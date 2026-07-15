import { Link } from '@inertiajs/react';
import { ArrowRight, Banknote, CreditCard, FileText, Receipt } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Payment = {
    id: number;
    student_name: string;
    amount_paid: string;
    payment_method: string;
    payment_date: string;
    received_by: string | null;
};

type Props = {
    stats: {
        billing_total: number;
        unpaid: number;
        partial: number;
        collected: number | string;
        payments_today: number;
    };
    recentPayments: Payment[];
};

export default function Dashboard({ stats, recentPayments }: Props) {
    return (
        <ModuleShell title="Cashier Dashboard" breadcrumbs={[{ title: 'Cashier', href: '/cashier' }]}>
            <PageHeader
                title="Cashier Dashboard"
                description="Process payments, issue receipts, and monitor billing collections."
                icon={Banknote}
                accent="emerald"
                actions={
                    <Button asChild className="rounded-xl">
                        <Link href="/cashier/payments">Record Payment</Link>
                    </Button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Billing Statements" value={stats.billing_total} icon={FileText} accent="emerald" />
                <StatCard label="Unpaid" value={stats.unpaid} icon={FileText} accent="rose" trend="down" />
                <StatCard label="Partial" value={stats.partial} icon={FileText} accent="amber" />
                <StatCard label="Collected" value={`₱${Number(stats.collected).toLocaleString()}`} icon={CreditCard} accent="emerald" trend="up" change={`${stats.payments_today} today`} />
            </div>

            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Payments</CardTitle>
                    <Button asChild variant="ghost" size="sm" className="rounded-xl">
                        <Link href="/cashier/payments">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {recentPayments.length === 0 ? (
                        <EmptyState icon={Receipt} title="No payments yet" description="Payment transactions will appear here once recorded." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentPayments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.student_name}</TableCell>
                                        <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">₱{p.amount_paid}</TableCell>
                                        <TableCell><Badge variant="secondary" className="capitalize rounded-lg">{p.payment_method.replace(/_/g, ' ')}</Badge></TableCell>
                                        <TableCell>{p.payment_date}</TableCell>
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

Dashboard.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }]);
