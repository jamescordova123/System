import { useMemo, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Eye, GraduationCap, Plus, Settings2, Trash2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ListToolbar } from '@/components/school/list-toolbar';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Option = { value: number; label: string };
type ProgramOption = { value: string; label: string };

type Assessment = {
    id: number;
    student_id: number;
    student_name: string;
    student_number: string | null;
    program: string;
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
};

type CatalogItem = {
    id: number;
    program: string;
    label: string;
    category: string;
    default_amount: number;
    is_active: boolean;
};

type Props = {
    assessments: Assessment[];
    stats: { assessed: string; collected: string; outstanding: string; fully_paid: number };
    studentOptions: Option[];
    programs: ProgramOption[];
    schoolYears: string[];
    catalog: CatalogItem[];
};

const categoryLabels: Record<string, string> = {
    fee: 'General Fees',
    test_paper: 'Test Papers',
    consumable: 'Consumables',
};

const peso = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function PaymentProgress({ paid, total }: { paid: number; total: number }) {
    const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                <div
                    className={pct >= 100 ? 'h-full bg-emerald-500' : 'h-full bg-amber-500'}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
        </div>
    );
}

type ItemSelection = Record<number, { checked: boolean; amount: string }>;

export default function Index({ assessments, stats, studentOptions, programs, schoolYears, catalog }: Props) {
    const [assessOpen, setAssessOpen] = useState(false);
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [programFilter, setProgramFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return assessments.filter((a) => {
            if (programFilter !== 'all' && a.program !== programFilter) return false;
            if (statusFilter !== 'all' && a.status !== statusFilter) return false;
            if (yearFilter !== 'all' && a.school_year !== yearFilter) return false;
            if (term && !`${a.student_name} ${a.student_number ?? ''}`.toLowerCase().includes(term)) return false;
            return true;
        });
    }, [assessments, search, programFilter, statusFilter, yearFilter]);

    const handleDelete = (a: Assessment) => {
        if (!confirm(`Delete the ${a.program_label} assessment for ${a.student_name}? Payments recorded against it will also be removed.`)) return;
        router.delete(`/cashier/student-fees/${a.id}`);
    };

    return (
        <ModuleShell title="Student Fees" breadcrumbs={[{ title: 'Cashier', href: '/cashier' }, { title: 'Student Fees', href: '/cashier/student-fees' }]}>
            <PageHeader
                title="Student Fees"
                description="Assess Grade 11, Grade 12, Graduation, and Japanese Language fees per student, and settle each fee item with its own AR number."
                icon={Wallet}
                accent="emerald"
                actions={
                    <>
                        <Button variant="outline" className="rounded-xl" onClick={() => setCatalogOpen(true)}>
                            <Settings2 className="mr-2 h-4 w-4" /> Fee Catalog
                        </Button>
                        <Button className="rounded-xl" onClick={() => setAssessOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Assess Fees
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Assessed" value={`₱${stats.assessed}`} icon={Wallet} accent="emerald" />
                <StatCard label="Collected" value={`₱${stats.collected}`} icon={Wallet} accent="blue" trend="up" />
                <StatCard label="Outstanding" value={`₱${stats.outstanding}`} icon={Wallet} accent="rose" />
                <StatCard label="Fully Paid" value={stats.fully_paid} icon={GraduationCap} accent="gold" />
            </div>

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <ListToolbar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search by student name or number…"
                        resultCount={filtered.length}
                        totalCount={assessments.length}
                        onClear={() => {
                            setSearch('');
                            setProgramFilter('all');
                            setStatusFilter('all');
                            setYearFilter('all');
                        }}
                        filters={[
                            {
                                key: 'program',
                                label: 'Program',
                                value: programFilter,
                                onChange: setProgramFilter,
                                widthClassName: 'w-[170px]',
                                options: [
                                    { value: 'all', label: 'All programs' },
                                    ...programs.map((p) => ({ value: p.value, label: p.label })),
                                ],
                            },
                            {
                                key: 'year',
                                label: 'School Year',
                                value: yearFilter,
                                onChange: setYearFilter,
                                widthClassName: 'w-[140px]',
                                options: [
                                    { value: 'all', label: 'All years' },
                                    ...schoolYears.map((y) => ({ value: y, label: y })),
                                ],
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                value: statusFilter,
                                onChange: setStatusFilter,
                                widthClassName: 'w-[130px]',
                                options: [
                                    { value: 'all', label: 'All status' },
                                    { value: 'unpaid', label: 'Unpaid' },
                                    { value: 'partial', label: 'Partial' },
                                    { value: 'paid', label: 'Paid' },
                                ],
                            },
                        ]}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={Wallet}
                            title={assessments.length === 0 ? 'No fee assessments yet' : 'No results'}
                            description={
                                assessments.length === 0
                                    ? 'Assess a student to generate their itemized fee statement from the catalog.'
                                    : 'No assessments match the current filters.'
                            }
                            action={assessments.length === 0 ? <Button className="rounded-xl" onClick={() => setAssessOpen(true)}>Assess Fees</Button> : undefined}
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>School Year</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell>
                                            <div className="font-medium">{a.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{a.student_number}</div>
                                        </TableCell>
                                        <TableCell><Badge variant="secondary" className="rounded-lg">{a.program_label}</Badge></TableCell>
                                        <TableCell className="text-sm">{a.school_year ?? '—'}</TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums">{peso(a.total_due)}</TableCell>
                                        <TableCell className={`text-right font-semibold tabular-nums ${a.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                            {peso(a.balance)}
                                        </TableCell>
                                        <TableCell><PaymentProgress paid={a.total_paid} total={a.total_due} /></TableCell>
                                        <TableCell className="text-sm tabular-nums text-muted-foreground">{a.items_paid}/{a.items_count} paid</TableCell>
                                        <TableCell><StatusBadge status={a.status} /></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/cashier/student-fees/${a.id}`}><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(a)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AssessDialog
                open={assessOpen}
                onOpenChange={setAssessOpen}
                studentOptions={studentOptions}
                programs={programs}
                schoolYears={schoolYears}
                catalog={catalog}
            />
            <CatalogDialog open={catalogOpen} onOpenChange={setCatalogOpen} programs={programs} catalog={catalog} />
        </ModuleShell>
    );
}

function AssessDialog({
    open,
    onOpenChange,
    studentOptions,
    programs,
    schoolYears,
    catalog,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentOptions: Option[];
    programs: ProgramOption[];
    schoolYears: string[];
    catalog: CatalogItem[];
}) {
    const [selection, setSelection] = useState<ItemSelection>({});
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        student_id: '',
        program: '',
        school_year: schoolYears[schoolYears.length - 1] ?? '',
        due_date: '',
        remarks: '',
    });

    const programItems = useMemo(
        () => catalog.filter((c) => c.program === data.program && c.is_active),
        [catalog, data.program],
    );

    const grouped = useMemo(() => {
        const groups: Record<string, CatalogItem[]> = {};
        for (const item of programItems) {
            (groups[item.category] ??= []).push(item);
        }
        return groups;
    }, [programItems]);

    const handleProgramChange = (program: string) => {
        setData('program', program);
        const initial: ItemSelection = {};
        for (const item of catalog.filter((c) => c.program === program && c.is_active)) {
            initial[item.id] = { checked: true, amount: String(item.default_amount) };
        }
        setSelection(initial);
    };

    const selectedTotal = programItems.reduce((sum, item) => {
        const sel = selection[item.id];
        return sel?.checked ? sum + (parseFloat(sel.amount) || 0) : sum;
    }, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const items = programItems
            .filter((item) => selection[item.id]?.checked)
            .map((item) => ({
                fee_catalog_item_id: item.id,
                amount_due: parseFloat(selection[item.id]?.amount || '0') || 0,
            }));

        if (items.length === 0) {
            toast.error('Select at least one fee item.');
            return;
        }

        transform((formData) => ({ ...formData, items }));
        post('/cashier/student-fees', {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                setSelection({});
            },
            onError: () => toast.error('Please fix the form errors.'),
            preserveScroll: true,
        });
    };

    const itemError = Object.entries(errors).find(([key]) => key.startsWith('items'))?.[1];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
                <DialogHeader><DialogTitle>Assess Student Fees</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Student" error={errors.student_id} required className="sm:col-span-2">
                            <Select value={data.student_id} onValueChange={(v) => setData('student_id', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select student" /></SelectTrigger>
                                <SelectContent>
                                    {studentOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Program" error={errors.program} required>
                            <Select value={data.program} onValueChange={handleProgramChange}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select program" /></SelectTrigger>
                                <SelectContent>
                                    {programs.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="School Year" error={errors.school_year} required>
                            <Select value={data.school_year} onValueChange={(v) => setData('school_year', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select school year" /></SelectTrigger>
                                <SelectContent>
                                    {schoolYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Due Date" htmlFor="due_date" error={errors.due_date} required>
                            <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Remarks" htmlFor="remarks" error={errors.remarks}>
                            <Input id="remarks" value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} placeholder="Optional" className="rounded-xl" />
                        </FormField>
                    </div>

                    {data.program === '' ? (
                        <p className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                            Select a program to load its fee items.
                        </p>
                    ) : programItems.length === 0 ? (
                        <p className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                            No fee items in the catalog for this program yet. Add them via the Fee Catalog first.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(grouped).map(([category, items]) => (
                                <div key={category}>
                                    <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        {categoryLabels[category] ?? category}
                                    </p>
                                    <div className="space-y-2">
                                        {items.map((item) => {
                                            const sel = selection[item.id] ?? { checked: false, amount: '0' };
                                            return (
                                                <div key={item.id} className="flex items-center gap-3 rounded-xl border p-2.5">
                                                    <Checkbox
                                                        checked={sel.checked}
                                                        onCheckedChange={(checked) =>
                                                            setSelection((prev) => ({ ...prev, [item.id]: { ...sel, checked: checked === true } }))
                                                        }
                                                    />
                                                    <span className="flex-1 text-sm">{item.label}</span>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₱</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={sel.amount}
                                                            disabled={!sel.checked}
                                                            onChange={(e) =>
                                                                setSelection((prev) => ({ ...prev, [item.id]: { ...sel, amount: e.target.value } }))
                                                            }
                                                            className="w-32 rounded-xl pl-7 text-right tabular-nums"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {itemError && <p className="text-xs text-destructive">{itemError}</p>}
                            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                                <span className="text-sm font-medium">Total assessment</span>
                                <span className="text-lg font-bold tabular-nums">{peso(selectedTotal)}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" className="rounded-xl" disabled={processing || data.program === ''}>Create Assessment</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CatalogDialog({
    open,
    onOpenChange,
    programs,
    catalog,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programs: ProgramOption[];
    catalog: CatalogItem[];
}) {
    const [program, setProgram] = useState(programs[0]?.value ?? 'grade_11');
    const [drafts, setDrafts] = useState<Record<number, { label: string; amount: string }>>({});
    const [newItem, setNewItem] = useState({ label: '', category: 'fee', amount: '' });
    const [saving, setSaving] = useState(false);

    const items = catalog.filter((c) => c.program === program);

    const draftFor = (item: CatalogItem) =>
        drafts[item.id] ?? { label: item.label, amount: String(item.default_amount) };

    const saveItem = (item: CatalogItem, overrides: Partial<{ is_active: boolean }> = {}) => {
        const draft = draftFor(item);
        setSaving(true);
        router.put(`/cashier/fee-catalog/${item.id}`, {
            label: draft.label,
            default_amount: parseFloat(draft.amount) || 0,
            is_active: overrides.is_active ?? item.is_active,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const addItem = () => {
        if (!newItem.label.trim()) {
            toast.error('Enter a name for the new fee item.');
            return;
        }
        setSaving(true);
        router.post('/cashier/fee-catalog', {
            program,
            label: newItem.label.trim(),
            category: newItem.category,
            default_amount: parseFloat(newItem.amount) || 0,
        }, {
            preserveScroll: true,
            onSuccess: () => setNewItem({ label: '', category: 'fee', amount: '' }),
            onFinish: () => setSaving(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
                <DialogHeader><DialogTitle>Fee Catalog</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <Select value={program} onValueChange={setProgram}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {programs.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {items.length === 0 ? (
                        <p className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                            No fee items for this program yet. Add the first one below.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => {
                                const draft = draftFor(item);
                                return (
                                    <div key={item.id} className={`flex items-center gap-2 rounded-xl border p-2.5 ${item.is_active ? '' : 'opacity-60'}`}>
                                        <Badge variant="outline" className="w-24 shrink-0 justify-center rounded-lg text-[10px]">
                                            {categoryLabels[item.category] ?? item.category}
                                        </Badge>
                                        <Input
                                            value={draft.label}
                                            onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, label: e.target.value } }))}
                                            className="flex-1 rounded-xl"
                                        />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₱</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={draft.amount}
                                                onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, amount: e.target.value } }))}
                                                className="w-28 rounded-xl pl-7 text-right tabular-nums"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-xl" disabled={saving} onClick={() => saveItem(item)}>
                                            Save
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl text-xs"
                                            disabled={saving}
                                            onClick={() => saveItem(item, { is_active: !item.is_active })}
                                        >
                                            {item.is_active ? 'Disable' : 'Enable'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="rounded-xl border border-dashed p-3">
                        <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Add fee item</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                value={newItem.label}
                                onChange={(e) => setNewItem((prev) => ({ ...prev, label: e.target.value }))}
                                placeholder="Fee name (e.g. Japanese Language Module Fee)"
                                className="min-w-48 flex-1 rounded-xl"
                            />
                            <Select value={newItem.category} onValueChange={(v) => setNewItem((prev) => ({ ...prev, category: v }))}>
                                <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fee">General Fees</SelectItem>
                                    <SelectItem value="test_paper">Test Papers</SelectItem>
                                    <SelectItem value="consumable">Consumables</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₱</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newItem.amount}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, amount: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-28 rounded-xl pl-7 text-right tabular-nums"
                                />
                            </div>
                            <Button className="rounded-xl" disabled={saving} onClick={addItem}>
                                <Plus className="mr-1 h-4 w-4" /> Add
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

Index.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }, { title: 'Student Fees', href: '/cashier/student-fees' }]);
