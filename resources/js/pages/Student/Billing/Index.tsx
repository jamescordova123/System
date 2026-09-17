import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { CreditCard, History, ReceiptText, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ListToolbar } from '@/components/school/list-toolbar';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type FeeItem = {
    id: number;
    label: string;
    ar_number: string | null;
    amount_due: number;
    amount_paid: number;
    balance: number;
    status: string;
};

type PaymentRow = {
    id: number;
    payment_date: string;
    receipt_number: string | null;
    item_label: string | null;
    amount_paid: number;
};

type Statement = {
    id: number;
    program: string | null;
    program_label: string;
    school_year: string | null;
    due_date: string;
    status: string;
    remarks: string | null;
    total_due: number;
    total_paid: number;
    balance: number;
    items: FeeItem[];
    payments: PaymentRow[];
};

type Props = {
    summary: { assessed: number; paid: number; balance: number };
    statements: Statement[];
    filters?: { search?: string };
};

const peso = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Index({ summary, statements, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    const yearOptions = useMemo(
        () =>
            Array.from(new Set(statements.map((s) => s.school_year).filter((y): y is string => Boolean(y)))).sort(
                (a, b) => b.localeCompare(a),
            ),
        [statements],
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return statements.filter((statement) => {
            if (statusFilter !== 'all' && statement.status !== statusFilter) return false;
            if (yearFilter !== 'all' && statement.school_year !== yearFilter) return false;
            if (!term) return true;

            const haystack = [
                statement.program_label,
                statement.school_year ?? '',
                statement.remarks ?? '',
                ...statement.items.flatMap((item) => [item.label, item.ar_number ?? '']),
                ...statement.payments.flatMap((payment) => [
                    payment.receipt_number ?? '',
                    payment.item_label ?? '',
                ]),
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(term);
        });
    }, [statements, search, statusFilter, yearFilter]);

    return (
        <ModuleShell
            title="My Billing"
            breadcrumbs={[
                { title: 'Student Portal', href: '/student' },
                { title: 'My Billing', href: '/student/billing' },
            ]}
        >
            <PageHeader
                title="My Billing"
                description="Your fee assessments and payment ledger, updated whenever the Cashier records a payment."
                icon={Wallet}
                accent="emerald"
                actions={
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/student/transactions">
                            <History className="mr-2 h-4 w-4" /> Transaction History
                        </Link>
                    </Button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Assessed" value={peso(summary.assessed)} icon={Wallet} accent="emerald" />
                <StatCard label="Total Paid" value={peso(summary.paid)} icon={CreditCard} accent="blue" trend="up" />
                <StatCard
                    label="Outstanding Balance"
                    value={peso(summary.balance)}
                    icon={Wallet}
                    accent={summary.balance > 0 ? 'rose' : 'emerald'}
                />
            </div>

            {statements.length === 0 ? (
                <EmptyState
                    icon={Wallet}
                    title="No billing statements yet"
                    description="When the Cashier assesses your fees, your financial ledger will appear here."
                />
            ) : (
                <div className="space-y-4">
                    <Card className="rounded-2xl">
                        <CardContent className="pt-6">
                            <ListToolbar
                                search={search}
                                onSearchChange={setSearch}
                                searchPlaceholder="Search by program, fee item, AR #, or receipt…"
                                resultCount={filtered.length}
                                totalCount={statements.length}
                                onClear={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setYearFilter('all');
                                }}
                                filters={[
                                    {
                                        key: 'status',
                                        label: 'Status',
                                        value: statusFilter,
                                        onChange: setStatusFilter,
                                        widthClassName: 'w-[140px]',
                                        options: [
                                            { value: 'all', label: 'All status' },
                                            { value: 'unpaid', label: 'Unpaid' },
                                            { value: 'partial', label: 'Partial' },
                                            { value: 'paid', label: 'Paid' },
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
                        </CardContent>
                    </Card>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={Wallet}
                            title="No matching statements"
                            description="Try a different search term or clear your filters."
                        />
                    ) : (
                        <div className="space-y-6">
                            {filtered.map((statement) => (
                                <Card key={statement.id} className="rounded-2xl">
                                    <CardContent className="space-y-5 pt-6">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-base font-semibold">{statement.program_label}</h2>
                                                    <StatusBadge status={statement.status} />
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {[
                                                        statement.school_year ? `SY ${statement.school_year}` : null,
                                                        `Due ${statement.due_date}`,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                                {statement.remarks && (
                                                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                                                        Remarks: {statement.remarks}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm sm:min-w-[200px]">
                                                <div className="flex justify-between gap-6">
                                                    <span className="text-muted-foreground">Assessed</span>
                                                    <span className="font-semibold tabular-nums">{peso(statement.total_due)}</span>
                                                </div>
                                                <div className="mt-1 flex justify-between gap-6">
                                                    <span className="text-muted-foreground">Paid</span>
                                                    <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                                                        {peso(statement.total_paid)}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex justify-between gap-6 border-t pt-1">
                                                    <span className="font-medium">Balance</span>
                                                    <span
                                                        className={`font-bold tabular-nums ${
                                                            statement.balance > 0
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {peso(statement.balance)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {statement.items.length > 0 && (
                                            <div>
                                                <h3 className="mb-2 text-sm font-semibold">Fee Breakdown</h3>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Fee Item</TableHead>
                                                            <TableHead>AR #</TableHead>
                                                            <TableHead className="text-right">Due</TableHead>
                                                            <TableHead className="text-right">Paid</TableHead>
                                                            <TableHead className="text-right">Balance</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {statement.items.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="font-medium">{item.label}</TableCell>
                                                                <TableCell className="tabular-nums text-muted-foreground">
                                                                    {item.ar_number ?? '—'}
                                                                </TableCell>
                                                                <TableCell className="text-right tabular-nums">
                                                                    {peso(item.amount_due)}
                                                                </TableCell>
                                                                <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                                                                    {peso(item.amount_paid)}
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`text-right font-semibold tabular-nums ${
                                                                        item.balance > 0
                                                                            ? 'text-amber-600 dark:text-amber-400'
                                                                            : 'text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {peso(item.balance)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <StatusBadge status={item.status} />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                                <ReceiptText className="h-4 w-4" /> Recent Payments
                                            </h3>
                                            {statement.payments.length === 0 ? (
                                                <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                                                    No payments recorded for this assessment yet.
                                                </p>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Receipt #</TableHead>
                                                            <TableHead>Fee Item</TableHead>
                                                            <TableHead className="text-right">Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {statement.payments.map((payment) => (
                                                            <TableRow key={payment.id}>
                                                                <TableCell>{payment.payment_date}</TableCell>
                                                                <TableCell className="tabular-nums">
                                                                    {payment.receipt_number ?? '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {payment.item_label ?? (
                                                                        <Badge variant="outline" className="rounded-lg text-[10px]">
                                                                            General
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                                                                    {peso(payment.amount_paid)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Student Portal', href: '/student' },
    { title: 'My Billing', href: '/student/billing' },
]);
