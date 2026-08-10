import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartTooltip } from '@/components/analytics/chart-tooltip';
import { CHART_COLORS, formatNumber } from '@/lib/analytics';
import type { EnrollmentTrendPoint } from '@/types/analytics';

const axisProps = {
    stroke: 'currentColor',
    tick: { fontSize: 11 },
    tickLine: false,
    axisLine: false,
    className: 'text-muted-foreground',
};

export function EnrollmentTrendChart({
    data,
}: {
    data: EnrollmentTrendPoint[];
}) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border"
                />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip
                    cursor={{ fill: 'currentColor', fillOpacity: 0.06 }}
                    content={
                        <ChartTooltip
                            formatter={(value) => formatNumber(value)}
                        />
                    }
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar
                    dataKey="enrolled"
                    name="Enrolled"
                    stackId="status"
                    fill={CHART_COLORS.indigo}
                    radius={[0, 0, 0, 0]}
                />
                <Bar
                    dataKey="completed"
                    name="Completed"
                    stackId="status"
                    fill={CHART_COLORS.emerald}
                />
                <Bar
                    dataKey="dropped"
                    name="Dropped"
                    stackId="status"
                    fill={CHART_COLORS.rose}
                    radius={[6, 6, 0, 0]}
                />
                <Line
                    type="monotone"
                    dataKey="total"
                    name="Total registrations"
                    stroke={CHART_COLORS.violet}
                    strokeWidth={2}
                    dot={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
