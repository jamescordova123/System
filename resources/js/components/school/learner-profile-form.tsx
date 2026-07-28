import InputError from '@/components/input-error';
import { FormField } from '@/components/school/form-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type LearnerFormData = {
    school_year: string;
    grade_to_enroll: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    birthdate: string;
    place_of_birth: string;
    mother_tongue: string;
    sex: string;
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
    jhs_graduation_date: string;
    shs_semester: string;
    shs_track: string;
    shs_strand: string;
    learning_modalities: string[];
    contact_number: string;
    email: string;
    fb_account: string;
    prev_school_name: string;
    prev_school_address: string;
    prev_section: string;
    prev_school_year: string;
    prev_graduation_date: string;
    prev_average: string;
    learner_status: string;
};

export const emptyLearnerForm = (): LearnerFormData => ({
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
    learning_modalities: [],
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
});

export type LearnerFormOptions = {
    schoolYears: string[];
    grades: string[];
    modalities: Record<string, string>;
    learnerStatuses: string[];
};

type Props = {
    data: LearnerFormData;
    setData: <K extends keyof LearnerFormData>(key: K, value: LearnerFormData[K]) => void;
    errors: Partial<Record<string, string>>;
    options: LearnerFormOptions;
    showEmail?: boolean;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
            <h3 className="text-xs font-bold tracking-wider text-[#800000] uppercase">{title}</h3>
            {children}
        </section>
    );
}

const inputClass = 'rounded-xl';

