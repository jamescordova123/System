import type { TooltipContentProps } from 'recharts';

type Formatter = (value: number, key: string) => string;

type ChartTooltipProps = Omit<
    Partial<TooltipContentProps<number, string>>,
    'formatter'
> & {
    formatter?: Formatter;
};

export function ChartTooltip({
    active,
    payload,
    label,
    formatter,
}: ChartTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-md">
            <p className="mb-1 font-semibold text-popover-foreground">
                {label}
            </p>
            <ul className="space-y-1">
                {payload.map((entry) => (
                    <li
                        key={`${entry.dataKey}`}
                        className="flex items-center gap-2 text-muted-foreground"
                    >
                        <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.name}</span>
                        <span className="ml-auto font-medium text-popover-foreground">
                            {formatter
                                ? formatter(
                                      Number(entry.value ?? 0),
                                      String(entry.dataKey ?? ''),
                                  )
                                : Number(entry.value ?? 0).toLocaleString()}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
