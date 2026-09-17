<?php

namespace App\Mail;

use App\Models\OnlineEnrollmentApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EnrollmentApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $emailSubject;

    public string $applicantName;

    public string $gradeToEnroll;

    public string $schoolYear;

    public ?string $studentNumber;

    public ?string $email;

    public ?string $password;

    public string $loginUrl;

    public string $appName;

    public function __construct(
        OnlineEnrollmentApplication $application,
        ?string $studentNumber,
        ?string $email,
        ?string $password,
    ) {
        $this->emailSubject = 'Your Enrollment Application Has Been Approved';
        $this->applicantName = trim("{$application->first_name} {$application->last_name}");
        $this->gradeToEnroll = $application->grade_to_enroll;
        $this->schoolYear = $application->school_year;
        $this->studentNumber = $studentNumber;
        $this->email = $email;
        $this->password = $password;
        $this->loginUrl = url('/login');
        $this->appName = config('mail.from.name', 'DILTrack');
    }

    public function build()
    {
        return $this->subject($this->emailSubject)->html($this->buildHtml());
    }

    private function buildHtml(): string
    {
        $credentialsBlock = '';

        if ($this->email && $this->password) {
            $credentialsBlock = "
                <div style='background: #fff8e6; border: 1px solid #ffd700; border-radius: 8px; padding: 16px 20px; margin: 20px 0;'>
                    <p style='margin: 0 0 10px 0; font-weight: bold; color: #5d0000;'>Your Student Portal Account</p>
                    <p style='margin: 4px 0;'><strong>Email:</strong> {$this->email}</p>
                    <p style='margin: 4px 0;'><strong>Temporary Password:</strong> {$this->password}</p>
                    <p style='margin: 10px 0 0 0; font-size: 12px; color: #666;'>For your security, please log in and change your password as soon as possible.</p>
                </div>
                <div style='text-align: center; margin: 24px 0;'>
                    <a href='{$this->loginUrl}' style='background: #800000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;'>Log In to Student Portal</a>
                </div>
            ";
        } else {
            $credentialsBlock = "
                <p>You already have an existing account linked to this email address. Please use your current credentials to log in to the student portal.</p>
                <div style='text-align: center; margin: 24px 0;'>
                    <a href='{$this->loginUrl}' style='background: #800000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;'>Log In to Student Portal</a>
                </div>
            ";
        }

        $studentNumberRow = $this->studentNumber
            ? "<p style='margin: 4px 0;'><strong>Student Number:</strong> {$this->studentNumber}</p>"
            : '';

        return "
            <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #1f1f1f;'>
                <div style='background: #800000; color: white; padding: 24px; text-align: center;'>
                    <h1 style='margin: 0;'>{$this->appName}</h1>
                    <p style='margin: 5px 0 0 0;'>Enrollment Application Update</p>
                </div>
                <div style='background: white; padding: 24px; border: 1px solid #ddd;'>
                    <p>Hello {$this->applicantName},</p>
                    <p>Congratulations! Your online enrollment application has been <strong style='color: #15803d;'>approved</strong>.</p>
                    <p style='margin: 4px 0;'><strong>Grade to Enroll:</strong> {$this->gradeToEnroll}</p>
                    <p style='margin: 4px 0;'><strong>School Year:</strong> {$this->schoolYear}</p>
                    {$studentNumberRow}
                    {$credentialsBlock}
                    <hr style='border: 1px solid #eee; margin: 20px 0;'>
                    <p style='color: #666; font-size: 13px;'>If you have questions about your enrollment, please contact the Registrar's Office.</p>
                </div>
                <div style='text-align: center; padding: 15px; color: #999; font-size: 12px;'>
                    <p>&copy; ".now()->year." {$this->appName}. All rights reserved.</p>
                </div>
            </div>
        ";
    }
}
