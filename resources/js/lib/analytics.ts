export const CHART_COLORS = {
    indigo: '#6366f1',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    blue: '#3b82f6',
    slate: '#94a3b8',
} as const;

export const STATUS_COLORS: Record<string, string> = {
    active: CHART_COLORS.emerald,
    inactive: CHART_COLORS.amber,
    graduated: CHART_COLORS.violet,
    enrolled: CHART_COLORS.indigo,
    dropped: CHART_COLORS.rose,
    completed: CHART_COLORS.emerald,
};

export const SERIES_PALETTE = [
    CHART_COLORS.indigo,
    CHART_COLORS.emerald,
    CHART_COLORS.amber,
    CHART_COLORS.violet,
    CHART_COLORS.blue,
    CHART_COLORS.rose,
];

export function formatCurrency(value: number): string {
    return `₱${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function formatCompactCurrency(value: number): string {
    if (Math.abs(value) >= 1000) {
        return `₱${(value / 1000).toLocaleString(undefined, {
            maximumFractionDigits: 1,
        })}k`;
    }

    return `₱${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value: number): string {
    return Number(value).toLocaleString();
}

export function formatPercent(value: number, fractionDigits = 1): string {
    return `${Number(value).toFixed(fractionDigits)}%`;
}

export function formatSignedPercent(value: number): string {
    const sign = value > 0 ? '+' : '';

    return `${sign}${Number(value).toFixed(1)}%`;
}

export function trendOf(value: number): 'up' | 'down' | 'neutral' {
    if (value > 0) {
        return 'up';
    }

    return value < 0 ? 'down' : 'neutral';
}

/**
 * Least-squares slope over an evenly spaced series, expressed as the average
 * change per period. Used to describe whether a metric is trending up or down.
 */
export function linearTrendSlope(values: number[]): number {
    const n = values.length;

    if (n < 2) {
        return 0;
    }

    const meanX = (n - 1) / 2;
    const meanY = values.reduce((sum, value) => sum + value, 0) / n;

    let numerator = 0;
    let denominator = 0;

    values.forEach((value, index) => {
        numerator += (index - meanX) * (value - meanY);
        denominator += (index - meanX) ** 2;
    });

    return denominator === 0 ? 0 : numerator / denominator;
}
