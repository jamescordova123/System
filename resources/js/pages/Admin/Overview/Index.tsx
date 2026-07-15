import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    GraduationCap,
    LayoutDashboard,
    Users,
} from 'lucide-react';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Module = {
    label: string;
    href: string;
    description: string;
    count: number;
};

type Props = {
    stats: {
        users: number;
        students: number;
        sections: number;
        enrollments: number;
        billing: number;
        payments: number;
        revenue: string;
    };
    modules: Module[];
};

export default function Index({ stats, modules }: Props) {
    return (
        <ModuleShell title="School Overview" breadcrumbs={[{ title: 'School Overview', href: '/admin/overview' }]}>
            <PageHeader
                title="School System Overview"
                description="Unified dashboard with access to all registrar, cashier, and student modules."
                icon={LayoutDashboard}
                accent="violet"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Users" value={stats.users} icon={Users} accent="violet" />
                <StatCard label="Students" value={stats.students} icon={GraduationCap} accent="indigo" />
                <StatCard label="Enrollments" value={stats.enrollments} icon={GraduationCap} accent="blue" />
                <StatCard label="Revenue" value={`₱${stats.revenue}`} icon={Banknote} accent="emerald" trend="up" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {modules.map((m) => (
                    <Card key={m.label} className="group rounded-2xl transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                {m.label}
                                <span className="text-2xl font-bold text-muted-foreground">{m.count}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">{m.description}</p>
                            <Button asChild variant="outline" className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground">
                                <Link href={m.href}>
                                    Open module <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'School Overview', href: '/admin/overview' }]);
