import { BarChart3, GraduationCap, PieChart as PieChartIcon, Users } from 'lucide-react';
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
} from '@/components/school/charts';

type StatusBreakdown = { status: string; label: string; count: number; percent: number };
type SectionCount = { section_id: number; section_name: string; course_name: string; students: number };
type TrendPoint = { month: string; label: string; count: number };

type Analytics = {
    enrollment_summaries: {
        total: number;
        by_status: { status: string; label: string; count: number }[];
        trend_12_months: TrendPoint[];
        latest_date: string | null;
    };
    students_by_section: SectionCount[];
    population_status: {
        total: number;
        active: number;
        inactive: number;
        graduated: number;
        breakdown: StatusBreakdown[];
    };
};

type Props = { analytics: Analytics };

export default function Index({ analytics }: Props) {
    const { enrollment_summaries, students_by_section, population_status } = analytics;

    return (
        <ModuleShell
            title="Registrar Analytics"
            breadcrumbs={[
                { title: 'Registrar', href: '/registrar' },
                { title: 'Analytics', href: '/registrar/analytics' },
            ]}
        >
            <PageHeader
                title="Registrar Descriptive Analytics"
                description="Enrollment summaries, students per section, and student population status — visualized with Recharts."
                icon={BarChart3}
                accent="indigo"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Enrollments" value={enrollment_summaries.total} icon={GraduationCap} accent="indigo" change={`Latest: ${enrollment_summaries.latest_date ?? '—'}`} />
                <StatCard label="Total Students" value={population_status.total} icon={Users} accent="emerald" />
                <StatCard label="Active Students" value={population_status.active} icon={Users} accent="emerald" trend="up" change={`${population_status.active} currently active`} />
                <StatCard label="Sections" value={students_by_section.length} icon={BarChart3} accent="violet" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard
                    title="Enrollment Trend (12 months)"
                    description="New enrollments recorded per month."
                    icon={<GraduationCap className="h-5 w-5" />}
                    className="lg:col-span-2"
                >
                    {enrollment_summaries.trend_12_months.length === 0 ? (
                        <EmptyChart message="No enrollment activity in the last 12 months." />
                    ) : (
                        <LineChartCard
                            data={enrollment_summaries.trend_12_months}
                            xKey="label"
                            lines={[{ key: 'count', label: 'Enrollments' }]}
                        />
                    )}
                </ChartCard>

                <ChartCard
                    title="Enrollment by Status"
                    description="Distribution across enrolled / dropped / completed."
                    icon={<PieChartIcon className="h-5 w-5" />}
                >
                    {enrollment_summaries.by_status.every((s) => s.count === 0) ? (
                        <EmptyChart message="No enrollment records to break down." />
                    ) : (
                        <PieChartCard
                            data={enrollment_summaries.by_status.map((s, i) => ({
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
                    title="Total Students by Section"
                    description="Enrolled student counts per section."
                    icon={<BarChart3 className="h-5 w-5" />}
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
                    icon={<Users className="h-5 w-5" />}
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
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Analytics', href: '/registrar/analytics' },
]);
