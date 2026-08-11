<?php

namespace App\Services;

use App\Enums\BillingStatus;
use App\Enums\EnrollmentStatus;
use App\Enums\StudentStatus;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Descriptive (summative) analytics for the registrar, cashier, and admin
 * modules. All aggregations are computed with a single set of queries so the
 * same shapes can be reused across roles without duplicating logic.
 */
class DescriptiveAnalyticsService
{
    /**
     * Registrar-facing analytics: enrollment summaries, students per section,
     * and a breakdown of the student population by status.
     *
     * @return array<string, mixed>
     */
    public function registrarAnalytics(): array
    {
        return [
            'enrollment_summaries' => $this->enrollmentSummaries(),
            'students_by_section' => $this->studentsBySection(),
            'population_status' => $this->populationStatus(),
        ];
    }

    /**
     * Cashier-facing analytics: total cash revenue collected over time and
     * financial performance (billed vs collected vs outstanding) per section.
     *
     * @return array<string, mixed>
     */
    public function cashierAnalytics(): array
    {
        return [
            'revenue_over_time' => $this->revenueOverTime(),
            'financial_per_section' => $this->financialPerformancePerSection(),
        ];
    }

    /**
     * Admin-facing analytics: the union of registrar and cashier summaries so
     * the administrator sees every module in one place.
     *
     * @return array<string, mixed>
     */
    public function adminAnalytics(): array
    {
        return [
            'students_by_section' => $this->studentsBySection(),
            'population_status' => $this->populationStatus(),
            'revenue_over_time' => $this->revenueOverTime(),
            'financial_per_section' => $this->financialPerformancePerSection(),
        ];
    }

    /**
     * Enrollment summaries grouped by status, plus totals and the most recent
     * enrollment activity.
     *
     * @return array<string, mixed>
     */
    public function enrollmentSummaries(): array
    {
        $byStatus = Enrollment::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $total = (int) Enrollment::count();

        // Enrollment trend for the last 12 months (rolling window).
        $start = Carbon::now()->startOfMonth()->subMonths(11);
        $trend = Enrollment::query()
            ->selectRaw('date_format(enrollment_date, "%Y-%m") as month, count(*) as count')
            ->where('enrollment_date', '>=', $start)
            ->groupByRaw('date_format(enrollment_date, "%Y-%m")')
            ->orderByRaw('date_format(enrollment_date, "%Y-%m")')
            ->pluck('count', 'month');

        // Fill any gaps in the 12-month window so charts render continuous bars.
        $series = [];
        $cursor = $start->copy();
        for ($i = 0; $i < 12; $i++) {
            $key = $cursor->format('Y-m');
            $series[] = [
                'month' => $key,
                'label' => $cursor->format('M Y'),
                'count' => (int) ($trend[$key] ?? 0),
            ];
            $cursor->addMonth();
        }

        return [
            'total' => $total,
            'by_status' => collect(EnrollmentStatus::cases())->map(fn (EnrollmentStatus $s) => [
                'status' => $s->value,
                'label' => ucfirst($s->value),
                'count' => (int) ($byStatus[$s->value] ?? 0),
            ])->values()->all(),
            'trend_12_months' => $series,
            'latest_date' => optional(Enrollment::latest('enrollment_date')->first()?->enrollment_date)?->format('M d, Y'),
        ];
    }

    /**
     * Total enrolled student counts grouped by section.
     *
     * @return array<int, array<string, mixed>>
     */
    public function studentsBySection(): array
    {
        return Section::query()
            ->withCount(['enrollments' => fn ($q) => $q->whereIn('status', [
                EnrollmentStatus::Enrolled,
                EnrollmentStatus::Completed,
            ])])
            ->orderByDesc('enrollments_count')
            ->get()
            ->map(fn (Section $s) => [
                'section_id' => $s->id,
                'section_name' => $s->section_name,
                'course_name' => $s->course_name,
                'students' => (int) ($s->enrollments_count ?? 0),
            ])
            ->values()
            ->all();
    }

