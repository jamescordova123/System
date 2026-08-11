import { Banknote, BarChart3, TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import {
    BarChartCard,
    ChartCard,
    EmptyChart,
    LineChartCard,
    chartPalette,
    peso,
} from '@/components/school/charts';

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
    const { revenue_over_time, financial_per_section } = analytics;

    const momChange = revenue_over_time.last_month > 0
        ? ((revenue_over_time.this_month - revenue_over_time.last_month) / revenue_over_time.last_month) * 100
        : 0;

    return (
        <ModuleShell
            title="Cashier Analytics"
            breadcrumbs={[
                { title: 'Cashier', href: '/cashier' },
                { title: 'Analytics', href: '/cashier/analytics' },
            ]}
        >
            <PageHeader
                title="Cashier Descriptive Analytics"
                description="Total cash revenue collected over time and financial performance per section — visualized with Recharts."
                icon={Banknote}
                accent="emerald"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Revenue (12 mo)" value={peso(revenue_over_time.total)} icon={Banknote} accent="emerald" trend="up" change={`${revenue_over_time.payments_count} payments`} />
                <StatCard label="This Month" value={peso(revenue_over_time.this_month)} icon={TrendingUp} accent="emerald" trend={momChange >= 0 ? 'up' : 'down'} change={`${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}% vs last month`} />
                <StatCard label="Last Month" value={peso(revenue_over_time.last_month)} icon={TrendingUp} accent="amber" />
                <StatCard label="Sections Tracked" value={financial_per_section.length} icon={BarChart3} accent="violet" />
            </div>

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
                        height={320}
                    />
                )}
            </ChartCard>

            <ChartCard
                title="Financial Performance per Section"
                description="Billed vs collected vs outstanding amounts grouped by section."
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
                        height={360}
                    />
                )}
            </ChartCard>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Cashier', href: '/cashier' },
    { title: 'Analytics', href: '/cashier/analytics' },
]);
