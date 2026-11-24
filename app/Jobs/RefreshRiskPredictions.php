<?php

namespace App\Jobs;

use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

/**
 * Re-runs the section risk model after payments, billing, enrollments or students change.
 *
 * It is dispatched "after the response": it runs in the same PHP process right after the user's request
 * has been answered, so it needs no queue worker and the cashier never waits for it.
 */
class RefreshRiskPredictions
{
    use Dispatchable;

    public function handle(): void
    {
        $code = Artisan::call('risk:predict');

        if ($code !== 0) {
            Log::warning('risk:predict failed after a data change: '.trim(Artisan::output()));
        }
    }
}
