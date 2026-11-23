<?php

namespace App\Services\Risk;

/**
 * Adds the "payment history" inputs used by the random forest.
 *
 * For every fee row, the history is the same learner's rows whose deadline is strictly earlier
 * AND whose outcome is already known (deadline in the past). This mirrors how the model was
 * trained, so a fee never "sees" its own outcome or anything decided after its deadline.
 *
 * Pure PHP on plain arrays so it can be tested without the framework. Each row needs:
 *   key (string|int)  learner group, e.g. the billing statement id
 *   deadline (Y-m-d)  fee deadline
 *   observed (bool)   deadline already passed, so the outcome is known
 *   unpaid (bool)     not fully paid (only meaningful when observed)
 *   days_late (?int)  days paid after the deadline; null when unpaid
 */
final class HistoryFeatures
{
    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array<string, mixed>>
     */
    public static function apply(array $rows): array
    {
        $groups = [];
        foreach ($rows as $i => $row) {
            $groups[$row['key']][] = $i;
        }

        foreach ($rows as $i => $row) {
            $prior = [];
            foreach ($groups[$row['key']] as $j) {
                if ($rows[$j]['observed'] && $rows[$j]['deadline'] < $row['deadline']) {
                    $prior[] = $rows[$j];
                }
            }

            $n = count($prior);
            $unpaid = 0;
            $failed = 0;
            $lateDays = [];
            foreach ($prior as $p) {
                if ($p['unpaid']) {
                    $unpaid++;
                    $failed++;
                } else {
                    $lateDays[] = (int) $p['days_late'];
                    if ((int) $p['days_late'] > 0) {
                        $failed++;
                    }
                }
            }
            $maxLate = $lateDays === [] ? 0 : max($lateDays);

            $rows[$i]['prior_fees'] = $n;
            $rows[$i]['prior_failed'] = $failed;
            $rows[$i]['prior_unpaid'] = $unpaid;
            $rows[$i]['prior_fail_rate'] = $n > 0 ? $failed / $n : 0.0;
            // an unpaid fee counts as "as late as the latest paid one" when averaging
            $rows[$i]['prior_avg_days_late'] = $n > 0 ? (array_sum($lateDays) + $unpaid * $maxLate) / $n : 0.0;
            $rows[$i]['prior_max_days_late'] = $maxLate;
            $rows[$i]['has_history'] = $n > 0 ? 1 : 0;
        }

        return $rows;
    }
}
