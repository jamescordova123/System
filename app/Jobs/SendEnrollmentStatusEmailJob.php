<?php

namespace App\Jobs;

use App\Mail\EnrollmentStatusMail;
use App\Models\OnlineEnrollmentApplication;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEnrollmentStatusEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $applicationId,
    ) {}

    public function handle(): void
    {
        $application = OnlineEnrollmentApplication::find($this->applicationId);

        if (! $application || ! $application->email) {
            return;
        }

        try {
            Mail::to($application->email)->send(new EnrollmentStatusMail($application));
        } catch (\Throwable $exception) {
            Log::warning('Failed to send enrollment status email.', [
                'application_id' => $this->applicationId,
                'email' => $application->email,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
