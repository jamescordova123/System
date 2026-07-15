import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { BrainCircuit, Edit3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { StatusBadge } from '@/components/school/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Option = { value: number; label: string };

type Prediction = {
    id: number;
    section_id: number;
    section_name: string;
    course_name: string;
    risk_level: string;
    prediction_date: string;
    prediction_date_display: string;
    model_used: string;
};

type Props = {
    predictions: Prediction[];
    stats: { total: number; high: number; medium: number; low: number };
    sectionOptions: Option[];
};

const emptyForm = {
    section_id: '',
    risk_level: 'medium',
    model_used: 'dropout-v1',
    prediction_date: new Date().toISOString().split('T')[0],
};

export default function Index({ predictions, stats, sectionOptions }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Prediction | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => { setEditing(null); reset(); setOpen(true); };
    const openEdit = (prediction: Prediction) => {
        setEditing(prediction);
        setData({
            section_id: String(prediction.section_id),
            risk_level: prediction.risk_level,
            model_used: prediction.model_used,
            prediction_date: prediction.prediction_date,
        });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: () => { setOpen(false); reset(); setEditing(null); }, onError: () => toast.error('Please fix the form errors.') };
        editing ? put(`/admin/risk-analytics/${editing.id}`, options) : post('/admin/risk-analytics', options);
    };

    const handleDelete = (prediction: Prediction) => {
        if (!confirm(`Delete risk prediction for ${prediction.section_name}?`)) return;
        router.delete(`/admin/risk-analytics/${prediction.id}`);
    };

    return (
        <ModuleShell title="Risk Analytics" breadcrumbs={[{ title: 'Administration', href: '/admin/overview' }, { title: 'Risk Analytics', href: '/admin/risk-analytics' }]}>
            <PageHeader title="Risk Analytics" description="AI-powered dropout risk predictions by section for proactive intervention." icon={BrainCircuit} accent="violet" actions={<Button className="rounded-xl" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Prediction</Button>} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Predictions" value={stats.total} icon={BrainCircuit} accent="violet" />
                <StatCard label="High Risk" value={stats.high} icon={BrainCircuit} accent="rose" trend="down" />
                <StatCard label="Medium Risk" value={stats.medium} icon={BrainCircuit} accent="amber" />
                <StatCard label="Low Risk" value={stats.low} icon={BrainCircuit} accent="emerald" trend="up" />
            </div>
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    {predictions.length === 0 ? (
                        <EmptyState icon={BrainCircuit} title="No predictions yet" description="Risk predictions will appear once the model runs on section data." action={<Button onClick={openCreate} className="rounded-xl">Add Prediction</Button>} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Risk Level</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {predictions.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.section_name}</TableCell>
                                        <TableCell>{p.course_name}</TableCell>
                                        <TableCell><StatusBadge status={p.risk_level} /></TableCell>
                                        <TableCell><Badge variant="outline" className="rounded-lg font-mono text-xs">{p.model_used}</Badge></TableCell>
                                        <TableCell>{p.prediction_date_display}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit3 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader><DialogTitle>{editing ? 'Edit Prediction' : 'Add Risk Prediction'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="Section" error={errors.section_id} required>
                            <Select value={data.section_id} onValueChange={(v) => setData('section_id', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select section" /></SelectTrigger>
                                <SelectContent>
                                    {sectionOptions.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Risk Level" error={errors.risk_level} required>
                            <Select value={data.risk_level} onValueChange={(v) => setData('risk_level', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Model Used" htmlFor="model_used" error={errors.model_used} required>
                            <Input id="model_used" value={data.model_used} onChange={(e) => setData('model_used', e.target.value)} className="rounded-xl" placeholder="e.g. dropout-v1" />
                        </FormField>
                        <FormField label="Prediction Date" htmlFor="prediction_date" error={errors.prediction_date} required>
                            <Input id="prediction_date" type="date" value={data.prediction_date} onChange={(e) => setData('prediction_date', e.target.value)} className="rounded-xl" />
                        </FormField>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl" disabled={processing}>{editing ? 'Save' : 'Add'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Administration', href: '/admin/overview' }, { title: 'Risk Analytics', href: '/admin/risk-analytics' }]);
