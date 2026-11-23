<?php

use App\Services\Risk\HistoryFeatures;

function feeRow(string $deadline, bool $observed, bool $unpaid, ?int $daysLate, string $key = 'a'): array
{
    return ['key' => $key, 'deadline' => $deadline, 'observed' => $observed, 'unpaid' => $unpaid, 'days_late' => $daysLate];
}

it('has no history for the first fee', function () {
    $rows = HistoryFeatures::apply([feeRow('2025-08-16', true, false, 0)]);

    expect($rows[0]['has_history'])->toBe(0)
        ->and($rows[0]['prior_fees'])->toBe(0)
        ->and($rows[0]['prior_fail_rate'])->toBe(0.0);
});

it('counts only earlier fees whose outcome is known', function () {
    $rows = HistoryFeatures::apply([
        feeRow('2025-08-16', true, false, 0),    // on time
        feeRow('2025-10-16', true, false, 10),   // paid 10 days late
        feeRow('2025-12-16', true, true, null),  // never paid
        feeRow('2026-02-16', false, true, null), // deadline not passed: outcome unknown, must not count
        feeRow('2026-06-16', false, true, null), // the fee being scored
    ]);

    $last = $rows[4];
    expect($last['prior_fees'])->toBe(3)
        ->and($last['prior_failed'])->toBe(2)
        ->and($last['prior_unpaid'])->toBe(1)
        ->and($last['prior_max_days_late'])->toBe(10)
        // an unpaid fee counts as as late as the latest paid one: (0 + 10 + 10) / 3
        ->and(round($last['prior_avg_days_late'], 4))->toBe(round(20 / 3, 4));
});

it('ignores fees with the same deadline and other learners', function () {
    $rows = HistoryFeatures::apply([
        feeRow('2025-08-16', true, true, null),
        feeRow('2025-08-16', true, false, 0),
        feeRow('2025-08-16', true, true, null, 'b'),
        feeRow('2025-10-16', false, true, null),
    ]);

    expect($rows[0]['prior_fees'])->toBe(0)
        ->and($rows[1]['prior_fees'])->toBe(0)
        ->and($rows[3]['prior_fees'])->toBe(2);
});
