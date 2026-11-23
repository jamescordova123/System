<?php

namespace App\Console\Commands;

use App\Enums\RiskLevel;
use App\Models\RiskPrediction;
use App\Services\Risk\RiskFeatureBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Process;

class PredictSectionRisk extends Command
{
    protected $signature = 'risk:predict {--dry-run : Show the results without saving them}';

    protected $description = 'Score upcoming fees with the random forest and save one risk prediction per section';

    public function handle(RiskFeatureBuilder $builder): int
    {
        $today = Carbon::today();
        $rows = $builder->scoringRows($today);

        if ($rows->isEmpty()) {
            $this->warn('No upcoming unpaid Grade 11/12 fees to score.');

            return self::SUCCESS;
        }

        $result = Process::timeout((int) config('risk.timeout'))
            ->input(json_encode(['rows' => $rows->map(fn (array $r) => $builder->modelInput($r))->all()]))
            ->run([config('risk.python'), config('risk.script')]);

        if ($result->failed()) {
            $this->error('Model failed: '.trim($result->errorOutput() ?: $result->output()));

            return self::FAILURE;
        }

        $output = json_decode($result->output(), true);
        $probabilities = $output['probabilities'] ?? [];
        if (count($probabilities) !== $rows->count()) {
            $this->error('Model returned '.count($probabilities).' scores for '.$rows->count().' fees.');

            return self::FAILURE;
        }
        $version = (string) ($output['model_version'] ?? 'unknown');

        $table = [];
        $scored = $rows->map(fn (array $r, int $i) => $r + ['probability' => (float) $probabilities[$i]])->groupBy('section_id');

        foreach ($scored as $sectionId => $sectionRows) {
            $probability = round($sectionRows->avg('probability'), 4);
            $level = $this->level($probability);
            $drivers = $this->drivers($sectionRows);

            if (! $this->option('dry-run')) {
                RiskPrediction::updateOrCreate(
                    ['section_id' => $sectionId, 'prediction_date' => $today->toDateString(), 'model_used' => config('risk.model_label')],
                    ['risk_level' => $level, 'probability' => $probability, 'model_version' => $version,
                        'fees_scored' => $sectionRows->count(), 'drivers' => $drivers],
                );
            }

            $table[] = [$sectionId, $sectionRows->count(), round($probability * 100, 1).'%', $level->value];
        }

        $this->table(['Section id', 'Fees scored', 'Probability of failing to pay', 'Risk'], $table);
        $this->info(($this->option('dry-run') ? 'Dry run, nothing saved. ' : 'Saved. ')."Model {$version}.");

        return self::SUCCESS;
    }

    private function level(float $probability): RiskLevel
    {
        return match (true) {
            $probability >= config('risk.thresholds.high') => RiskLevel::High,
            $probability >= config('risk.thresholds.medium') => RiskLevel::Medium,
            default => RiskLevel::Low,
        };
    }

    /**
     * Plain-language hints about what is behind a section's number (from the rows, not from the model).
     *
     * @param  \Illuminate\Support\Collection<int, array<string, mixed>>  $rows
     * @return array<int, string>
     */
    private function drivers($rows): array
    {
        $drivers = [];
        $withHistory = $rows->where('has_history', 1);
        if ($withHistory->isNotEmpty() && $withHistory->avg('prior_fail_rate') >= 0.3) {
            $drivers[] = 'Earlier fees often paid late or unpaid';
        }
        if ($rows->where('fee_group', 'CONSUMABLE')->count() / $rows->count() >= 0.4) {
            $drivers[] = 'Many consumable installments still due';
        }
        if ($rows->where('prior_unpaid', '>', 0)->count() / $rows->count() >= 0.2) {
            $drivers[] = 'Learners with unpaid past fees';
        }

        return $drivers ?: ['Steady payment history'];
    }
}
