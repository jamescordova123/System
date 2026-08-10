import {
    Banknote,
    BarChart3,
    CreditCard,
    Percent,
    TrendingUp,
} from 'lucide-react';
import { RevenueTrendPanel } from '@/components/analytics/revenue-trend-panel';
import { SectionFinancialsPanel } from '@/components/analytics/section-financials-panel';
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
    RevenueByMethod,
    RevenueSummary,
    RevenueTrendPoint,
    SectionFinancials,
} from '@/types/analytics';

type Props = {
    months: number;
    revenueSummary: RevenueSummary;
    revenueTrend: RevenueTrendPoint[];
    revenueByMethod: RevenueByMethod[];
    sectionPerformance: SectionFinancials[];
};

export default function CashierAnalytics({
    months,
    revenueSummary,
    revenueTrend,
    revenueByMethod,
    sectionPerformance,
}: Props) {
    const methodSummary = revenueByMethod
        .map(
            (method) =>
                `${method.method}: ${formatCurrency(method.amount)} (${formatPercent(method.share)})`,
        )
        .join(' · ');

    return (
        <ModuleShell
            title="Cashier Analytics"
            breadcrumbs={[
                { title: 'Cashier', href: '/cashier' },
                { title: 'Analytics', href: '/cashier/analytics' },
            ]}
        >
            <PageHeader
                title="Cashier Analytics"
                description="Descriptive analytics on cash revenue collected over time and financial performance per section."
                icon={BarChart3}
                accent="emerald"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Collected"
                    value={formatCurrency(revenueSummary.collected)}
                    icon={Banknote}
                    accent="emerald"
                    trend={trendOf(revenueSummary.growth)}
                    change={`${formatSignedPercent(revenueSummary.growth)} vs last month`}
                />
                <StatCard
                    label="Outstanding"
                    value={formatCurrency(revenueSummary.outstanding)}
                    icon={CreditCard}
                    accent="rose"
                    change={`Billed ${formatCurrency(revenueSummary.billed)}`}
                />
                <StatCard
                    label="Collection Rate"
                    value={formatPercent(revenueSummary.collection_rate)}
                    icon={Percent}
                    accent="blue"
                    trend={trendOf(revenueSummary.collection_rate - 80)}
                    change="Collected ÷ billed"
                />
                <StatCard
                    label="Avg. Payment"
                    value={formatCurrency(revenueSummary.average_payment)}
                    icon={TrendingUp}
                    accent="violet"
                    change={`${revenueSummary.transactions} transactions`}
                />
            </div>

            <RevenueTrendPanel
                trend={revenueTrend}
                summary={revenueSummary}
                months={months}
                url="/cashier/analytics"
            />

            {methodSummary && (
                <p className="rounded-2xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                    Payment mix — {methodSummary}
                </p>
            )}

            <SectionFinancialsPanel data={sectionPerformance} />
        </ModuleShell>
    );
}

CashierAnalytics.layout = setModuleLayout([
    { title: 'Cashier', href: '/cashier' },
    { title: 'Analytics', href: '/cashier/analytics' },
]);
