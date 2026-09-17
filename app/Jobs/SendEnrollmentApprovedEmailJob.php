<?php

namespace App\Jobs;

use App\Mail\EnrollmentApprovedMail;
use App\Models\OnlineEnrollmentApplication;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEnrollmentApprovedEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $applicationId,
        public ?string $studentNumber,
        public ?string $accountEmail,
        public ?string $accountPassword,
    ) {}

    public function handle(): void
    {
        $application = OnlineEnrollmentApplication::find($this->applicationId);

        if (! $application || ! $application->email) {
            return;
        }

        try {
            Mail::to($application->email)->send(
                new EnrollmentApprovedMail(
                    $application,
                    $this->studentNumber,
                    $this->accountEmail,
                    $this->accountPassword,
                )
            );
        } catch (\Throwable $exception) {
            Log::warning('Failed to send enrollment approval email.', [
                'application_id' => $this->applicationId,
                'email' => $application->email,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
