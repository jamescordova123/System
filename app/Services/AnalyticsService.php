<?php

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Enums\StudentStatus;
use App\Models\BillingStatement;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Descriptive analytics for the registrar, cashier and administration modules.
 *
 * Aggregations are computed in PHP over lean column selections so the results
 * stay identical across database drivers (sqlite in tests, MySQL in production).
 */
class AnalyticsService
{
    public const DEFAULT_MONTHS = 12;

    /**
     * Enrollment volume per month, broken down by enrollment status.
     *
     * @return list<array{period: string, label: string, enrolled: int, dropped: int, completed: int, total: int}>
     */
    public function enrollmentTrend(int $months = self::DEFAULT_MONTHS): array
    {
        $counters = [];

        foreach ($this->months($months) as $key => $label) {
            $counters[$key] = ['enrolled' => 0, 'dropped' => 0, 'completed' => 0];
        }

        Enrollment::query()
            ->where('enrollment_date', '>=', $this->windowStart($months))
            ->get(['enrollment_date', 'status'])
            ->each(function (Enrollment $enrollment) use (&$counters): void {
                $key = $enrollment->enrollment_date->format('Y-m');

                if (! isset($counters[$key])) {
                    return;
                }

                $counters[$key][$enrollment->status->value]++;
            });

        $trend = [];

        foreach ($this->months($months) as $key => $label) {
            $trend[] = [
                'period' => $key,
                'label' => $label,
                'enrolled' => $counters[$key]['enrolled'],
                'dropped' => $counters[$key]['dropped'],
                'completed' => $counters[$key]['completed'],
                'total' => array_sum($counters[$key]),
            ];
        }

        return $trend;
    }

    /**
     * Headline enrollment figures with month-over-month movement.
     *
     * @return array{total: int, enrolled: int, dropped: int, completed: int, this_month: int, last_month: int, growth: float, retention_rate: float, average_per_section: float}
     */
    public function enrollmentSummary(): array
    {
        $statusCounts = Enrollment::query()
            ->get(['status'])
            ->countBy(fn (Enrollment $enrollment) => $enrollment->status->value);

        $total = (int) $statusCounts->sum();
        $enrolled = (int) $statusCounts->get(EnrollmentStatus::Enrolled->value, 0);
        $dropped = (int) $statusCounts->get(EnrollmentStatus::Dropped->value, 0);
        $completed = (int) $statusCounts->get(EnrollmentStatus::Completed->value, 0);

        $thisMonth = $this->countEnrollmentsForMonth(Carbon::now()->startOfMonth());
        $lastMonth = $this->countEnrollmentsForMonth(Carbon::now()->subMonthNoOverflow()->startOfMonth());

        $sections = Section::query()->count();

        return [
            'total' => $total,
            'enrolled' => $enrolled,
            'dropped' => $dropped,
            'completed' => $completed,
            'this_month' => $thisMonth,
            'last_month' => $lastMonth,
            'growth' => $this->percentageChange($lastMonth, $thisMonth),
            'retention_rate' => $this->rate($total - $dropped, $total),
            'average_per_section' => $sections > 0 ? round($total / $sections, 1) : 0.0,
        ];
    }

    /**
     * Distinct student headcount per section, ranked from largest to smallest.
     *
     * @return list<array{section: string, course: string, students: int, enrolled: int, dropped: int, completed: int, share: float}>
     */
    public function studentsBySection(): array
    {
        $sections = Section::query()
            ->withCount([
                'enrollments as enrolled_count' => fn ($query) => $query->where('status', EnrollmentStatus::Enrolled->value),
                'enrollments as dropped_count' => fn ($query) => $query->where('status', EnrollmentStatus::Dropped->value),
                'enrollments as completed_count' => fn ($query) => $query->where('status', EnrollmentStatus::Completed->value),
            ])
            ->get(['id', 'section_name', 'course_name']);

        $studentsPerSection = Enrollment::query()
            ->get(['section_id', 'student_id'])
            ->groupBy('section_id')
            ->map(fn (Collection $rows) => $rows->pluck('student_id')->unique()->count());

        $totalStudents = (int) $studentsPerSection->sum();

        return array_values($sections
            ->map(fn (Section $section) => [
                'section' => $section->section_name,
                'course' => $section->course_name,
                'students' => (int) $studentsPerSection->get($section->id, 0),
                'enrolled' => (int) $section->getAttribute('enrolled_count'),
                'dropped' => (int) $section->getAttribute('dropped_count'),
                'completed' => (int) $section->getAttribute('completed_count'),
                'share' => $this->rate((int) $studentsPerSection->get($section->id, 0), $totalStudents),
            ])
            ->sortByDesc('students')
            ->all());
    }

