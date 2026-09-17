import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    schoolYears: string[];
    grades: string[];
    modalities: Record<string, string>;
    learnerStatuses: string[];
};

const emptyForm = {
    school_year: '',
    grade_to_enroll: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    birthdate: '',
    place_of_birth: '',
    mother_tongue: '',
    sex: '',
    is_indigenous: false,
    indigenous_specify: '',
    is_4ps_beneficiary: false,
    household_id_number: '',
    current_house_no: '',
    current_street: '',
    current_barangay: '',
    current_municipality: '',
    current_province: '',
    current_country: 'Philippines',
    current_zip_code: '',
    permanent_same_as_current: true,
    permanent_house_no: '',
    permanent_street: '',
    permanent_barangay: '',
    permanent_municipality: '',
    permanent_province: '',
    permanent_country: 'Philippines',
    permanent_zip_code: '',
    father_last_name: '',
    father_first_name: '',
    father_middle_name: '',
    father_contact: '',
    mother_last_name: '',
    mother_first_name: '',
    mother_middle_name: '',
    mother_contact: '',
    guardian_last_name: '',
    guardian_first_name: '',
    guardian_middle_name: '',
    guardian_contact: '',
    jhs_graduation_date: '',
    shs_semester: '',
    shs_track: '',
    shs_strand: '',
    learning_modalities: [] as string[],
    contact_number: '',
    email: '',
    fb_account: '',
    prev_school_name: '',
    prev_school_address: '',
    prev_section: '',
    prev_school_year: '',
    prev_graduation_date: '',
    prev_average: '',
    learner_status: '',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4 rounded-2xl border border-[#800000]/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="border-b border-[#FFD700]/40 pb-3">
                <h2 className="text-sm font-bold tracking-wider text-[#800000] uppercase">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function Field({
    label,
    htmlFor,
    error,
    required,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={htmlFor} className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                {label}
                {required && <span className="ml-0.5 text-[#800000]">*</span>}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

const inputClass =
    'h-11 rounded-xl border-slate-200 bg-slate-50/60 focus:border-[#800000] focus:ring-[#800000]/10';

export default function Index({ schoolYears, grades, modalities, learnerStatuses }: Props) {
    const [form, setForm] = useState(emptyForm);

    const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const toggleModality = (key: string, checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            learning_modalities: checked
                ? [...prev.learning_modalities, key]
                : prev.learning_modalities.filter((m) => m !== key),
        }));
    };

    const isShs = form.grade_to_enroll === 'Grade 11' || form.grade_to_enroll === 'Grade 12';

    return (
        <>
            <Head title="Online Enrollment" />
            <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] via-white to-[#fffdf5]">
                <header className="border-b border-[#800000]/10 bg-[#800000] text-white">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <img src="/images/diltc/crest.png" alt="DILTC" className="h-12 w-12 rounded-full bg-white object-contain p-1" />
                            <div>
                                <p className="text-lg font-bold tracking-tight">DILTrack Online Enrollment</p>
                                <p className="text-xs text-white/70">Davao del Sur Institute of Languages and Technological College Inc.</p>
                            </div>
                        </div>
                        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FFD700] hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
                    <div className="rounded-2xl border border-[#800000]/10 bg-white p-5 dilt-card-shadow sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#800000] text-[#FFD700]">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Learner Enrollment Application</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Complete all required fields. Your application will be sent to the Registrar for review.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Form
                        action="/enroll"
                        method="post"
                        className="space-y-6"
                        options={{ preserveScroll: true }}
                        onError={() => toast.error('Please fix the highlighted form errors.')}
                        onSuccess={() => setForm(emptyForm)}
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Hidden/synced inputs via controlled names */}
                                <Section title="1. Enrollment Details">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="School Year" htmlFor="school_year" required error={errors.school_year}>
                                            <select id="school_year" name="school_year" required value={form.school_year} onChange={(e) => set('school_year', e.target.value)} className={`flex w-full ${inputClass} border px-3 text-sm`}>
                                                <option value="">Select school year</option>
                                                {schoolYears.map((y) => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Grade to Enroll" htmlFor="grade_to_enroll" required error={errors.grade_to_enroll}>
                                            <select id="grade_to_enroll" name="grade_to_enroll" required value={form.grade_to_enroll} onChange={(e) => set('grade_to_enroll', e.target.value)} className={`flex w-full ${inputClass} border px-3 text-sm`}>
                                                <option value="">Select grade</option>
                                                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Learner Status" htmlFor="learner_status" required error={errors.learner_status}>
                                            <select id="learner_status" name="learner_status" required value={form.learner_status} onChange={(e) => set('learner_status', e.target.value)} className={`flex w-full ${inputClass} border px-3 text-sm`}>
                                                <option value="">Select status</option>
                                                {learnerStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </Field>
                                    </div>
                                </Section>

                                <Section title="2. Learner Information">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <Field label="Last Name" htmlFor="last_name" required error={errors.last_name}>
                                            <Input id="last_name" name="last_name" required value={form.last_name} onChange={(e) => set('last_name', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="First Name" htmlFor="first_name" required error={errors.first_name}>
                                            <Input id="first_name" name="first_name" required value={form.first_name} onChange={(e) => set('first_name', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Middle Name" htmlFor="middle_name" error={errors.middle_name}>
                                            <Input id="middle_name" name="middle_name" value={form.middle_name} onChange={(e) => set('middle_name', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Birthdate" htmlFor="birthdate" required error={errors.birthdate}>
                                            <Input id="birthdate" name="birthdate" type="date" required value={form.birthdate} onChange={(e) => set('birthdate', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Place of Birth" htmlFor="place_of_birth" required error={errors.place_of_birth}>
                                            <Input id="place_of_birth" name="place_of_birth" required value={form.place_of_birth} onChange={(e) => set('place_of_birth', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Mother Tongue" htmlFor="mother_tongue" error={errors.mother_tongue}>
                                            <Input id="mother_tongue" name="mother_tongue" value={form.mother_tongue} onChange={(e) => set('mother_tongue', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Sex" htmlFor="sex" required error={errors.sex}>
                                            <select id="sex" name="sex" required value={form.sex} onChange={(e) => set('sex', e.target.value)} className={`flex w-full ${inputClass} border px-3 text-sm`}>
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </Field>
                                        <Field label="Contact Number" htmlFor="contact_number" required error={errors.contact_number}>
                                            <Input id="contact_number" name="contact_number" required value={form.contact_number} onChange={(e) => set('contact_number', e.target.value)} className={inputClass} placeholder="09XXXXXXXXX" />
                                        </Field>
                                        <Field label="Email Address" htmlFor="email" required error={errors.email}>
                                            <Input id="email" name="email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} placeholder="name@example.com" />
                                        </Field>
                                        <Field label="Facebook Account" htmlFor="fb_account" error={errors.fb_account}>
                                            <Input id="fb_account" name="fb_account" value={form.fb_account} onChange={(e) => set('fb_account', e.target.value)} className={inputClass} placeholder="FB name or profile link" />
                                        </Field>
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox id="is_indigenous" checked={form.is_indigenous} onCheckedChange={(c) => set('is_indigenous', !!c)} />
                                                <input type="hidden" name="is_indigenous" value={form.is_indigenous ? '1' : '0'} />
                                                <Label htmlFor="is_indigenous" className="text-sm">Belong to Indigenous People?</Label>
                                            </div>
                                            {form.is_indigenous && (
                                                <Field label="Please specify" htmlFor="indigenous_specify" required error={errors.indigenous_specify}>
                                                    <Input id="indigenous_specify" name="indigenous_specify" required value={form.indigenous_specify} onChange={(e) => set('indigenous_specify', e.target.value)} className={inputClass} />
                                                </Field>
                                            )}
                                        </div>
                                        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox id="is_4ps_beneficiary" checked={form.is_4ps_beneficiary} onCheckedChange={(c) => set('is_4ps_beneficiary', !!c)} />
                                                <input type="hidden" name="is_4ps_beneficiary" value={form.is_4ps_beneficiary ? '1' : '0'} />
                                                <Label htmlFor="is_4ps_beneficiary" className="text-sm">Is your family a 4Ps beneficiary?</Label>
                                            </div>
                                            {form.is_4ps_beneficiary && (
                                                <Field label="Household ID Number" htmlFor="household_id_number" required error={errors.household_id_number}>
                                                    <Input id="household_id_number" name="household_id_number" required value={form.household_id_number} onChange={(e) => set('household_id_number', e.target.value)} className={inputClass} />
                                                </Field>
                                            )}
                                        </div>
                                    </div>
                                </Section>

                                <Section title="3. Current Address">
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <Field label="House No." htmlFor="current_house_no" error={errors.current_house_no}>
                                            <Input id="current_house_no" name="current_house_no" value={form.current_house_no} onChange={(e) => set('current_house_no', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Sitio / Street" htmlFor="current_street" error={errors.current_street}>
                                            <Input id="current_street" name="current_street" value={form.current_street} onChange={(e) => set('current_street', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Barangay" htmlFor="current_barangay" required error={errors.current_barangay}>
                                            <Input id="current_barangay" name="current_barangay" required value={form.current_barangay} onChange={(e) => set('current_barangay', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Municipality / City" htmlFor="current_municipality" required error={errors.current_municipality}>
                                            <Input id="current_municipality" name="current_municipality" required value={form.current_municipality} onChange={(e) => set('current_municipality', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Province" htmlFor="current_province" required error={errors.current_province}>
                                            <Input id="current_province" name="current_province" required value={form.current_province} onChange={(e) => set('current_province', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Country" htmlFor="current_country" error={errors.current_country}>
                                            <Input id="current_country" name="current_country" value={form.current_country} onChange={(e) => set('current_country', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="ZIP Code" htmlFor="current_zip_code" error={errors.current_zip_code}>
                                            <Input id="current_zip_code" name="current_zip_code" value={form.current_zip_code} onChange={(e) => set('current_zip_code', e.target.value)} className={inputClass} />
                                        </Field>
                                    </div>
                                </Section>

                                <Section title="4. Permanent Address">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Checkbox id="permanent_same_as_current" checked={form.permanent_same_as_current} onCheckedChange={(c) => set('permanent_same_as_current', !!c)} />
                                        <input type="hidden" name="permanent_same_as_current" value={form.permanent_same_as_current ? '1' : '0'} />
                                        <Label htmlFor="permanent_same_as_current" className="text-sm">Same as current address?</Label>
                                    </div>
                                    {!form.permanent_same_as_current && (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <Field label="House No." htmlFor="permanent_house_no" error={errors.permanent_house_no}>
                                                <Input id="permanent_house_no" name="permanent_house_no" value={form.permanent_house_no} onChange={(e) => set('permanent_house_no', e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="Sitio / Street" htmlFor="permanent_street" error={errors.permanent_street}>
                                                <Input id="permanent_street" name="permanent_street" value={form.permanent_street} onChange={(e) => set('permanent_street', e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="Barangay" htmlFor="permanent_barangay" required error={errors.permanent_barangay}>
                                                <Input id="permanent_barangay" name="permanent_barangay" required value={form.permanent_barangay} onChange={(e) => set('permanent_barangay', e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="Municipality / City" htmlFor="permanent_municipality" required error={errors.permanent_municipality}>
                                                <Input id="permanent_municipality" name="permanent_municipality" required value={form.permanent_municipality} onChange={(e) => set('permanent_municipality', e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="Province" htmlFor="permanent_province" required error={errors.permanent_province}>
                                                <Input id="permanent_province" name="permanent_province" required value={form.permanent_province} onChange={(e) => set('permanent_province', e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="Country" htmlFor="permanent_country" error={errors.permanent_country}>
                                                <Input id="permanent_country" name="permanent_country" value={form.permanent_country} onChange={(e) => set('permanent_country', e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="ZIP Code" htmlFor="permanent_zip_code" error={errors.permanent_zip_code}>
                                                <Input id="permanent_zip_code" name="permanent_zip_code" value={form.permanent_zip_code} onChange={(e) => set('permanent_zip_code', e.target.value)} className={inputClass} />
                                            </Field>
                                        </div>
                                    )}
                                </Section>

                                <Section title="5. Parents / Guardian Information">
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Father&apos;s Name</p>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <Field label="Last Name" htmlFor="father_last_name" error={errors.father_last_name}><Input id="father_last_name" name="father_last_name" value={form.father_last_name} onChange={(e) => set('father_last_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="First Name" htmlFor="father_first_name" error={errors.father_first_name}><Input id="father_first_name" name="father_first_name" value={form.father_first_name} onChange={(e) => set('father_first_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Middle Name" htmlFor="father_middle_name" error={errors.father_middle_name}><Input id="father_middle_name" name="father_middle_name" value={form.father_middle_name} onChange={(e) => set('father_middle_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Contact Number" htmlFor="father_contact" error={errors.father_contact}><Input id="father_contact" name="father_contact" value={form.father_contact} onChange={(e) => set('father_contact', e.target.value)} className={inputClass} /></Field>
                                    </div>
                                    <p className="mt-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Mother&apos;s Name</p>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <Field label="Last Name" htmlFor="mother_last_name" error={errors.mother_last_name}><Input id="mother_last_name" name="mother_last_name" value={form.mother_last_name} onChange={(e) => set('mother_last_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="First Name" htmlFor="mother_first_name" error={errors.mother_first_name}><Input id="mother_first_name" name="mother_first_name" value={form.mother_first_name} onChange={(e) => set('mother_first_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Middle Name" htmlFor="mother_middle_name" error={errors.mother_middle_name}><Input id="mother_middle_name" name="mother_middle_name" value={form.mother_middle_name} onChange={(e) => set('mother_middle_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Contact Number" htmlFor="mother_contact" error={errors.mother_contact}><Input id="mother_contact" name="mother_contact" value={form.mother_contact} onChange={(e) => set('mother_contact', e.target.value)} className={inputClass} /></Field>
                                    </div>
                                    <p className="mt-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Legal Guardian&apos;s Name</p>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <Field label="Last Name" htmlFor="guardian_last_name" error={errors.guardian_last_name}><Input id="guardian_last_name" name="guardian_last_name" value={form.guardian_last_name} onChange={(e) => set('guardian_last_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="First Name" htmlFor="guardian_first_name" error={errors.guardian_first_name}><Input id="guardian_first_name" name="guardian_first_name" value={form.guardian_first_name} onChange={(e) => set('guardian_first_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Middle Name" htmlFor="guardian_middle_name" error={errors.guardian_middle_name}><Input id="guardian_middle_name" name="guardian_middle_name" value={form.guardian_middle_name} onChange={(e) => set('guardian_middle_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Contact Number" htmlFor="guardian_contact" error={errors.guardian_contact}><Input id="guardian_contact" name="guardian_contact" value={form.guardian_contact} onChange={(e) => set('guardian_contact', e.target.value)} className={inputClass} /></Field>
                                    </div>
                                </Section>

                                {isShs && (
                                    <Section title="6. Senior High School Information">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <Field label="Date of JHS Graduation" htmlFor="jhs_graduation_date" error={errors.jhs_graduation_date}>
                                                <Input id="jhs_graduation_date" name="jhs_graduation_date" type="date" value={form.jhs_graduation_date} onChange={(e) => set('jhs_graduation_date', e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="Semester" htmlFor="shs_semester" error={errors.shs_semester}>
                                                <select id="shs_semester" name="shs_semester" value={form.shs_semester} onChange={(e) => set('shs_semester', e.target.value)} className={`flex w-full ${inputClass} border px-3 text-sm`}>
                                                    <option value="">Select</option>
                                                    <option value="1st">1st</option>
                                                    <option value="2nd">2nd</option>
                                                </select>
                                            </Field>
                                            <Field label="Track" htmlFor="shs_track" error={errors.shs_track}>
                                                <Input id="shs_track" name="shs_track" value={form.shs_track} onChange={(e) => set('shs_track', e.target.value)} className={inputClass} placeholder="e.g. Academic" />
                                            </Field>
                                            <Field label="Strand" htmlFor="shs_strand" error={errors.shs_strand}>
                                                <Input id="shs_strand" name="shs_strand" value={form.shs_strand} onChange={(e) => set('shs_strand', e.target.value)} className={inputClass} placeholder="e.g. STEM / HUMSS" />
                                            </Field>
                                        </div>
                                    </Section>
                                )}

                                <Section title={`${isShs ? '7' : '6'}. Preferred Learning Modalities`}>
                                    <p className="text-sm text-slate-500">If the school implements distance learning modalities aside from face-to-face, what would you prefer? (Choose all that apply)</p>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(modalities).map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm">
                                                <Checkbox checked={form.learning_modalities.includes(key)} onCheckedChange={(c) => toggleModality(key, !!c)} />
                                                {form.learning_modalities.includes(key) && <input type="hidden" name="learning_modalities[]" value={key} />}
                                                <span>{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.learning_modalities} />
                                </Section>

                                <Section title={`${isShs ? '8' : '7'}. Previous School`}>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <Field label="School Name" htmlFor="prev_school_name" error={errors.prev_school_name}><Input id="prev_school_name" name="prev_school_name" value={form.prev_school_name} onChange={(e) => set('prev_school_name', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Address" htmlFor="prev_school_address" error={errors.prev_school_address}><Input id="prev_school_address" name="prev_school_address" value={form.prev_school_address} onChange={(e) => set('prev_school_address', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Section" htmlFor="prev_section" error={errors.prev_section}><Input id="prev_section" name="prev_section" value={form.prev_section} onChange={(e) => set('prev_section', e.target.value)} className={inputClass} /></Field>
                                        <Field label="School Year" htmlFor="prev_school_year" error={errors.prev_school_year}><Input id="prev_school_year" name="prev_school_year" value={form.prev_school_year} onChange={(e) => set('prev_school_year', e.target.value)} className={inputClass} placeholder="e.g. 2024-2025" /></Field>
                                        <Field label="Date of Graduation" htmlFor="prev_graduation_date" error={errors.prev_graduation_date}><Input id="prev_graduation_date" name="prev_graduation_date" type="date" value={form.prev_graduation_date} onChange={(e) => set('prev_graduation_date', e.target.value)} className={inputClass} /></Field>
                                        <Field label="Average" htmlFor="prev_average" error={errors.prev_average}><Input id="prev_average" name="prev_average" value={form.prev_average} onChange={(e) => set('prev_average', e.target.value)} className={inputClass} placeholder="e.g. 88.5" /></Field>
                                    </div>
                                </Section>

                                <div className="flex flex-col gap-3 rounded-2xl border border-[#800000]/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-slate-500">By submitting, you confirm that the information provided is true and correct.</p>
                                    <Button type="submit" disabled={processing} className="h-12 rounded-xl bg-[#800000] px-8 font-bold text-white hover:bg-[#5d0000]">
                                        {processing ? <Spinner className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        Submit Application
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </main>
            </div>
        </>
    );
}
