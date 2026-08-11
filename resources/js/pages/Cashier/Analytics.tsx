import { Banknote, CreditCard, TrendingUp } from 'lucide-react';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

type RevenueData = {
    month: string;
    total: number;
};

type PerformanceData = {
    id: number;
    section_name: string;
    course_name: string;
    billed: number;
    collected: number;
    outstanding: number;
};

type Props = {
    monthlyRevenue: RevenueData[];
    sectionPerformance: PerformanceData[];
};

const formatCurrency = (val: number) => `₱${val.toLocaleString()}`;

export default function Analytics({
    monthlyRevenue,
    sectionPerformance,
}: Props) {
    const totalBilled = sectionPerformance.reduce((acc, curr) => acc + curr.billed, 0);
    const totalCollected = sectionPerformance.reduce((acc, curr) => acc + curr.collected, 0);
    const totalOutstanding = totalBilled - totalCollected;

    return (
        <ModuleShell
            title="Cashier Analytics"
            breadcrumbs={[
                { title: 'Cashier', href: '/cashier' },
                { title: 'Analytics', href: '/cashier/analytics' },
            ]}
        >
            <PageHeader
                title="Cashier Revenue Analytics"
                description="Overview of billing collections and section financial performance metrics."
                icon={Banknote}
                accent="emerald"
            />

            {/* Quick Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Billed" value={formatCurrency(totalBilled)} icon={Banknote} accent="indigo" />
                <StatCard label="Total Collected" value={formatCurrency(totalCollected)} icon={CreditCard} accent="emerald" trend="up" />
                <StatCard label="Outstanding Balance" value={formatCurrency(totalOutstanding)} icon={TrendingUp} accent="amber" />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Revenue Intake Overtime */}
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Revenue Intake Trend</CardTitle>
                        <CardDescription>Overtime monthly collections (Last 12 Months)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        {monthlyRevenue.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No collection records found
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                                    <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid rgb(228, 228, 231)',
                                        }}
                                        formatter={(value: any) => [formatCurrency(Number(value)), 'Collected']}
                                    />
                                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Section Performance */}
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Financial Performance by Section</CardTitle>
                        <CardDescription>Billed fees vs actual collected amounts</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        {sectionPerformance.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No section performance records found
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sectionPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                                    <XAxis dataKey="section_name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid rgb(228, 228, 231)',
                                        }}
                                        formatter={(value: any) => [formatCurrency(Number(value))]}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="billed" name="Billed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ModuleShell>
    );
}

Analytics.layout = setModuleLayout([
    { title: 'Cashier', href: '/cashier' },
    { title: 'Analytics', href: '/cashier/analytics' },
]);
