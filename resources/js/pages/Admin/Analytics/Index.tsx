import { BarChart3, Banknote, Percent, UserCheck, Users } from 'lucide-react';
import { PopulationStatusPanel } from '@/components/analytics/population-status-panel';
import { RevenueTrendPanel } from '@/components/analytics/revenue-trend-panel';
import { SectionFinancialsPanel } from '@/components/analytics/section-financials-panel';
import { SectionHeadcountPanel } from '@/components/analytics/section-headcount-panel';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import {
    formatCurrency,
    formatPercent,
    formatSignedPercent,
    trendOf,
} from '@/lib/analytics';
import type {
    PopulationStatus,
    RevenueSummary,
    RevenueTrendPoint,
    SectionFinancials,
    SectionHeadcount,
} from '@/types/analytics';

type Props = {
    months: number;
    studentsBySection: SectionHeadcount[];
    populationStatus: PopulationStatus;
    revenueSummary: RevenueSummary;
    revenueTrend: RevenueTrendPoint[];
    sectionPerformance: SectionFinancials[];
};

export default function AdminAnalytics({
    months,
    studentsBySection,
    populationStatus,
    revenueSummary,
    revenueTrend,
    sectionPerformance,
}: Props) {
    return (
        <ModuleShell
            title="School Analytics"
            breadcrumbs={[
                { title: 'Administration', href: '/admin/overview' },
                { title: 'Analytics', href: '/admin/analytics' },
            ]}
        >
            <PageHeader
                title="School Analytics"
                description="Institution-wide descriptive analytics combining student population, section distribution and cash collection performance."
                icon={BarChart3}
                accent="violet"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Students"
                    value={populationStatus.total}
                    icon={Users}
                    accent="indigo"
                    change={`${studentsBySection.length} sections`}
                />
                <StatCard
                    label="Active Rate"
                    value={formatPercent(populationStatus.active_rate)}
                    icon={UserCheck}
                    accent="emerald"
                    trend={trendOf(populationStatus.active_rate - 75)}
                    change={`${populationStatus.active} active students`}
                />
                <StatCard
                    label="Cash Collected"
                    value={formatCurrency(revenueSummary.collected)}
                    icon={Banknote}
                    accent="blue"
                    trend={trendOf(revenueSummary.growth)}
                    change={`${formatSignedPercent(revenueSummary.growth)} vs last month`}
                />
                <StatCard
                    label="Collection Rate"
                    value={formatPercent(revenueSummary.collection_rate)}
                    icon={Percent}
                    accent="amber"
                    change={`${formatCurrency(revenueSummary.outstanding)} outstanding`}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionHeadcountPanel data={studentsBySection} />
                <PopulationStatusPanel data={populationStatus} />
            </div>

            <RevenueTrendPanel
                trend={revenueTrend}
                summary={revenueSummary}
                months={months}
                url="/admin/analytics"
            />

            <SectionFinancialsPanel data={sectionPerformance} />
        </ModuleShell>
    );
}

AdminAnalytics.layout = setModuleLayout([
    { title: 'Administration', href: '/admin/overview' },
    { title: 'Analytics', href: '/admin/analytics' },
]);
