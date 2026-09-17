<?php

namespace App\Http\Controllers\Registrar;

use App\Enums\EnrollmentStatus;
use App\Enums\StudentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use App\Support\LearnerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RegistrarController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Registrar/Dashboard', [
            'stats' => [
                'students' => Student::count(),
                'sections' => Section::count(),
                'enrollments' => Enrollment::count(),
                'active_students' => Student::where('status', 'active')->count(),
            ],
            'recentEnrollments' => Enrollment::with(['student', 'section'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (Enrollment $e) => $this->formatEnrollment($e)),
        ]);
    }

    public function analytics()
    {
        $enrollmentStatuses = DB::table('enrollments')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => ['status' => ucfirst($item->status), 'count' => (int)$item->count]);

        $monthlyEnrollments = DB::table('enrollments')
            ->select(DB::raw('DATE_FORMAT(enrollment_date, "%Y-%m") as month'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->take(12)
            ->get()
            ->map(fn($item) => ['month' => $item->month, 'count' => (int)$item->count]);

        $studentsBySection = Section::withCount('enrollments')
            ->orderBy('enrollments_count', 'desc')
            ->get()
            ->map(fn(Section $s) => [
                'section_name' => $s->section_name,
                'course_name' => $s->course_name,
                'count' => $s->enrollments_count,
            ]);

        $studentStatus = DB::table('students')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => ['status' => ucfirst($item->status), 'count' => (int)$item->count]);

        return Inertia::render('Registrar/Analytics', [
            'enrollmentStatuses' => $enrollmentStatuses,
            'monthlyEnrollments' => $monthlyEnrollments,
            'studentsBySection' => $studentsBySection,
            'studentStatus' => $studentStatus,
        ]);
    }

    public function students()
    {
        return Inertia::render('Registrar/Students/Index', [
            'students' => Student::with('user')
                ->latest()
                ->get()
                ->map(fn (Student $s) => $this->formatStudent($s)),
            'stats' => [
                'total' => Student::count(),
                'active' => Student::where('status', 'active')->count(),
                'inactive' => Student::where('status', 'inactive')->count(),
                'graduated' => Student::where('status', 'graduated')->count(),
            ],
            'formOptions' => $this->learnerFormOptions(),
        ]);
    }

    public function storeStudent(Request $request)
    {
        $validated = $request->validate(array_merge(LearnerProfile::rules(), [
            'password' => 'required|string|min:8',
            'student_number' => 'required|string|unique:students,student_number',
            'status' => ['required', Rule::enum(StudentStatus::class)],
            'email' => 'required|email|unique:users,email',
        ]));

        $validated = LearnerProfile::normalize($validated);

        $student = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => UserRole::Student,
                'email_verified_at' => now(),
            ]);
            $user->assignRole('Student');

            return Student::create($this->studentAttributesFromValidated($validated, [
                'user_id' => $user->id,
                'student_number' => $validated['student_number'],
                'status' => $validated['status'],
            ]));
        });

        if ($request->boolean('send_credentials')) {
            \App\Jobs\SendStudentCredentialsEmailJob::dispatch(
                $student->id,
                $validated['email'],
                $validated['password']
            );
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student created successfully.']);

        return redirect()->route('registrar.students');
    }

    public function updateStudent(Request $request, Student $student)
    {
        $validated = $request->validate(array_merge(LearnerProfile::rules(), [
            'password' => 'nullable|string|min:8',
            'student_number' => ['required', 'string', Rule::unique('students', 'student_number')->ignore($student->id)],
            'status' => ['required', Rule::enum(StudentStatus::class)],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($student->user_id)],
        ]));

        $validated = LearnerProfile::normalize($validated);

        DB::transaction(function () use ($validated, $student) {
            $userData = [
                'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                'email' => $validated['email'],
                'role' => UserRole::Student,
            ];
            if (! empty($validated['password'])) {
                $userData['password'] = bcrypt($validated['password']);
            }

            // The linked portal account may have been deleted (or never
            // created). Restore it when soft-deleted, otherwise recreate it,
            // so the student always ends up with a working login.
            $user = $student->user_id ? User::withTrashed()->find($student->user_id) : null;

            if ($user) {
                if ($user->trashed()) {
                    $user->restore();
                }
                $user->update($userData);
            } else {
                $user = User::create([
                    ...$userData,
                    'password' => $userData['password'] ?? bcrypt(Str::password(12)),
                    'email_verified_at' => now(),
                ]);
            }

            if (! $user->hasRole('Student')) {
                $user->assignRole('Student');
            }

            $student->update($this->studentAttributesFromValidated($validated, [
                'user_id' => $user->id,
                'student_number' => $validated['student_number'],
                'status' => $validated['status'],
            ]));
        });

        if ($request->boolean('send_credentials')) {
            \App\Jobs\SendStudentCredentialsEmailJob::dispatch(
                $student->id,
                $validated['email'],
                ! empty($validated['password']) ? $validated['password'] : null
            );
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student updated successfully.']);

        return redirect()->route('registrar.students');
    }

    public function sendCredentials(Request $request, Student $student)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($student->user_id)],
            'password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($validated, $student) {
            $user = $student->user_id ? User::withTrashed()->find($student->user_id) : null;
            
            $userData = [
                'email' => $validated['email'],
                'name' => trim("{$student->first_name} {$student->last_name}"),
            ];
            
            if (! empty($validated['password'])) {
                $userData['password'] = bcrypt($validated['password']);
            }

            if ($user) {
                if ($user->trashed()) {
                    $user->restore();
                }
                $user->update($userData);
            } else {
                $user = User::create([
                    ...$userData,
                    'password' => $userData['password'] ?? bcrypt(Str::password(12)),
                    'role' => UserRole::Student,
                    'email_verified_at' => now(),
                ]);
                $student->update(['user_id' => $user->id]);
            }

            if (! $user->hasRole('Student')) {
                $user->assignRole('Student');
            }
        });

        \App\Jobs\SendStudentCredentialsEmailJob::dispatch(
            $student->id,
            $validated['email'],
            ! empty($validated['password']) ? $validated['password'] : null
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student credentials updated and email queued successfully.']);

        return redirect()->back();
    }

    public function destroyStudent(Student $student)
    {
        DB::transaction(function () use ($student) {
            $student->user?->delete();
            $student->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student deleted successfully.']);

        return redirect()->route('registrar.students');
    }

    public function sections()
    {
        return Inertia::render('Registrar/Sections/Index', [
            'sections' => Section::withCount('enrollments')
                ->latest()
                ->get()
                ->map(fn (Section $s) => $this->formatSection($s)),
            'stats' => [
                'total' => Section::count(),
                'enrollments' => Enrollment::count(),
            ],
        ]);
    }

    public function storeSection(Request $request)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:255',
            'course_name' => 'required|string|max:255',
            'schedule' => 'nullable|string|max:255',
        ]);

        Section::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Section created successfully.']);

        return redirect()->route('registrar.sections');
    }

    public function updateSection(Request $request, Section $section)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:255',
            'course_name' => 'required|string|max:255',
            'schedule' => 'nullable|string|max:255',
        ]);

        $section->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Section updated successfully.']);

        return redirect()->route('registrar.sections');
    }

    public function destroySection(Section $section)
    {
        $section->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Section deleted successfully.']);

        return redirect()->route('registrar.sections');
    }

    public function enrollments()
    {
        return Inertia::render('Registrar/Enrollments/Index', [
            'enrollments' => Enrollment::with(['student', 'section'])
                ->latest()
                ->get()
                ->map(fn (Enrollment $e) => $this->formatEnrollment($e)),
            'stats' => [
                'total' => Enrollment::count(),
                'enrolled' => Enrollment::where('status', 'enrolled')->count(),
                'dropped' => Enrollment::where('status', 'dropped')->count(),
                'completed' => Enrollment::where('status', 'completed')->count(),
            ],
            'studentOptions' => Student::orderBy('last_name')
                ->get()
                ->map(fn (Student $s) => [
                    'value' => $s->id,
                    'label' => trim("{$s->student_number} — {$s->first_name} {$s->last_name}"),
                ]),
            'sectionOptions' => Section::orderBy('section_name')
                ->get()
                ->map(fn (Section $s) => [
                    'value' => $s->id,
                    'label' => "{$s->section_name} ({$s->course_name})",
                ]),
            'formOptions' => $this->learnerFormOptions(),
        ]);
    }

    public function storeEnrollment(Request $request)
    {
        $validated = $request->validate(array_merge(LearnerProfile::rules(), [
            'section_id' => 'required|exists:sections,id',
            'enrollment_date' => 'required|date',
            'status' => ['required', Rule::enum(EnrollmentStatus::class)],
            'student_number' => 'nullable|string|unique:students,student_number',
            'password' => 'nullable|string|min:8',
            'email' => 'required|email|unique:users,email',
        ]));

        $validated = LearnerProfile::normalize($validated);

        DB::transaction(function () use ($validated) {
            $password = $validated['password'] ?: Str::password(12);
            $studentNumber = $validated['student_number'] ?: $this->generateStudentNumber();

            $user = User::create([
                'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                'email' => $validated['email'],
                'password' => bcrypt($password),
                'role' => UserRole::Student,
                'email_verified_at' => now(),
            ]);
            $user->assignRole('Student');

            $student = Student::create($this->studentAttributesFromValidated($validated, [
                'user_id' => $user->id,
                'student_number' => $studentNumber,
                'status' => StudentStatus::Active,
            ]));

            Enrollment::create([
                'student_id' => $student->id,
                'section_id' => $validated['section_id'],
                'enrollment_date' => $validated['enrollment_date'],
                'status' => $validated['status'],
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Enrollment created successfully. Student portal account was also created.']);

        return redirect()->route('registrar.enrollments');
    }

    public function updateEnrollment(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'section_id' => 'required|exists:sections,id',
            'enrollment_date' => 'required|date',
            'status' => ['required', Rule::enum(EnrollmentStatus::class)],
        ]);

        $enrollment->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Enrollment updated successfully.']);

        return redirect()->route('registrar.enrollments');
    }

    public function destroyEnrollment(Enrollment $enrollment)
    {
        $enrollment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Enrollment deleted successfully.']);

        return redirect()->route('registrar.enrollments');
    }

    private function formatStudent(Student $s): array
    {
        return [
            'id' => $s->id,
            'student_number' => $s->student_number,
            'first_name' => $s->first_name,
            'last_name' => $s->last_name,
            'middle_name' => $s->middle_name,
            'full_name' => trim("{$s->first_name} {$s->middle_name} {$s->last_name}"),
            'email' => $s->user?->email,
            'gender' => $s->gender,
            'sex' => $this->normalizeSex($s->gender),
            'contact_number' => $s->contact_number,
            'address' => $s->address,
            'status' => $s->status->value,
            'birthdate' => $s->birthdate->format('Y-m-d'),
            'birthdate_display' => $s->birthdate->format('M d, Y'),
            'school_year' => $s->school_year,
            'grade_to_enroll' => $s->grade_to_enroll,
            'learner_status' => $s->learner_status,
            'place_of_birth' => $s->place_of_birth,
            'mother_tongue' => $s->mother_tongue,
            'is_indigenous' => (bool) $s->is_indigenous,
            'indigenous_specify' => $s->indigenous_specify,
            'is_4ps_beneficiary' => (bool) $s->is_4ps_beneficiary,
            'household_id_number' => $s->household_id_number,
            'current_house_no' => $s->current_house_no,
            'current_street' => $s->current_street,
            'current_barangay' => $s->current_barangay,
            'current_municipality' => $s->current_municipality,
            'current_province' => $s->current_province,
            'current_country' => $s->current_country ?? 'Philippines',
            'current_zip_code' => $s->current_zip_code,
            'permanent_same_as_current' => (bool) ($s->permanent_same_as_current ?? true),
            'permanent_house_no' => $s->permanent_house_no,
            'permanent_street' => $s->permanent_street,
            'permanent_barangay' => $s->permanent_barangay,
            'permanent_municipality' => $s->permanent_municipality,
            'permanent_province' => $s->permanent_province,
            'permanent_country' => $s->permanent_country ?? 'Philippines',
            'permanent_zip_code' => $s->permanent_zip_code,
            'father_last_name' => $s->father_last_name,
            'father_first_name' => $s->father_first_name,
            'father_middle_name' => $s->father_middle_name,
            'father_contact' => $s->father_contact,
            'mother_last_name' => $s->mother_last_name,
            'mother_first_name' => $s->mother_first_name,
            'mother_middle_name' => $s->mother_middle_name,
            'mother_contact' => $s->mother_contact,
            'guardian_last_name' => $s->guardian_last_name,
            'guardian_first_name' => $s->guardian_first_name,
            'guardian_middle_name' => $s->guardian_middle_name,
            'guardian_contact' => $s->guardian_contact,
            'jhs_graduation_date' => $s->jhs_graduation_date?->format('Y-m-d'),
            'shs_semester' => $s->shs_semester,
            'shs_track' => $s->shs_track,
            'shs_strand' => $s->shs_strand,
            'learning_modalities' => $s->learning_modalities ?? [],
            'fb_account' => $s->fb_account,
            'prev_school_name' => $s->prev_school_name,
            'prev_school_address' => $s->prev_school_address,
            'prev_section' => $s->prev_section,
            'prev_school_year' => $s->prev_school_year,
            'prev_graduation_date' => $s->prev_graduation_date?->format('Y-m-d'),
            'prev_average' => $s->prev_average,
        ];
    }

    /**
     * @return array{schoolYears: array<int, string>, grades: array<int, string>, modalities: array<string, string>, learnerStatuses: array<int, string>}
     */
    private function learnerFormOptions(): array
    {
        return [
            'schoolYears' => LearnerProfile::schoolYears(),
            'grades' => LearnerProfile::grades(),
            'modalities' => LearnerProfile::modalities(),
            'learnerStatuses' => LearnerProfile::learnerStatuses(),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private function studentAttributesFromValidated(array $validated, array $extra = []): array
    {
        $attributes = $extra;

        foreach (LearnerProfile::studentAttributeKeys() as $key) {
            if (array_key_exists($key, $validated)) {
                $attributes[$key] = $validated[$key];
            }
        }

        return $attributes;
    }

    private function generateStudentNumber(): string
    {
        $year = now()->format('Y');
        $sequence = Student::withTrashed()->where('student_number', 'like', "{$year}-%")->count() + 1;

        do {
            $candidate = $year.'-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
            $sequence++;
        } while (Student::withTrashed()->where('student_number', $candidate)->exists());

        return $candidate;
    }

    private function normalizeSex(?string $gender): string
    {
        $value = strtolower((string) $gender);

        return match ($value) {
            'male', 'm' => 'Male',
            'female', 'f' => 'Female',
            default => in_array($gender, ['Male', 'Female'], true) ? $gender : '',
        };
    }

    private function formatSection(Section $s): array
    {
        return [
            'id' => $s->id,
            'section_name' => $s->section_name,
            'course_name' => $s->course_name,
            'schedule' => $s->schedule,
            'enrollments_count' => $s->enrollments_count ?? $s->enrollments()->count(),
        ];
    }

    private function formatEnrollment(Enrollment $e): array
    {
        return [
            'id' => $e->id,
            'student_id' => $e->student_id,
            'section_id' => $e->section_id,
            'student_name' => trim("{$e->student?->first_name} {$e->student?->last_name}"),
            'student_number' => $e->student?->student_number,
            'section_name' => $e->section?->section_name,
            'course_name' => $e->section?->course_name,
            'status' => $e->status->value,
            'enrollment_date' => $e->enrollment_date->format('Y-m-d'),
            'enrollment_date_display' => $e->enrollment_date->format('M d, Y'),
        ];
    }
}
