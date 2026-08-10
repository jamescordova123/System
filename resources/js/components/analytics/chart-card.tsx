import { BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/school/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ChartCardProps = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    /** Analyst note rendered under the chart. */
    insight?: ReactNode;
    actions?: ReactNode;
    isEmpty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    className?: string;
    children: ReactNode;
};

export function ChartCard({
    title,
    description,
    icon: Icon,
    insight,
    actions,
    isEmpty = false,
    emptyTitle = 'No data to analyse yet',
    emptyDescription = 'Charts populate automatically once records exist for this period.',
    className,
    children,
}: ChartCardProps) {
    return (
        <Card className={cn('rounded-2xl border shadow-sm', className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        {Icon && (
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        {title}
                    </CardTitle>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {actions && <div className="shrink-0">{actions}</div>}
            </CardHeader>
            <CardContent className="space-y-4">
                {isEmpty ? (
                    <EmptyState
                        icon={Icon ?? BarChart3}
                        title={emptyTitle}
                        description={emptyDescription}
                    />
                ) : (
                    <>
                        {children}
                        {insight && (
                            <p className="rounded-xl bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                                {insight}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
