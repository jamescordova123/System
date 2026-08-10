import { LineChart } from 'lucide-react';
import { ChartCard } from '@/components/analytics/chart-card';
import { EnrollmentTrendChart } from '@/components/analytics/enrollment-trend-chart';
import { RangeFilter } from '@/components/analytics/range-filter';
import {
    formatNumber,
    formatPercent,
    formatSignedPercent,
    linearTrendSlope,
} from '@/lib/analytics';
import type {
    EnrollmentSummary,
    EnrollmentTrendPoint,
} from '@/types/analytics';

function enrollmentInsight(
    trend: EnrollmentTrendPoint[],
    summary: EnrollmentSummary,
): string {
    const active = trend.filter((point) => point.total > 0);

    if (active.length === 0) {
        return 'No enrollment activity recorded in this period.';
    }

    const peak = [...active].sort((a, b) => b.total - a.total)[0];
    const periodTotal = active.reduce((sum, point) => sum + point.total, 0);
    const slope = linearTrendSlope(trend.map((point) => point.total));
    const direction =
        slope > 0 ? 'growing' : slope < 0 ? 'declining' : 'stable';

    return [
        `${formatNumber(periodTotal)} registrations across ${active.length} active month(s), peaking at ${formatNumber(peak.total)} in ${peak.label}.`,
        `Volume is ${direction} at ${Math.abs(slope).toFixed(1)} registrations per month, and this month is ${formatSignedPercent(summary.growth)} versus last month.`,
        `Retention (non-dropped enrollments) stands at ${formatPercent(summary.retention_rate)}.`,
    ].join(' ');
}

export function EnrollmentTrendPanel({
    trend,
    summary,
    months,
    url,
}: {
    trend: EnrollmentTrendPoint[];
    summary: EnrollmentSummary;
    months: number;
    url: string;
}) {
    return (
        <ChartCard
            title="Enrollment Summary Over Time"
            description={`Monthly registrations for the last ${months} months, split by enrollment status.`}
            icon={LineChart}
            actions={<RangeFilter months={months} url={url} />}
            insight={enrollmentInsight(trend, summary)}
        >
            <EnrollmentTrendChart data={trend} />

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total', value: summary.total },
                    { label: 'Enrolled', value: summary.enrolled },
                    { label: 'Completed', value: summary.completed },
                    { label: 'Dropped', value: summary.dropped },
                ].map((tile) => (
                    <div
                        key={tile.label}
                        className="rounded-xl border bg-muted/20 p-3"
                    >
                        <p className="text-xs tracking-wider text-muted-foreground uppercase">
                            {tile.label}
                        </p>
                        <p className="mt-1 text-xl font-bold">
                            {formatNumber(tile.value)}
                        </p>
                    </div>
                ))}
            </div>
        </ChartCard>
    );
}
