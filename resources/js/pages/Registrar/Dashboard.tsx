import { Link } from '@inertiajs/react';
import {
    GraduationCap,
    Layers,
    UserCheck,
    Users,
    ArrowRight,
} from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Enrollment = {
    id: number;
    student_name: string;
    student_number: string;
    section_name: string;
    course_name: string;
    status: string;
    enrollment_date: string;
};

type Props = {
    stats: {
        students: number;
        sections: number;
        enrollments: number;
        active_students: number;
    };
    recentEnrollments: Enrollment[];
};

export default function Dashboard({ stats, recentEnrollments }: Props) {
    return (
        <ModuleShell
            title="Registrar Dashboard"
            breadcrumbs={[{ title: 'Registrar', href: '/registrar' }]}
        >
            <PageHeader
                title="Registrar Dashboard"
                description="Manage student records, class sections, and enrollment workflows."
                icon={GraduationCap}
                accent="indigo"
                actions={
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/registrar/students">View Students</Link>
                    </Button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Students" value={stats.students} icon={Users} accent="indigo" change="+ Active enrollment tracking" />
                <StatCard label="Active Students" value={stats.active_students} icon={UserCheck} accent="emerald" trend="up" change="Currently enrolled" />
                <StatCard label="Sections" value={stats.sections} icon={Layers} accent="violet" change="Open class sections" />
                <StatCard label="Enrollments" value={stats.enrollments} icon={GraduationCap} accent="blue" change="All-time records" />
            </div>

            <Card className="rounded-2xl border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Enrollments</CardTitle>
                    <Button asChild variant="ghost" size="sm" className="rounded-xl">
                        <Link href="/registrar/enrollments">
                            View all <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {recentEnrollments.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="No enrollments yet"
                            description="Enrollment records will appear here once students are registered to sections."
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentEnrollments.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell>
                                            <div className="font-medium">{e.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{e.student_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{e.section_name}</div>
                                            <div className="text-xs text-muted-foreground">{e.course_name}</div>
                                        </TableCell>
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

Dashboard.layout = setModuleLayout([{ title: 'Registrar', href: '/registrar' }]);
