import { History } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type HistoryRow = {
    id: number;
    student_name: string;
    student_number: string;
    total_paid: string;
    last_payment_date: string | null;
};

type Props = {
    histories: HistoryRow[];
    stats: { total: number };
};

export default function Index({ histories, stats }: Props) {
    return (
        <ModuleShell title="Payment History" breadcrumbs={[{ title: 'Cashier', href: '/cashier' }, { title: 'Payment History', href: '/cashier/payment-history' }]}>
            <PageHeader title="Payment History" description="Aggregated payment records per student for audit and reporting." icon={History} accent="emerald" />
            <StatCard label="Student Records" value={stats.total} icon={History} accent="emerald" />
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {histories.length === 0 ? (
                        <EmptyState icon={History} title="No payment history" description="Student payment summaries will appear here." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Total Paid</TableHead>
                                    <TableHead>Last Payment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {histories.map((h) => (
                                    <TableRow key={h.id}>
                                        <TableCell>
                                            <div className="font-medium">{h.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{h.student_number}</div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">₱{h.total_paid}</TableCell>
                                        <TableCell>{h.last_payment_date ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }, { title: 'Payment History', href: '/cashier/payment-history' }]);