export function LearnerProfileForm({ data, setData, errors, options, showEmail = true }: Props) {
    const isShs = data.grade_to_enroll === 'Grade 11' || data.grade_to_enroll === 'Grade 12';

    const toggleModality = (key: string, checked: boolean) => {
        setData(
            'learning_modalities',
            checked
                ? [...data.learning_modalities, key]
                : data.learning_modalities.filter((m) => m !== key),
        );
    };

    return (
        <div className="space-y-4">
            <Section title="1. Enrollment Details">
                <div className="grid gap-3 sm:grid-cols-2">
                    <FormField label="School Year" htmlFor="school_year" error={errors.school_year}>
                        <select id="school_year" value={data.school_year} onChange={(e) => setData('school_year', e.target.value)} className={`flex h-10 w-full border border-input bg-transparent px-3 text-sm ${inputClass}`}>
                            <option value="">Select school year</option>
                            {options.schoolYears.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Grade to Enroll" htmlFor="grade_to_enroll" error={errors.grade_to_enroll}>
                        <select id="grade_to_enroll" value={data.grade_to_enroll} onChange={(e) => setData('grade_to_enroll', e.target.value)} className={`flex h-10 w-full border border-input bg-transparent px-3 text-sm ${inputClass}`}>
                            <option value="">Select grade</option>
                            {options.grades.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Learner Status" htmlFor="learner_status" error={errors.learner_status}>
                        <select id="learner_status" value={data.learner_status} onChange={(e) => setData('learner_status', e.target.value)} className={`flex h-10 w-full border border-input bg-transparent px-3 text-sm ${inputClass}`}>
                            <option value="">Select status</option>
                            {options.learnerStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </FormField>
                </div>
            </Section>

            <Section title="2. Learner Information">
                <div className="grid gap-3 sm:grid-cols-3">
                    <FormField label="Last Name" htmlFor="last_name" error={errors.last_name} required>
                        <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="First Name" htmlFor="first_name" error={errors.first_name} required>
                        <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Middle Name" htmlFor="middle_name" error={errors.middle_name}>
                        <Input id="middle_name" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Birthdate" htmlFor="birthdate" error={errors.birthdate} required>
                        <Input id="birthdate" type="date" value={data.birthdate} onChange={(e) => setData('birthdate', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Place of Birth" htmlFor="place_of_birth" error={errors.place_of_birth}>
                        <Input id="place_of_birth" value={data.place_of_birth} onChange={(e) => setData('place_of_birth', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Mother Tongue" htmlFor="mother_tongue" error={errors.mother_tongue}>
                        <Input id="mother_tongue" value={data.mother_tongue} onChange={(e) => setData('mother_tongue', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Sex" htmlFor="sex" error={errors.sex} required>
                        <select id="sex" value={data.sex} onChange={(e) => setData('sex', e.target.value)} className={`flex h-10 w-full border border-input bg-transparent px-3 text-sm ${inputClass}`}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </FormField>
                    <FormField label="Contact Number" htmlFor="contact_number" error={errors.contact_number}>
                        <Input id="contact_number" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} className={inputClass} placeholder="09XXXXXXXXX" />
                    </FormField>
                    {showEmail && (
                        <FormField label="Email Address" htmlFor="email" error={errors.email} required>
                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} />
                        </FormField>
                    )}
                    <FormField label="Facebook Account" htmlFor="fb_account" error={errors.fb_account}>
                        <Input id="fb_account" value={data.fb_account} onChange={(e) => setData('fb_account', e.target.value)} className={inputClass} />
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

            <Section title="3. Current Address">
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

            <Section title="4. Permanent Address">
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

            <Section title="5. Parents / Guardian Information">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Father&apos;s Name</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField label="Last Name" htmlFor="father_last_name" error={errors.father_last_name}><Input id="father_last_name" value={data.father_last_name} onChange={(e) => setData('father_last_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="First Name" htmlFor="father_first_name" error={errors.father_first_name}><Input id="father_first_name" value={data.father_first_name} onChange={(e) => setData('father_first_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Middle Name" htmlFor="father_middle_name" error={errors.father_middle_name}><Input id="father_middle_name" value={data.father_middle_name} onChange={(e) => setData('father_middle_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Contact" htmlFor="father_contact" error={errors.father_contact}><Input id="father_contact" value={data.father_contact} onChange={(e) => setData('father_contact', e.target.value)} className={inputClass} /></FormField>
                </div>
                <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Mother&apos;s Name</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField label="Last Name" htmlFor="mother_last_name" error={errors.mother_last_name}><Input id="mother_last_name" value={data.mother_last_name} onChange={(e) => setData('mother_last_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="First Name" htmlFor="mother_first_name" error={errors.mother_first_name}><Input id="mother_first_name" value={data.mother_first_name} onChange={(e) => setData('mother_first_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Middle Name" htmlFor="mother_middle_name" error={errors.mother_middle_name}><Input id="mother_middle_name" value={data.mother_middle_name} onChange={(e) => setData('mother_middle_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Contact" htmlFor="mother_contact" error={errors.mother_contact}><Input id="mother_contact" value={data.mother_contact} onChange={(e) => setData('mother_contact', e.target.value)} className={inputClass} /></FormField>
                </div>
                <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Legal Guardian&apos;s Name</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField label="Last Name" htmlFor="guardian_last_name" error={errors.guardian_last_name}><Input id="guardian_last_name" value={data.guardian_last_name} onChange={(e) => setData('guardian_last_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="First Name" htmlFor="guardian_first_name" error={errors.guardian_first_name}><Input id="guardian_first_name" value={data.guardian_first_name} onChange={(e) => setData('guardian_first_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Middle Name" htmlFor="guardian_middle_name" error={errors.guardian_middle_name}><Input id="guardian_middle_name" value={data.guardian_middle_name} onChange={(e) => setData('guardian_middle_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Contact" htmlFor="guardian_contact" error={errors.guardian_contact}><Input id="guardian_contact" value={data.guardian_contact} onChange={(e) => setData('guardian_contact', e.target.value)} className={inputClass} /></FormField>
                </div>
            </Section>

            {isShs && (
                <Section title="6. Senior High School Information">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <FormField label="Date of JHS Graduation" htmlFor="jhs_graduation_date" error={errors.jhs_graduation_date}>
                            <Input id="jhs_graduation_date" type="date" value={data.jhs_graduation_date} onChange={(e) => setData('jhs_graduation_date', e.target.value)} className={inputClass} />
                        </FormField>
                        <FormField label="Semester" htmlFor="shs_semester" error={errors.shs_semester}>
                            <select id="shs_semester" value={data.shs_semester} onChange={(e) => setData('shs_semester', e.target.value)} className={`flex h-10 w-full border border-input bg-transparent px-3 text-sm ${inputClass}`}>
                                <option value="">Select</option>
                                <option value="1st">1st</option>
                                <option value="2nd">2nd</option>
                            </select>
                        </FormField>
                        <FormField label="Track" htmlFor="shs_track" error={errors.shs_track}>
                            <Input id="shs_track" value={data.shs_track} onChange={(e) => setData('shs_track', e.target.value)} className={inputClass} />
                        </FormField>
                        <FormField label="Strand" htmlFor="shs_strand" error={errors.shs_strand}>
                            <Input id="shs_strand" value={data.shs_strand} onChange={(e) => setData('shs_strand', e.target.value)} className={inputClass} />
                        </FormField>
                    </div>
                </Section>
            )}

            <Section title={`${isShs ? '7' : '6'}. Preferred Learning Modalities`}>
                <p className="text-sm text-muted-foreground">Choose all that apply.</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(options.modalities).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 text-sm">
                            <Checkbox checked={data.learning_modalities.includes(key)} onCheckedChange={(c) => toggleModality(key, !!c)} />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
                <InputError message={errors.learning_modalities} />
            </Section>

            <Section title={`${isShs ? '8' : '7'}. Previous School`}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField label="School Name" htmlFor="prev_school_name" error={errors.prev_school_name}><Input id="prev_school_name" value={data.prev_school_name} onChange={(e) => setData('prev_school_name', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Address" htmlFor="prev_school_address" error={errors.prev_school_address}><Input id="prev_school_address" value={data.prev_school_address} onChange={(e) => setData('prev_school_address', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Section" htmlFor="prev_section" error={errors.prev_section}><Input id="prev_section" value={data.prev_section} onChange={(e) => setData('prev_section', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="School Year" htmlFor="prev_school_year" error={errors.prev_school_year}><Input id="prev_school_year" value={data.prev_school_year} onChange={(e) => setData('prev_school_year', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Date of Graduation" htmlFor="prev_graduation_date" error={errors.prev_graduation_date}><Input id="prev_graduation_date" type="date" value={data.prev_graduation_date} onChange={(e) => setData('prev_graduation_date', e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Average" htmlFor="prev_average" error={errors.prev_average}><Input id="prev_average" value={data.prev_average} onChange={(e) => setData('prev_average', e.target.value)} className={inputClass} /></FormField>
                </div>
            </Section>
        </div>
    );
}
