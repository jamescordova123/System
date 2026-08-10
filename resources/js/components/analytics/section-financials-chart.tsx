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
import {
    CHART_COLORS,
    formatCompactCurrency,
    formatCurrency,
    formatPercent,
} from '@/lib/analytics';
import type { SectionFinancials } from '@/types/analytics';

const axisProps = {
    stroke: 'currentColor',
    tick: { fontSize: 11 },
    tickLine: false,
    axisLine: false,
    className: 'text-muted-foreground',
};

export function SectionFinancialsChart({
    data,
}: {
    data: SectionFinancials[];
}) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border"
                />
                <XAxis
                    dataKey="section"
                    interval={0}
                    angle={data.length > 6 ? -25 : 0}
                    textAnchor={data.length > 6 ? 'end' : 'middle'}
                    height={data.length > 6 ? 60 : 30}
                    {...axisProps}
                />
                <YAxis
                    yAxisId="amount"
                    tickFormatter={(value: number) =>
                        formatCompactCurrency(value)
                    }
                    {...axisProps}
                />
                <YAxis
                    yAxisId="rate"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                    {...axisProps}
                />
                <Tooltip
                    cursor={{ fill: 'currentColor', fillOpacity: 0.06 }}
                    content={
                        <ChartTooltip
                            formatter={(value, key) =>
                                key === 'collection_rate'
                                    ? formatPercent(value)
                                    : formatCurrency(value)
                            }
                        />
                    }
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar
                    yAxisId="amount"
                    dataKey="billed"
                    name="Billed"
                    fill={CHART_COLORS.slate}
                    radius={[6, 6, 0, 0]}
                />
                <Bar
                    yAxisId="amount"
                    dataKey="collected"
                    name="Collected"
                    fill={CHART_COLORS.emerald}
                    radius={[6, 6, 0, 0]}
                />
                <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="collection_rate"
                    name="Collection rate"
                    stroke={CHART_COLORS.amber}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
