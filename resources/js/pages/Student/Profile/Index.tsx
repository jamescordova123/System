import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { UserRound } from 'lucide-react';
import InputError from '@/components/input-error';
import { FormField } from '@/components/school/form-field';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ReadonlyInfo = {
    student_number: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    birthdate: string | null;
    birthdate_display: string | null;
    sex: string;
    email: string;
    school_year: string | null;
    grade_to_enroll: string | null;
    learner_status: string | null;
    shs_semester: string | null;
    shs_track: string | null;
    shs_strand: string | null;
};

type ProfileForm = {
    place_of_birth: string;
    mother_tongue: string;
    is_indigenous: boolean;
    indigenous_specify: string;
    is_4ps_beneficiary: boolean;
    household_id_number: string;
    current_house_no: string;
    current_street: string;
    current_barangay: string;
    current_municipality: string;
    current_province: string;
    current_country: string;
    current_zip_code: string;
    permanent_same_as_current: boolean;
    permanent_house_no: string;
    permanent_street: string;
    permanent_barangay: string;
    permanent_municipality: string;
    permanent_province: string;
    permanent_country: string;
    permanent_zip_code: string;
    father_last_name: string;
    father_first_name: string;
    father_middle_name: string;
    father_contact: string;
    mother_last_name: string;
    mother_first_name: string;
    mother_middle_name: string;
    mother_contact: string;
    guardian_last_name: string;
    guardian_first_name: string;
    guardian_middle_name: string;
    guardian_contact: string;
    contact_number: string;
    fb_account: string;
    learning_modalities: string[];
};

type Props = {
    readonly: ReadonlyInfo;
    profile: ProfileForm;
    formOptions: { modalities: Record<string, string> };
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
            <h3 className="text-xs font-bold tracking-wider text-[#800000] uppercase">{title}</h3>
            {children}
        </section>
    );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="rounded-xl border border-dashed bg-background/60 px-3 py-2 text-sm">
                {value || '—'}
            </p>
        </div>
    );
}

const inputClass = 'rounded-xl';

