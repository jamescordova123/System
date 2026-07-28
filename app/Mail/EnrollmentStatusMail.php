<?php

namespace App\Mail;

use App\Models\OnlineEnrollmentApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EnrollmentStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $emailSubject;

    public string $applicantName;

    public string $status;

    public string $gradeToEnroll;

    public string $schoolYear;

    public ?string $registrarNotes;

    public string $appName;

    private const STATUS_COPY = [
        'pending' => [
            'label' => 'Pending',
            'color' => '#b45309',
            'message' => 'Your application has been received and is awaiting review by the Registrar\'s Office.',
        ],
        'reviewed' => [
            'label' => 'Reviewed',
            'color' => '#800000',
            'message' => 'Your application has been reviewed by the Registrar\'s Office. A final decision will follow soon.',
        ],
        'rejected' => [
            'label' => 'Rejected',
            'color' => '#b91c1c',
            'message' => 'After careful review, we regret to inform you that your application was not approved at this time.',
        ],
    ];

    public function __construct(OnlineEnrollmentApplication $application)
    {
        $this->emailSubject = 'Update on Your Enrollment Application';
        $this->applicantName = trim("{$application->first_name} {$application->last_name}");
        $this->status = $application->application_status;
        $this->gradeToEnroll = $application->grade_to_enroll;
        $this->schoolYear = $application->school_year;
        $this->registrarNotes = $application->registrar_notes;
        $this->appName = config('mail.from.name', 'DILTrack');
    }

    public function build()
    {
        return $this->subject($this->emailSubject)->html($this->buildHtml());
    }

    private function buildHtml(): string
    {
        $copy = self::STATUS_COPY[$this->status] ?? [
            'label' => ucfirst($this->status),
            'color' => '#800000',
            'message' => 'The status of your enrollment application has been updated.',
        ];

        $notesBlock = $this->registrarNotes
            ? "<div style='background: #f8f8f8; border-left: 3px solid #800000; padding: 12px 16px; margin: 16px 0;'><p style='margin: 0; font-size: 13px; color: #444;'><strong>Note from the Registrar:</strong><br>{$this->registrarNotes}</p></div>"
            : '';

        return "
            <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #1f1f1f;'>
                <div style='background: #800000; color: white; padding: 24px; text-align: center;'>
                    <h1 style='margin: 0;'>{$this->appName}</h1>
                    <p style='margin: 5px 0 0 0;'>Enrollment Application Update</p>
                </div>
                <div style='background: white; padding: 24px; border: 1px solid #ddd;'>
                    <p>Hello {$this->applicantName},</p>
                    <p>Your application status is now:
                        <strong style='color: {$copy['color']};'>{$copy['label']}</strong>
                    </p>
                    <p>{$copy['message']}</p>
                    <p style='margin: 4px 0;'><strong>Grade to Enroll:</strong> {$this->gradeToEnroll}</p>
                    <p style='margin: 4px 0;'><strong>School Year:</strong> {$this->schoolYear}</p>
                    {$notesBlock}
                    <hr style='border: 1px solid #eee; margin: 20px 0;'>
                    <p style='color: #666; font-size: 13px;'>If you have questions, please contact the Registrar's Office.</p>
                </div>
                <div style='text-align: center; padding: 15px; color: #999; font-size: 12px;'>
                    <p>&copy; ".now()->year." {$this->appName}. All rights reserved.</p>
                </div>
            </div>
        ";
    }
}
