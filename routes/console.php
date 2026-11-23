<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Safety net: deadlines pass with no database change, so also refresh every 15 minutes.
Schedule::command('risk:predict')->everyFifteenMinutes()->withoutOverlapping();