export default function Index({ readonly, profile, formOptions }: Props) {
    const { data, setData, put, processing, errors } = useForm<ProfileForm>(profile);

    const toggleModality = (key: string, checked: boolean) => {
        setData(
            'learning_modalities',
            checked
                ? [...data.learning_modalities, key]
                : data.learning_modalities.filter((m) => m !== key),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/student/profile', {
            preserveScroll: true,
            onSuccess: () => toast.success('Your information was updated.'),
            onError: () => toast.error('Please fix the form errors.'),
        });
    };

    return (
        <ModuleShell
            title="My Information"
            breadcrumbs={[
                { title: 'Student Portal', href: '/student' },
                { title: 'My Information', href: '/student/profile' },
            ]}
        >
            <PageHeader
                title="My Information"
                description="Update your contact details, address, and family information. Academic enrollment details can only be changed by the Registrar."
                icon={UserRound}
                accent="blue"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                <Card className="rounded-2xl">
                    <CardContent className="space-y-4 pt-6">
                        <Section title="Academic record (read-only)">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <ReadOnlyField label="Student Number" value={readonly.student_number} />
                                <ReadOnlyField label="School Year" value={readonly.school_year} />
                                <ReadOnlyField label="Grade" value={readonly.grade_to_enroll} />
                                <ReadOnlyField label="Learner Status" value={readonly.learner_status} />
                                <ReadOnlyField label="Last Name" value={readonly.last_name} />
                                <ReadOnlyField label="First Name" value={readonly.first_name} />
                                <ReadOnlyField label="Middle Name" value={readonly.middle_name} />
                                <ReadOnlyField label="Birthdate" value={readonly.birthdate_display} />
                                <ReadOnlyField label="Sex" value={readonly.sex} />
                                <ReadOnlyField label="Email" value={readonly.email} />
                                {(readonly.shs_track || readonly.shs_strand || readonly.shs_semester) && (
                                    <>
                                        <ReadOnlyField label="SHS Semester" value={readonly.shs_semester} />
                                        <ReadOnlyField label="Track" value={readonly.shs_track} />
                                        <ReadOnlyField label="Strand" value={readonly.shs_strand} />
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Need a name or grade correction? Contact the Registrar&apos;s Office. Change your
                                email or password in Settings → Profile.
                            </p>
                        </Section>

                        <Section title="Contact & personal details">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <FormField label="Contact Number" htmlFor="contact_number" error={errors.contact_number}>
                                    <Input id="contact_number" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} className={inputClass} placeholder="09XXXXXXXXX" />
                                </FormField>
                                <FormField label="Facebook Account" htmlFor="fb_account" error={errors.fb_account}>
                                    <Input id="fb_account" value={data.fb_account} onChange={(e) => setData('fb_account', e.target.value)} className={inputClass} />
                                </FormField>
                                <FormField label="Place of Birth" htmlFor="place_of_birth" error={errors.place_of_birth}>
                                    <Input id="place_of_birth" value={data.place_of_birth} onChange={(e) => setData('place_of_birth', e.target.value)} className={inputClass} />
                                </FormField>
                                <FormField label="Mother Tongue" htmlFor="mother_tongue" error={errors.mother_tongue}>
                                    <Input id="mother_tongue" value={data.mother_tongue} onChange={(e) => setData('mother_tongue', e.target.value)} className={inputClass} />
                                </FormField>
                            </div>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div className="space-y-3 rounded-xl border border-border/50 bg-background p-3">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="is_indigenous" checked={data.is_indigenous} onCheckedChange={(c) => setData('is_indigenous', !!c)} />
                                        <Label htmlFor="is_indigenous" className="text-sm">Belong to Indigenous People?</Label>
                                    </div>
                                    {data.is_indigenous && (
                                        <FormField label="Please specify" htmlFor="indigenous_specify" error={errors.indigenous_specify} required>
                                            <Input id="indigenous_specify" value={data.indigenous_specify} onChange={(e) => setData('indigenous_specify', e.target.value)} className={inputClass} />
                                        </FormField>
                                    )}
                                </div>
                                <div className="space-y-3 rounded-xl border border-border/50 bg-background p-3">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="is_4ps_beneficiary" checked={data.is_4ps_beneficiary} onCheckedChange={(c) => setData('is_4ps_beneficiary', !!c)} />
                                        <Label htmlFor="is_4ps_beneficiary" className="text-sm">Is your family a 4Ps beneficiary?</Label>
                                    </div>
                                    {data.is_4ps_beneficiary && (
                                        <FormField label="Household ID Number" htmlFor="household_id_number" error={errors.household_id_number} required>
                                            <Input id="household_id_number" value={data.household_id_number} onChange={(e) => setData('household_id_number', e.target.value)} className={inputClass} />
                                        </FormField>
                                    )}
                                </div>
                            </div>
                        </Section>

                        <Section title="Current address">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <FormField label="House No." htmlFor="current_house_no" error={errors.current_house_no}><Input id="current_house_no" value={data.current_house_no} onChange={(e) => setData('current_house_no', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Sitio / Street" htmlFor="current_street" error={errors.current_street}><Input id="current_street" value={data.current_street} onChange={(e) => setData('current_street', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Barangay" htmlFor="current_barangay" error={errors.current_barangay}><Input id="current_barangay" value={data.current_barangay} onChange={(e) => setData('current_barangay', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Municipality / City" htmlFor="current_municipality" error={errors.current_municipality}><Input id="current_municipality" value={data.current_municipality} onChange={(e) => setData('current_municipality', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Province" htmlFor="current_province" error={errors.current_province}><Input id="current_province" value={data.current_province} onChange={(e) => setData('current_province', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Country" htmlFor="current_country" error={errors.current_country}><Input id="current_country" value={data.current_country} onChange={(e) => setData('current_country', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="ZIP Code" htmlFor="current_zip_code" error={errors.current_zip_code}><Input id="current_zip_code" value={data.current_zip_code} onChange={(e) => setData('current_zip_code', e.target.value)} className={inputClass} /></FormField>
                            </div>
                        </Section>

                        <Section title="Permanent address">
                            <div className="mb-3 flex items-center gap-2">
                                <Checkbox id="permanent_same_as_current" checked={data.permanent_same_as_current} onCheckedChange={(c) => setData('permanent_same_as_current', !!c)} />
                                <Label htmlFor="permanent_same_as_current" className="text-sm">Same as current address?</Label>
                            </div>
                            {!data.permanent_same_as_current && (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <FormField label="House No." htmlFor="permanent_house_no" error={errors.permanent_house_no}><Input id="permanent_house_no" value={data.permanent_house_no} onChange={(e) => setData('permanent_house_no', e.target.value)} className={inputClass} /></FormField>
                                    <FormField label="Sitio / Street" htmlFor="permanent_street" error={errors.permanent_street}><Input id="permanent_street" value={data.permanent_street} onChange={(e) => setData('permanent_street', e.target.value)} className={inputClass} /></FormField>
                                    <FormField label="Barangay" htmlFor="permanent_barangay" error={errors.permanent_barangay}><Input id="permanent_barangay" value={data.permanent_barangay} onChange={(e) => setData('permanent_barangay', e.target.value)} className={inputClass} /></FormField>
                                    <FormField label="Municipality / City" htmlFor="permanent_municipality" error={errors.permanent_municipality}><Input id="permanent_municipality" value={data.permanent_municipality} onChange={(e) => setData('permanent_municipality', e.target.value)} className={inputClass} /></FormField>
                                    <FormField label="Province" htmlFor="permanent_province" error={errors.permanent_province}><Input id="permanent_province" value={data.permanent_province} onChange={(e) => setData('permanent_province', e.target.value)} className={inputClass} /></FormField>
                                    <FormField label="Country" htmlFor="permanent_country" error={errors.permanent_country}><Input id="permanent_country" value={data.permanent_country} onChange={(e) => setData('permanent_country', e.target.value)} className={inputClass} /></FormField>
                                    <FormField label="ZIP Code" htmlFor="permanent_zip_code" error={errors.permanent_zip_code}><Input id="permanent_zip_code" value={data.permanent_zip_code} onChange={(e) => setData('permanent_zip_code', e.target.value)} className={inputClass} /></FormField>
                                </div>
                            )}
                        </Section>

                        <Section title="Parents / guardian">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Father</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <FormField label="Last Name" htmlFor="father_last_name" error={errors.father_last_name}><Input id="father_last_name" value={data.father_last_name} onChange={(e) => setData('father_last_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="First Name" htmlFor="father_first_name" error={errors.father_first_name}><Input id="father_first_name" value={data.father_first_name} onChange={(e) => setData('father_first_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Middle Name" htmlFor="father_middle_name" error={errors.father_middle_name}><Input id="father_middle_name" value={data.father_middle_name} onChange={(e) => setData('father_middle_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Contact" htmlFor="father_contact" error={errors.father_contact}><Input id="father_contact" value={data.father_contact} onChange={(e) => setData('father_contact', e.target.value)} className={inputClass} /></FormField>
                            </div>
                            <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Mother</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <FormField label="Last Name" htmlFor="mother_last_name" error={errors.mother_last_name}><Input id="mother_last_name" value={data.mother_last_name} onChange={(e) => setData('mother_last_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="First Name" htmlFor="mother_first_name" error={errors.mother_first_name}><Input id="mother_first_name" value={data.mother_first_name} onChange={(e) => setData('mother_first_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Middle Name" htmlFor="mother_middle_name" error={errors.mother_middle_name}><Input id="mother_middle_name" value={data.mother_middle_name} onChange={(e) => setData('mother_middle_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Contact" htmlFor="mother_contact" error={errors.mother_contact}><Input id="mother_contact" value={data.mother_contact} onChange={(e) => setData('mother_contact', e.target.value)} className={inputClass} /></FormField>
                            </div>
                            <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Legal guardian</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <FormField label="Last Name" htmlFor="guardian_last_name" error={errors.guardian_last_name}><Input id="guardian_last_name" value={data.guardian_last_name} onChange={(e) => setData('guardian_last_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="First Name" htmlFor="guardian_first_name" error={errors.guardian_first_name}><Input id="guardian_first_name" value={data.guardian_first_name} onChange={(e) => setData('guardian_first_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Middle Name" htmlFor="guardian_middle_name" error={errors.guardian_middle_name}><Input id="guardian_middle_name" value={data.guardian_middle_name} onChange={(e) => setData('guardian_middle_name', e.target.value)} className={inputClass} /></FormField>
                                <FormField label="Contact" htmlFor="guardian_contact" error={errors.guardian_contact}><Input id="guardian_contact" value={data.guardian_contact} onChange={(e) => setData('guardian_contact', e.target.value)} className={inputClass} /></FormField>
                            </div>
                        </Section>

                        <Section title="Preferred learning modalities">
                            <p className="text-sm text-muted-foreground">Choose all that apply.</p>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(formOptions.modalities).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 text-sm">
                                        <Checkbox checked={data.learning_modalities.includes(key)} onCheckedChange={(c) => toggleModality(key, !!c)} />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.learning_modalities} />
                        </Section>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" className="rounded-xl" disabled={processing}>
                        Save changes
                    </Button>
                </div>
            </form>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Student Portal', href: '/student' },
    { title: 'My Information', href: '/student/profile' },
]);
