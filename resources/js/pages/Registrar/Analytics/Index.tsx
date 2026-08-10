import {
    BarChart3,
    GraduationCap,
    Layers,
    TrendingUp,
    Users,
} from 'lucide-react';
import { EnrollmentTrendPanel } from '@/components/analytics/enrollment-trend-panel';
import { PopulationStatusPanel } from '@/components/analytics/population-status-panel';
import { SectionHeadcountPanel } from '@/components/analytics/section-headcount-panel';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { formatPercent, formatSignedPercent, trendOf } from '@/lib/analytics';
import type {
    EnrollmentSummary,
    EnrollmentTrendPoint,
    PopulationStatus,
    SectionHeadcount,
} from '@/types/analytics';

type Props = {
    months: number;
    enrollmentSummary: EnrollmentSummary;
    enrollmentTrend: EnrollmentTrendPoint[];
    studentsBySection: SectionHeadcount[];
    populationStatus: PopulationStatus;
};

export default function RegistrarAnalytics({
    months,
    enrollmentSummary,
    enrollmentTrend,
    studentsBySection,
    populationStatus,
}: Props) {
    return (
        <ModuleShell
            title="Registrar Analytics"
            breadcrumbs={[
                { title: 'Registrar', href: '/registrar' },
                { title: 'Analytics', href: '/registrar/analytics' },
            ]}
        >
            <PageHeader
                title="Registrar Analytics"
                description="Descriptive analytics on enrollment volume, section distribution and the overall student population."
                icon={BarChart3}
                accent="indigo"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Enrollments"
                    value={enrollmentSummary.total}
                    icon={GraduationCap}
                    accent="indigo"
                    change={`${enrollmentSummary.this_month} this month`}
                />
                <StatCard
                    label="Enrollment Growth"
                    value={formatSignedPercent(enrollmentSummary.growth)}
                    icon={TrendingUp}
                    accent="blue"
                    trend={trendOf(enrollmentSummary.growth)}
                    change="Month over month"
                />
                <StatCard
                    label="Retention Rate"
                    value={formatPercent(enrollmentSummary.retention_rate)}
                    icon={Users}
                    accent="emerald"
                    trend={trendOf(enrollmentSummary.retention_rate - 90)}
                    change={`${enrollmentSummary.dropped} dropped records`}
                />
                <StatCard
                    label="Avg. per Section"
                    value={enrollmentSummary.average_per_section}
                    icon={Layers}
                    accent="violet"
                    change={`${studentsBySection.length} sections`}
                />
            </div>

            <EnrollmentTrendPanel
                trend={enrollmentTrend}
                summary={enrollmentSummary}
                months={months}
                url="/registrar/analytics"
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionHeadcountPanel data={studentsBySection} />
                <PopulationStatusPanel data={populationStatus} />
            </div>
        </ModuleShell>
    );
}

RegistrarAnalytics.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Analytics', href: '/registrar/analytics' },
]);
