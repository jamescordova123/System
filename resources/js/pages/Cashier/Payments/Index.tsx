import { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CreditCard, History, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ListToolbar } from '@/components/school/list-toolbar';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type BillingOption = { value: number; label: string; total_amount: number };

type Payment = {
    id: number;
    student_name: string;
    amount_paid: string;
    payment_method: string;
    payment_date: string;
    received_by: string | null;
};

type HistoryRow = {
    id: number;
    student_name: string;
    student_number: string | null;
    total_paid: string;
    total_balance: string;
    last_payment_date: string | null;
};

type Props = {
    payments: Payment[];
    histories: HistoryRow[];
    stats: { total: number; collected: string; students_tracked: number };
    billingOptions: BillingOption[];
};

const emptyForm = {
    billing_id: '',
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
};

export default function Index({ payments, histories, stats, billingOptions }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [balanceFilter, setBalanceFilter] = useState('all');
    const { data, setData, post, processing, errors, reset } = useForm(emptyForm);

    const selectedBilling = billingOptions.find((b) => String(b.value) === data.billing_id);

    const filteredPayments = useMemo(() => {
        const term = search.trim().toLowerCase();
        return payments.filter((p) => {
            if (methodFilter !== 'all' && p.payment_method !== methodFilter) return false;
            if (!term) return true;
            return (
                p.student_name.toLowerCase().includes(term) ||
                p.received_by?.toLowerCase().includes(term) ||
                p.payment_date.toLowerCase().includes(term)
            );
        });
    }, [payments, search, methodFilter]);

    const filteredHistories = useMemo(() => {
        const term = search.trim().toLowerCase();
        return histories.filter((h) => {
            if (balanceFilter === 'outstanding' && h.total_balance === '0.00') return false;
            if (balanceFilter === 'cleared' && h.total_balance !== '0.00') return false;
            if (!term) return true;
            return (
                h.student_name.toLowerCase().includes(term) ||
                (h.student_number ?? '').toLowerCase().includes(term)
            );
        });
    }, [histories, search, balanceFilter]);

    const clearFilters = () => {
        setSearch('');
        setMethodFilter('all');
        setBalanceFilter('all');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cashier/payments', {
            onSuccess: () => { setOpen(false); reset(); },
            onError: () => toast.error('Please fix the form errors.'),
        });
    };

    return (
        <ModuleShell title="Payments" breadcrumbs={[{ title: 'Cashier', href: '/cashier' }, { title: 'Payments', href: '/cashier/payments' }]}>
            <PageHeader
                title="Payments & History"
                description="Record payments, auto-generate receipts, and track each student's payment history in one place."
                icon={CreditCard}
                accent="emerald"
                actions={<Button className="rounded-xl" onClick={() => { reset(); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Record Payment</Button>}
            />
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Payments" value={stats.total} icon={CreditCard} accent="emerald" />
                <StatCard label="Total Collected" value={`₱${stats.collected}`} icon={CreditCard} accent="blue" trend="up" />
                <StatCard label="Students Tracked" value={stats.students_tracked} icon={Users} accent="gold" />
            </div>

            <Tabs defaultValue="transactions" className="w-full">
                <TabsList>
                    <TabsTrigger value="transactions">
                        <CreditCard className="mr-1.5 h-4 w-4" /> Transactions
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="mr-1.5 h-4 w-4" /> Payment History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                    <Card className="rounded-2xl">
                        <CardContent className="pt-6">
                            <ListToolbar
                                search={search}
                                onSearchChange={setSearch}
                                searchPlaceholder="Search by student, cashier, or date…"
                                resultCount={filteredPayments.length}
                                totalCount={payments.length}
                                onClear={clearFilters}
                                filters={[
                                    {
                                        key: 'method',
                                        label: 'Method',
                                        value: methodFilter,
                                        onChange: setMethodFilter,
                                        widthClassName: 'w-[140px]',
                                        options: [
                                            { value: 'all', label: 'All methods' },
                                            { value: 'cash', label: 'Cash' },
                                        ],
                                    },
                                ]}
                            />
                            {filteredPayments.length === 0 ? (
                                <EmptyState icon={CreditCard} title="No payments recorded" description="Payment transactions will be listed here." action={<Button onClick={() => setOpen(true)} className="rounded-xl">Record Payment</Button>} />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Received By</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayments.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.student_name}</TableCell>
                                                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">₱{p.amount_paid}</TableCell>
                                                <TableCell><Badge variant="secondary" className="capitalize rounded-lg">{p.payment_method.replace(/_/g, ' ')}</Badge></TableCell>
                                                <TableCell>{p.received_by ?? '—'}</TableCell>
                                                <TableCell>{p.payment_date}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="rounded-2xl">
                        <CardContent className="pt-6">
                            <ListToolbar
                                search={search}
                                onSearchChange={setSearch}
                                searchPlaceholder="Search by student name or number…"
                                resultCount={filteredHistories.length}
                                totalCount={histories.length}
                                onClear={clearFilters}
                                filters={[
                                    {
                                        key: 'balance',
                                        label: 'Balance',
                                        value: balanceFilter,
                                        onChange: setBalanceFilter,
                                        widthClassName: 'w-[160px]',
                                        options: [
                                            { value: 'all', label: 'All balances' },
                                            { value: 'outstanding', label: 'Has balance' },
                                            { value: 'cleared', label: 'Fully paid' },
                                        ],
                                    },
                                ]}
                            />
                            {filteredHistories.length === 0 ? (
                                <EmptyState icon={History} title="No payment history" description="Student payment summaries will appear here once payments are recorded." />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Total Paid</TableHead>
                                            <TableHead>Balance</TableHead>
                                            <TableHead>Last Payment</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHistories.map((h) => (
                                            <TableRow key={h.id}>
                                                <TableCell>
                                                    <div className="font-medium">{h.student_name}</div>
                                                    <div className="text-xs text-muted-foreground">{h.student_number}</div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">₱{h.total_paid}</TableCell>
                                                <TableCell className={h.total_balance !== '0.00' ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}>₱{h.total_balance}</TableCell>
                                                <TableCell>{h.last_payment_date ?? '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="Billing Statement" error={errors.billing_id} required>
                            <Select value={data.billing_id} onValueChange={(v) => {
                                setData('billing_id', v);
                                const billing = billingOptions.find((b) => String(b.value) === v);
                                if (billing && !data.amount_paid) {
                                    setData('amount_paid', String(billing.total_amount));
                                }
                            }}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select billing statement" /></SelectTrigger>
                                <SelectContent>
                                    {billingOptions.length === 0 ? (
                                        <SelectItem value="none" disabled>No unpaid statements</SelectItem>
                                    ) : (
                                        billingOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)
                                    )}
                                </SelectContent>
                            </Select>
                        </FormField>
                        {selectedBilling && (
                            <p className="text-xs text-muted-foreground">Statement total: ₱{selectedBilling.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        )}
                        <FormField label="Amount Paid (₱)" htmlFor="amount_paid" error={errors.amount_paid} required>
                            <Input id="amount_paid" type="number" step="0.01" min="0.01" value={data.amount_paid} onChange={(e) => setData('amount_paid', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Payment Date" htmlFor="payment_date" error={errors.payment_date} required>
                            <Input id="payment_date" type="date" value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Payment Method" error={errors.payment_method} required>
                            <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl" disabled={processing || billingOptions.length === 0}>Record & Issue Receipt</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }, { title: 'Payments', href: '/cashier/payments' }]);
