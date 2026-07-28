<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\OnlineEnrollmentApplication;
use App\Services\EnrollmentApprovalService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OnlineEnrollmentApplicationController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->string('status')->toString();

        $query = OnlineEnrollmentApplication::query()->latest();

        if (in_array($status, ['pending', 'reviewed', 'approved', 'rejected'], true)) {
            $query->where('application_status', $status);
        }

        $applications = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (OnlineEnrollmentApplication $app) => $this->summary($app));

        return Inertia::render('Registrar/OnlineApplications/Index', [
            'applications' => $applications,
            'filters' => ['status' => $status ?: 'all'],
            'stats' => [
                'total' => OnlineEnrollmentApplication::count(),
                'pending' => OnlineEnrollmentApplication::where('application_status', 'pending')->count(),
                'approved' => OnlineEnrollmentApplication::where('application_status', 'approved')->count(),
                'rejected' => OnlineEnrollmentApplication::where('application_status', 'rejected')->count(),
            ],
        ]);
    }

    public function show(OnlineEnrollmentApplication $application)
    {
        $application->load('reviewer', 'student');

        return Inertia::render('Registrar/OnlineApplications/Show', [
            'application' => $this->detail($application),
        ]);
    }

    public function updateStatus(Request $request, OnlineEnrollmentApplication $application, EnrollmentApprovalService $approvalService)
    {
        if ($application->isFinalized()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This application has already been finalized and its status can no longer be changed.',
            ]);

            return redirect()->route('registrar.online-applications.show', $application);
        }

        $validated = $request->validate([
            'application_status' => ['required', Rule::in(['pending', 'reviewed', 'approved', 'rejected'])],
            'registrar_notes' => 'nullable|string|max:2000',
            'notify_applicant' => 'boolean',
        ]);

        $application->update([
            'application_status' => $validated['application_status'],
            'registrar_notes' => $validated['registrar_notes'] ?? $application->registrar_notes,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $notify = $request->boolean('notify_applicant', true);
        $message = 'Application status updated successfully.';

        if ($validated['application_status'] === 'approved') {
            $student = $approvalService->approve($application, notify: $notify);
            $message = $student
                ? "Application approved. Student account (No. {$student->student_number}) is ready.".($notify ? ' Login credentials emailed to the applicant.' : '')
                : 'Application approved, but no account could be created (missing email).';
        } elseif ($notify) {
            $approvalService->notifyStatusChange($application);
            $message = 'Application status updated and the applicant has been notified by email.';
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);

        return redirect()->route('registrar.online-applications.show', $application);
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(OnlineEnrollmentApplication $app): array
    {
        return [
            'id' => $app->id,
            'full_name' => $app->full_name,
            'school_year' => $app->school_year,
            'grade_to_enroll' => $app->grade_to_enroll,
            'contact_number' => $app->contact_number,
            'email' => $app->email,
            'learner_status' => $app->learner_status,
            'application_status' => $app->application_status,
            'created_at' => $app->created_at?->format('M d, Y h:i A'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(OnlineEnrollmentApplication $app): array
    {
        return [
            ...$this->summary($app),
            'first_name' => $app->first_name,
            'last_name' => $app->last_name,
            'middle_name' => $app->middle_name,
            'birthdate' => $app->birthdate?->format('Y-m-d'),
            'birthdate_display' => $app->birthdate?->format('M d, Y'),
            'place_of_birth' => $app->place_of_birth,
            'mother_tongue' => $app->mother_tongue,
            'sex' => $app->sex,
            'is_indigenous' => $app->is_indigenous,
            'indigenous_specify' => $app->indigenous_specify,
            'is_4ps_beneficiary' => $app->is_4ps_beneficiary,
            'household_id_number' => $app->household_id_number,
            'current_address' => [
                'house_no' => $app->current_house_no,
                'street' => $app->current_street,
                'barangay' => $app->current_barangay,
                'municipality' => $app->current_municipality,
                'province' => $app->current_province,
                'country' => $app->current_country,
                'zip_code' => $app->current_zip_code,
            ],
            'permanent_same_as_current' => $app->permanent_same_as_current,
            'permanent_address' => [
                'house_no' => $app->permanent_house_no,
                'street' => $app->permanent_street,
                'barangay' => $app->permanent_barangay,
                'municipality' => $app->permanent_municipality,
                'province' => $app->permanent_province,
                'country' => $app->permanent_country,
                'zip_code' => $app->permanent_zip_code,
            ],
            'father' => [
                'last_name' => $app->father_last_name,
                'first_name' => $app->father_first_name,
                'middle_name' => $app->father_middle_name,
                'contact' => $app->father_contact,
            ],
            'mother' => [
                'last_name' => $app->mother_last_name,
                'first_name' => $app->mother_first_name,
                'middle_name' => $app->mother_middle_name,
                'contact' => $app->mother_contact,
            ],
            'guardian' => [
                'last_name' => $app->guardian_last_name,
                'first_name' => $app->guardian_first_name,
                'middle_name' => $app->guardian_middle_name,
                'contact' => $app->guardian_contact,
            ],
            'jhs_graduation_date' => $app->jhs_graduation_date?->format('Y-m-d'),
            'jhs_graduation_display' => $app->jhs_graduation_date?->format('M d, Y'),
            'shs_semester' => $app->shs_semester,
            'shs_track' => $app->shs_track,
            'shs_strand' => $app->shs_strand,
            'learning_modalities' => $app->learning_modalities ?? [],
            'contact_number' => $app->contact_number,
            'email' => $app->email,
            'fb_account' => $app->fb_account,
            'previous_school' => [
                'name' => $app->prev_school_name,
                'address' => $app->prev_school_address,
                'section' => $app->prev_section,
                'school_year' => $app->prev_school_year,
                'graduation_date' => $app->prev_graduation_date?->format('Y-m-d'),
                'graduation_display' => $app->prev_graduation_date?->format('M d, Y'),
                'average' => $app->prev_average,
            ],
            'registrar_notes' => $app->registrar_notes,
            'reviewed_by' => $app->reviewer?->name,
            'reviewed_at' => $app->reviewed_at?->format('M d, Y h:i A'),
            'is_finalized' => $app->isFinalized(),
            'student_number' => $app->student?->student_number,
        ];
    }
}
