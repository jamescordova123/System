import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Eye, FileText } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ListToolbar } from '@/components/school/list-toolbar';
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
    filters: {
        status: string;
        search: string;
        grade: string;
        school_year: string;
    };
    gradeOptions: string[];
    schoolYearOptions: string[];
    stats: { total: number; pending: number; approved: number; rejected: number };
};

export default function Index({ applications, filters, gradeOptions, schoolYearOptions, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (search === (filters.search ?? '')) return;
            applyFilters({ search });
        }, 300);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyFilters = (overrides: Partial<typeof filters> = {}) => {
        const next = {
            status: overrides.status ?? filters.status,
            search: overrides.search ?? search,
            grade: overrides.grade ?? filters.grade,
            school_year: overrides.school_year ?? filters.school_year,
        };

        const params: Record<string, string> = {};
        if (next.status && next.status !== 'all') params.status = next.status;
        if (next.search.trim()) params.search = next.search.trim();
        if (next.grade && next.grade !== 'all') params.grade = next.grade;
        if (next.school_year && next.school_year !== 'all') params.school_year = next.school_year;

        router.get('/registrar/online-applications', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/registrar/online-applications', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
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

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <ListToolbar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search by name, contact, or email…"
                        resultCount={applications.data.length}
                        totalCount={applications.total}
                        onClear={clearFilters}
                        filters={[
                            {
                                key: 'status',
                                label: 'Status',
                                value: filters.status || 'all',
                                onChange: (value) => applyFilters({ status: value }),
                                widthClassName: 'w-[140px]',
                                options: [
                                    { value: 'all', label: 'All status' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'reviewed', label: 'Reviewed' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'rejected', label: 'Rejected' },
                                ],
                            },
                            {
                                key: 'grade',
                                label: 'Grade',
                                value: filters.grade || 'all',
                                onChange: (value) => applyFilters({ grade: value }),
                                widthClassName: 'w-[150px]',
                                options: [
                                    { value: 'all', label: 'All grades' },
                                    ...gradeOptions.map((g) => ({ value: g, label: g })),
                                ],
                            },
                            {
                                key: 'year',
                                label: 'School Year',
                                value: filters.school_year || 'all',
                                onChange: (value) => applyFilters({ school_year: value }),
                                widthClassName: 'w-[150px]',
                                options: [
                                    { value: 'all', label: 'All years' },
                                    ...schoolYearOptions.map((y) => ({ value: y, label: y })),
                                ],
                            },
                        ]}
                    />

                    {applications.data.length === 0 ? (
                        <EmptyState
                            icon={ClipboardList}
                            title="No applications found"
                            description="Online enrollment submissions matching your filters will appear here."
                        />
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-border/50">
                            <div className="divide-y divide-border/40">
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
                            </div>
                            <Pagination
                                links={applications.links}
                                from={applications.from}
                                to={applications.to}
                                total={applications.total}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Online Applications', href: '/registrar/online-applications' },
]);
