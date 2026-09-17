<?php

namespace App\Mail;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StudentCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $emailSubject;

    public string $studentName;

    public string $studentNumber;

    public string $email;

    public ?string $password;

    public string $loginUrl;

    public string $appName;

    public function __construct(
        Student $student,
        string $email,
        ?string $password = null
    ) {
        $this->emailSubject = 'Your Student Portal Account Credentials';
        $this->studentName = trim("{$student->first_name} {$student->last_name}");
        $this->studentNumber = $student->student_number;
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

        if ($this->password) {
            $credentialsBlock = "
                <div style='background: #fff8e6; border: 1px solid #ffd700; border-radius: 8px; padding: 16px 20px; margin: 20px 0;'>
                    <p style='margin: 0 0 10px 0; font-weight: bold; color: #5d0000;'>Your Student Portal Account Credentials</p>
                    <p style='margin: 4px 0;'><strong>Email / Username:</strong> {$this->email}</p>
                    <p style='margin: 4px 0;'><strong>Password:</strong> {$this->password}</p>
                    <p style='margin: 10px 0 0 0; font-size: 12px; color: #666;'>For your security, please log in and change your password as soon as possible.</p>
                </div>
            ";
        } else {
            $credentialsBlock = "
                <div style='background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 20px 0;'>
                    <p style='margin: 0 0 10px 0; font-weight: bold; color: #166534;'>Your Student Portal Account details</p>
                    <p style='margin: 4px 0;'><strong>Email / Username:</strong> {$this->email}</p>
                    <p style='margin: 4px 0;'><strong>Password:</strong> Use your existing password.</p>
                    <p style='margin: 10px 0 0 0; font-size: 12px; color: #666;'>If you have forgotten your password, you can reset it via the login screen.</p>
                </div>
            ";
        }

        return "
            <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #1f1f1f;'>
                <div style='background: #800000; color: white; padding: 24px; text-align: center;'>
                    <h1 style='margin: 0;'>{$this->appName}</h1>
                    <p style='margin: 5px 0 0 0;'>Student Portal Account Details</p>
                </div>
                <div style='background: white; padding: 24px; border: 1px solid #ddd;'>
                    <p>Hello {$this->studentName},</p>
                    <p>Your student account access details on the DILTrack portal have been configured/updated.</p>
                    <p style='margin: 4px 0;'><strong>Student Number:</strong> {$this->studentNumber}</p>
                    
                    {$credentialsBlock}

                    <div style='text-align: center; margin: 24px 0;'>
                        <a href='{$this->loginUrl}' style='background: #800000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;'>Log In to Student Portal</a>
                    </div>
                    
                    <hr style='border: 1px solid #eee; margin: 20px 0;'>
                    <p style='color: #666; font-size: 13px;'>If you have questions about your account, please contact the Registrar's Office.</p>
                </div>
                <div style='text-align: center; padding: 15px; color: #999; font-size: 12px;'>
                    <p>&copy; ".now()->year." {$this->appName}. All rights reserved.</p>
                </div>
            </div>
        ";
    }
}
