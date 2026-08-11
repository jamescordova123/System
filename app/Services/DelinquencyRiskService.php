<?php

namespace App\Services;

use App\Enums\BillingStatus;
use App\Enums\EnrollmentStatus;
use App\Enums\RiskLevel;
use App\MachineLearning\RandomForest;
use App\Models\BillingStatement;
use App\Models\Enrollment;
use App\Models\RiskPrediction;
use App\Models\Section;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Predicts payment-delinquency risk at the section level using a Random
 * Forest classifier.
 *
 * The model is trained on billing-statement-level features (outstanding
 * balance, due-date overdue days, payment delay days, prior payment ratio) with
 * a binary label derived from billing status (delinquent = unpaid or partial).
 * Per-student predictions are aggregated to a section-level risk band using the
 * share of delinquent students and the mean delinquency probability, and the
 * results are persisted to {@see RiskPrediction} with model_used =
 * "random-forest-v1".
 */
class DelinquencyRiskService
{
    public const MODEL_USED = 'random-forest-v1';

    /**
     * Feature columns the model trains on. Kept as a single source of truth so
     * the trainer and the per-row vector builder stay in sync.
     */
    private const FEATURES = [
        'total_amount',
        'outstanding',
        'overdue_days',
        'payment_delay_days',
        'prior_payment_ratio',
        'billing_age_days',
    ];

    /**
     * Run the full pipeline: build the dataset, train the forest, score each
     * billing statement, aggregate to sections, and persist predictions.
     *
     * @return array{predictions: array<int, array<string, mixed>>, stats: array<string, mixed>, accuracy: float}
     */
    public function predict(): array
    {
        $dataset = $this->buildDataset();

        if (count($dataset) < 10) {
            Log::info('DelinquencyRiskService: insufficient data to train model', [
                'samples' => count($dataset),
            ]);

            return ['predictions' => [], 'stats' => $this->emptyStats(), 'accuracy' => 0.0];
        }

        // Simple stratified-ish holdout: 20% for evaluation, rest for training.
        [$training, $evaluation] = $this->splitDataset($dataset, 0.2);

        $forest = new RandomForest(
            featureNames: self::FEATURES,
            nTrees: 40,
            maxDepth: 8,
            minSamplesSplit: 2,
            maxFeaturesRatio: 0.7,
            randomSeed: 42,
        );
        $forest->train($training);

        $accuracy = empty($evaluation) ? $forest->trainingAccuracy($training) : $this->evaluate($forest, $evaluation);

        $sectionPredictions = $this->aggregateToSections($forest, $dataset);

        $persisted = $this->persist($sectionPredictions);

        return [
            'predictions' => $persisted,
            'stats' => $this->summarize($persisted),
            'accuracy' => round($accuracy, 3),
        ];
    }

    /**
     * Build the billing-statement-level training dataset, joining each
     * statement to its student's payment history and most recent section.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildDataset(): array
    {
        $today = Carbon::today();

        $statements = BillingStatement::query()
            ->with(['student.paymentHistory', 'student.enrollments' => function ($q) {
                $q->whereIn('status', [
                    EnrollmentStatus::Enrolled,
                    EnrollmentStatus::Completed,
                ])->orderByDesc('enrollment_date');
            }])
            ->get();

        $dataset = [];
        foreach ($statements as $billing) {
            $totalAmount = (float) $billing->total_amount;
            if ($totalAmount <= 0) {
                continue;
            }

            $history = $billing->student?->paymentHistory;
            $totalPaid = (float) ($history?->total_paid ?? 0);
            $totalBilledAcross = (float) ($totalPaid + ($history?->total_balance ?? 0));

            $outstanding = max(0.0, $totalAmount - $totalPaid);
            $overdueDays = $billing->due_date < $today
                ? (int) $billing->due_date->diffInDays($today)
                : 0;
            $paymentDelayDays = (int) ($history?->payment_delay_days ?? 0);
            $priorPaymentRatio = $totalBilledAcross > 0
                ? round(min(1.0, $totalPaid / $totalBilledAcross), 4)
                : 0.0;
            $billingAgeDays = (int) $billing->created_at?->diffInDays($today) ?? 0;

            // Binary label: delinquent = unpaid or partial (not yet paid in full).
            $isDelinquent = in_array($billing->status, [
                BillingStatus::Unpaid,
                BillingStatus::Partial,
            ], true) ? 1 : 0;

            $dataset[] = [
                'billing_id' => $billing->id,
                'student_id' => $billing->student_id,
                'section_id' => $billing->student?->enrollments?->first()?->section_id,
                'label' => (string) $isDelinquent,
                'total_amount' => round($totalAmount, 2),
                'outstanding' => round($outstanding, 2),
                'overdue_days' => $overdueDays,
                'payment_delay_days' => $paymentDelayDays,
                'prior_payment_ratio' => $priorPaymentRatio,
                'billing_age_days' => $billingAgeDays,
            ];
        }

        return $dataset;
    }

    /**
     * Split the dataset into training and evaluation subsets.
     *
     * @param array<int, array<string, mixed>> $dataset
     * @return array{0: array, 1: array}
     */
    private function splitDataset(array $dataset, float $evaluationRatio): array
    {
        shuffle($dataset);
        $evalCount = (int) floor(count($dataset) * $evaluationRatio);
        $evaluation = array_slice($dataset, 0, $evalCount);
        $training = array_slice($dataset, $evalCount);

        return [$training, $evaluation];
    }

