import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Printer, Receipt as ReceiptIcon } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ListToolbar } from '@/components/school/list-toolbar';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ReceiptRow = {
    id: number;
    receipt_number: string;
    student_name: string;
    student_number: string | null;
    amount: string;
    payment_method: string | null;
    received_by: string | null;
    billing_total: string;
    issued_at: string | null;
};

type Props = {
    receipts: ReceiptRow[];
    stats: { total: number };
};

export default function Index({ receipts, stats }: Props) {
    const { branding } = usePage().props as { branding?: { app_name?: string } };
    const appName = branding?.app_name || 'DILTrack';
    const [printing, setPrinting] = useState<ReceiptRow | null>(null);
    const [search, setSearch] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');

    const methodOptions = useMemo(() => {
        const methods = Array.from(
            new Set(receipts.map((r) => r.payment_method).filter((m): m is string => Boolean(m))),
        ).sort();
        return methods.map((m) => ({
            value: m,
            label: m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        }));
    }, [receipts]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return receipts.filter((r) => {
            if (methodFilter !== 'all' && r.payment_method !== methodFilter) return false;
            if (!term) return true;
            return (
                r.receipt_number.toLowerCase().includes(term) ||
                r.student_name.toLowerCase().includes(term) ||
                (r.student_number ?? '').toLowerCase().includes(term) ||
                (r.received_by ?? '').toLowerCase().includes(term)
            );
        });
    }, [receipts, search, methodFilter]);

    // Wait a tick after `printing` is set so the hidden receipt markup is
    // actually in the DOM before invoking the browser's print dialog.
    useEffect(() => {
        if (!printing) return;
        const timer = window.setTimeout(() => window.print(), 60);
        return () => window.clearTimeout(timer);
    }, [printing]);

    useEffect(() => {
        const handleAfterPrint = () => setPrinting(null);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    return (
        <ModuleShell title="Receipts" breadcrumbs={[{ title: 'Cashier', href: '/cashier' }, { title: 'Receipts', href: '/cashier/receipts' }]}>
            <PageHeader title="Issued Receipts" description="View and print payment receipts issued to students." icon={ReceiptIcon} accent="emerald" />
            <StatCard label="Total Receipts" value={stats.total} icon={ReceiptIcon} accent="emerald" />
            <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <ListToolbar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search by receipt #, student, or cashier…"
                        resultCount={filtered.length}
                        totalCount={receipts.length}
                        onClear={() => {
                            setSearch('');
                            setMethodFilter('all');
                        }}
                        filters={
                            methodOptions.length > 0
                                ? [
                                      {
                                          key: 'method',
                                          label: 'Method',
                                          value: methodFilter,
                                          onChange: setMethodFilter,
                                          widthClassName: 'w-[150px]',
                                          options: [
                                              { value: 'all', label: 'All methods' },
                                              ...methodOptions,
                                          ],
                                      },
                                  ]
                                : []
                        }
                    />
                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={ReceiptIcon}
                            title={receipts.length === 0 ? 'No receipts issued' : 'No results'}
                            description={
                                receipts.length === 0
                                    ? 'Receipts are generated when payments are recorded.'
                                    : 'Try a different search or clear filters.'
                            }
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt #</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Issued</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-sm">{r.receipt_number}</TableCell>
                                        <TableCell className="font-medium">{r.student_name}</TableCell>
                                        <TableCell className="font-semibold">₱{r.amount}</TableCell>
                                        <TableCell>{r.issued_at ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg"
                                                onClick={() => setPrinting(r)}
                                            >
                                                <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Hidden on screen; only rendered visible via @media print rules in app.css */}
            <div className="hidden print:block">
                {printing && (
                    <div id="printable-receipt" className="mx-auto max-w-md p-8">
                        <div className="mb-6 flex flex-col items-center gap-2 border-b border-dashed border-neutral-300 pb-6 text-center">
                            <img src="/images/diltc/crest.png" alt={`${appName} crest`} className="h-16 w-16 object-contain" />
                            <p className="text-sm font-bold tracking-tight text-[#800000]">{appName}</p>
                            <p className="text-[11px] leading-tight text-neutral-500">
                                Davao del Sur Institute of Languages and Technological College Inc.
                            </p>
                            <p className="mt-2 text-xs font-bold tracking-widest text-neutral-500 uppercase">
                                Official Receipt
                            </p>
                        </div>

                        <div className="space-y-3 text-sm text-neutral-800">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Receipt No.</span>
                                <span className="font-mono font-semibold">{printing.receipt_number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Date Issued</span>
                                <span className="font-medium">{printing.issued_at ?? '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Received From</span>
                                <span className="font-medium">{printing.student_name}</span>
                            </div>
                            {printing.student_number && (
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-500">Student No.</span>
                                    <span className="font-medium">{printing.student_number}</span>
                                </div>
                            )}
                            {printing.payment_method && (
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-500">Payment Method</span>
                                    <span className="font-medium capitalize">{printing.payment_method.replace(/_/g, ' ')}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Statement Total</span>
                                <span className="font-medium">₱{printing.billing_total}</span>
                            </div>

                            <div className="my-4 border-t border-dashed border-neutral-300 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold">Amount Paid</span>
                                    <span className="text-xl font-bold text-emerald-700">₱{printing.amount}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-neutral-500">
                                <span>Received By</span>
                                <span className="font-medium text-neutral-800">{printing.received_by ?? '—'}</span>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-[10px] text-neutral-400">
                            This receipt is computer-generated and valid without a signature.
                        </p>
                    </div>
                )}
            </div>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Cashier', href: '/cashier' }, { title: 'Receipts', href: '/cashier/receipts' }]);
