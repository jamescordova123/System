import { Receipt } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ReceiptRow = {
    id: number;
    receipt_number: string;
    student_name: string;
    amount: string;
    issued_at: string | null;
};

type Props = {
    receipts: ReceiptRow[];
    stats: { total: number };
};

export default function Index({ receipts, stats }: Props) {
    return (
        <ModuleShell title="Receipts" breadcrumbs={[{ title: 'Cashier', href: '/cashier' }, { title: 'Receipts', href: '/cashier/receipts' }]}>
            <PageHeader title="Issued Receipts" description="View all payment receipts issued to students." icon={Receipt} accent="emerald" />
            <StatCard label="Total Receipts" value={stats.total} icon={Receipt} accent="emerald" />
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {receipts.length === 0 ? (
                        <EmptyState icon={Receipt} title="No receipts issued" description="Receipts are generated when payments are recorded." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt #</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Issued</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {receipts.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-sm">{r.receipt_number}</TableCell>
                                        <TableCell className="font-medium">{r.student_name}</TableCell>
                                        <TableCell className="font-semibold">₱{r.amount}</TableCell>
                                        <TableCell>{r.issued_at ?? '—'}</TableCell>
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

Index.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }, { title: 'Receipts', href: '/cashier/receipts' }]);
