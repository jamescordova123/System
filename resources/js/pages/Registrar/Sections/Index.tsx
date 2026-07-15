import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Edit3, Layers, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Section = {
    id: number;
    section_name: string;
    course_name: string;
    schedule: string | null;
    enrollments_count: number;
};

type Props = {
    sections: Section[];
    stats: { total: number; enrollments: number };
};

const emptyForm = { section_name: '', course_name: '', schedule: '' };

export default function Index({ sections, stats }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Section | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => { setEditing(null); reset(); setOpen(true); };
    const openEdit = (section: Section) => {
        setEditing(section);
        setData({ section_name: section.section_name, course_name: section.course_name, schedule: section.schedule ?? '' });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: () => { setOpen(false); reset(); setEditing(null); }, onError: () => toast.error('Please fix the form errors.') };
        editing ? put(`/registrar/sections/${editing.id}`, options) : post('/registrar/sections', options);
    };

    const handleDelete = (section: Section) => {
        if (!confirm(`Delete section ${section.section_name}?`)) return;
        router.delete(`/registrar/sections/${section.id}`);
    };

    return (
        <ModuleShell title="Sections" breadcrumbs={[{ title: 'Registrar', href: '/registrar' }, { title: 'Sections', href: '/registrar/sections' }]}>
            <PageHeader title="Class Sections" description="Organize courses into sections with schedules and capacity tracking." icon={Layers} accent="indigo" actions={<Button className="rounded-xl" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Section</Button>} />
            <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Total Sections" value={stats.total} icon={Layers} accent="indigo" />
                <StatCard label="Total Enrollments" value={stats.enrollments} icon={Layers} accent="violet" />
            </div>
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {sections.length === 0 ? (
                        <EmptyState icon={Layers} title="No sections yet" description="Create class sections to start enrolling students." action={<Button onClick={openCreate} className="rounded-xl">New Section</Button>} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Enrolled</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sections.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.section_name}</TableCell>
                                        <TableCell>{s.course_name}</TableCell>
                                        <TableCell>{s.schedule ?? '—'}</TableCell>
                                        <TableCell><Badge variant="secondary" className="rounded-lg">{s.enrollments_count} students</Badge></TableCell>
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
                    <DialogHeader><DialogTitle>{editing ? 'Edit Section' : 'New Section'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="Section Name" htmlFor="section_name" error={errors.section_name} required>
                            <Input id="section_name" value={data.section_name} onChange={(e) => setData('section_name', e.target.value)} className="rounded-xl" placeholder="e.g. BSIT-3A" />
                        </FormField>
                        <FormField label="Course Name" htmlFor="course_name" error={errors.course_name} required>
                            <Input id="course_name" value={data.course_name} onChange={(e) => setData('course_name', e.target.value)} className="rounded-xl" placeholder="e.g. Web Development" />
                        </FormField>
                        <FormField label="Schedule" htmlFor="schedule" error={errors.schedule}>
                            <Input id="schedule" value={data.schedule} onChange={(e) => setData('schedule', e.target.value)} className="rounded-xl" placeholder="e.g. Mon/Wed 8:00–10:00 AM" />
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

Index.layout = setModuleLayout([{ title: 'Registrar', href: '/registrar' }, { title: 'Sections', href: '/registrar/sections' }]);
