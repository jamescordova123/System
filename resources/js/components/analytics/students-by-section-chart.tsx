import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartTooltip } from '@/components/analytics/chart-tooltip';
import { formatNumber, SERIES_PALETTE } from '@/lib/analytics';
import type { SectionHeadcount } from '@/types/analytics';

const axisProps = {
    stroke: 'currentColor',
    tick: { fontSize: 11 },
    tickLine: false,
    axisLine: false,
    className: 'text-muted-foreground',
};

export function StudentsBySectionChart({ data }: { data: SectionHeadcount[] }) {
    const height = Math.max(260, data.length * 42);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 0, left: 8 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-border"
                />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis
                    type="category"
                    dataKey="section"
                    width={110}
                    {...axisProps}
                />
                <Tooltip
                    cursor={{ fill: 'currentColor', fillOpacity: 0.06 }}
                    content={
                        <ChartTooltip
                            formatter={(value) => formatNumber(value)}
                        />
                    }
                />
                <Bar dataKey="students" name="Students" radius={[0, 6, 6, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={entry.section}
                            fill={SERIES_PALETTE[index % SERIES_PALETTE.length]}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
