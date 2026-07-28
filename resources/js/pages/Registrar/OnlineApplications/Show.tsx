import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, Clock, Eye, Lock, Mail, Save, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Address = {
    house_no: string | null;
    street: string | null;
    barangay: string | null;
    municipality: string | null;
    province: string | null;
    country: string | null;
    zip_code: string | null;
};

type Person = {
    last_name: string | null;
    first_name: string | null;
    middle_name: string | null;
    contact: string | null;
};

type Application = {
    id: number;
    full_name: string;
    school_year: string;
    grade_to_enroll: string;
    learner_status: string;
    application_status: string;
    created_at: string | null;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    birthdate_display: string | null;
    place_of_birth: string;
    mother_tongue: string | null;
    sex: string;
    is_indigenous: boolean;
    indigenous_specify: string | null;
    is_4ps_beneficiary: boolean;
    household_id_number: string | null;
    current_address: Address;
    permanent_same_as_current: boolean;
    permanent_address: Address;
    father: Person;
    mother: Person;
    guardian: Person;
    jhs_graduation_display: string | null;
    shs_semester: string | null;
    shs_track: string | null;
    shs_strand: string | null;
    learning_modalities: string[];
    contact_number: string;
    email: string | null;
    fb_account: string | null;
    previous_school: {
        name: string | null;
        address: string | null;
        section: string | null;
        school_year: string | null;
        graduation_display: string | null;
        average: string | null;
    };
    registrar_notes: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    is_finalized: boolean;
    student_number: string | null;
};

type Props = { application: Application };

const modalityLabels: Record<string, string> = {
    modular_print: 'Modular (Print)',
    modular_digital: 'Modular (Digital)',
    online: 'Online',
    educational_television: 'Educational Television',
    radio_based: 'Radio-Based Instruction',
    homeschooling: 'Homeschooling',
    blended: 'Blended',
    face_to_face: 'Face to Face',
};

function Row({ label, value }: { label: string; value?: string | null | boolean }) {
    const display =
        typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '—';
    return (
        <div className="grid gap-1 border-b border-border/40 py-2 sm:grid-cols-[180px_1fr] sm:gap-4">
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="text-sm text-foreground">{display}</dd>
        </div>
    );
}

function formatAddress(a: Address) {
    return [a.house_no, a.street, a.barangay, a.municipality, a.province, a.country, a.zip_code]
        .filter(Boolean)
        .join(', ') || '—';
}

function formatPerson(p: Person) {
    const name = [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(', ');
    if (!name && !p.contact) return '—';
    return `${name || '—'}${p.contact ? ` · ${p.contact}` : ''}`;
}

const statusOptions = [
    {
        value: 'pending',
        label: 'Pending',
        description: 'Awaiting registrar review',
        icon: Clock,
        active: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
    },
    {
        value: 'reviewed',
        label: 'Reviewed',
        description: 'Checked, pending decision',
        icon: Eye,
        active: 'border-[#800000]/40 bg-[#800000]/10 text-[#800000] dark:text-[#FFD700]',
        dot: 'bg-[#800000] dark:bg-[#FFD700]',
    },
    {
        value: 'approved',
        label: 'Approved',
        description: 'Learner may proceed to enroll',
        icon: CheckCircle2,
        active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
    },
    {
        value: 'rejected',
        label: 'Rejected',
        description: 'Application will not proceed',
        icon: XCircle,
        active: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400',
        dot: 'bg-rose-500',
    },
] as const;

function StatusRadioCards({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    return (
        <div role="radiogroup" aria-label="Application Status" className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => {
                const isActive = value === option.value;
                const Icon = option.icon;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all duration-200',
                            disabled && 'cursor-not-allowed opacity-60',
                            isActive
                                ? option.active
                                : 'border-border/50 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/40',
                        )}
                    >
                        {isActive && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-current text-background">
                                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            </span>
                        )}
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-semibold capitalize">{option.label}</span>
                        <span className="text-[11px] leading-snug opacity-80">{option.description}</span>
                    </button>
                );
            })}
        </div>
    );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card className="rounded-2xl border-border/50">
            <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="text-base text-[#800000]">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <dl>{children}</dl>
            </CardContent>
        </Card>
    );
}

