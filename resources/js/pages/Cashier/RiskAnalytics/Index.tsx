import { BrainCircuit } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
    return (
        <ModuleShell
            title="Risk Analytics"
            breadcrumbs={[
                { title: 'Cashier', href: '/cashier' },
                { title: 'Risk Analytics', href: '/cashier/risk-analytics' },
            ]}
        >
            <PageHeader
                title="Payment Risk Analytics"
                description="Predict which sections are most at risk of failing to pay — based on outstanding balances, payment delays, and collection trends."
                icon={BrainCircuit}
                accent="rose"
            />

            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <EmptyState
                        icon={BrainCircuit}
                        title="Risk predictions coming soon"
                        description="This module will highlight sections with a high likelihood of unpaid fees. Predictions are not available yet."
                    />
                </CardContent>
            </Card>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Cashier', href: '/cashier' },
    { title: 'Risk Analytics', href: '/cashier/risk-analytics' },
]);