    /**
     * @param RandomForest $forest
     * @param array<int, array<string, mixed>> $evaluation
     */
    private function evaluate(RandomForest $forest, array $evaluation): float
    {
        if (empty($evaluation)) {
            return 0.0;
        }
        $correct = 0;
        foreach ($evaluation as $row) {
            $predicted = $forest->predict($row);
            if ($predicted === (string) $row['label']) {
                $correct++;
            }
        }

        return $correct / count($evaluation);
    }

    /**
     * Score each billing row with the trained forest, then aggregate per
     * section into a risk band, delinquent count, and mean probability.
     *
     * @param RandomForest $forest
     * @param array<int, array<string, mixed>> $dataset
     * @return array<int, array<string, mixed>>
     */
    private function aggregateToSections(RandomForest $forest, array $dataset): array
    {
        $bySection = [];
        foreach ($dataset as $row) {
            $sectionId = $row['section_id'];
            if ($sectionId === null) {
                continue; // unassigned billing, skip from per-section view
            }

            $result = $forest->predictProbability($row);
            $bySection[$sectionId][] = [
                'predicted_label' => $result['label'],
                'probability' => $result['probability'],
            ];
        }

        $sections = Section::whereIn('id', array_keys($bySection))
            ->get()
            ->keyBy('id');

        $aggregated = [];
        foreach ($bySection as $sectionId => $predictions) {
            $total = count($predictions);
            $delinquent = count(array_filter(
                $predictions,
                fn (array $p) => $p['predicted_label'] === '1',
            ));
            $meanProbability = $total > 0
                ? array_sum(array_column($predictions, 'probability')) / $total
                : 0.0;

            $section = $sections->get($sectionId);
            $aggregated[] = [
                'section_id' => $sectionId,
                'section_name' => $section?->section_name ?? "Section #{$sectionId}",
                'course_name' => $section?->course_name,
                'students_evaluated' => $total,
                'delinquent_students' => $delinquent,
                'mean_probability' => round($meanProbability, 3),
                'risk_level' => $this->riskBand($delinquent, $total, $meanProbability)->value,
            ];
        }

        // Highest risk first.
        $order = ['high' => 0, 'medium' => 1, 'low' => 2];
        usort($aggregated, function ($a, $b) use ($order) {
            return $order[$a['risk_level']] <=> $order[$b['risk_level']];
        });

        return $aggregated;
    }

    /**
     * Map a section's delinquent share and mean probability to a risk band.
     */
    private function riskBand(int $delinquent, int $total, float $meanProbability): RiskLevel
    {
        if ($total === 0) {
            return RiskLevel::Low;
        }
        $delinquentRatio = $delinquent / $total;
        $score = ($delinquentRatio * 0.6) + ($meanProbability * 0.4);

        return match (true) {
            $score >= 0.6 => RiskLevel::High,
            $score >= 0.3 => RiskLevel::Medium,
            default => RiskLevel::Low,
        };
    }

    /**
     * Persist predictions for today, replacing any previous run's rows so the
     * report always reflects the latest model output.
     *
     * @param array<int, array<string, mixed>> $predictions
     * @return array<int, array<string, mixed>>
     */
    private function persist(array $predictions): array
    {
        $today = Carbon::today();

        DB::transaction(function () use ($today, $predictions) {
            RiskPrediction::where('model_used', self::MODEL_USED)
                ->whereDate('prediction_date', $today)
                ->delete();

            foreach ($predictions as $p) {
                RiskPrediction::create([
                    'section_id' => $p['section_id'],
                    'risk_level' => $p['risk_level'],
                    'model_used' => self::MODEL_USED,
                    'prediction_date' => $today,
                ]);
            }
        });

        // Reload with relations so the returned shape includes names for charts.
        return RiskPrediction::with('section')
            ->where('model_used', self::MODEL_USED)
            ->whereDate('prediction_date', $today)
            ->latest()
            ->get()
            ->map(fn (RiskPrediction $r) => [
                'id' => $r->id,
                'section_id' => $r->section_id,
                'section_name' => $r->section?->section_name,
                'course_name' => $r->section?->course_name,
                'risk_level' => $r->risk_level->value,
                'model_used' => $r->model_used,
                'prediction_date' => $r->prediction_date->format('Y-m-d'),
                'prediction_date_display' => $r->prediction_date->format('M d, Y'),
            ])
            ->values()
            ->all();
    }

    /**
     * @param array<int, array<string, mixed>> $predictions
     * @return array<string, int>
     */
    private function summarize(array $predictions): array
    {
        $counts = ['total' => count($predictions), 'high' => 0, 'medium' => 0, 'low' => 0];
        foreach ($predictions as $p) {
            $counts[$p['risk_level']] = ($counts[$p['risk_level']] ?? 0) + 1;
        }

        return $counts;
    }

    /**
     * @return array<string, int>
     */
    private function emptyStats(): array
    {
        return ['total' => 0, 'high' => 0, 'medium' => 0, 'low' => 0];
    }
}
