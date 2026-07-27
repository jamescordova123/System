import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/registrar/online-applications/${application.id}/status`, {
            onSuccess: () => toast.success('Status updated.'),
            onError: () => toast.error('Failed to update status.'),
        });
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
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="application_status">Application Status</Label>
                                    <select
                                        id="application_status"
                                        value={data.application_status}
                                        onChange={(e) => setData('application_status', e.target.value)}
                                        className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registrar_notes">Notes</Label>
                                    <textarea
                                        id="registrar_notes"
                                        rows={5}
                                        value={data.registrar_notes}
                                        onChange={(e) => setData('registrar_notes', e.target.value)}
                                        className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                                        placeholder="Optional notes for this application..."
                                    />
                                </div>
                                <Button type="submit" disabled={processing} className="w-full rounded-xl bg-[#800000] hover:bg-[#5d0000]">
                                    <Save className="mr-2 h-4 w-4" /> Save Status
                                </Button>
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
        </ModuleShell>
    );
}

Show.layout = setModuleLayout([
    { title: 'Registrar', href: '/registrar' },
    { title: 'Online Applications', href: '/registrar/online-applications' },
]);
