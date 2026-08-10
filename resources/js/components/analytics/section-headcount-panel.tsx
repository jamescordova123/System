import { Layers } from 'lucide-react';
import { ChartCard } from '@/components/analytics/chart-card';
import { StudentsBySectionChart } from '@/components/analytics/students-by-section-chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatNumber, formatPercent } from '@/lib/analytics';
import type { SectionHeadcount } from '@/types/analytics';

function headcountInsight(data: SectionHeadcount[]): string {
    const populated = data.filter((row) => row.students > 0);

    if (populated.length === 0) {
        return 'No students are currently assigned to a section.';
    }

    const largest = populated[0];
    const smallest = populated[populated.length - 1];
    const total = populated.reduce((sum, row) => sum + row.students, 0);
    const average = total / populated.length;
    const empty = data.length - populated.length;

    return [
        `${largest.section} carries the largest cohort at ${formatNumber(largest.students)} students (${formatPercent(largest.share)} of all section placements),`,
        `while ${smallest.section} is the smallest at ${formatNumber(smallest.students)}.`,
        `Average section size is ${average.toFixed(1)} students across ${populated.length} active sections`,
        empty > 0 ? `, with ${empty} section(s) still unpopulated.` : '.',
    ].join(' ');
}

export function SectionHeadcountPanel({ data }: { data: SectionHeadcount[] }) {
    return (
        <ChartCard
            title="Total Students by Section"
            description="Distinct student headcount per class section, ranked by size."
            icon={Layers}
            isEmpty={data.length === 0}
            emptyTitle="No sections yet"
            emptyDescription="Create sections and enroll students to see the distribution."
            insight={headcountInsight(data)}
        >
            <StudentsBySectionChart data={data} />

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Section</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead className="text-right">
                                Students
                            </TableHead>
                            <TableHead className="text-right">
                                Enrolled
                            </TableHead>
                            <TableHead className="text-right">
                                Dropped
                            </TableHead>
                            <TableHead className="text-right">
                                Completed
                            </TableHead>
                            <TableHead className="text-right">Share</TableHead>
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
                                <TableCell className="text-right font-semibold">
                                    {formatNumber(row.students)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNumber(row.enrolled)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNumber(row.dropped)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNumber(row.completed)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatPercent(row.share)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </ChartCard>
    );
}
