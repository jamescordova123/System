import type { CSSProperties, ReactNode } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ChartCardProps = {
    title: string;
    description?: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function ChartCard({ title, description, icon, children, className }: ChartCardProps) {
    return (
        <Card className={cn('rounded-2xl', className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle className="text-base">{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                {icon && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#800000]/8 text-[#800000] dark:bg-[#800000]/15 dark:text-[#FFD700]">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

// Brand-aligned palette (maroon / gold) extended with supporting hues.
// The first five map to the theme's chart tokens so the look follows the
// active light/dark theme; the rest are fixed brand hues for extra series.
export const chartPalette = {
    maroon: 'var(--chart-1)',
    gold: 'var(--chart-2)',
    emerald: 'var(--chart-3)',
    blue: '#3b82f6',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    rose: '#e11d48',
    slate: '#64748b',
};

export const categoricalColors = [
    chartPalette.maroon,
    chartPalette.gold,
    chartPalette.emerald,
    chartPalette.blue,
    chartPalette.violet,
    chartPalette.amber,
    chartPalette.rose,
    chartPalette.slate,
];

export const riskColors: Record<string, string> = {
    high: chartPalette.rose,
    medium: chartPalette.amber,
    low: chartPalette.emerald,
};

const tooltipStyle: CSSProperties = {
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--popover)',
    color: 'var(--popover-foreground)',
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
};

const axisStroke = 'var(--muted-foreground)';
const gridStroke = 'var(--border)';

type SimpleDatum = Record<string, string | number | null>;

type BarChartCardProps = {
    data: SimpleDatum[];
    xKey: string;
    bars: { key: string; label: string; color?: string; stackId?: string }[];
    height?: number;
    formatValue?: (value: number) => string;
};

export function BarChartCard({ data, xKey, bars, height = 300, formatValue }: BarChartCardProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke={axisStroke} />
                <YAxis tick={{ fontSize: 11 }} stroke={axisStroke} tickFormatter={(v) => (formatValue ? formatValue(Number(v)) : String(v))} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatValue ? formatValue(Number(value)) : String(value), name]} cursor={{ fill: 'rgba(128,0,0,0.05)' }} />
                {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                {bars.map((bar) => (
                    <Bar key={bar.key} dataKey={bar.key} name={bar.label} stackId={bar.stackId} fill={bar.color ?? chartPalette.maroon} radius={bar.stackId ? 0 : [6, 6, 0, 0]} maxBarSize={48} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}

type LineChartCardProps = {
    data: SimpleDatum[];
    xKey: string;
    lines: { key: string; label: string; color?: string }[];
    height?: number;
    formatValue?: (value: number) => string;
};

export function LineChartCard({ data, xKey, lines, height = 300, formatValue }: LineChartCardProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke={axisStroke} />
                <YAxis tick={{ fontSize: 11 }} stroke={axisStroke} tickFormatter={(v) => (formatValue ? formatValue(Number(v)) : String(v))} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatValue ? formatValue(Number(value)) : String(value), name]} />
                {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                {lines.map((line) => (
                    <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color ?? chartPalette.maroon} strokeWidth={2.5} dot={{ r: 3, fill: line.color ?? chartPalette.maroon }} activeDot={{ r: 5 }} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}

type PieDatum = { name: string; value: number; color?: string };

type PieChartCardProps = {
    data: PieDatum[];
    height?: number;
    formatValue?: (value: number) => string;
};

export function PieChartCard({ data, height = 300, formatValue }: PieChartCardProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color ?? categoricalColors[index % categoricalColors.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatValue ? formatValue(Number(value)) : String(value), name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
        </ResponsiveContainer>
    );
}

type HorizontalBarChartCardProps = {
    data: SimpleDatum[];
    yKey: string;
    bars: { key: string; label: string; color?: string }[];
    height?: number;
    formatValue?: (value: number) => string;
};

export function HorizontalBarChartCard({ data, yKey, bars, height = 300, formatValue }: HorizontalBarChartCardProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke={axisStroke} tickFormatter={(v) => (formatValue ? formatValue(Number(v)) : String(v))} />
                <YAxis type="category" dataKey={yKey} tick={{ fontSize: 11 }} stroke={axisStroke} width={140} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatValue ? formatValue(Number(value)) : String(value), name]} cursor={{ fill: 'rgba(128,0,0,0.05)' }} />
                {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                {bars.map((bar) => (
                    <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color ?? chartPalette.maroon} radius={[0, 6, 6, 0]} maxBarSize={28} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}

type EmptyChartProps = {
    message: string;
};

export function EmptyChart({ message }: EmptyChartProps) {
    return (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

export const peso = (value: number) =>
    `₱${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const pesoDecimal = (value: number) =>
    `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
