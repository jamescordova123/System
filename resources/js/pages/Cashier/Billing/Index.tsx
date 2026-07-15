import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Edit3, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Option = { value: number; label: string };

type Statement = {
    id: number;
    student_id: number;
    student_name: string;
    student_number: string;
    total_amount: string;
    total_amount_raw: number;
    due_date: string;
    due_date_display: string;
    status: string;
};

type Props = {
    statements: Statement[];
    stats: { total: number; unpaid: number; partial: number; paid: number };
    studentOptions: Option[];
};

const emptyForm = {
    student_id: '',
    total_amount: '',
    due_date: '',
    status: 'unpaid',
};

export default function Index({ statements, stats, studentOptions }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Statement | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => { setEditing(null); reset(); setOpen(true); };
    const openEdit = (statement: Statement) => {
        setEditing(statement);
        setData({
            student_id: String(statement.student_id),
            total_amount: String(statement.total_amount_raw),
            due_date: statement.due_date,
            status: statement.status,
        });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: () => { setOpen(false); reset(); setEditing(null); }, onError: () => toast.error('Please fix the form errors.') };
        editing ? put(`/cashier/billing/${editing.id}`, options) : post('/cashier/billing', options);
    };

    const handleDelete = (statement: Statement) => {
        if (!confirm(`Delete billing statement for ${statement.student_name}?`)) return;
        router.delete(`/cashier/billing/${statement.id}`);
    };

    return (
        <ModuleShell title="Billing" breadcrumbs={[{ title: 'Cashier', href: '/cashier' }, { title: 'Billing', href: '/cashier/billing' }]}>
            <PageHeader title="Billing Statements" description="View and manage student billing statements and due dates." icon={FileText} accent="emerald" actions={<Button className="rounded-xl" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Statement</Button>} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total" value={stats.total} icon={FileText} accent="emerald" />
                <StatCard label="Unpaid" value={stats.unpaid} icon={FileText} accent="rose" />
                <StatCard label="Partial" value={stats.partial} icon={FileText} accent="amber" />
                <StatCard label="Paid" value={stats.paid} icon={FileText} accent="blue" />
            </div>
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {statements.length === 0 ? (
                        <EmptyState icon={FileText} title="No billing statements" description="Billing records will appear here once generated." action={<Button onClick={openCreate} className="rounded-xl">New Statement</Button>} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statements.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="font-medium">{s.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{s.student_number}</div>
                                        </TableCell>
                                        <TableCell className="font-semibold">₱{s.total_amount}</TableCell>
                                        <TableCell>{s.due_date_display}</TableCell>
                                        <TableCell><StatusBadge status={s.status} /></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit3 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader><DialogTitle>{editing ? 'Edit Statement' : 'New Billing Statement'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="Student" error={errors.student_id} required>
                            <Select value={data.student_id} onValueChange={(v) => setData('student_id', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select student" /></SelectTrigger>
                                <SelectContent>
                                    {studentOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Total Amount (₱)" htmlFor="total_amount" error={errors.total_amount} required>
                            <Input id="total_amount" type="number" step="0.01" min="0" value={data.total_amount} onChange={(e) => setData('total_amount', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Due Date" htmlFor="due_date" error={errors.due_date} required>
                            <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Status" error={errors.status} required>
                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl" disabled={processing}>{editing ? 'Save' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }, { title: 'Billing', href: '/cashier/billing' }]);
