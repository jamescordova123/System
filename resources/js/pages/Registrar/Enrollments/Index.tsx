import { useMemo, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { ClipboardList, Edit3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import {
    emptyLearnerForm,
    LearnerProfileForm,
    type LearnerFormData,
    type LearnerFormOptions,
} from '@/components/school/learner-profile-form';
import { ListToolbar } from '@/components/school/list-toolbar';
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

type Enrollment = {
    id: number;
    student_id: number;
    section_id: number;
    student_name: string;
    student_number: string;
    section_name: string;
    course_name: string;
    status: string;
    enrollment_date: string;
    enrollment_date_display: string;
};

type Props = {
    enrollments: Enrollment[];
    stats: { total: number; enrolled: number; dropped: number; completed: number };
    studentOptions: Option[];
    sectionOptions: Option[];
    formOptions: LearnerFormOptions;
};

type CreateForm = LearnerFormData & {
    section_id: string;
    enrollment_date: string;
    status: string;
    student_number: string;
    password: string;
};

type EditForm = {
    student_id: string;
    section_id: string;
    enrollment_date: string;
    status: string;
};

const emptyCreateForm = (): CreateForm => ({
    ...emptyLearnerForm(),
    section_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'enrolled',
    student_number: '',
    password: '',
});

export default function Index({ enrollments, stats, studentOptions, sectionOptions, formOptions }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Enrollment | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');

    const createForm = useForm<CreateForm>(emptyCreateForm());
    const editForm = useForm<EditForm>({
        student_id: '',
        section_id: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'enrolled',
    });

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return enrollments.filter((e) => {
            if (statusFilter !== 'all' && e.status !== statusFilter) return false;
            if (sectionFilter !== 'all' && String(e.section_id) !== sectionFilter) return false;
            if (!term) return true;
            return (
                e.student_name.toLowerCase().includes(term) ||
                e.student_number.toLowerCase().includes(term) ||
                e.section_name.toLowerCase().includes(term) ||
                e.course_name.toLowerCase().includes(term)
            );
        });
    }, [enrollments, search, statusFilter, sectionFilter]);

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setSectionFilter('all');
    };

    const openCreate = () => {
        setEditing(null);
        createForm.setData(emptyCreateForm());
        setOpen(true);
    };

    const openEdit = (enrollment: Enrollment) => {
        setEditing(enrollment);
        editForm.setData({
            student_id: String(enrollment.student_id),
            section_id: String(enrollment.section_id),
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
        });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setOpen(false);
                createForm.reset();
                editForm.reset();
                setEditing(null);
            },
            onError: () => toast.error('Please fix the form errors.'),
        };

        if (editing) {
            editForm.put(`/registrar/enrollments/${editing.id}`, options);
        } else {
            createForm.post('/registrar/enrollments', options);
        }
    };

    const handleDelete = (enrollment: Enrollment) => {
        if (!confirm(`Delete enrollment for ${enrollment.student_name}?`)) return;
        router.delete(`/registrar/enrollments/${enrollment.id}`);
    };

    return (
        <ModuleShell title="Enrollments" breadcrumbs={[{ title: 'Registrar', href: '/registrar' }, { title: 'Enrollments', href: '/registrar/enrollments' }]}>
            <PageHeader
                title="Enrollment Management"
                description="Enroll learners with the same full application details used in online enrollment."
                icon={ClipboardList}
                accent="indigo"
                actions={
                    <Button className="rounded-xl" onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Enrollment
                    </Button>
                }
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total" value={stats.total} icon={ClipboardList} accent="indigo" />
                <StatCard label="Enrolled" value={stats.enrolled} icon={ClipboardList} accent="blue" />
                <StatCard label="Dropped" value={stats.dropped} icon={ClipboardList} accent="rose" />
                <StatCard label="Completed" value={stats.completed} icon={ClipboardList} accent="emerald" />
            </div>
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <ListToolbar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search by student, student #, or section…"
                        resultCount={filtered.length}
                        totalCount={enrollments.length}
                        onClear={clearFilters}
                        filters={[
                            {
                                key: 'status',
                                label: 'Status',
                                value: statusFilter,
                                onChange: setStatusFilter,
                                widthClassName: 'w-[140px]',
                                options: [
                                    { value: 'all', label: 'All status' },
                                    { value: 'enrolled', label: 'Enrolled' },
                                    { value: 'dropped', label: 'Dropped' },
                                    { value: 'completed', label: 'Completed' },
                                ],
                            },
                            {
                                key: 'section',
                                label: 'Section',
                                value: sectionFilter,
                                onChange: setSectionFilter,
                                widthClassName: 'w-[200px]',
                                options: [
                                    { value: 'all', label: 'All sections' },
                                    ...sectionOptions.map((s) => ({ value: String(s.value), label: s.label })),
                                ],
                            },
                        ]}
                    />
                    {filtered.length === 0 ? (
                        <EmptyState icon={ClipboardList} title="No enrollments" description="Enroll students into sections to see records here." action={<Button onClick={openCreate} className="rounded-xl">New Enrollment</Button>} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell>
                                            <div className="font-medium">{e.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{e.student_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{e.section_name}</div>
                                            <div className="text-xs text-muted-foreground">{e.course_name}</div>
                                        </TableCell>
                                        <TableCell>{e.enrollment_date_display}</TableCell>
                                        <TableCell><StatusBadge status={e.status} /></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Edit3 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(e)}><Trash2 className="h-4 w-4" /></Button>
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
                <DialogContent className={`max-h-[90vh] overflow-y-auto rounded-2xl ${editing ? 'sm:max-w-md' : 'sm:max-w-4xl'}`}>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Enrollment' : 'New Enrollment'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {editing ? (
                            <>
                                <FormField label="Student" error={editForm.errors.student_id} required>
                                    <Select value={editForm.data.student_id} onValueChange={(v) => editForm.setData('student_id', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>
                                            {studentOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                                <FormField label="Section" error={editForm.errors.section_id} required>
                                    <Select value={editForm.data.section_id} onValueChange={(v) => editForm.setData('section_id', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select section" /></SelectTrigger>
                                        <SelectContent>
                                            {sectionOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                                <FormField label="Enrollment Date" htmlFor="enrollment_date" error={editForm.errors.enrollment_date} required>
                                    <Input id="enrollment_date" type="date" value={editForm.data.enrollment_date} onChange={(e) => editForm.setData('enrollment_date', e.target.value)} className="rounded-xl" />
                                </FormField>
                                <FormField label="Status" error={editForm.errors.status} required>
                                    <Select value={editForm.data.status} onValueChange={(v) => editForm.setData('status', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="enrolled">Enrolled</SelectItem>
                                            <SelectItem value="dropped">Dropped</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <FormField label="Section" error={createForm.errors.section_id} required>
                                        <Select value={createForm.data.section_id} onValueChange={(v) => createForm.setData('section_id', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select section" /></SelectTrigger>
                                            <SelectContent>
                                                {sectionOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                    <FormField label="Enrollment Date" htmlFor="create_enrollment_date" error={createForm.errors.enrollment_date} required>
                                        <Input id="create_enrollment_date" type="date" value={createForm.data.enrollment_date} onChange={(e) => createForm.setData('enrollment_date', e.target.value)} className="rounded-xl" />
                                    </FormField>
                                    <FormField label="Enrollment Status" error={createForm.errors.status} required>
                                        <Select value={createForm.data.status} onValueChange={(v) => createForm.setData('status', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="enrolled">Enrolled</SelectItem>
                                                <SelectItem value="dropped">Dropped</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                    <FormField label="Student Number (optional)" htmlFor="create_student_number" error={createForm.errors.student_number}>
                                        <Input id="create_student_number" value={createForm.data.student_number} onChange={(e) => createForm.setData('student_number', e.target.value)} className="rounded-xl" placeholder="Auto-generated if blank" />
                                    </FormField>
                                </div>
                                <FormField label="Portal Password (optional)" htmlFor="create_password" error={createForm.errors.password}>
                                    <Input id="create_password" type="password" value={createForm.data.password} onChange={(e) => createForm.setData('password', e.target.value)} className="rounded-xl" placeholder="Auto-generated if blank" />
                                </FormField>

                                <LearnerProfileForm
                                    data={createForm.data}
                                    setData={(key, value) => createForm.setData(key as keyof CreateForm, value as never)}
                                    errors={createForm.errors}
                                    options={formOptions}
                                />
                            </>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl" disabled={editing ? editForm.processing : createForm.processing}>
                                {editing ? 'Save' : 'Enroll'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Registrar', href: '/registrar' }, { title: 'Enrollments', href: '/registrar/enrollments' }]);
