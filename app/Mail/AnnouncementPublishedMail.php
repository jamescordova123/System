<?php

namespace App\Mail;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AnnouncementPublishedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $greeting;
    public $announcementTitle;
    public $announcementMessage;
    public $publishedAt;
    public $appName;

    public function __construct(Announcement $announcement, ?string $recipientName = null)
    {
        $this->subject = 'New Announcement: ' . $announcement->title;
        $this->greeting = $recipientName ? "Hello {$recipientName}," : "Hello,";
        $this->announcementTitle = $announcement->title;
        $this->announcementMessage = $announcement->message;
        $this->publishedAt = $announcement->created_at?->format('M d, Y h:i A') ?? 'Just now';
        $this->appName = config('mail.from.name', 'DILTrack');
    }

    public function build()
    {
        return $this->subject($this->subject)
                    ->html($this->buildHtml());
    }

    private function buildHtml(): string
    {
        return "
            <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;'>
                <div style='background: #7c3aed; color: white; padding: 20px; text-align: center;'>
                    <h1 style='margin: 0;'>{$this->appName}</h1>
                    <p style='margin: 5px 0 0 0;'>New Announcement</p>
                </div>
                <div style='background: white; padding: 20px; border: 1px solid #ddd;'>
                    <p>{$this->greeting}</p>
                    <h2>{$this->announcementTitle}</h2>
                    <p style='white-space: pre-wrap;'>{$this->announcementMessage}</p>
                    <hr style='border: 1px solid #eee; margin: 20px 0;'>
                    <p style='color: #666; font-size: 13px;'>Published on {$this->publishedAt}</p>
                </div>
                <div style='text-align: center; padding: 15px; color: #999; font-size: 12px;'>
                    <p>&copy; 2026 {$this->appName}. All rights reserved.</p>
                </div>
            </div>
        ";
    }
}
