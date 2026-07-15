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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        ]);
    }

    public function storeStudent(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'student_number' => 'required|string|unique:students,student_number',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'gender' => 'required|string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'status' => ['required', Rule::enum(StudentStatus::class)],
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => UserRole::Student,
                'email_verified_at' => now(),
            ]);
            $user->assignRole('Student');

            Student::create([
                'user_id' => $user->id,
                'student_number' => $validated['student_number'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'birthdate' => $validated['birthdate'],
                'gender' => $validated['gender'],
                'contact_number' => $validated['contact_number'] ?? null,
                'address' => $validated['address'] ?? null,
                'status' => $validated['status'],
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student created successfully.']);

        return redirect()->route('registrar.students');
    }

    public function updateStudent(Request $request, Student $student)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($student->user_id)],
            'password' => 'nullable|string|min:8',
            'student_number' => ['required', 'string', Rule::unique('students', 'student_number')->ignore($student->id)],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'gender' => 'required|string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'status' => ['required', Rule::enum(StudentStatus::class)],
        ]);

        DB::transaction(function () use ($validated, $student) {
            $userData = [
                'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                'email' => $validated['email'],
                'role' => UserRole::Student,
            ];
            if (! empty($validated['password'])) {
                $userData['password'] = bcrypt($validated['password']);
            }
            $student->user->update($userData);

            $student->update([
                'student_number' => $validated['student_number'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'birthdate' => $validated['birthdate'],
                'gender' => $validated['gender'],
                'contact_number' => $validated['contact_number'] ?? null,
                'address' => $validated['address'] ?? null,
                'status' => $validated['status'],
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student updated successfully.']);

        return redirect()->route('registrar.students');
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
        ]);
    }

    public function storeEnrollment(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'section_id' => 'required|exists:sections,id',
            'enrollment_date' => 'required|date',
            'status' => ['required', Rule::enum(EnrollmentStatus::class)],
        ]);

        Enrollment::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Enrollment created successfully.']);

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
            'contact_number' => $s->contact_number,
            'address' => $s->address,
            'status' => $s->status->value,
            'birthdate' => $s->birthdate->format('Y-m-d'),
            'birthdate_display' => $s->birthdate->format('M d, Y'),
        ];
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
