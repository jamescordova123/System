import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Edit3, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Student = {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    full_name: string;
    email: string | null;
    gender: string;
    contact_number: string | null;
    address: string | null;
    status: string;
    birthdate: string;
    birthdate_display: string;
};

type Props = {
    students: Student[];
    stats: { total: number; active: number; inactive: number; graduated: number };
};

const emptyForm = {
    email: '',
    password: '',
    student_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    birthdate: '',
    gender: 'male',
    contact_number: '',
    address: '',
    status: 'active',
};

export default function Index({ students, stats }: Props) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const filtered = students.filter(
        (s) =>
            s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.student_number.toLowerCase().includes(search.toLowerCase()) ||
            (s.email ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    const openCreate = () => {
        setEditing(null);
        reset();
        setOpen(true);
    };

    const openEdit = (student: Student) => {
        setEditing(student);
        setData({
            email: student.email ?? '',
            password: '',
            student_number: student.student_number,
            first_name: student.first_name,
            last_name: student.last_name,
            middle_name: student.middle_name ?? '',
            birthdate: student.birthdate,
            gender: student.gender,
            contact_number: student.contact_number ?? '',
            address: student.address ?? '',
            status: student.status,
        });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setOpen(false);
                reset();
                setEditing(null);
            },
            onError: () => toast.error('Please fix the form errors.'),
        };

        if (editing) {
            put(`/registrar/students/${editing.id}`, options);
        } else {
            post('/registrar/students', options);
        }
    };

    const handleDelete = (student: Student) => {
        if (!confirm(`Delete student ${student.full_name}?`)) return;
        router.delete(`/registrar/students/${student.id}`);
    };

    return (
        <ModuleShell title="Students" breadcrumbs={[{ title: 'Registrar', href: '/registrar' }, { title: 'Students', href: '/registrar/students' }]}>
            <PageHeader
                title="Student Records"
                description="Browse and manage the student registry with enrollment status tracking."
                icon={Users}
                accent="indigo"
                actions={
                    <Button className="rounded-xl" onClick={openCreate}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total" value={stats.total} icon={Users} accent="indigo" />
                <StatCard label="Active" value={stats.active} icon={Users} accent="emerald" />
                <StatCard label="Inactive" value={stats.inactive} icon={Users} accent="amber" />
                <StatCard label="Graduated" value={stats.graduated} icon={Users} accent="violet" />
            </div>

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl pl-9" />
                    </div>
                    {filtered.length === 0 ? (
                        <EmptyState icon={Users} title="No students found" description="Student records will appear here once added to the system." action={<Button onClick={openCreate} className="rounded-xl">Add Student</Button>} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student #</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-mono text-sm">{s.student_number}</TableCell>
                                        <TableCell className="font-medium">{s.full_name}</TableCell>
                                        <TableCell>{s.email ?? '—'}</TableCell>
                                        <TableCell>{s.contact_number ?? '—'}</TableCell>
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
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="First Name" htmlFor="first_name" error={errors.first_name} required>
                                <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="rounded-xl" />
                            </FormField>
                            <FormField label="Last Name" htmlFor="last_name" error={errors.last_name} required>
                                <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="rounded-xl" />
                            </FormField>
                        </div>
                        <FormField label="Middle Name" htmlFor="middle_name" error={errors.middle_name}>
                            <Input id="middle_name" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Student Number" htmlFor="student_number" error={errors.student_number} required>
                            <Input id="student_number" value={data.student_number} onChange={(e) => setData('student_number', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Email" htmlFor="email" error={errors.email} required>
                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label={editing ? 'New Password (optional)' : 'Password'} htmlFor="password" error={errors.password} required={!editing}>
                            <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Birthdate" htmlFor="birthdate" error={errors.birthdate} required>
                                <Input id="birthdate" type="date" value={data.birthdate} onChange={(e) => setData('birthdate', e.target.value)} className="rounded-xl" />
                            </FormField>
                            <FormField label="Gender" error={errors.gender} required>
                                <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>
                        <FormField label="Contact Number" htmlFor="contact_number" error={errors.contact_number}>
                            <Input id="contact_number" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <FormField label="Address" htmlFor="address" error={errors.address}>
                            <textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                        </FormField>
                        <FormField label="Status" error={errors.status} required>
                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl" disabled={processing}>{editing ? 'Save Changes' : 'Create Student'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Students', href: '/registrar/students' },
]);
