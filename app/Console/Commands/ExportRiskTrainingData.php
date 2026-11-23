<?php

namespace App\Console\Commands;

use App\Services\Risk\RiskFeatureBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ExportRiskTrainingData extends Command
{
    protected $signature = 'risk:export-training {path? : CSV to write (default storage/app/risk/training_table.csv)}';

    protected $description = 'Export past fees (deadline already passed) with their outcome, to retrain the random forest on real payments';

    private const COLUMNS = [
        'school_year', 'grade', 'strand', 'gender', 'fee_group', 'fee_number', 'amount_due', 'days_to_deadline',
        'prior_fees', 'prior_failed', 'prior_unpaid', 'prior_fail_rate', 'prior_avg_days_late', 'prior_max_days_late',
        'has_history', 'failed_late_or_unpaid',
    ];

    public function handle(RiskFeatureBuilder $builder): int
    {
        $path = $this->argument('path') ?: storage_path('app/risk/training_table.csv');
        @mkdir(dirname($path), 0775, true);

        $rows = $builder->trainingRows(Carbon::today());
        $handle = fopen($path, 'w');
        fputcsv($handle, self::COLUMNS);
        foreach ($rows as $row) {
            fputcsv($handle, array_map(fn (string $c) => $row[$c], self::COLUMNS));
        }
        fclose($handle);

        $this->info("Wrote {$rows->count()} rows to {$path}");
        $this->line('Train with: python3 ml/train_model.py --data '.$path.' --version rf-real-v1 --source real');

        return self::SUCCESS;
    }
}
