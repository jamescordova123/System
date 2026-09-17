<?php

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Enums\StudentStatus;
use App\Enums\UserRole;
use App\Jobs\SendEnrollmentApprovedEmailJob;
use App\Jobs\SendEnrollmentStatusEmailJob;
use App\Models\Enrollment;
use App\Models\OnlineEnrollmentApplication;
use App\Models\Student;
use App\Models\User;
use App\Support\LearnerProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EnrollmentApprovalService
{
    /**
     * Approve an application: create (or link to an existing) student portal
     * account, enroll them into a section, and optionally email credentials.
     */
    public function approve(
        OnlineEnrollmentApplication $application,
        int $sectionId,
        bool $notify = true,
    ): ?Student {
        if ($application->student_id) {
            $student = $application->student;
            if ($student) {
                $this->ensureEnrollment($student->id, $sectionId);
            }

            return $student;
        }

        if (! $application->email) {
            return null;
        }

        return DB::transaction(function () use ($application, $sectionId, $notify) {
            $user = User::whereRaw('LOWER(email) = ?', [strtolower($application->email)])->first();
            $plainPassword = null;
            $isNewAccount = false;

            if (! $user) {
                $plainPassword = Str::password(12);
                $isNewAccount = true;

                $user = User::create([
                    'name' => trim("{$application->first_name} {$application->last_name}"),
                    'email' => $application->email,
                    'password' => bcrypt($plainPassword),
                    'role' => UserRole::Student,
                    'email_verified_at' => now(),
                ]);
            }

            if (! $user->hasRole('Student')) {
                $user->assignRole('Student');
            }

            $student = $user->student;

            if (! $student) {
                $profile = LearnerProfile::normalize([
                    'school_year' => $application->school_year,
                    'grade_to_enroll' => $application->grade_to_enroll,
                    'learner_status' => $application->learner_status,
                    'first_name' => $application->first_name,
                    'last_name' => $application->last_name,
                    'middle_name' => $application->middle_name,
                    'birthdate' => $application->birthdate?->format('Y-m-d'),
                    'sex' => $application->sex,
                    'place_of_birth' => $application->place_of_birth,
                    'mother_tongue' => $application->mother_tongue,
                    'is_indigenous' => $application->is_indigenous,
                    'indigenous_specify' => $application->indigenous_specify,
                    'is_4ps_beneficiary' => $application->is_4ps_beneficiary,
                    'household_id_number' => $application->household_id_number,
                    'current_house_no' => $application->current_house_no,
                    'current_street' => $application->current_street,
                    'current_barangay' => $application->current_barangay,
                    'current_municipality' => $application->current_municipality,
                    'current_province' => $application->current_province,
                    'current_country' => $application->current_country,
                    'current_zip_code' => $application->current_zip_code,
                    'permanent_same_as_current' => $application->permanent_same_as_current,
                    'permanent_house_no' => $application->permanent_house_no,
                    'permanent_street' => $application->permanent_street,
                    'permanent_barangay' => $application->permanent_barangay,
                    'permanent_municipality' => $application->permanent_municipality,
                    'permanent_province' => $application->permanent_province,
                    'permanent_country' => $application->permanent_country,
                    'permanent_zip_code' => $application->permanent_zip_code,
                    'father_last_name' => $application->father_last_name,
                    'father_first_name' => $application->father_first_name,
                    'father_middle_name' => $application->father_middle_name,
                    'father_contact' => $application->father_contact,
                    'mother_last_name' => $application->mother_last_name,
                    'mother_first_name' => $application->mother_first_name,
                    'mother_middle_name' => $application->mother_middle_name,
                    'mother_contact' => $application->mother_contact,
                    'guardian_last_name' => $application->guardian_last_name,
                    'guardian_first_name' => $application->guardian_first_name,
                    'guardian_middle_name' => $application->guardian_middle_name,
                    'guardian_contact' => $application->guardian_contact,
                    'jhs_graduation_date' => $application->jhs_graduation_date?->format('Y-m-d'),
                    'shs_semester' => $application->shs_semester,
                    'shs_track' => $application->shs_track,
                    'shs_strand' => $application->shs_strand,
                    'learning_modalities' => $application->learning_modalities ?? [],
                    'contact_number' => $application->contact_number,
                    'email' => $application->email,
                    'fb_account' => $application->fb_account,
                    'prev_school_name' => $application->prev_school_name,
                    'prev_school_address' => $application->prev_school_address,
                    'prev_section' => $application->prev_section,
                    'prev_school_year' => $application->prev_school_year,
                    'prev_graduation_date' => $application->prev_graduation_date?->format('Y-m-d'),
                    'prev_average' => $application->prev_average,
                ]);

                $studentData = [
                    'user_id' => $user->id,
                    'student_number' => $this->generateStudentNumber(),
                    'status' => StudentStatus::Active,
                ];

                foreach (LearnerProfile::studentAttributeKeys() as $key) {
                    if (array_key_exists($key, $profile)) {
                        $studentData[$key] = $profile[$key];
                    }
                }

                $student = Student::create($studentData);
            }

            $application->update(['student_id' => $student->id]);
            $this->ensureEnrollment($student->id, $sectionId);

            if ($notify) {
                SendEnrollmentApprovedEmailJob::dispatch(
                    $application->id,
                    $student->student_number,
                    $isNewAccount ? $user->email : null,
                    $plainPassword,
                );
            }

            return $student;
        });
    }

    /**
     * Notify the applicant that their application status changed, without
     * touching account creation (used for pending / reviewed / rejected).
     */
    public function notifyStatusChange(OnlineEnrollmentApplication $application): void
    {
        if (! $application->email) {
            return;
        }

        SendEnrollmentStatusEmailJob::dispatch($application->id);
    }

    /**
     * Enroll an already-linked student into a section without touching the
     * application's status. Used to backfill enrollments for applications
     * that were approved before a section was assigned/required.
     */
    public function enrollExisting(Student $student, int $sectionId): void
    {
        $this->ensureEnrollment($student->id, $sectionId);
    }

    private function ensureEnrollment(int $studentId, int $sectionId): void
    {
        $exists = Enrollment::where('student_id', $studentId)
            ->where('section_id', $sectionId)
            ->exists();

        if ($exists) {
            return;
        }

        Enrollment::create([
            'student_id' => $studentId,
            'section_id' => $sectionId,
            'enrollment_date' => now()->toDateString(),
            'status' => EnrollmentStatus::Enrolled,
        ]);
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
}
