<?php

namespace App\Jobs;

use App\Mail\StudentCredentialsMail;
use App\Models\Student;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendStudentCredentialsEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $studentId,
        public string $email,
        public ?string $password = null,
    ) {}

    public function handle(): void
    {
        $student = Student::find($this->studentId);

        if (! $student || ! $this->email) {
            return;
        }

        try {
            Mail::to($this->email)->send(
                new StudentCredentialsMail(
                    $student,
                    $this->email,
                    $this->password
                )
            );
        } catch (\Throwable $exception) {
            Log::warning('Failed to send student account credentials email.', [
                'student_id' => $this->studentId,
                'email' => $this->email,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
