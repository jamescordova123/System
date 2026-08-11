import { GraduationCap, Users, Calendar, Layers, Activity } from 'lucide-react';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

type StatusData = {
    status: string;
    count: number;
};

type MonthlyData = {
    month: string;
    count: number;
};

type SectionData = {
    section_name: string;
    course_name: string;
    count: number;
};

type Props = {
    enrollmentStatuses: StatusData[];
    monthlyEnrollments: MonthlyData[];
    studentsBySection: SectionData[];
    studentStatus: StatusData[];
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Analytics({
    enrollmentStatuses,
    monthlyEnrollments,
    studentsBySection,
    studentStatus,
}: Props) {
    const totalStudents = studentStatus.reduce((acc, curr) => acc + curr.count, 0);
    const activeCount = studentStatus.find(s => s.status.toLowerCase() === 'active')?.count || 0;
    const inactiveCount = studentStatus.find(s => s.status.toLowerCase() === 'inactive')?.count || 0;
    const graduatedCount = studentStatus.find(s => s.status.toLowerCase() === 'graduated')?.count || 0;

    return (
        <ModuleShell
            title="Registrar Analytics"
            breadcrumbs={[
                { title: 'Registrar', href: '/registrar' },
                { title: 'Analytics', href: '/registrar/analytics' },
            ]}
        >
            <PageHeader
                title="Registrar Data Analytics"
                description="Monitor real-time enrollment metrics, section distribution, and student status changes."
                icon={GraduationCap}
                accent="indigo"
            />

            {/* Quick Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Registered Students" value={totalStudents} icon={Users} accent="indigo" />
                <StatCard label="Active Students" value={activeCount} icon={Activity} accent="emerald" />
                <StatCard label="Graduated Alumni" value={graduatedCount} icon={GraduationCap} accent="blue" />
                <StatCard label="Inactive Accounts" value={inactiveCount} icon={Layers} accent="rose" />
            </div>

            {/* Main Graphs Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Enrollment Monthly Trend */}
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Enrollment Intake Trend</CardTitle>
                        <CardDescription>Monthly student registrations (Last 12 Months)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        {monthlyEnrollments.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No registration records found
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyEnrollments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                                    <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid rgb(228, 228, 231)',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Population Status */}
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Student Population Status</CardTitle>
                        <CardDescription>Breakdown of active, inactive, and graduated students</CardDescription>
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
            </div>

            {/* Total Student by Sections */}
            <Card className="rounded-2xl border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Students by Section</CardTitle>
                    <CardDescription>Enrollment density across sections</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                    {studentsBySection.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No sections with students found
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentsBySection} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                                <XAxis dataKey="section_name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid rgb(228, 228, 231)',
                                    }}
                                    formatter={(value: any, name: any, props: any) => [
                                        `${value} Students`,
                                        `Section: ${props.payload.section_name} (${props.payload.course_name})`
                                    ]}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40}>
                                    {studentsBySection.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </ModuleShell>
    );
}

Analytics.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Analytics', href: '/registrar/analytics' },
]);
