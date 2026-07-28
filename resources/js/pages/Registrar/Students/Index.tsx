import { useMemo, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Edit3, Trash2, UserPlus, Users } from 'lucide-react';
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
    sex: string;
    contact_number: string | null;
    address: string | null;
    status: string;
    birthdate: string;
    birthdate_display: string;
    school_year: string | null;
    grade_to_enroll: string | null;
    learner_status: string | null;
    place_of_birth: string | null;
    mother_tongue: string | null;
    is_indigenous: boolean;
    indigenous_specify: string | null;
    is_4ps_beneficiary: boolean;
    household_id_number: string | null;
    current_house_no: string | null;
    current_street: string | null;
    current_barangay: string | null;
    current_municipality: string | null;
    current_province: string | null;
    current_country: string | null;
    current_zip_code: string | null;
    permanent_same_as_current: boolean;
    permanent_house_no: string | null;
    permanent_street: string | null;
    permanent_barangay: string | null;
    permanent_municipality: string | null;
    permanent_province: string | null;
    permanent_country: string | null;
    permanent_zip_code: string | null;
    father_last_name: string | null;
    father_first_name: string | null;
    father_middle_name: string | null;
    father_contact: string | null;
    mother_last_name: string | null;
    mother_first_name: string | null;
    mother_middle_name: string | null;
    mother_contact: string | null;
    guardian_last_name: string | null;
    guardian_first_name: string | null;
    guardian_middle_name: string | null;
    guardian_contact: string | null;
    jhs_graduation_date: string | null;
    shs_semester: string | null;
    shs_track: string | null;
    shs_strand: string | null;
    learning_modalities: string[];
    fb_account: string | null;
    prev_school_name: string | null;
    prev_school_address: string | null;
    prev_section: string | null;
    prev_school_year: string | null;
    prev_graduation_date: string | null;
    prev_average: string | null;
};

type Props = {
    students: Student[];
    stats: { total: number; active: number; inactive: number; graduated: number };
    formOptions: LearnerFormOptions;
};

type StudentForm = LearnerFormData & {
    password: string;
    student_number: string;
    status: string;
};

const emptyForm = (): StudentForm => ({
    ...emptyLearnerForm(),
    password: '',
    student_number: '',
    status: 'active',
});

function studentToForm(student: Student): StudentForm {
    return {
        ...emptyLearnerForm(),
        school_year: student.school_year ?? '',
        grade_to_enroll: student.grade_to_enroll ?? '',
        last_name: student.last_name ?? '',
        first_name: student.first_name ?? '',
        middle_name: student.middle_name ?? '',
        birthdate: student.birthdate ?? '',
        place_of_birth: student.place_of_birth ?? '',
        mother_tongue: student.mother_tongue ?? '',
        sex: student.sex || student.gender || '',
        is_indigenous: !!student.is_indigenous,
        indigenous_specify: student.indigenous_specify ?? '',
        is_4ps_beneficiary: !!student.is_4ps_beneficiary,
        household_id_number: student.household_id_number ?? '',
        current_house_no: student.current_house_no ?? '',
        current_street: student.current_street ?? '',
        current_barangay: student.current_barangay ?? '',
        current_municipality: student.current_municipality ?? '',
        current_province: student.current_province ?? '',
        current_country: student.current_country || 'Philippines',
        current_zip_code: student.current_zip_code ?? '',
        permanent_same_as_current: student.permanent_same_as_current ?? true,
        permanent_house_no: student.permanent_house_no ?? '',
        permanent_street: student.permanent_street ?? '',
        permanent_barangay: student.permanent_barangay ?? '',
        permanent_municipality: student.permanent_municipality ?? '',
        permanent_province: student.permanent_province ?? '',
        permanent_country: student.permanent_country || 'Philippines',
        permanent_zip_code: student.permanent_zip_code ?? '',
        father_last_name: student.father_last_name ?? '',
        father_first_name: student.father_first_name ?? '',
        father_middle_name: student.father_middle_name ?? '',
        father_contact: student.father_contact ?? '',
        mother_last_name: student.mother_last_name ?? '',
        mother_first_name: student.mother_first_name ?? '',
        mother_middle_name: student.mother_middle_name ?? '',
        mother_contact: student.mother_contact ?? '',
        guardian_last_name: student.guardian_last_name ?? '',
        guardian_first_name: student.guardian_first_name ?? '',
        guardian_middle_name: student.guardian_middle_name ?? '',
        guardian_contact: student.guardian_contact ?? '',
        jhs_graduation_date: student.jhs_graduation_date ?? '',
        shs_semester: student.shs_semester ?? '',
        shs_track: student.shs_track ?? '',
        shs_strand: student.shs_strand ?? '',
        learning_modalities: student.learning_modalities ?? [],
        contact_number: student.contact_number ?? '',
        email: student.email ?? '',
        fb_account: student.fb_account ?? '',
        prev_school_name: student.prev_school_name ?? '',
        prev_school_address: student.prev_school_address ?? '',
        prev_section: student.prev_section ?? '',
        prev_school_year: student.prev_school_year ?? '',
        prev_graduation_date: student.prev_graduation_date ?? '',
        prev_average: student.prev_average ?? '',
        learner_status: student.learner_status ?? '',
        password: '',
        student_number: student.student_number,
        status: student.status,
    };
}

