import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Eye, FileText } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Pagination, type LinkItem } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Application = {
    id: number;
    full_name: string;
    school_year: string;
    grade_to_enroll: string;
    contact_number: string;
    email: string | null;
    learner_status: string;
    application_status: string;
    created_at: string | null;
};

type Props = {
    applications: {
        data: Application[];
        links: LinkItem[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { status: string };
    stats: { total: number; pending: number; approved: number; rejected: number };
};

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export default function Index({ applications, filters, stats }: Props) {
    const setStatus = (status: string) => {
        router.get('/registrar/online-applications', status === 'all' ? {} : { status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <ModuleShell
            title="Online Applications"
            breadcrumbs={[
                { title: 'Registrar', href: '/registrar' },
                { title: 'Online Applications', href: '/registrar/online-applications' },
            ]}
        >
            <Head title="Online Applications" />
            <PageHeader
                title="Online Enrollment Applications"
                description="Review learner applications submitted through the public enrollment form."
                icon={ClipboardList}
                accent="maroon"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total" value={stats.total} icon={FileText} accent="maroon" />
                <StatCard label="Pending" value={stats.pending} icon={ClipboardList} accent="amber" />
                <StatCard label="Approved" value={stats.approved} icon={ClipboardList} accent="gold" />
                <StatCard label="Rejected" value={stats.rejected} icon={ClipboardList} accent="rose" />
            </div>

            <div className="flex flex-wrap gap-2">
                {statusFilters.map((f) => (
                    <Button
                        key={f.value}
                        type="button"
                        variant={filters.status === f.value ? 'default' : 'outline'}
                        className={`rounded-xl ${filters.status === f.value ? 'bg-[#800000] hover:bg-[#5d0000]' : ''}`}
                        onClick={() => setStatus(f.value)}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            {applications.data.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No applications yet"
                    description="Online enrollment submissions will appear here for registrar review."
                />
            ) : (
                <Card className="overflow-hidden rounded-2xl border-border/50">
                    <CardContent className="divide-y divide-border/40 p-0">
                        {applications.data.map((app) => (
                            <div key={app.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="truncate font-semibold text-foreground">{app.full_name}</h3>
                                        <StatusBadge status={app.application_status} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {app.grade_to_enroll} · SY {app.school_year} · {app.learner_status}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {app.contact_number}
                                        {app.email ? ` · ${app.email}` : ''} · Submitted {app.created_at}
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="rounded-xl">
                                    <Link href={`/registrar/online-applications/${app.id}`}>
                                        <Eye className="mr-2 h-4 w-4" /> View Form
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                    <Pagination
                        links={applications.links}
                        from={applications.from}
                        to={applications.to}
                        total={applications.total}
                    />
                </Card>
            )}
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Online Applications', href: '/registrar/online-applications' },
]);
