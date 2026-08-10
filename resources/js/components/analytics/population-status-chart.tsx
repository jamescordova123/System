import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { ChartTooltip } from '@/components/analytics/chart-tooltip';
import { formatNumber, SERIES_PALETTE, STATUS_COLORS } from '@/lib/analytics';
import type { PopulationStatus } from '@/types/analytics';

export function PopulationStatusChart({ data }: { data: PopulationStatus }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data.breakdown}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    strokeWidth={0}
                >
                    {data.breakdown.map((entry, index) => (
                        <Cell
                            key={entry.key}
                            fill={
                                STATUS_COLORS[entry.key] ??
                                SERIES_PALETTE[index % SERIES_PALETTE.length]
                            }
                        />
                    ))}
                </Pie>
                <Tooltip
                    content={
                        <ChartTooltip
                            formatter={(value) => formatNumber(value)}
                        />
                    }
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
        </ResponsiveContainer>
    );
}