    /**
     * Overview of the student population by status.
     *
     * @return array<string, mixed>
     */
    public function populationStatus(): array
    {
        $byStatus = Student::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $total = (int) Student::count();
        $active = (int) ($byStatus[StudentStatus::Active->value] ?? 0);
        $inactive = (int) ($byStatus[StudentStatus::Inactive->value] ?? 0);
        $graduated = (int) ($byStatus[StudentStatus::Graduated->value] ?? 0);

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'graduated' => $graduated,
            'breakdown' => collect(StudentStatus::cases())->map(fn (StudentStatus $s) => [
                'status' => $s->value,
                'label' => ucfirst($s->value),
                'count' => (int) ($byStatus[$s->value] ?? 0),
                'percent' => $total > 0 ? round((float) ($byStatus[$s->value] ?? 0) / $total * 100, 1) : 0.0,
            ])->values()->all(),
        ];
    }

    /**
     * Monthly cash revenue collected over the last 12 months. "Overtime" is
     * interpreted as revenue trend over time.
     *
     * @return array<string, mixed>
     */
    public function revenueOverTime(): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths(11);

        $monthly = Payment::query()
            ->selectRaw('date_format(payment_date, "%Y-%m") as month, sum(amount_paid) as total')
            ->where('payment_date', '>=', $start)
            ->groupByRaw('date_format(payment_date, "%Y-%m")')
            ->orderByRaw('date_format(payment_date, "%Y-%m")')
            ->pluck('total', 'month');

        $series = [];
        $cursor = $start->copy();
        $grandTotal = 0.0;
        for ($i = 0; $i < 12; $i++) {
            $key = $cursor->format('Y-m');
            $amount = (float) ($monthly[$key] ?? 0);
            $grandTotal += $amount;
            $series[] = [
                'month' => $key,
                'label' => $cursor->format('M Y'),
                'revenue' => round($amount, 2),
            ];
            $cursor->addMonth();
        }

        return [
            'series' => $series,
            'total' => round($grandTotal, 2),
            'this_month' => round((float) ($monthly[Carbon::now()->format('Y-m')] ?? 0), 2),
            'last_month' => round((float) ($monthly[Carbon::now()->subMonth()->format('Y-m')] ?? 0), 2),
            'payments_count' => (int) Payment::count(),
        ];
    }

    /**
     * Financial performance per section: billed, collected, and outstanding
     * amounts aggregated from billing statements joined through enrollments
     * to their sections.
     *
     * @return array<int, array<string, mixed>>
     */
    public function financialPerformancePerSection(): array
    {
        $paid = BillingStatus::Paid->value;
        $unpaid = BillingStatus::Unpaid->value;

        // Resolve each billing statement to a section via the student's most
        // recent active enrollment so the financials attach to a concrete
        // section. Billing status literals are inlined as known constants to
        // keep the aggregate query free of parameter bindings.
        $rows = DB::table('billing_statements')
            ->join('students', 'students.id', '=', 'billing_statements.student_id')
            ->leftJoin('enrollments', function ($join) {
                $join->on('enrollments.student_id', '=', 'students.id')
                    ->whereIn('enrollments.status', [
                        EnrollmentStatus::Enrolled->value,
                        EnrollmentStatus::Completed->value,
                    ]);
            })
            ->leftJoin('sections', 'sections.id', '=', 'enrollments.section_id')
            ->select(
                'sections.id as section_id',
                'sections.section_name',
                'sections.course_name',
                DB::raw('coalesce(sum(billing_statements.total_amount), 0) as billed'),
                DB::raw("coalesce(sum(case when billing_statements.status = '{$paid}' then billing_statements.total_amount else 0 end), 0) as collected"),
                DB::raw("coalesce(sum(case when billing_statements.status = '{$unpaid}' then billing_statements.total_amount else 0 end), 0) as outstanding")
            )
            ->groupBy('sections.id', 'sections.section_name', 'sections.course_name')
            ->orderByDesc('billed')
            ->get();

        // Rows without a section (students with no active enrollment) roll up
        // into an "Unassigned" group so totals still reconcile.
        $grouped = $rows->groupBy(fn ($r) => $r->section_id ?? 'unassigned');

        return $grouped->map(function ($group, $key) {
            if ($key === 'unassigned') {
                return [
                    'section_id' => null,
                    'section_name' => 'Unassigned',
                    'course_name' => null,
                    'billed' => (float) $group->sum('billed'),
                    'collected' => (float) $group->sum('collected'),
                    'outstanding' => (float) $group->sum('outstanding'),
                ];
            }

            $first = $group->first();

            return [
                'section_id' => (int) $first->section_id,
                'section_name' => $first->section_name ?? 'Unassigned',
                'course_name' => $first->course_name,
                'billed' => (float) $group->sum('billed'),
                'collected' => (float) $group->sum('collected'),
                'outstanding' => (float) $group->sum('outstanding'),
            ];
        })
            ->filter(fn ($row) => $row['billed'] > 0 || $row['collected'] > 0 || $row['outstanding'] > 0)
            ->values()
            ->all();
    }
}
