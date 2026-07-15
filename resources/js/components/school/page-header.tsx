import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    accent?: 'indigo' | 'emerald' | 'blue' | 'violet' | 'amber' | 'rose';
    actions?: ReactNode;
};

const accentStyles = {
    indigo: 'from-indigo-500/20 via-indigo-500/5 to-transparent border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    blue: 'from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/20 text-blue-600 dark:text-blue-400',
    violet: 'from-violet-500/20 via-violet-500/5 to-transparent border-violet-500/20 text-violet-600 dark:text-violet-400',
    amber: 'from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/20 text-amber-600 dark:text-amber-400',
    rose: 'from-rose-500/20 via-rose-500/5 to-transparent border-rose-500/20 text-rose-600 dark:text-rose-400',
};

export function PageHeader({
    title,
    description,
    icon: Icon,
    accent = 'indigo',
    actions,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6',
                accentStyles[accent],
            )}
        >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl dark:bg-white/5" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    {Icon && (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/60 shadow-sm backdrop-blur-sm dark:bg-white/10">
                            <Icon className="h-6 w-6" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
