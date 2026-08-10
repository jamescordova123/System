import { Banknote } from 'lucide-react';
import { ChartCard } from '@/components/analytics/chart-card';
import { SectionFinancialsChart } from '@/components/analytics/section-financials-chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { SectionFinancials } from '@/types/analytics';

function financialInsight(data: SectionFinancials[]): string {
    const billed = data.filter((row) => row.billed > 0);

    if (billed.length === 0) {
        return 'No billing statements have been attributed to a section yet.';
    }

    const top = [...billed].sort((a, b) => b.collected - a.collected)[0];
    const weakest = [...billed].sort(
        (a, b) => a.collection_rate - b.collection_rate,
    )[0];
    const totalBilled = billed.reduce((sum, row) => sum + row.billed, 0);
    const totalCollected = billed.reduce((sum, row) => sum + row.collected, 0);
    const overallRate =
        totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    return [
        `${top.section} contributes the most revenue at ${formatCurrency(top.collected)} (${formatPercent(top.collection_rate)} of its billings collected).`,
        `${weakest.section} has the weakest collection rate at ${formatPercent(weakest.collection_rate)} with ${formatCurrency(weakest.outstanding)} outstanding.`,
        `Overall collection efficiency across sections is ${formatPercent(overallRate)}.`,
    ].join(' ');
}

function rateTone(rate: number): string {
    if (rate >= 80) {
        return 'text-emerald-600 dark:text-emerald-400';
    }

    if (rate >= 50) {
        return 'text-amber-600 dark:text-amber-400';
    }

    return 'text-rose-600 dark:text-rose-400';
}

export function SectionFinancialsPanel({
    data,
}: {
    data: SectionFinancials[];
}) {
    return (
        <ChartCard
            title="Financial Performance per Section"
            description="Billed versus collected amounts per section, with collection efficiency. Each student's billing is attributed to their latest section."
            icon={Banknote}
            isEmpty={data.length === 0}
            emptyTitle="No section financials yet"
            emptyDescription="Issue billing statements to enrolled students to populate this view."
            insight={financialInsight(data)}
        >
            <SectionFinancialsChart data={data} />

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Section</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead className="text-right">
                                Students
                            </TableHead>
                            <TableHead className="text-right">Billed</TableHead>
                            <TableHead className="text-right">
                                Collected
                            </TableHead>
                            <TableHead className="text-right">
                                Outstanding
                            </TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={`${row.section}-${row.course}`}>
                                <TableCell className="font-medium">
                                    {row.section}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {row.course}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNumber(row.students)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(row.billed)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(row.collected)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(row.outstanding)}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        'text-right font-semibold',
                                        rateTone(row.collection_rate),
                                    )}
                                >
                                    {formatPercent(row.collection_rate)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </ChartCard>
    );
}
