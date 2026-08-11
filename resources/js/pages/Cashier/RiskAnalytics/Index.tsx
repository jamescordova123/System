import { BrainCircuit, Cpu, ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChartCard,
    ChartCard,
    HorizontalBarChartCard,
    PieChartCard,
    riskColors,
} from '@/components/school/charts';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Prediction = {
    id: number;
    section_id: number;
    section_name: string;
    course_name: string;
    risk_level: string;
    model_used: string;
    prediction_date: string;
    prediction_date_display: string;
};

type Stats = {
    total: number;
    high: number;
    medium: number;
    low: number;
    last_run: string | null;
    model_used: string;
};

type ModelInfo = {
    name: string;
    algorithm: string;
    trees: number;
    features: string[];
};

type Props = {
    predictions: Prediction[];
    stats: Stats;
    model: ModelInfo;
};

export default function Index({ predictions, stats, model }: Props) {
    const riskCounts = [
        { name: 'High risk', value: stats.high, color: riskColors.high },
        { name: 'Medium risk', value: stats.medium, color: riskColors.medium },
        { name: 'Low risk', value: stats.low, color: riskColors.low },
    ];

    return (
        <ModuleShell
            title="Risk Analytics"
            breadcrumbs={[
                { title: 'Cashier', href: '/cashier' },
                { title: 'Risk Analytics', href: '/cashier/risk-analytics' },
            ]}
        >
            <PageHeader
                title="Payment Delinquency Risk Analytics"
                description="Predictive analytics identifying sections at risk of payment delinquency, scored by a Random Forest model."
                icon={BrainCircuit}
                accent="rose"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Sections Scored" value={stats.total} icon={BrainCircuit} accent="violet" change={`Last run: ${stats.last_run ?? '—'}`} />
                <StatCard label="High Risk" value={stats.high} icon={ShieldAlert} accent="rose" trend="down" />
                <StatCard label="Medium Risk" value={stats.medium} icon={ShieldAlert} accent="amber" />
                <StatCard label="Low Risk" value={stats.low} icon={ShieldAlert} accent="emerald" trend="up" />
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Cpu className="h-4 w-4" /> Model: {model.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm md:grid-cols-3">
                    <div>
                        <p className="font-semibold text-muted-foreground">Algorithm</p>
                        <p className="mt-1">{model.algorithm}</p>
                        <p className="mt-2 font-semibold text-muted-foreground">Estimators</p>
                        <p className="mt-1">{model.trees} decision trees</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="font-semibold text-muted-foreground">Features used for prediction</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {model.features.map((feature) => (
                                <Badge key={feature} variant="outline" className="rounded-lg font-mono text-xs">
                                    {feature}
                                </Badge>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Predictions are produced by running <code className="rounded bg-muted px-1 py-0.5 text-xs">php artisan analytics:predict-delinquency</code> and persisting the per-section risk bands. A section is flagged High when delinquent billing share and mean predicted delinquency probability are both elevated.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {predictions.length === 0 ? (
                <Card className="rounded-2xl">
                    <CardContent className="pt-6">
                        <EmptyState
                            icon={BrainCircuit}
                            title="No predictions yet"
                            description="Run `php artisan analytics:predict-delinquency` to train the Random Forest and score sections for delinquency risk."
                        />
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <ChartCard
                            title="Risk Distribution"
                            description="Count of sections in each risk band."
                            icon={<ShieldAlert className="h-5 w-5" />}
                        >
                            <PieChartCard data={riskCounts} />
                        </ChartCard>

                        <ChartCard
                            title="Sections by Risk Level"
                            description="Each section's predicted risk band."
                            icon={<BrainCircuit className="h-5 w-5" />}
                            className="lg:col-span-2"
                        >
                            <HorizontalBarChartCard
                                data={predictions.map((p) => ({
                                    section_name: p.section_name,
                                    rank: { high: 3, medium: 2, low: 1 }[p.risk_level] ?? 0,
                                }))}
                                yKey="section_name"
                                bars={[{ key: 'rank', label: 'Risk (low=1, high=3)', color: 'var(--chart-1)' }]}
                                height={Math.max(300, predictions.length * 36)}
                            />
                        </ChartCard>
                    </div>

                    <ChartCard
                        title="Delinquency Risk by Section"
                        description="Risk band per section — red indicates the highest predicted delinquency risk."
                        icon={<BrainCircuit className="h-5 w-5" />}
                    >
                        <BarChartCard
                            data={predictions.map((p) => ({
                                section_name: p.section_name,
                                score: { high: 3, medium: 2, low: 1 }[p.risk_level] ?? 0,
                                color: riskColors[p.risk_level],
                            }))}
                            xKey="section_name"
                            bars={[{ key: 'score', label: 'Risk score' }]}
                            height={320}
                        />
                    </ChartCard>

                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-base">Predictions Detail</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Risk Level</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Prediction Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {predictions.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.section_name}</TableCell>
                                            <TableCell>{p.course_name}</TableCell>
                                            <TableCell><StatusBadge status={p.risk_level} /></TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="rounded-lg font-mono text-xs">{p.model_used}</Badge>
                                            </TableCell>
                                            <TableCell>{p.prediction_date_display}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Cashier', href: '/cashier' },
    { title: 'Risk Analytics', href: '/cashier/risk-analytics' },
]);
