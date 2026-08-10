import { TrendingUp } from 'lucide-react';
import { ChartCard } from '@/components/analytics/chart-card';
import { RangeFilter } from '@/components/analytics/range-filter';
import { RevenueTrendChart } from '@/components/analytics/revenue-trend-chart';
import {
    formatCurrency,
    formatNumber,
    formatSignedPercent,
    linearTrendSlope,
} from '@/lib/analytics';
import type { RevenueTrendPoint, RevenueSummary } from '@/types/analytics';

function revenueInsight(
    trend: RevenueTrendPoint[],
    summary: RevenueSummary,
): string {
    const withRevenue = trend.filter((point) => point.revenue > 0);

    if (withRevenue.length === 0) {
        return 'No cash payments have been recorded in this period.';
    }

    const best = [...withRevenue].sort((a, b) => b.revenue - a.revenue)[0];
    const total = withRevenue.reduce((sum, point) => sum + point.revenue, 0);
    const average = total / withRevenue.length;
    const slope = linearTrendSlope(trend.map((point) => point.revenue));
    const direction = slope > 0 ? 'upward' : slope < 0 ? 'downward' : 'flat';

    return [
        `${formatCurrency(total)} collected over ${withRevenue.length} active month(s), averaging ${formatCurrency(average)} per month.`,
        `Peak collection was ${formatCurrency(best.revenue)} in ${best.label}.`,
        `The period shows a ${direction} trajectory (${formatCurrency(Math.abs(slope))} per month), and this month is ${formatSignedPercent(summary.growth)} versus last month.`,
    ].join(' ');
}

export function RevenueTrendPanel({
    trend,
    summary,
    months,
    url,
}: {
    trend: RevenueTrendPoint[];
    summary: RevenueSummary;
    months: number;
    url: string;
}) {
    return (
        <ChartCard
            title="Cash Revenue Over Time"
            description={`Total cash collected per month over the last ${months} months, with transaction volume.`}
            icon={TrendingUp}
            actions={<RangeFilter months={months} url={url} />}
            insight={revenueInsight(trend, summary)}
        >
            <RevenueTrendChart data={trend} />

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                        This month
                    </p>
                    <p className="mt-1 text-xl font-bold">
                        {formatCurrency(summary.this_month)}
                    </p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                        Last month
                    </p>
                    <p className="mt-1 text-xl font-bold">
                        {formatCurrency(summary.last_month)}
                    </p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                        Transactions
                    </p>
                    <p className="mt-1 text-xl font-bold">
                        {formatNumber(summary.transactions)}
                    </p>
                </div>
            </div>
        </ChartCard>
    );
}
