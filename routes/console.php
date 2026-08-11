<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Refresh the Random Forest delinquency predictions each night so the
// cashier risk dashboard always reflects the latest billing activity.
Schedule::command('analytics:predict-delinquency')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->description('Train the Random Forest delinquency model and persist per-section risk predictions.');