export default function Show({ application }: Props) {
    const { data, setData, put, processing } = useForm({
        application_status: application.application_status,
        registrar_notes: application.registrar_notes || '',
        notify_applicant: true,
    });
    const [confirmOpen, setConfirmOpen] = useState(false);

    const isFinalized = application.is_finalized;
    const isFinalDecision = data.application_status === 'approved' || data.application_status === 'rejected';
    const isStatusChanging = data.application_status !== application.application_status;

    const submit = () => {
        put(`/registrar/online-applications/${application.id}/status`, {
            onSuccess: () => {
                toast.success('Status updated.');
                setConfirmOpen(false);
            },
            onError: () => toast.error('Failed to update status.'),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFinalDecision && isStatusChanging) {
            setConfirmOpen(true);
            return;
        }
        submit();
    };

    return (
        <ModuleShell
            title={`Application #${application.id}`}
            breadcrumbs={[
                { title: 'Registrar', href: '/registrar' },
                { title: 'Online Applications', href: '/registrar/online-applications' },
                { title: application.full_name, href: `/registrar/online-applications/${application.id}` },
            ]}
        >
            <Head title={`Application — ${application.full_name}`} />
            <PageHeader
                title={application.full_name}
                description={`${application.grade_to_enroll} · SY ${application.school_year} · Submitted ${application.created_at}`}
                accent="maroon"
                actions={
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/registrar/online-applications">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
                        </Link>
                    </Button>
                }
            />

            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={application.application_status} />
                <span className="text-sm text-muted-foreground">Learner status: {application.learner_status}</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <InfoCard title="Learner Information">
                        <Row label="Full Name" value={application.full_name} />
                        <Row label="Birthdate" value={application.birthdate_display} />
                        <Row label="Place of Birth" value={application.place_of_birth} />
                        <Row label="Mother Tongue" value={application.mother_tongue} />
                        <Row label="Sex" value={application.sex} />
                        <Row label="Contact Number" value={application.contact_number} />
                        <Row label="Email" value={application.email} />
                        <Row label="Facebook" value={application.fb_account} />
                        <Row label="Indigenous People" value={application.is_indigenous} />
                        {application.is_indigenous && <Row label="IP Specify" value={application.indigenous_specify} />}
                        <Row label="4Ps Beneficiary" value={application.is_4ps_beneficiary} />
                        {application.is_4ps_beneficiary && <Row label="Household ID" value={application.household_id_number} />}
                    </InfoCard>

                    <InfoCard title="Current Address">
                        <Row label="Address" value={formatAddress(application.current_address)} />
                    </InfoCard>

                    <InfoCard title="Permanent Address">
                        <Row label="Same as Current" value={application.permanent_same_as_current} />
                        <Row label="Address" value={formatAddress(application.permanent_address)} />
                    </InfoCard>

                    <InfoCard title="Parents / Guardian">
                        <Row label="Father" value={formatPerson(application.father)} />
                        <Row label="Mother" value={formatPerson(application.mother)} />
                        <Row label="Legal Guardian" value={formatPerson(application.guardian)} />
                    </InfoCard>

                    <InfoCard title="Senior High School">
                        <Row label="JHS Graduation" value={application.jhs_graduation_display} />
                        <Row label="Semester" value={application.shs_semester} />
                        <Row label="Track" value={application.shs_track} />
                        <Row label="Strand" value={application.shs_strand} />
                    </InfoCard>

                    <InfoCard title="Learning Modalities">
                        <Row
                            label="Preferred"
                            value={
                                application.learning_modalities.length
                                    ? application.learning_modalities.map((m) => modalityLabels[m] || m).join(', ')
                                    : '—'
                            }
                        />
                    </InfoCard>

                    <InfoCard title="Previous School">
                        <Row label="School Name" value={application.previous_school.name} />
                        <Row label="Address" value={application.previous_school.address} />
                        <Row label="Section" value={application.previous_school.section} />
                        <Row label="School Year" value={application.previous_school.school_year} />
                        <Row label="Graduation" value={application.previous_school.graduation_display} />
                        <Row label="Average" value={application.previous_school.average} />
                    </InfoCard>
                </div>

                <div className="space-y-4">
                    <Card className="rounded-2xl border-border/50">
                        <CardHeader className="border-b border-border/40 pb-3">
                            <CardTitle className="text-base text-[#800000]">Registrar Review</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {isFinalized && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-[#800000]/20 bg-[#800000]/5 p-3 text-[#800000] dark:border-[#FFD700]/30 dark:bg-[#FFD700]/10 dark:text-[#FFD700]">
                                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p className="text-xs leading-relaxed">
                                        This application has been <strong className="capitalize">{application.application_status}</strong> and is now
                                        locked. The status can no longer be changed.
                                    </p>
                                </div>
                            )}

                            {application.student_number && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-700 dark:text-emerald-400">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p className="text-xs leading-relaxed">
                                        Portal account created — <strong>Student No. {application.student_number}</strong>
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Application Status</Label>
                                    <StatusRadioCards
                                        value={data.application_status}
                                        onChange={(value) => setData('application_status', value)}
                                        disabled={isFinalized}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registrar_notes">Notes</Label>
                                    <textarea
                                        id="registrar_notes"
                                        rows={5}
                                        disabled={isFinalized}
                                        value={data.registrar_notes}
                                        onChange={(e) => setData('registrar_notes', e.target.value)}
                                        className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                        placeholder="Optional notes for this application..."
                                    />
                                </div>
                                {!isFinalized && (
                                    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/50 bg-muted/30 p-3">
                                        <Checkbox
                                            checked={data.notify_applicant}
                                            onCheckedChange={(checked) => setData('notify_applicant', checked === true)}
                                            className="mt-0.5"
                                        />
                                        <span className="text-xs leading-relaxed text-muted-foreground">
                                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                                                <Mail className="h-3.5 w-3.5" /> Notify applicant by email
                                            </span>
                                            {application.email
                                                ? `Send a status update to ${application.email}. If approved, portal login credentials will be included.`
                                                : 'No email address was provided on this application — notification cannot be sent.'}
                                        </span>
                                    </label>
                                )}
                                {!isFinalized && (
                                    <Button type="submit" disabled={processing} className="w-full rounded-xl bg-[#800000] hover:bg-[#5d0000]">
                                        <Save className="mr-2 h-4 w-4" /> Save Status
                                    </Button>
                                )}
                            </form>
                            {(application.reviewed_by || application.reviewed_at) && (
                                <p className="text-xs text-muted-foreground">
                                    Last reviewed by {application.reviewed_by || '—'} on {application.reviewed_at || '—'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#800000] dark:text-[#FFD700]">
                            <AlertTriangle className="h-5 w-5" /> Confirm Final Decision
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                            You are about to mark this application as{' '}
                            <strong className="capitalize text-foreground">{data.application_status}</strong>. This action is{' '}
                            <strong className="text-foreground">final</strong> — once saved, the status can no longer be changed.
                        </p>
                        {data.application_status === 'approved' && (
                            <p>
                                A student portal account will be created for <strong className="text-foreground">{application.full_name}</strong>.
                                {data.notify_applicant && application.email
                                    ? ` Login credentials will be emailed to ${application.email}.`
                                    : ' No email notification will be sent.'}
                            </p>
                        )}
                        {data.application_status === 'rejected' && (
                            <p>
                                {data.notify_applicant && application.email
                                    ? `The applicant will be notified of the rejection at ${application.email}.`
                                    : 'No email notification will be sent.'}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={processing}
                            onClick={submit}
                            className="rounded-xl bg-[#800000] hover:bg-[#5d0000]"
                        >
                            Confirm &amp; Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Show.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Online Applications', href: '/registrar/online-applications' },
]);
