import { LayoutDashboard, Users, Banknote, CreditCard, Activity, GraduationCap, TrendingUp } from 'lucide-react';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

type StatusData = {
    status: string;
    count: number;
};

type SectionData = {
    section_name: string;
    course_name: string;
    count: number;
};

type RevenueData = {
    month: string;
    total: number;
};

type PerformanceData = {
    section_name: string;
    course_name: string;
    billed: number;
    collected: number;
    outstanding: number;
};

type Props = {
    studentStatus: StatusData[];
    studentsBySection: SectionData[];
    monthlyRevenue: RevenueData[];
    sectionPerformance: PerformanceData[];
};

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function Analytics({
    studentStatus,
    studentsBySection,
    monthlyRevenue,
    sectionPerformance,
}: Props) {
    const totalStudents = studentStatus.reduce((acc, curr) => acc + curr.count, 0);
    const activeCount = studentStatus.find(s => s.status.toLowerCase() === 'active')?.count || 0;

    const totalBilled = sectionPerformance.reduce((acc, curr) => acc + curr.billed, 0);
    const totalCollected = sectionPerformance.reduce((acc, curr) => acc + curr.collected, 0);
    const totalOutstanding = totalBilled - totalCollected;

    return (
        <ModuleShell
            title="School Analytics"
            breadcrumbs={[
                { title: 'Administration', href: '/admin/overview' },
                { title: 'Analytics', href: '/admin/analytics' },
            ]}
        >
            <PageHeader
                title="School System Analytics"
                description="Unified dashboard summarizing Registrar population records and Cashier financial summaries."
                icon={LayoutDashboard}
                accent="violet"
            />

            <Tabs defaultValue="registrar" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 rounded-xl max-w-md bg-neutral-100 p-1 dark:bg-neutral-800">
                    <TabsTrigger value="registrar" className="rounded-lg py-2 font-medium">Registrar Metrics</TabsTrigger>
                    <TabsTrigger value="cashier" className="rounded-lg py-2 font-medium">Cashier Metrics</TabsTrigger>
                </TabsList>

                {/* Registrar Analytics Tab */}
                <TabsContent value="registrar" className="space-y-6 outline-none">
                    {/* Registrar Stat Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Total Registered Students" value={totalStudents} icon={Users} accent="violet" />
                        <StatCard label="Active Students" value={activeCount} icon={Activity} accent="emerald" />
                        <StatCard label="Total Sections Tracked" value={studentsBySection.length} icon={GraduationCap} accent="indigo" />
                        <StatCard label="Completed/Alumni" value={studentStatus.find(s => s.status.toLowerCase() === 'graduated')?.count || 0} icon={GraduationCap} accent="blue" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Student Population Status */}
                        <Card className="rounded-2xl border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Student Population Status</CardTitle>
                                <CardDescription>All-time student records categorization</CardDescription>
                            </CardHeader>
                            <CardContent className="flex h-80 flex-col justify-between sm:flex-row">
                                {studentStatus.length === 0 ? (
                                    <div className="flex w-full items-center justify-center text-sm text-muted-foreground">
                                        No student records found
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-64 flex-1">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={studentStatus}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={4}
                                                        dataKey="count"
                                                        nameKey="status"
                                                    >
                                                        {studentStatus.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: '12px',
                                                            border: '1px solid rgb(228, 228, 231)',
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex flex-col justify-center gap-2 sm:w-1/3">
                                            {studentStatus.map((item, idx) => (
                                                <div key={item.status} className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    <div className="text-sm font-medium">
                                                        {item.status}: <span className="font-bold text-muted-foreground">{item.count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Students by Section */}
                        <Card className="rounded-2xl border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Students by Section</CardTitle>
                                <CardDescription>Section enrollment densities</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                {studentsBySection.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No sections with students found
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={studentsBySection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                                            <XAxis dataKey="section_name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid rgb(228, 228, 231)',
                                                }}
                                                formatter={(value: any) => [`${value} Students`]}
                                            />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={35}>
                                                {studentsBySection.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Cashier Analytics Tab */}
                <TabsContent value="cashier" className="space-y-6 outline-none">
                    {/* Cashier Stat Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Total Billed Statements" value={`₱${totalBilled.toLocaleString()}`} icon={Banknote} accent="violet" />
                        <StatCard label="Total Revenue Collected" value={`₱${totalCollected.toLocaleString()}`} icon={CreditCard} accent="emerald" trend="up" />
                        <StatCard label="Total Outstanding Balances" value={`₱${totalOutstanding.toLocaleString()}`} icon={TrendingUp} accent="amber" />
                        <StatCard label="Avg Section Collection" value={`₱${(sectionPerformance.length > 0 ? (totalCollected / sectionPerformance.length) : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Activity} accent="blue" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Revenue intake overtime */}
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
                                        <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                                            <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid rgb(228, 228, 231)',
                                                }}
                                                formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                                            />
                                            <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Section performance */}
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
                                                formatter={(value: any) => [`₱${Number(value).toLocaleString()}`]}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                            <Bar dataKey="billed" name="Billed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </ModuleShell>
    );
}

Analytics.layout = setModuleLayout([
    { title: 'Administration', href: '/admin/overview' },
    { title: 'Analytics', href: '/admin/analytics' },
]);
