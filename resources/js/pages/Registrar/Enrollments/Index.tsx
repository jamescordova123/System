import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { ClipboardList, Edit3, Plus, Trash2 } from 'lucide-react';
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
};

const emptyForm = {
    student_id: '',
    section_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'enrolled',
};

export default function Index({ enrollments, stats, studentOptions, sectionOptions }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Enrollment | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => { setEditing(null); reset(); setOpen(true); };
    const openEdit = (enrollment: Enrollment) => {
        setEditing(enrollment);
        setData({
            student_id: String(enrollment.student_id),
            section_id: String(enrollment.section_id),
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
        });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: () => { setOpen(false); reset(); setEditing(null); }, onError: () => toast.error('Please fix the form errors.') };
        if (editing) {
            put(`/registrar/enrollments/${editing.id}`, options);
        } else {
            post('/registrar/enrollments', options);
        }
    };

    const handleDelete = (enrollment: Enrollment) => {
        if (!confirm(`Delete enrollment for ${enrollment.student_name}?`)) return;
        router.delete(`/registrar/enrollments/${enrollment.id}`);
    };

    return (
        <ModuleShell title="Enrollments" breadcrumbs={[{ title: 'Registrar', href: '/registrar' }, { title: 'Enrollments', href: '/registrar/enrollments' }]}>
            <PageHeader title="Enrollment Management" description="Track student registrations across sections with real-time status." icon={ClipboardList} accent="indigo" actions={<Button className="rounded-xl" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Enrollment</Button>} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total" value={stats.total} icon={ClipboardList} accent="indigo" />
                <StatCard label="Enrolled" value={stats.enrolled} icon={ClipboardList} accent="blue" />
                <StatCard label="Dropped" value={stats.dropped} icon={ClipboardList} accent="rose" />
                <StatCard label="Completed" value={stats.completed} icon={ClipboardList} accent="emerald" />
            </div>
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {enrollments.length === 0 ? (
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
                                {enrollments.map((e) => (
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
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader><DialogTitle>{editing ? 'Edit Enrollment' : 'New Enrollment'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="Student" error={errors.student_id} required>
                            <Select value={data.student_id} onValueChange={(v) => setData('student_id', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select student" /></SelectTrigger>
                                <SelectContent>
                                    {studentOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Section" error={errors.section_id} required>
                            <Select value={data.section_id} onValueChange={(v) => setData('section_id', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select section" /></SelectTrigger>
                                <SelectContent>
                                    {sectionOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Enrollment Date" htmlFor="enrollment_date" error={errors.enrollment_date} required>
                            <Input id="enrollment_date" type="date" value={data.enrollment_date} onChange={(e) => setData('enrollment_date', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Status" error={errors.status} required>
                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl" disabled={processing}>{editing ? 'Save' : 'Enroll'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Registrar', href: '/registrar' }, { title: 'Enrollments', href: '/registrar/enrollments' }]);
