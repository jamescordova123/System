import { PieChart, UserCheck, UserMinus, GraduationCap } from 'lucide-react';
import { ChartCard } from '@/components/analytics/chart-card';
import { PopulationStatusChart } from '@/components/analytics/population-status-chart';
import { formatNumber, formatPercent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { PopulationStatus } from '@/types/analytics';

const tiles = [
    {
        key: 'active',
        label: 'Active',
        icon: UserCheck,
        className: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        key: 'inactive',
        label: 'Inactive',
        icon: UserMinus,
        className: 'text-amber-600 dark:text-amber-400',
    },
    {
        key: 'graduated',
        label: 'Graduated',
        icon: GraduationCap,
        className: 'text-violet-600 dark:text-violet-400',
    },
] as const;

function populationInsight(data: PopulationStatus): string {
    if (data.total === 0) {
        return 'No student records exist yet.';
    }

    const dominant = [...data.breakdown].sort((a, b) => b.count - a.count)[0];

    return [
        `${formatPercent(data.active_rate)} of the ${formatNumber(data.total)} registered students are active;`,
        `the largest cohort is "${dominant.status}" with ${formatNumber(dominant.count)} students.`,
        data.unassigned > 0
            ? `${formatNumber(data.unassigned)} student(s) have no active section placement and need registrar follow-up.`
            : 'Every student currently holds an active section placement.',
    ].join(' ');
}

export function PopulationStatusPanel({ data }: { data: PopulationStatus }) {
    return (
        <ChartCard
            title="Student Population Status"
            description="Lifecycle mix of the registered student body."
            icon={PieChart}
            isEmpty={data.total === 0}
            emptyTitle="No students registered"
            emptyDescription="Register students to see the population breakdown."
            insight={populationInsight(data)}
        >
            <PopulationStatusChart data={data} />

            <div className="grid gap-3 sm:grid-cols-3">
                {tiles.map((tile) => {
                    const entry = data.breakdown.find(
                        (item) => item.key === tile.key,
                    );

                    return (
                        <div
                            key={tile.key}
                            className="rounded-xl border bg-muted/20 p-3"
                        >
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <tile.icon
                                    className={cn('h-4 w-4', tile.className)}
                                />
                                {tile.label}
                            </div>
                            <p className="mt-1 text-xl font-bold">
                                {formatNumber(entry?.count ?? 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatPercent(entry?.percentage ?? 0)} of
                                population
                            </p>
                        </div>
                    );
                })}
            </div>
        </ChartCard>
    );
}
