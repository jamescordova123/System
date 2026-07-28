<?php

namespace App\Services;

use App\Enums\StudentStatus;
use App\Enums\UserRole;
use App\Jobs\SendEnrollmentApprovedEmailJob;
use App\Jobs\SendEnrollmentStatusEmailJob;
use App\Models\OnlineEnrollmentApplication;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EnrollmentApprovalService
{
    /**
     * Approve an application: create (or link to an existing) student portal
     * account, and optionally email the applicant their login credentials.
     */
    public function approve(OnlineEnrollmentApplication $application, bool $notify = true): ?Student
    {
        if ($application->student_id) {
            return $application->student;
        }

        if (! $application->email) {
            return null;
        }

        return DB::transaction(function () use ($application, $notify) {
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
                $student = Student::create([
                    'user_id' => $user->id,
                    'student_number' => $this->generateStudentNumber(),
                    'first_name' => $application->first_name,
                    'last_name' => $application->last_name,
                    'middle_name' => $application->middle_name,
                    'birthdate' => $application->birthdate,
                    'gender' => $application->sex,
                    'contact_number' => $application->contact_number,
                    'address' => $this->formatAddress($application),
                    'status' => StudentStatus::Active,
                ]);
            }

            $application->update(['student_id' => $student->id]);

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

    private function formatAddress(OnlineEnrollmentApplication $application): ?string
    {
        $parts = array_filter([
            $application->current_house_no,
            $application->current_street,
            $application->current_barangay,
            $application->current_municipality,
            $application->current_province,
            $application->current_country,
        ]);

        return $parts ? implode(', ', $parts) : null;
    }
}
