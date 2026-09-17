import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { CreditCard, History, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ListToolbar } from '@/components/school/list-toolbar';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Transaction = {
    id: number;
    payment_date: string;
    payment_date_raw: string;
    receipt_number: string | null;
    item_label: string | null;
    program_label: string;
    school_year: string | null;
    payment_method: string;
    received_by: string | null;
    amount_paid: number;
};

type Props = {
    summary: { count: number; total_paid: number };
    transactions: Transaction[];
};

const peso = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Index({ summary, transactions }: Props) {
    const [search, setSearch] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    const yearOptions = useMemo(
        () =>
            Array.from(
                new Set(transactions.map((t) => t.school_year).filter((y): y is string => Boolean(y))),
            ).sort((a, b) => b.localeCompare(a)),
        [transactions],
    );

    const methodOptions = useMemo(
        () =>
            Array.from(new Set(transactions.map((t) => t.payment_method))).sort().map((m) => ({
                value: m,
                label: m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            })),
        [transactions],
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return transactions.filter((t) => {
            if (methodFilter !== 'all' && t.payment_method !== methodFilter) return false;
            if (yearFilter !== 'all' && t.school_year !== yearFilter) return false;
            if (!term) return true;
            return (
                (t.receipt_number ?? '').toLowerCase().includes(term) ||
                (t.item_label ?? '').toLowerCase().includes(term) ||
                t.program_label.toLowerCase().includes(term) ||
                (t.school_year ?? '').toLowerCase().includes(term) ||
                (t.received_by ?? '').toLowerCase().includes(term) ||
                t.payment_date.toLowerCase().includes(term)
            );
        });
    }, [transactions, search, methodFilter, yearFilter]);

    const filteredTotal = useMemo(
        () => filtered.reduce((sum, t) => sum + t.amount_paid, 0),
        [filtered],
    );

    return (
        <ModuleShell
            title="Transaction History"
            breadcrumbs={[
                { title: 'Student Portal', href: '/student' },
                { title: 'Transaction History', href: '/student/transactions' },
            ]}
        >
            <PageHeader
                title="Transaction History"
                description="Search and review every payment recorded against your fee assessments."
                icon={History}
                accent="blue"
                actions={
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/student/billing">
                            <Wallet className="mr-2 h-4 w-4" /> My Billing
                        </Link>
                    </Button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Transactions" value={summary.count} icon={History} accent="blue" />
                <StatCard label="Total Paid" value={peso(summary.total_paid)} icon={CreditCard} accent="emerald" trend="up" />
                <StatCard
                    label={search || methodFilter !== 'all' || yearFilter !== 'all' ? 'Filtered Total' : 'Showing'}
                    value={peso(filteredTotal)}
                    icon={Wallet}
                    accent="violet"
                />
            </div>

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <ListToolbar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search by receipt #, fee item, program, or cashier…"
                        resultCount={filtered.length}
                        totalCount={transactions.length}
                        onClear={() => {
                            setSearch('');
                            setMethodFilter('all');
                            setYearFilter('all');
                        }}
                        filters={[
                            {
                                key: 'method',
                                label: 'Method',
                                value: methodFilter,
                                onChange: setMethodFilter,
                                widthClassName: 'w-[150px]',
                                options: [
                                    { value: 'all', label: 'All methods' },
                                    ...methodOptions,
                                ],
                            },
                            {
                                key: 'year',
                                label: 'School Year',
                                value: yearFilter,
                                onChange: setYearFilter,
                                widthClassName: 'w-[150px]',
                                options: [
                                    { value: 'all', label: 'All years' },
                                    ...yearOptions.map((y) => ({ value: y, label: y })),
                                ],
                            },
                        ]}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={History}
                            title={transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
                            description={
                                transactions.length === 0
                                    ? 'Payments recorded by the Cashier will appear here.'
                                    : 'Try a different search term or clear your filters.'
                            }
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Receipt #</TableHead>
                                    <TableHead>Fee / Program</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Received By</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.payment_date}</TableCell>
                                        <TableCell className="font-mono text-sm tabular-nums">
                                            {t.receipt_number ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{t.item_label ?? 'General payment'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {t.program_label}
                                                {t.school_year ? ` · SY ${t.school_year}` : ''}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="rounded-lg capitalize">
                                                {t.payment_method.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {t.received_by ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                                            {peso(t.amount_paid)}
                                        </TableCell>
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

Index.layout = setModuleLayout([
    { title: 'Student Portal', href: '/student' },
    { title: 'Transaction History', href: '/student/transactions' },
]);