    /**
     * Student population split by lifecycle status, plus unassigned headcount.
     *
     * @return array{total: int, active: int, inactive: int, graduated: int, unassigned: int, active_rate: float, breakdown: list<array{status: string, key: string, count: int, percentage: float}>}
     */
    public function populationStatus(): array
    {
        $counts = Student::query()
            ->get(['status'])
            ->countBy(fn (Student $student) => $student->status->value);

        $total = (int) $counts->sum();

        $breakdown = array_map(
            fn (StudentStatus $status) => [
                'status' => ucfirst($status->value),
                'key' => $status->value,
                'count' => (int) $counts->get($status->value, 0),
                'percentage' => $this->rate((int) $counts->get($status->value, 0), $total),
            ],
            StudentStatus::cases(),
        );

        $withEnrollment = Enrollment::query()
            ->where('status', EnrollmentStatus::Enrolled->value)
            ->distinct()
            ->count('student_id');

        return [
            'total' => $total,
            'active' => (int) $counts->get(StudentStatus::Active->value, 0),
            'inactive' => (int) $counts->get(StudentStatus::Inactive->value, 0),
            'graduated' => (int) $counts->get(StudentStatus::Graduated->value, 0),
            'unassigned' => (int) max($total - $withEnrollment, 0),
            'active_rate' => $this->rate((int) $counts->get(StudentStatus::Active->value, 0), $total),
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Cash collected per month with transaction volume and average ticket size.
     *
     * @return list<array{period: string, label: string, revenue: float, transactions: int, average: float}>
     */
    public function revenueTrend(int $months = self::DEFAULT_MONTHS): array
    {
        $counters = $this->paymentCounters($months);

        $trend = [];

        foreach ($this->months($months) as $key => $label) {
            $revenue = round($counters[$key]['revenue'], 2);
            $transactions = $counters[$key]['transactions'];

            $trend[] = [
                'period' => $key,
                'label' => $label,
                'revenue' => $revenue,
                'transactions' => $transactions,
                'average' => $transactions > 0 ? round($revenue / $transactions, 2) : 0.0,
            ];
        }

        return $trend;
    }

    /**
     * Headline collection figures across the whole billing ledger.
     *
     * @return array{collected: float, billed: float, outstanding: float, collection_rate: float, transactions: int, average_payment: float, this_month: float, last_month: float, growth: float, today: float}
     */
    public function revenueSummary(): array
    {
        $payments = Payment::query()->get(['payment_date', 'amount_paid']);

        $collected = round((float) $payments->sum(fn (Payment $payment) => (float) $payment->amount_paid), 2);
        $billed = round((float) BillingStatement::query()->sum('total_amount'), 2);
        $transactions = $payments->count();

        $thisMonth = $this->sumPaymentsForMonth($payments, Carbon::now()->startOfMonth());
        $lastMonth = $this->sumPaymentsForMonth($payments, Carbon::now()->subMonthNoOverflow()->startOfMonth());

        $today = round((float) $payments
            ->filter(fn (Payment $payment) => $payment->payment_date->isToday())
            ->sum(fn (Payment $payment) => (float) $payment->amount_paid), 2);

        return [
            'collected' => $collected,
            'billed' => $billed,
            'outstanding' => round(max($billed - $collected, 0), 2),
            'collection_rate' => $billed > 0 ? round($collected / $billed * 100, 1) : 0.0,
            'transactions' => $transactions,
            'average_payment' => $transactions > 0 ? round($collected / $transactions, 2) : 0.0,
            'this_month' => $thisMonth,
            'last_month' => $lastMonth,
            'growth' => $this->percentageChange($lastMonth, $thisMonth),
            'today' => $today,
        ];
    }

    /**
     * Billed vs. collected amounts per section.
     *
     * A student's billing is attributed to their most recent enrollment so that
     * every peso is counted exactly once, even for students who moved sections.
     *
     * @return list<array{section: string, course: string, students: int, billed: float, collected: float, outstanding: float, collection_rate: float}>
     */
    public function financialPerformanceBySection(): array
    {
        $sectionOfStudent = $this->latestSectionPerStudent();

        $sections = Section::query()
            ->get(['id', 'section_name', 'course_name'])
            ->keyBy('id');

        $totals = $sections
            ->map(fn (Section $section) => [
                'section' => $section->section_name,
                'course' => $section->course_name,
                'students' => 0,
                'billed' => 0.0,
                'collected' => 0.0,
            ])
            ->all();

        $paymentsByBilling = Payment::query()
            ->get(['billing_id', 'amount_paid'])
            ->groupBy('billing_id')
            ->map(fn (Collection $rows) => (float) $rows->sum(fn (Payment $payment) => (float) $payment->amount_paid));

        $statements = BillingStatement::query()->get(['id', 'student_id', 'total_amount']);

        $countedStudents = [];

        foreach ($statements as $statement) {
            $sectionId = $sectionOfStudent[$statement->student_id] ?? null;

            if ($sectionId === null || ! isset($totals[$sectionId])) {
                continue;
            }

            $totals[$sectionId]['billed'] += (float) $statement->total_amount;
            $totals[$sectionId]['collected'] += (float) $paymentsByBilling->get($statement->id, 0.0);

            if (! isset($countedStudents[$sectionId][$statement->student_id])) {
                $countedStudents[$sectionId][$statement->student_id] = true;
                $totals[$sectionId]['students']++;
            }
        }

        return array_values(collect($totals)
            ->map(function (array $row): array {
                $billed = round($row['billed'], 2);
                $collected = round($row['collected'], 2);

                return [
                    'section' => $row['section'],
                    'course' => $row['course'],
                    'students' => $row['students'],
                    'billed' => $billed,
                    'collected' => $collected,
                    'outstanding' => round(max($billed - $collected, 0), 2),
                    'collection_rate' => $billed > 0 ? round($collected / $billed * 100, 1) : 0.0,
                ];
            })
            ->sortByDesc('collected')
            ->all());
    }

    /**
     * Cash collected per payment method — the ledger currently records cash only,
     * but the breakdown keeps the chart honest if more methods are introduced.
     *
     * @return list<array{method: string, amount: float, transactions: int, share: float}>
     */
    public function revenueByPaymentMethod(): array
    {
        $payments = Payment::query()->get(['payment_method', 'amount_paid']);
        $total = (float) $payments->sum(fn (Payment $payment) => (float) $payment->amount_paid);

        return array_values($payments
            ->groupBy(fn (Payment $payment) => $payment->payment_method->value)
            ->map(fn (Collection $rows, string $method) => [
                'method' => ucfirst($method),
                'amount' => round((float) $rows->sum(fn (Payment $payment) => (float) $payment->amount_paid), 2),
                'transactions' => $rows->count(),
                'share' => $total > 0
                    ? round((float) $rows->sum(fn (Payment $payment) => (float) $payment->amount_paid) / $total * 100, 1)
                    : 0.0,
            ])
            ->all());
    }

    /**
     * @return array<string, array{revenue: float, transactions: int}>
     */
    private function paymentCounters(int $months): array
    {
        $counters = [];

        foreach (array_keys($this->months($months)) as $key) {
            $counters[$key] = ['revenue' => 0.0, 'transactions' => 0];
        }

        Payment::query()
            ->where('payment_date', '>=', $this->windowStart($months))
            ->get(['payment_date', 'amount_paid'])
            ->each(function (Payment $payment) use (&$counters): void {
                $key = $payment->payment_date->format('Y-m');

                if (! isset($counters[$key])) {
                    return;
                }

                $counters[$key]['revenue'] += (float) $payment->amount_paid;
                $counters[$key]['transactions']++;
            });

        return $counters;
    }

    /**
     * @return array<int, int> student id => section id of their latest enrollment
     */
    private function latestSectionPerStudent(): array
    {
        return Enrollment::query()
            ->orderBy('enrollment_date')
            ->orderBy('id')
            ->get(['student_id', 'section_id'])
            ->mapWithKeys(fn (Enrollment $enrollment) => [$enrollment->student_id => $enrollment->section_id])
            ->all();
    }

    private function countEnrollmentsForMonth(Carbon $month): int
    {
        return Enrollment::query()
            ->whereBetween('enrollment_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
            ->count();
    }

    /**
     * @param  Collection<int, Payment>  $payments
     */
    private function sumPaymentsForMonth(Collection $payments, Carbon $month): float
    {
        return round((float) $payments
            ->filter(fn (Payment $payment) => $payment->payment_date->isSameMonth($month))
            ->sum(fn (Payment $payment) => (float) $payment->amount_paid), 2);
    }

    /**
     * @return array<string, string> 'Y-m' => 'M Y' for every month in the window
     */
    private function months(int $months): array
    {
        $labels = [];
        $cursor = $this->windowStart($months);

        for ($i = 0; $i < $months; $i++) {
            $labels[$cursor->format('Y-m')] = $cursor->format('M Y');
            $cursor = $cursor->copy()->addMonthNoOverflow();
        }

        return $labels;
    }

    private function windowStart(int $months): Carbon
    {
        return Carbon::now()->startOfMonth()->subMonthsNoOverflow(max($months - 1, 0));
    }

    private function percentageChange(float $previous, float $current): float
    {
        if ($previous <= 0.0) {
            return $current > 0.0 ? 100.0 : 0.0;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    private function rate(int $part, int $whole): float
    {
        return $whole > 0 ? round($part / $whole * 100, 1) : 0.0;
    }
}
