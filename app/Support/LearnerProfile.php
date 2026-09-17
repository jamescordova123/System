<?php

namespace App\Support;

class LearnerProfile
{
    /**
     * @return array<int, string>
     */
    public static function schoolYears(): array
    {
        $start = (int) now()->format('Y');
        if ((int) now()->format('n') < 6) {
            $start--;
        }

        return [
            "{$start}-".($start + 1),
            ($start + 1).'-'.($start + 2),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function grades(): array
    {
        return [
            'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
            'Grade 11', 'Grade 12',
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function modalities(): array
    {
        return [
            'modular_print' => 'Modular (Print)',
            'modular_digital' => 'Modular (Digital)',
            'online' => 'Online',
            'educational_television' => 'Educational Television',
            'radio_based' => 'Radio-Based Instruction',
            'homeschooling' => 'Homeschooling',
            'blended' => 'Blended',
            'face_to_face' => 'Face to Face',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function learnerStatuses(): array
    {
        return ['PEAC', 'Paying', 'Working', 'Scholar'];
    }

    /**
     * Validation rules shared by online enroll, registrar students, and enrollments.
     *
     * @return array<string, mixed>
     */
    public static function rules(bool $requireEmail = true): array
    {
        return [
            'school_year' => 'nullable|string|max:20',
            'grade_to_enroll' => 'nullable|string|max:50',
            'last_name' => 'required|string|max:100',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'birthdate' => 'required|date|before:today',
            'place_of_birth' => 'nullable|string|max:255',
            'mother_tongue' => 'nullable|string|max:100',
            'sex' => 'required|in:Male,Female',
            'is_indigenous' => 'boolean',
            'indigenous_specify' => 'nullable|required_if:is_indigenous,true|string|max:255',
            'is_4ps_beneficiary' => 'boolean',
            'household_id_number' => 'nullable|required_if:is_4ps_beneficiary,true|string|max:100',
            'current_house_no' => 'nullable|string|max:50',
            'current_street' => 'nullable|string|max:255',
            'current_barangay' => 'nullable|string|max:100',
            'current_municipality' => 'nullable|string|max:100',
            'current_province' => 'nullable|string|max:100',
            'current_country' => 'nullable|string|max:100',
            'current_zip_code' => 'nullable|string|max:20',
            'permanent_same_as_current' => 'boolean',
            'permanent_house_no' => 'nullable|string|max:50',
            'permanent_street' => 'nullable|string|max:255',
            'permanent_barangay' => 'nullable|required_if:permanent_same_as_current,false|string|max:100',
            'permanent_municipality' => 'nullable|required_if:permanent_same_as_current,false|string|max:100',
            'permanent_province' => 'nullable|required_if:permanent_same_as_current,false|string|max:100',
            'permanent_country' => 'nullable|string|max:100',
            'permanent_zip_code' => 'nullable|string|max:20',
            'father_last_name' => 'nullable|string|max:100',
            'father_first_name' => 'nullable|string|max:100',
            'father_middle_name' => 'nullable|string|max:100',
            'father_contact' => 'nullable|string|max:50',
            'mother_last_name' => 'nullable|string|max:100',
            'mother_first_name' => 'nullable|string|max:100',
            'mother_middle_name' => 'nullable|string|max:100',
            'mother_contact' => 'nullable|string|max:50',
            'guardian_last_name' => 'nullable|string|max:100',
            'guardian_first_name' => 'nullable|string|max:100',
            'guardian_middle_name' => 'nullable|string|max:100',
            'guardian_contact' => 'nullable|string|max:50',
            'jhs_graduation_date' => 'nullable|date',
            'shs_semester' => 'nullable|in:1st,2nd',
            'shs_track' => 'nullable|string|max:100',
            'shs_strand' => 'nullable|string|max:100',
            'learning_modalities' => 'nullable|array',
            'learning_modalities.*' => 'string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'email' => ($requireEmail ? 'required' : 'nullable').'|email|max:255',
            'fb_account' => 'nullable|string|max:255',
            'prev_school_name' => 'nullable|string|max:255',
            'prev_school_address' => 'nullable|string|max:255',
            'prev_section' => 'nullable|string|max:100',
            'prev_school_year' => 'nullable|string|max:20',
            'prev_graduation_date' => 'nullable|date',
            'prev_average' => 'nullable|string|max:20',
            'learner_status' => 'nullable|in:PEAC,Paying,Working,Scholar',
        ];
    }

    /**
     * Fields a student may update themselves from the portal.
     * Academic/enrollment identity fields stay registrar-only.
     *
     * @return array<string, mixed>
     */
    public static function studentSelfUpdateRules(): array
    {
        return [
            'place_of_birth' => 'nullable|string|max:255',
            'mother_tongue' => 'nullable|string|max:100',
            'is_indigenous' => 'boolean',
            'indigenous_specify' => 'nullable|required_if:is_indigenous,true|string|max:255',
            'is_4ps_beneficiary' => 'boolean',
            'household_id_number' => 'nullable|required_if:is_4ps_beneficiary,true|string|max:100',
            'current_house_no' => 'nullable|string|max:50',
            'current_street' => 'nullable|string|max:255',
            'current_barangay' => 'nullable|string|max:100',
            'current_municipality' => 'nullable|string|max:100',
            'current_province' => 'nullable|string|max:100',
            'current_country' => 'nullable|string|max:100',
            'current_zip_code' => 'nullable|string|max:20',
            'permanent_same_as_current' => 'boolean',
            'permanent_house_no' => 'nullable|string|max:50',
            'permanent_street' => 'nullable|string|max:255',
            'permanent_barangay' => 'nullable|required_if:permanent_same_as_current,false|string|max:100',
            'permanent_municipality' => 'nullable|required_if:permanent_same_as_current,false|string|max:100',
            'permanent_province' => 'nullable|required_if:permanent_same_as_current,false|string|max:100',
            'permanent_country' => 'nullable|string|max:100',
            'permanent_zip_code' => 'nullable|string|max:20',
            'father_last_name' => 'nullable|string|max:100',
            'father_first_name' => 'nullable|string|max:100',
            'father_middle_name' => 'nullable|string|max:100',
            'father_contact' => 'nullable|string|max:50',
            'mother_last_name' => 'nullable|string|max:100',
            'mother_first_name' => 'nullable|string|max:100',
            'mother_middle_name' => 'nullable|string|max:100',
            'mother_contact' => 'nullable|string|max:50',
            'guardian_last_name' => 'nullable|string|max:100',
            'guardian_first_name' => 'nullable|string|max:100',
            'guardian_middle_name' => 'nullable|string|max:100',
            'guardian_contact' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'fb_account' => 'nullable|string|max:255',
            'learning_modalities' => 'nullable|array',
            'learning_modalities.*' => 'string|max:50',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function studentSelfUpdateKeys(): array
    {
        return array_values(array_filter(
            array_keys(self::studentSelfUpdateRules()),
            fn (string $key) => ! str_contains($key, '.')
        ));
    }

    /**
     * Normalize booleans / permanent address / derived address string.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function normalize(array $validated): array
    {
        $validated['is_indigenous'] = (bool) ($validated['is_indigenous'] ?? false);
        $validated['is_4ps_beneficiary'] = (bool) ($validated['is_4ps_beneficiary'] ?? false);
        $validated['permanent_same_as_current'] = (bool) ($validated['permanent_same_as_current'] ?? true);
        $validated['learning_modalities'] = $validated['learning_modalities'] ?? [];

        if ($validated['permanent_same_as_current']) {
            $validated['permanent_house_no'] = $validated['current_house_no'] ?? null;
            $validated['permanent_street'] = $validated['current_street'] ?? null;
            $validated['permanent_barangay'] = $validated['current_barangay'] ?? null;
            $validated['permanent_municipality'] = $validated['current_municipality'] ?? null;
            $validated['permanent_province'] = $validated['current_province'] ?? null;
            $validated['permanent_country'] = $validated['current_country'] ?? 'Philippines';
            $validated['permanent_zip_code'] = $validated['current_zip_code'] ?? null;
        }

        if (! $validated['is_indigenous']) {
            $validated['indigenous_specify'] = null;
        }

        if (! $validated['is_4ps_beneficiary']) {
            $validated['household_id_number'] = null;
        }

        $validated['gender'] = $validated['sex'] ?? $validated['gender'] ?? null;
        unset($validated['sex']);

        $parts = array_filter([
            $validated['current_house_no'] ?? null,
            $validated['current_street'] ?? null,
            $validated['current_barangay'] ?? null,
            $validated['current_municipality'] ?? null,
            $validated['current_province'] ?? null,
            $validated['current_country'] ?? null,
        ]);
        $validated['address'] = $parts ? implode(', ', $parts) : ($validated['address'] ?? null);

        return $validated;
    }

    /**
     * Profile attribute keys stored on the students table.
     *
     * @return array<int, string>
     */
    public static function studentAttributeKeys(): array
    {
        return [
            'school_year',
            'grade_to_enroll',
            'learner_status',
            'first_name',
            'last_name',
            'middle_name',
            'birthdate',
            'gender',
            'place_of_birth',
            'mother_tongue',
            'is_indigenous',
            'indigenous_specify',
            'is_4ps_beneficiary',
            'household_id_number',
            'current_house_no',
            'current_street',
            'current_barangay',
            'current_municipality',
            'current_province',
            'current_country',
            'current_zip_code',
            'permanent_same_as_current',
            'permanent_house_no',
            'permanent_street',
            'permanent_barangay',
            'permanent_municipality',
            'permanent_province',
            'permanent_country',
            'permanent_zip_code',
            'father_last_name',
            'father_first_name',
            'father_middle_name',
            'father_contact',
            'mother_last_name',
            'mother_first_name',
            'mother_middle_name',
            'mother_contact',
            'guardian_last_name',
            'guardian_first_name',
            'guardian_middle_name',
            'guardian_contact',
            'jhs_graduation_date',
            'shs_semester',
            'shs_track',
            'shs_strand',
            'learning_modalities',
            'contact_number',
            'fb_account',
            'prev_school_name',
            'prev_school_address',
            'prev_section',
            'prev_school_year',
            'prev_graduation_date',
            'prev_average',
            'address',
        ];
    }
}
