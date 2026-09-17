import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    accent?: 'maroon' | 'gold' | 'indigo' | 'emerald' | 'blue' | 'violet' | 'amber' | 'rose';
    actions?: ReactNode;
};

const accentStyles = {
    maroon: 'from-[#800000]/15 via-[#800000]/5 to-[#FFD700]/10 border-[#800000]/20 text-[#800000] dark:text-[#FFD700]',
    gold: 'from-[#FFD700]/25 via-[#FFD700]/10 to-transparent border-[#FFD700]/30 text-[#5d0000] dark:text-[#FFD700]',
    indigo: 'from-[#800000]/15 via-[#800000]/5 to-[#FFD700]/10 border-[#800000]/20 text-[#800000] dark:text-[#FFD700]',
    emerald: 'from-[#800000]/15 via-[#800000]/5 to-[#FFD700]/10 border-[#800000]/20 text-[#800000] dark:text-[#FFD700]',
    blue: 'from-[#800000]/15 via-[#800000]/5 to-[#FFD700]/10 border-[#800000]/20 text-[#800000] dark:text-[#FFD700]',
    violet: 'from-[#800000]/15 via-[#800000]/5 to-[#FFD700]/10 border-[#800000]/20 text-[#800000] dark:text-[#FFD700]',
    amber: 'from-[#FFD700]/25 via-[#FFD700]/10 to-transparent border-[#FFD700]/30 text-[#5d0000] dark:text-[#FFD700]',
    rose: 'from-[#800000]/15 via-[#800000]/5 to-[#FFD700]/10 border-[#800000]/20 text-[#800000] dark:text-[#FFD700]',
};

export function PageHeader({
    title,
    description,
    icon: Icon,
    accent = 'maroon',
    actions,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'dilt-animate-in relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 dilt-card-shadow',
                accentStyles[accent],
            )}
        >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FFD700]/10 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    {Icon && (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#800000]/15 bg-white/70 shadow-sm backdrop-blur-sm dark:border-[#FFD700]/20 dark:bg-white/5">
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
