import { FormEvent, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Bell, BookOpen, CreditCard, GraduationCap, History, Megaphone, Search, Wallet } from 'lucide-react';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Announcement = {
    id: number;
    title: string;
    message: string;
    created_by: string | null;
    created_at: string | null;
};

type Props = {
    student: { name: string; student_number: string; status: string } | null;
    stats: { enrollments: number; unpaid_bills: number; notifications: number };
    announcements: Announcement[];
};

export default function Dashboard({ student, stats, announcements }: Props) {
    const [billingSearch, setBillingSearch] = useState('');

    const searchBilling = (e: FormEvent) => {
        e.preventDefault();
        const term = billingSearch.trim();
        router.get(
            '/student/billing',
            term ? { search: term } : {},
            { preserveState: false },
        );
    };

    return (
        <ModuleShell title="Student Portal" breadcrumbs={[{ title: 'Student Portal', href: '/student' }]}>
            <PageHeader
                title={student ? `Welcome, ${student.name}` : 'Student Portal'}
                description={student ? `Student #${student.student_number}` : 'Your personal academic and billing hub.'}
                icon={GraduationCap}
                accent="blue"
                actions={student && <StatusBadge status={student.status} />}
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="My Enrollments" value={stats.enrollments} icon={BookOpen} accent="blue" />
                <StatCard
                    label="Unpaid Bills"
                    value={stats.unpaid_bills}
                    icon={CreditCard}
                    accent={stats.unpaid_bills > 0 ? 'rose' : 'emerald'}
                />
                <StatCard label="Unread Notifications" value={stats.notifications} icon={Bell} accent="violet" />
            </div>

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <form onSubmit={searchBilling} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={billingSearch}
                                onChange={(e) => setBillingSearch(e.target.value)}
                                placeholder="Search in My Billing — program, fee item, AR #, or receipt…"
                                className="rounded-xl pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" className="rounded-xl">
                                <Search className="mr-2 h-4 w-4" /> Search Billing
                            </Button>
                            <Button asChild type="button" variant="outline" className="rounded-xl">
                                <Link href="/student/transactions">
                                    <History className="mr-2 h-4 w-4" /> Transactions
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button asChild variant="outline" className="h-auto flex-col gap-2 rounded-2xl p-6">
                    <Link href="/student/enrollments">
                        <BookOpen className="h-6 w-6 text-blue-500" />
                        <span>My Enrollments</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto flex-col gap-2 rounded-2xl p-6">
                    <Link href="/student/billing">
                        <Wallet className="h-6 w-6 text-emerald-500" />
                        <span>My Billing</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto flex-col gap-2 rounded-2xl p-6">
                    <Link href="/student/transactions">
                        <History className="h-6 w-6 text-sky-500" />
                        <span>Transaction History</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto flex-col gap-2 rounded-2xl p-6">
                    <Link href="/student/notifications">
                        <Bell className="h-6 w-6 text-violet-500" />
                        <span>Notifications</span>
                    </Link>
                </Button>
            </div>

            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-blue-500" /> Latest Announcements
                    </CardTitle>
                    <Button asChild variant="ghost" size="sm" className="rounded-xl">
                        <Link href="/student/notifications">View all</Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {announcements.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No announcements at this time.</p>
                    ) : (
                        announcements.map((a) => (
                            <div key={a.id} className="rounded-xl border bg-muted/30 p-4">
                                <h4 className="font-semibold">{a.title}</h4>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.message}</p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {a.created_at} · {a.created_by}
                                </p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </ModuleShell>
    );
}

Dashboard.layout = setModuleLayout([{ title: 'Student Portal', href: '/student' }]);
