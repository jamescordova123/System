<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Artisan;

/**
 * Re-runs the section risk model after payments, billing, enrollments or students change.
 * Unique, so a burst of changes (e.g. a cashier saving several payments) triggers one run.
 */
class RefreshRiskPredictions implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $uniqueFor = 120;

    public int $timeout = 150;

    public int $tries = 1;

    public function handle(): void
    {
        Artisan::call('risk:predict');
    }
}
