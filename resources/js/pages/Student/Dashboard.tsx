import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    BookOpen,
    CheckCircle2,
    Clock,
    CreditCard,
    GraduationCap,
    History,
    Megaphone,
    ReceiptText,
    Wallet,
    XCircle,
} from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Announcement = {
    id: number;
    title: string;
    message: string;
    created_by: string | null;
    created_at: string | null;
};

type FeeItem = {
    id: number;
    label: string;
    amount_due: number;
    amount_paid: number;
    balance: number;
    status: string;
};

type RecentStatement = {
    id: number;
    program_label: string;
    school_year: string | null;
    due_date: string;
    status: string;
    total_due: number;
    total_paid: number;
    balance: number;
    items: FeeItem[];
};

type RecentPayment = {
    id: number;
    payment_date: string;
    receipt_number: string | null;
    item_label: string | null;
    program_label: string;
    amount_paid: number;
};

type Props = {
    student: { name: string; student_number: string; status: string } | null;
    stats: { enrollments: number; unpaid_bills: number; notifications: number };
    announcements: Announcement[];
    billing_summary: { assessed: number; paid: number; balance: number };
    recent_statements: RecentStatement[];
    recent_payments: RecentPayment[];
};

const peso = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function StatusIcon({ status }: { status: string }) {
    if (status === 'paid') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    if (status === 'partial') return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    return <XCircle className="h-3.5 w-3.5 text-rose-500" />;
}

export default function Dashboard({ student, stats, announcements, billing_summary, recent_statements, recent_payments }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const hasStatements = recent_statements.length > 0;
    const hasPayments = recent_payments.length > 0;

    return (
        <ModuleShell title="Student Portal" breadcrumbs={[{ title: 'Student Portal', href: '/student' }]}>
            <PageHeader
                title={student ? `Welcome, ${student.name}` : 'Student Portal'}
                description={student ? `Student #${student.student_number}` : 'Your personal academic and billing hub.'}
                icon={GraduationCap}
                accent="blue"
                actions={student && <StatusBadge status={student.status} />}
            />

            {/* Stat Cards */}
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

            {/* Quick Links */}
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

            {/* ── Billing Ledger ── */}
            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wallet className="h-5 w-5 text-emerald-500" />
                        Billing Ledger
                    </CardTitle>
                    <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs">
                        <Link href="/student/billing">
                            View Full Ledger <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    {/* Summary bar */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-muted/40 p-3 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total Assessed</p>
                            <p className="mt-1 font-bold tabular-nums">{peso(billing_summary.assessed)}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total Paid</p>
                            <p className="mt-1 font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{peso(billing_summary.paid)}</p>
                        </div>
                        <div className={`rounded-xl p-3 text-center ${billing_summary.balance > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-muted/40'}`}>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Balance</p>
                            <p className={`mt-1 font-bold tabular-nums ${billing_summary.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                {peso(billing_summary.balance)}
                            </p>
                        </div>
                    </div>

                    {/* Statement rows */}
                    {!hasStatements ? (
                        <EmptyState
                            icon={Wallet}
                            title="No billing statements yet"
                            description="When the Cashier assesses your fees, your ledger will appear here."
                        />
                    ) : (
                        <div className="space-y-3">
                            {recent_statements.map((s) => {
                                const isExpanded = expandedId === s.id;
                                return (
                                    <div key={s.id} className="rounded-xl border border-border/60 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                            className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <StatusIcon status={s.status} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate">{s.program_label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {s.school_year ? `SY ${s.school_year} · ` : ''}Due {s.due_date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-muted-foreground">Balance</p>
                                                    <p className={`text-sm font-bold tabular-nums ${s.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                        {peso(s.balance)}
                                                    </p>
                                                </div>
                                                <StatusBadge status={s.status} />
                                                <span className="text-xs text-muted-foreground">{isExpanded ? '▲' : '▼'}</span>
                                            </div>
                                        </button>

                                        {isExpanded && s.items.length > 0 && (
                                            <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
                                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Fee Breakdown</p>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="text-xs">Fee Item</TableHead>
                                                            <TableHead className="text-right text-xs">Due</TableHead>
                                                            <TableHead className="text-right text-xs">Paid</TableHead>
                                                            <TableHead className="text-right text-xs">Balance</TableHead>
                                                            <TableHead className="text-xs">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {s.items.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="text-xs font-medium">{item.label}</TableCell>
                                                                <TableCell className="text-right text-xs tabular-nums">{peso(item.amount_due)}</TableCell>
                                                                <TableCell className="text-right text-xs tabular-nums text-emerald-600 dark:text-emerald-400">{peso(item.amount_paid)}</TableCell>
                                                                <TableCell className={`text-right text-xs font-semibold tabular-nums ${item.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                                                    {peso(item.balance)}
                                                                </TableCell>
                                                                <TableCell><StatusBadge status={item.status} /></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                                <div className="mt-3 flex justify-end gap-6 border-t border-border/40 pt-2 text-xs">
                                                    <span className="text-muted-foreground">Total Paid: <strong className="text-emerald-600 dark:text-emerald-400">{peso(s.total_paid)}</strong></span>
                                                    <span className="text-muted-foreground">Balance: <strong className={s.balance > 0 ? 'text-amber-600 dark:text-amber-400' : ''}>{peso(s.balance)}</strong></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Recent Payments ── */}
            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ReceiptText className="h-5 w-5 text-sky-500" />
                        Recent Payments
                    </CardTitle>
                    <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs">
                        <Link href="/student/transactions">
                            View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="pt-0">
                    {!hasPayments ? (
                        <EmptyState
                            icon={History}
                            title="No payments recorded yet"
                            description="Payments recorded by the Cashier will appear here."
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Receipt #</TableHead>
                                    <TableHead>Fee / Program</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recent_payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="text-sm">{p.payment_date}</TableCell>
                                        <TableCell className="font-mono text-sm tabular-nums">
                                            {p.receipt_number ? (
                                                <Badge variant="outline" className="rounded-lg font-mono text-[10px]">
                                                    {p.receipt_number}
                                                </Badge>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{p.item_label ?? 'General Payment'}</div>
                                            <div className="text-xs text-muted-foreground">{p.program_label}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                            {peso(p.amount_paid)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* ── Announcements ── */}
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
