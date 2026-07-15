import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    accent?: 'indigo' | 'emerald' | 'blue' | 'violet' | 'amber' | 'rose';
};

const accentMap = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const trendMap = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-muted-foreground',
};

export function StatCard({
    label,
    value,
    change,
    trend = 'neutral',
    icon: Icon,
    accent = 'indigo',
}: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {change && (
                        <p className={cn('text-xs font-medium', trendMap[trend])}>
                            {change}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        accentMap[accent],
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
