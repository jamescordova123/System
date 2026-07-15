<?php

namespace App\Jobs;

use App\Mail\AnnouncementPublishedMail;
use App\Models\Announcement;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAnnouncementEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $announcementId,
        public string $email,
        public ?string $recipientName = null,
    ) {}

    public function handle(): void
    {
        $announcement = Announcement::find($this->announcementId);

        if (! $announcement) {
            return;
        }

        try {
            Mail::to($this->email)->send(
                new AnnouncementPublishedMail($announcement, $this->recipientName)
            );
        } catch (\Throwable $exception) {
            Log::warning('Failed to send announcement email.', [
                'announcement_id' => $this->announcementId,
                'email' => $this->email,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
