import { BrainCircuit, AlertTriangle, ShieldAlert, CheckCircle, TrendingUp } from 'lucide-react';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type PredictionData = {
    section_name: string;
    course_name: string;
    unpaid_ratio: number;
    collection_rate: number;
    probability: number;
    risk_level: 'high' | 'medium' | 'low';
    confidence: number;
    factors: string[];
};

type Props = {
    predictiveAnalytics: PredictionData[];
};

export default function Index({ predictiveAnalytics }: Props) {
    const totalSections = predictiveAnalytics.length;
    const highRiskCount = predictiveAnalytics.filter(p => p.risk_level === 'high').length;
    const mediumRiskCount = predictiveAnalytics.filter(p => p.risk_level === 'medium').length;
    const avgProb = totalSections > 0 
        ? Math.round(predictiveAnalytics.reduce((acc, curr) => acc + curr.probability, 0) / totalSections) 
        : 0;

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
                description="AI-powered predictions identifying sections most at risk of tuition payment delays and default."
                icon={BrainCircuit}
                accent="rose"
            />

            {/* Quick Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Predicted Sections" value={totalSections} icon={BrainCircuit} accent="indigo" />
                <StatCard label="High Risk Sections" value={highRiskCount} icon={ShieldAlert} accent="rose" trend={highRiskCount > 0 ? 'down' : 'up'} />
                <StatCard label="Medium Risk Sections" value={mediumRiskCount} icon={AlertTriangle} accent="amber" />
                <StatCard label="Avg Delinquency Prob." value={`${avgProb}%`} icon={TrendingUp} accent={avgProb > 50 ? 'rose' : 'emerald'} />
            </div>

            {/* Delinquency Risk Forecast */}
            <Card className="rounded-2xl border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                        Delinquency Risk Forecast
                    </CardTitle>
                    <CardDescription>
                        Sections at risk of payment delinquency predicted using the{' '}
                        <span className="font-mono text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded text-rose-600 dark:text-rose-400">
                            Random Forest Classifier (v1)
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {predictiveAnalytics.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                            No risk metrics available. Generate some section enrollments and billings first.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Section Name</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Collection Rate</TableHead>
                                        <TableHead>Delinquency Prob.</TableHead>
                                        <TableHead>Risk Classification</TableHead>
                                        <TableHead>Confidence</TableHead>
                                        <TableHead>Key Risk Drivers (Top Forest Features)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {predictiveAnalytics.map((pred, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-semibold">{pred.section_name}</TableCell>
                                            <TableCell>{pred.course_name}</TableCell>
                                            <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                                                {pred.collection_rate}%
                                            </TableCell>
                                            <TableCell className="font-semibold text-rose-600 dark:text-rose-400">
                                                {pred.probability}%
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize rounded-lg px-2 py-0.5 font-semibold text-xs border ${
                                                        pred.risk_level === 'high'
                                                            ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                                                            : pred.risk_level === 'medium'
                                                            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400'
                                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400'
                                                    }`}
                                                >
                                                    {pred.risk_level} Risk
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {pred.confidence}%
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {pred.factors.map((factor, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="rounded-md bg-neutral-100 text-neutral-700 text-[10px] dark:bg-neutral-800 dark:text-neutral-300 font-normal border border-transparent"
                                                        >
                                                            {factor}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Cashier', href: '/cashier' },
    { title: 'Risk Analytics', href: '/cashier/risk-analytics' },
]);
