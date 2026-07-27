import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
    status: string;
    className?: string;
};

const statusStyles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    inactive: 'bg-muted text-muted-foreground border-border',
    graduated: 'bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-400',
    enrolled: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400',
    dropped: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400',
    completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    paid: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    unpaid: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400',
    partial: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
    low: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    medium: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
    high: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400',
    read: 'bg-muted text-muted-foreground border-border',
    unread: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400',
    pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
    reviewed: 'bg-[#800000]/10 text-[#800000] border-[#800000]/20 dark:text-[#FFD700]',
    approved: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    rejected: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalized = status.toLowerCase().replace(/\s+/g, '_');
    const style =
        statusStyles[normalized] ??
        'bg-secondary text-secondary-foreground border-transparent';

    return (
        <Badge
            variant="outline"
            className={cn('capitalize font-medium', style, className)}
        >
            {status.replace(/_/g, ' ')}
        </Badge>
    );
}
