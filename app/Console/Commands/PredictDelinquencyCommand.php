<?php

namespace App\Console\Commands;

use App\Services\DelinquencyRiskService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('analytics:predict-delinquency')]
#[Description('Run the Random Forest delinquency model and persist per-section risk predictions.')]
class PredictDelinquencyCommand extends Command
{
    public function handle(DelinquencyRiskService $service): int
    {
        $this->info('Training Random Forest delinquency model...');

        $result = $service->predict();

        if (empty($result['predictions'])) {
            $this->warn('Not enough billing data to train the model. No predictions were recorded.');

            return self::SUCCESS;
        }

        $stats = $result['stats'];
        $this->info(sprintf(
            'Completed. Model accuracy: %.1f%% — %d sections scored (high: %d, medium: %d, low: %d).',
            $result['accuracy'] * 100,
            $stats['total'],
            $stats['high'],
            $stats['medium'],
            $stats['low'],
        ));

        return self::SUCCESS;
    }
}
