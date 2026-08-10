import {
    Area,
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
import {
    CHART_COLORS,
    formatCompactCurrency,
    formatCurrency,
    formatNumber,
} from '@/lib/analytics';
import type { RevenueTrendPoint } from '@/types/analytics';

const axisProps = {
    stroke: 'currentColor',
    tick: { fontSize: 11 },
    tickLine: false,
    axisLine: false,
    className: 'text-muted-foreground',
};

export function RevenueTrendChart({ data }: { data: RevenueTrendPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
            >
                <defs>
                    <linearGradient
                        id="revenueFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor={CHART_COLORS.emerald}
                            stopOpacity={0.35}
                        />
                        <stop
                            offset="100%"
                            stopColor={CHART_COLORS.emerald}
                            stopOpacity={0.02}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border"
                />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis
                    yAxisId="revenue"
                    tickFormatter={(value: number) =>
                        formatCompactCurrency(value)
                    }
                    {...axisProps}
                />
                <YAxis
                    yAxisId="transactions"
                    orientation="right"
                    allowDecimals={false}
                    {...axisProps}
                />
                <Tooltip
                    cursor={{ stroke: 'currentColor', strokeOpacity: 0.2 }}
                    content={
                        <ChartTooltip
                            formatter={(value, key) =>
                                key === 'transactions'
                                    ? formatNumber(value)
                                    : formatCurrency(value)
                            }
                        />
                    }
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="Cash collected"
                    stroke={CHART_COLORS.emerald}
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                />
                <Line
                    yAxisId="transactions"
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions"
                    stroke={CHART_COLORS.indigo}
                    strokeWidth={2}
                    dot={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
