import { CreditCard } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatusBadge } from '@/components/school/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Statement = {
    id: number;
    total_amount: string;
    due_date: string;
    status: string;
};

type Props = { statements: Statement[] };

export default function Index({ statements }: Props) {
    return (
        <ModuleShell title="My Billing" breadcrumbs={[{ title: 'Student Portal', href: '/student' }, { title: 'Billing', href: '/student/billing' }]}>
            <PageHeader title="My Billing" description="Track your tuition statements and payment status." icon={CreditCard} accent="blue" />
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {statements.length === 0 ? (
                        <EmptyState icon={CreditCard} title="No billing statements" description="Your billing records will appear here." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statements.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="text-lg font-semibold">₱{s.total_amount}</TableCell>
                                        <TableCell>{s.due_date}</TableCell>
                                        <TableCell><StatusBadge status={s.status} /></TableCell>
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

Index.layout = setModuleLayout([{ title: 'Student Portal', href: '/student' }, { title: 'Billing', href: '/student/billing' }]);
