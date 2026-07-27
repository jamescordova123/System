import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    accent?: 'maroon' | 'gold' | 'indigo' | 'emerald' | 'blue' | 'violet' | 'amber' | 'rose';
};

const accentMap = {
    maroon: 'bg-[#800000]/10 text-[#800000] dark:bg-[#800000]/20 dark:text-[#FFD700]',
    gold: 'bg-[#FFD700]/20 text-[#5d0000] dark:bg-[#FFD700]/15 dark:text-[#FFD700]',
    indigo: 'bg-[#800000]/8 text-[#800000] dark:bg-[#800000]/15 dark:text-[#FFD700]',
    emerald: 'bg-[#800000]/8 text-[#800000] dark:bg-[#800000]/15 dark:text-[#FFD700]',
    blue: 'bg-[#800000]/8 text-[#800000] dark:bg-[#800000]/15 dark:text-[#FFD700]',
    violet: 'bg-[#800000]/8 text-[#800000] dark:bg-[#800000]/15 dark:text-[#FFD700]',
    amber: 'bg-[#FFD700]/20 text-[#5d0000] dark:bg-[#FFD700]/15 dark:text-[#FFD700]',
    rose: 'bg-[#800000]/10 text-[#800000] dark:bg-[#800000]/20 dark:text-[#FFD700]',
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
    accent = 'maroon',
}: StatCardProps) {
    return (
        <div className="group dilt-animate-in relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 dilt-card-shadow transition-all duration-300 hover:-translate-y-0.5 hover:border-[#800000]/20 hover:shadow-lg">
            <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-[#800000]/8 to-[#FFD700]/10 opacity-60 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                    {change && (
                        <p className={cn('text-xs font-medium', trendMap[trend])}>
                            {change}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-[#800000]/10',
                        accentMap[accent],
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
