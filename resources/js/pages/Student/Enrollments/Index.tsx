import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatusBadge } from '@/components/school/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Enrollment = {
    id: number;
    section_name: string;
    course_name: string;
    schedule: string | null;
    status: string;
    enrollment_date: string;
};

type Props = { enrollments: Enrollment[] };

export default function Index({ enrollments }: Props) {
    return (
        <ModuleShell title="My Enrollments" breadcrumbs={[{ title: 'Student Portal', href: '/student' }, { title: 'Enrollments', href: '/student/enrollments' }]}>
            <PageHeader title="My Enrollments" description="View your enrolled courses and class schedules." icon={BookOpen} accent="blue" />
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {enrollments.length === 0 ? (
                        <EmptyState icon={BookOpen} title="No enrollments" description="You are not enrolled in any sections yet." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell className="font-medium">{e.section_name}</TableCell>
                                        <TableCell>{e.course_name}</TableCell>
                                        <TableCell>{e.schedule ?? '—'}</TableCell>
                                        <TableCell>{e.enrollment_date}</TableCell>
                                        <TableCell><StatusBadge status={e.status} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Student Portal', href: '/student' }, { title: 'Enrollments', href: '/student/enrollments' }]);
