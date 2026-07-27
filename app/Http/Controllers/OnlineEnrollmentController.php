<?php

namespace App\Http\Controllers;

use App\Models\OnlineEnrollmentApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnlineEnrollmentController extends Controller
{
    public function create()
    {
        return Inertia::render('Enroll/Index', [
            'schoolYears' => $this->schoolYearOptions(),
            'grades' => [
                'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
                'Grade 11', 'Grade 12',
            ],
            'modalities' => [
                'modular_print' => 'Modular (Print)',
                'modular_digital' => 'Modular (Digital)',
                'online' => 'Online',
                'educational_television' => 'Educational Television',
                'radio_based' => 'Radio-Based Instruction',
                'homeschooling' => 'Homeschooling',
                'blended' => 'Blended',
                'face_to_face' => 'Face to Face',
            ],
            'learnerStatuses' => ['PEAC', 'Paying', 'Working', 'Scholar'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        if ($validated['permanent_same_as_current'] ?? false) {
            $validated['permanent_house_no'] = $validated['current_house_no'] ?? null;
            $validated['permanent_street'] = $validated['current_street'] ?? null;
            $validated['permanent_barangay'] = $validated['current_barangay'];
            $validated['permanent_municipality'] = $validated['current_municipality'];
            $validated['permanent_province'] = $validated['current_province'];
            $validated['permanent_country'] = $validated['current_country'] ?? 'Philippines';
            $validated['permanent_zip_code'] = $validated['current_zip_code'] ?? null;
        }

        if (! ($validated['is_indigenous'] ?? false)) {
            $validated['indigenous_specify'] = null;
        }

        if (! ($validated['is_4ps_beneficiary'] ?? false)) {
            $validated['household_id_number'] = null;
        }

        $validated['application_status'] = 'pending';

        OnlineEnrollmentApplication::create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Enrollment application submitted successfully. The registrar will review your form.',
        ]);

        return redirect()->route('enroll.success');
    }

    public function success()
    {
        return Inertia::render('Enroll/Success');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'school_year' => 'required|string|max:20',
            'grade_to_enroll' => 'required|string|max:50',
            'last_name' => 'required|string|max:100',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'birthdate' => 'required|date|before:today',
            'place_of_birth' => 'required|string|max:255',
            'mother_tongue' => 'nullable|string|max:100',
            'sex' => 'required|in:Male,Female',
            'is_indigenous' => 'boolean',
            'indigenous_specify' => 'nullable|required_if:is_indigenous,true|string|max:255',
            'is_4ps_beneficiary' => 'boolean',
            'household_id_number' => 'nullable|required_if:is_4ps_beneficiary,true|string|max:100',
            'current_house_no' => 'nullable|string|max:50',
            'current_street' => 'nullable|string|max:255',
            'current_barangay' => 'required|string|max:100',
            'current_municipality' => 'required|string|max:100',
            'current_province' => 'required|string|max:100',
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
            'contact_number' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'fb_account' => 'nullable|string|max:255',
            'prev_school_name' => 'nullable|string|max:255',
            'prev_school_address' => 'nullable|string|max:255',
            'prev_section' => 'nullable|string|max:100',
            'prev_school_year' => 'nullable|string|max:20',
            'prev_graduation_date' => 'nullable|date',
            'prev_average' => 'nullable|string|max:20',
            'learner_status' => 'required|in:PEAC,Paying,Working,Scholar',
        ];
    }

    /**
     * @return array<int, string>
     */
    private function schoolYearOptions(): array
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
}
