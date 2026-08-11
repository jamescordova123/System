import { BarChart3, Banknote, GraduationCap, LayoutDashboard, TrendingUp, Users } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import {
    BarChartCard,
    ChartCard,
    EmptyChart,
    LineChartCard,
    PieChartCard,
    categoricalColors,
    chartPalette,
    peso,
} from '@/components/school/charts';

type SectionCount = { section_id: number; section_name: string; course_name: string; students: number };
type RevenuePoint = { month: string; label: string; revenue: number };
type SectionFinance = {
    section_id: number | null;
    section_name: string;
    course_name: string | null;
    billed: number;
    collected: number;
    outstanding: number;
};

type Analytics = {
    students_by_section: SectionCount[];
    population_status: {
        total: number;
        active: number;
        inactive: number;
        graduated: number;
        breakdown: { status: string; label: string; count: number; percent: number }[];
    };
    revenue_over_time: {
        series: RevenuePoint[];
        total: number;
        this_month: number;
        last_month: number;
        payments_count: number;
    };
    financial_per_section: SectionFinance[];
};

type Props = { analytics: Analytics };

export default function Index({ analytics }: Props) {
    const { students_by_section, population_status, revenue_over_time, financial_per_section } = analytics;

    return (
        <ModuleShell
            title="School Analytics"
            breadcrumbs={[
                { title: 'Administration', href: '/admin/overview' },
                { title: 'Analytics', href: '/admin/analytics' },
            ]}
        >
            <PageHeader
                title="School Descriptive Analytics"
                description="Combined registrar and cashier summaries — students by section, population status, revenue trends, and per-section financial performance."
                icon={LayoutDashboard}
                accent="violet"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Students" value={population_status.total} icon={Users} accent="indigo" change={`${population_status.active} active`} />
                <StatCard label="Sections" value={students_by_section.length} icon={BarChart3} accent="violet" />
                <StatCard label="Revenue (12 mo)" value={peso(revenue_over_time.total)} icon={Banknote} accent="emerald" trend="up" change={`${revenue_over_time.payments_count} payments`} />
                <StatCard label="This Month Revenue" value={peso(revenue_over_time.this_month)} icon={TrendingUp} accent="emerald" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard
                    title="Total Students by Section"
                    description="Enrolled student counts per section."
                    icon={<Users className="h-5 w-5" />}
                >
                    {students_by_section.length === 0 ? (
                        <EmptyChart message="No sections with enrolled students yet." />
                    ) : (
                        <BarChartCard
                            data={students_by_section}
                            xKey="section_name"
                            bars={[{ key: 'students', label: 'Students' }]}
                        />
                    )}
                </ChartCard>

                <ChartCard
                    title="Student Population Status"
                    description="Active vs inactive vs graduated."
                    icon={<GraduationCap className="h-5 w-5" />}
                >
                    {population_status.breakdown.every((s) => s.count === 0) ? (
                        <EmptyState icon={Users} title="No students yet" description="Student population will appear here once records are added." />
                    ) : (
                        <PieChartCard
                            data={population_status.breakdown.map((s, i) => ({
                                name: s.label,
                                value: s.count,
                                color: categoricalColors[i % categoricalColors.length],
                            }))}
                        />
                    )}
                </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard
                    title="Overtime Report — Total Cash Revenue Collected"
                    description="Monthly cash collections over the last 12 months."
                    icon={<TrendingUp className="h-5 w-5" />}
                >
                    {revenue_over_time.series.length === 0 ? (
                        <EmptyChart message="No payments recorded in the last 12 months." />
                    ) : (
                        <LineChartCard
                            data={revenue_over_time.series}
                            xKey="label"
                            lines={[{ key: 'revenue', label: 'Revenue', color: chartPalette.emerald }]}
                            formatValue={peso}
                        />
                    )}
                </ChartCard>

                <ChartCard
                    title="Financial Performance per Section"
                    description="Billed vs collected vs outstanding grouped by section."
                    icon={<BarChart3 className="h-5 w-5" />}
                >
                    {financial_per_section.length === 0 ? (
                        <EmptyState icon={Banknote} title="No billing data" description="Financial performance per section will appear once billing statements are recorded." />
                    ) : (
                        <BarChartCard
                            data={financial_per_section}
                            xKey="section_name"
                            bars={[
                                { key: 'collected', label: 'Collected', color: chartPalette.emerald, stackId: 'a' },
                                { key: 'outstanding', label: 'Outstanding', color: chartPalette.rose, stackId: 'a' },
                                { key: 'billed', label: 'Billed', color: chartPalette.gold },
                            ]}
                            formatValue={peso}
                            height={300}
                        />
                    )}
                </ChartCard>
            </div>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Administration', href: '/admin/overview' },
    { title: 'Analytics', href: '/admin/analytics' },
]);
