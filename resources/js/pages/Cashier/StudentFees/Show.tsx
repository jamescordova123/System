import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Banknote, CheckCircle2, Pencil, ReceiptText, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Assessment = {
    id: number;
    student_name: string;
    student_number: string | null;
    program_label: string;
    school_year: string | null;
    total_due: number;
    total_paid: number;
    balance: number;
    items_count: number;
    items_paid: number;
    due_date: string;
    due_date_display: string;
    status: string;
    remarks: string | null;
    section: string | null;
    course: string | null;
};

type FeeItem = {
    id: number;
    label: string;
    category: string;
    ar_number: string | null;
    amount_due: number;
    amount_paid: number;
    balance: number;
    status: string;
};

type PaymentRow = {
    id: number;
    item_label: string | null;
    receipt_number: string | null;
    amount_paid: number;
    payment_date: string;
    received_by: string | null;
};

type Props = {
    assessment: Assessment;
    items: FeeItem[];
    payments: PaymentRow[];
};

const categoryLabels: Record<string, string> = {
    fee: 'General',
    test_paper: 'Test Paper',
    consumable: 'Consumable',
};

const peso = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Show({ assessment, items, payments }: Props) {
    const [payingItem, setPayingItem] = useState<FeeItem | null>(null);
    const [editingItem, setEditingItem] = useState<FeeItem | null>(null);
    const [remarksOpen, setRemarksOpen] = useState(false);

    return (
        <ModuleShell
            title={`Student Fees — ${assessment.student_name}`}
            breadcrumbs={[
                { title: 'Cashier', href: '/cashier' },
                { title: 'Student Fees', href: '/cashier/student-fees' },
                { title: assessment.student_name, href: `/cashier/student-fees/${assessment.id}` },
            ]}
        >
            <PageHeader
                title={assessment.student_name}
                description={[
                    assessment.student_number,
                    assessment.program_label,
                    assessment.school_year ? `SY ${assessment.school_year}` : null,
                    assessment.section ? `${assessment.course ?? ''} ${assessment.section}`.trim() : null,
                    `Due ${assessment.due_date_display}`,
                ]
                    .filter(Boolean)
                    .join(' · ')}
                icon={Wallet}
                accent="emerald"
                actions={
                    <>
                        <Button variant="outline" className="rounded-xl" onClick={() => setRemarksOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                        </Button>
                        <Button variant="outline" className="rounded-xl" asChild>
                            <Link href="/cashier/student-fees"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Assessed" value={peso(assessment.total_due)} icon={Wallet} accent="emerald" />
                <StatCard label="Total Paid" value={peso(assessment.total_paid)} icon={Banknote} accent="blue" trend="up" />
                <StatCard label="Balance" value={peso(assessment.balance)} icon={Wallet} accent={assessment.balance > 0 ? 'rose' : 'emerald'} />
                <StatCard label="Items Settled" value={`${assessment.items_paid}/${assessment.items_count}`} icon={CheckCircle2} accent="gold" />
            </div>

            {assessment.remarks && (
                <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5">
                    <CardContent className="pt-4 pb-4 text-sm">
                        <span className="font-semibold">Remarks:</span> {assessment.remarks}
                    </CardContent>
                </Card>
            )}

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Fee Breakdown</h2>
                        <StatusBadge status={assessment.status} />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fee Item</TableHead>
                                <TableHead>AR #</TableHead>
                                <TableHead className="text-right">Amount Due</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{item.label}</span>
                                            <Badge variant="outline" className="rounded-lg text-[10px]">
                                                {categoryLabels[item.category] ?? item.category}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm tabular-nums">{item.ar_number ?? <span className="text-muted-foreground">—</span>}</TableCell>
                                    <TableCell className="text-right tabular-nums">{peso(item.amount_due)}</TableCell>
                                    <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">{peso(item.amount_paid)}</TableCell>
                                    <TableCell className={`text-right font-semibold tabular-nums ${item.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                        {peso(item.balance)}
                                    </TableCell>
                                    <TableCell><StatusBadge status={item.status} /></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                size="sm"
                                                className="rounded-xl"
                                                disabled={item.balance <= 0}
                                                onClick={() => setPayingItem(item)}
                                            >
                                                <Banknote className="mr-1 h-4 w-4" /> Pay
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex flex-col items-end gap-1 border-t pt-4 text-sm">
                        <div className="flex w-56 justify-between"><span className="text-muted-foreground">Total due</span><span className="font-semibold tabular-nums">{peso(assessment.total_due)}</span></div>
                        <div className="flex w-56 justify-between"><span className="text-muted-foreground">Total paid</span><span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{peso(assessment.total_paid)}</span></div>
                        <div className="flex w-56 justify-between text-base"><span className="font-medium">Balance</span><span className="font-bold tabular-nums">{peso(assessment.balance)}</span></div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <h2 className="mb-4 text-base font-semibold">Payment Transactions</h2>
                    {payments.length === 0 ? (
                        <EmptyState icon={ReceiptText} title="No payments yet" description="Payments recorded against this assessment will appear here with their receipt numbers." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Receipt #</TableHead>
                                    <TableHead>Fee Item</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Received By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.payment_date}</TableCell>
                                        <TableCell className="tabular-nums">{p.receipt_number ?? '—'}</TableCell>
                                        <TableCell>{p.item_label ?? <span className="text-muted-foreground">General</span>}</TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{peso(p.amount_paid)}</TableCell>
                                        <TableCell>{p.received_by ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {payingItem && <PayItemDialog assessmentId={assessment.id} item={payingItem} onClose={() => setPayingItem(null)} />}
            {editingItem && <EditItemDialog assessmentId={assessment.id} item={editingItem} onClose={() => setEditingItem(null)} />}
            <EditDetailsDialog assessment={assessment} open={remarksOpen} onOpenChange={setRemarksOpen} />
        </ModuleShell>
    );
}

function PayItemDialog({ assessmentId, item, onClose }: { assessmentId: number; item: FeeItem; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        amount: String(item.balance),
        ar_number: item.ar_number ?? '',
        payment_date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/cashier/student-fees/${assessmentId}/items/${item.id}/pay`, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: () => toast.error('Please fix the form errors.'),
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>Record Payment — {item.label}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Remaining balance: <span className="font-semibold text-foreground">{peso(item.balance)}</span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Amount (₱)" htmlFor="amount" error={errors.amount} required>
                        <Input id="amount" type="number" step="0.01" min="0.01" max={item.balance} value={data.amount} onChange={(e) => setData('amount', e.target.value)} className="rounded-xl" />
                    </FormField>
                    <FormField label="AR Number" htmlFor="ar_number" error={errors.ar_number}>
                        <Input id="ar_number" value={data.ar_number} onChange={(e) => setData('ar_number', e.target.value)} placeholder="Official/acknowledgment receipt no." className="rounded-xl" />
                    </FormField>
                    <FormField label="Payment Date" htmlFor="payment_date" error={errors.payment_date} required>
                        <Input id="payment_date" type="date" value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} className="rounded-xl" />
                    </FormField>
                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="rounded-xl" disabled={processing}>Record & Issue Receipt</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditItemDialog({ assessmentId, item, onClose }: { assessmentId: number; item: FeeItem; onClose: () => void }) {
    const { data, setData, put, processing, errors } = useForm({
        amount_due: String(item.amount_due),
        ar_number: item.ar_number ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cashier/student-fees/${assessmentId}/items/${item.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: () => toast.error('Please fix the form errors.'),
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>Edit Fee Item — {item.label}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Amount Due (₱)" htmlFor="amount_due" error={errors.amount_due} required>
                        <Input id="amount_due" type="number" step="0.01" min="0" value={data.amount_due} onChange={(e) => setData('amount_due', e.target.value)} className="rounded-xl" />
                    </FormField>
                    <FormField label="AR Number" htmlFor="edit_ar_number" error={errors.ar_number}>
                        <Input id="edit_ar_number" value={data.ar_number} onChange={(e) => setData('ar_number', e.target.value)} placeholder="Official/acknowledgment receipt no." className="rounded-xl" />
                    </FormField>
                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="rounded-xl" disabled={processing}>Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditDetailsDialog({ assessment, open, onOpenChange }: { assessment: Assessment; open: boolean; onOpenChange: (open: boolean) => void }) {
    const { data, setData, put, processing, errors } = useForm({
        due_date: assessment.due_date,
        remarks: assessment.remarks ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cashier/student-fees/${assessment.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
            onError: () => toast.error('Please fix the form errors.'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>Edit Assessment Details</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Due Date" htmlFor="details_due_date" error={errors.due_date} required>
                        <Input id="details_due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="rounded-xl" />
                    </FormField>
                    <FormField label="Remarks" htmlFor="details_remarks" error={errors.remarks}>
                        <Input id="details_remarks" value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} placeholder="Optional notes (e.g. promissory, scholarship)" className="rounded-xl" />
                    </FormField>
                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" className="rounded-xl" disabled={processing}>Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

Show.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }, { title: 'Student Fees', href: '/cashier/student-fees' }]);