export default function Index({ students, stats, formOptions }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm<StudentForm>(emptyForm());

    const gradeOptions = useMemo(
        () => [...new Set(students.map((s) => s.grade_to_enroll).filter(Boolean) as string[])].sort(),
        [students],
    );
    const yearOptions = useMemo(
        () => [...new Set(students.map((s) => s.school_year).filter(Boolean) as string[])].sort(),
        [students],
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return students.filter((s) => {
            if (statusFilter !== 'all' && s.status !== statusFilter) return false;
            if (gradeFilter !== 'all' && s.grade_to_enroll !== gradeFilter) return false;
            if (yearFilter !== 'all' && s.school_year !== yearFilter) return false;
            if (!term) return true;
            return (
                s.full_name.toLowerCase().includes(term) ||
                s.student_number.toLowerCase().includes(term) ||
                (s.email ?? '').toLowerCase().includes(term) ||
                (s.contact_number ?? '').toLowerCase().includes(term)
            );
        });
    }, [students, search, statusFilter, gradeFilter, yearFilter]);

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setGradeFilter('all');
        setYearFilter('all');
    };

    const openCreate = () => {
        setEditing(null);
        setData(emptyForm());
        setOpen(true);
    };

    const openEdit = (student: Student) => {
        setEditing(student);
        setData(studentToForm(student));
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
                description="Browse and manage the student registry with full learner enrollment details."
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
                    <ListToolbar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search by name, student #, email, or contact…"
                        resultCount={filtered.length}
                        totalCount={students.length}
                        onClear={clearFilters}
                        filters={[
                            {
                                key: 'status',
                                label: 'Status',
                                value: statusFilter,
                                onChange: setStatusFilter,
                                widthClassName: 'w-[130px]',
                                options: [
                                    { value: 'all', label: 'All status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                    { value: 'graduated', label: 'Graduated' },
                                ],
                            },
                            {
                                key: 'grade',
                                label: 'Grade',
                                value: gradeFilter,
                                onChange: setGradeFilter,
                                widthClassName: 'w-[140px]',
                                options: [
                                    { value: 'all', label: 'All grades' },
                                    ...gradeOptions.map((g) => ({ value: g, label: g })),
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
                        <EmptyState icon={Users} title="No students found" description="Student records will appear here once added to the system." action={<Button onClick={openCreate} className="rounded-xl">Add Student</Button>} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student #</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>School Year</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-mono text-sm">{s.student_number}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{s.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{s.email ?? '—'}</div>
                                        </TableCell>
                                        <TableCell>{s.grade_to_enroll ?? '—'}</TableCell>
                                        <TableCell>{s.school_year ?? '—'}</TableCell>
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
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <FormField label="Student Number" htmlFor="student_number" error={errors.student_number} required>
                                <Input id="student_number" value={data.student_number} onChange={(e) => setData('student_number', e.target.value)} className="rounded-xl" />
                            </FormField>
                            <FormField label={editing ? 'New Password (optional)' : 'Password'} htmlFor="password" error={errors.password} required={!editing}>
                                <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="rounded-xl" />
                            </FormField>
                            <FormField label="Account Status" error={errors.status} required>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="graduated">Graduated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>

                        <LearnerProfileForm
                            data={data}
                            setData={(key, value) => setData(key as keyof StudentForm, value as never)}
                            errors={errors}
                            options={formOptions}
                        />

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
