<?php

namespace App\Services\Risk;

use App\Enums\FeeProgram;
use App\Models\BillingLineItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Turns billing line items into the rows the random forest was trained on
 * (one row per student x fee). See ml/features.py for the model's inputs.
 */
class RiskFeatureBuilder
{
    /** Keys sent to ml/predict.py. */
    private const MODEL_KEYS = [
        'grade', 'fee_number', 'amount_due', 'days_to_deadline', 'prior_fees', 'prior_failed', 'prior_unpaid',
        'prior_fail_rate', 'prior_avg_days_late', 'prior_max_days_late', 'has_history', 'strand', 'gender', 'fee_group',
    ];

    /**
     * Fees whose outcome is still open: deadline not passed yet and not fully paid.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function scoringRows(Carbon $today): Collection
    {
        return $this->rows($today)->filter(fn (array $r) => ! $r['observed'] && ! $r['fully_paid'])->values();
    }

    /**
     * Fees already past their deadline and still not fully paid: they have failed for certain.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function overdueRows(Carbon $today): Collection
    {
        return $this->rows($today)->filter(fn (array $r) => $r['observed'] && ! $r['fully_paid'])->values();
    }

    /**
     * Fees whose deadline has passed, with the outcome (for retraining on real payments).
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function trainingRows(Carbon $today): Collection
    {
        return $this->rows($today)->filter(fn (array $r) => $r['observed'])->values();
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    public function modelInput(array $row): array
    {
        return array_intersect_key($row, array_flip(self::MODEL_KEYS));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function rows(Carbon $today): Collection
    {
        $today = $today->copy()->startOfDay();

        $items = BillingLineItem::query()
            ->with(['catalogItem', 'payments', 'billingStatement.student.enrollments.section'])
            ->whereHas('billingStatement', fn ($q) => $q
                ->whereIn('program', [FeeProgram::Grade11->value, FeeProgram::Grade12->value])
                ->whereNotNull('school_year'))
            ->get();

        $rows = [];
        foreach ($items as $item) {
            $statement = $item->billingStatement;
            $student = $statement?->student;
            $catalog = $item->catalogItem;
            if (! $statement || ! $student || ! $catalog) {
                continue;
            }

            [$group, $number] = $this->classify((string) $catalog->code, (string) $catalog->category);
            $start = $this->schoolYearStart((string) $statement->school_year);
            $section = $student->enrollments
                ->filter(fn ($e) => $e->status->value === 'enrolled')
                ->sortByDesc('enrollment_date')
                ->first()?->section;
            if ($group === null || $start === null || $section === null) {
                continue;
            }

            $deadline = $item->due_date?->copy()->startOfDay() ?? $this->deadline($start, $group, $number);
            $fullyPaid = (float) $item->amount_paid >= (float) $item->amount_due && (float) $item->amount_due > 0;
            // fully paid but no payment record: counted as paid on the deadline day
            $paidDate = $fullyPaid ? ($item->payments->max('payment_date') ?? $deadline) : null;
            $daysLate = $paidDate ? max(0, (int) $deadline->diffInDays($paidDate, false)) : null;

            $rows[] = [
                'key' => $statement->id,
                'section_id' => $section->id,
                'student_id' => $student->id,
                'line_item_id' => $item->id,
                'school_year' => $statement->school_year,
                'grade' => $statement->program === FeeProgram::Grade11 ? 11 : 12,
                'strand' => $this->strand((string) $section->course_name),
                'gender' => strtoupper(substr((string) $student->gender, 0, 1)),
                'fee_group' => $group,
                'fee_number' => $number,
                'amount_due' => (float) $item->amount_due,
                'days_to_deadline' => (int) $start->diffInDays($deadline),
                'deadline' => $deadline->toDateString(),
                'observed' => $deadline->lt($today),
                'fully_paid' => $fullyPaid,
                'unpaid' => ! $fullyPaid,
                'days_late' => $daysLate,
                'failed_late_or_unpaid' => (int) (! $fullyPaid || $daysLate > 0),
            ];
        }

        return collect(HistoryFeatures::apply($rows));
    }

    /**
     * @return array{0: string|null, 1: int}
     */
    private function classify(string $code, string $category): array
    {
        if ($code === 'id') {
            return ['ID', 1];
        }
        if ($code === 'uniform') {
            return ['UNIFORM', 1];
        }
        if (preg_match('/^test_paper_term_(\d+)$/', $code, $m)) {
            return ['TESTPAPER', (int) $m[1]];
        }
        if ($category === 'consumable' && preg_match('/_month_(\d+)$/', $code, $m)) {
            return ['CONSUMABLE', (int) $m[1]];
        }

        return [null, 0];
    }

    private function schoolYearStart(string $schoolYear): ?Carbon
    {
        $listed = config('risk.school_year_starts')[$schoolYear] ?? null;
        if ($listed) {
            return Carbon::parse($listed)->startOfDay();
        }
        if (! preg_match('/^(\d{4})/', $schoolYear, $m)) {
            return null;
        }

        return Carbon::parse($m[1].'-'.config('risk.school_year_start_default'))->startOfDay();
    }

    private function deadline(Carbon $start, string $group, int $number): Carbon
    {
        $months = config("risk.deadline_months.$group");
        $months = is_array($months) ? ($months[$number] ?? end($months)) : $months;

        return $start->copy()->addMonthsNoOverflow((int) $months);
    }

    private function strand(string $courseName): string
    {
        $tokens = preg_split('/[^A-Za-z0-9]+/', strtoupper($courseName), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        foreach (config('risk.strands') as $code) {
            if (in_array($code, $tokens, true)) {
                return $code;
            }
        }
        $name = strtolower($courseName);
        foreach (config('risk.strand_phrases') as $code => $phrases) {
            foreach ($phrases as $phrase) {
                if (str_contains($name, $phrase)) {
                    return $code;
                }
            }
        }

        return 'OTHER';
    }
}
