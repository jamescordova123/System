<?php

namespace App\Services;

use App\Jobs\SendAnnouncementEmailJob;
use App\Models\Announcement;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Collection;

class AnnouncementDispatchService
{
    /**
     * @return array{emails_queued: int, in_app_notifications: int}
     */
    public function dispatch(
        Announcement $announcement,
        bool $notifyAllStudents = false,
        array $specificEmails = [],
    ): array {
        $recipients = $this->resolveRecipients($notifyAllStudents, $specificEmails);

        $inAppCount = 0;

        foreach ($recipients as $recipient) {
            SendAnnouncementEmailJob::dispatch(
                $announcement->id,
                $recipient['email'],
                $recipient['name'],
            );

            if ($recipient['user_id']) {
                UserNotification::create([
                    'user_id' => $recipient['user_id'],
                    'announcement_id' => $announcement->id,
                    'message' => $announcement->message,
                    'is_read' => false,
                ]);

                $inAppCount++;
            }
        }

        return [
            'emails_queued' => $recipients->count(),
            'in_app_notifications' => $inAppCount,
        ];
    }

    /**
     * @return Collection<int, array{email: string, name: string|null, user_id: int|null}>
     */
    private function resolveRecipients(bool $notifyAllStudents, array $specificEmails): Collection
    {
        $recipients = collect();

        if ($notifyAllStudents) {
            User::role('Student')
                ->whereNotNull('email')
                ->get(['id', 'name', 'email'])
                ->each(function (User $user) use ($recipients) {
                    $recipients->put(strtolower($user->email), [
                        'email' => $user->email,
                        'name' => $user->name,
                        'user_id' => $user->id,
                    ]);
                });
        }

        foreach ($specificEmails as $email) {
            $normalizedEmail = strtolower($email);
            $user = User::whereRaw('LOWER(email) = ?', [$normalizedEmail])->first(['id', 'name', 'email']);

            $recipients->put($normalizedEmail, [
                'email' => $user?->email ?? $email,
                'name' => $user?->name,
                'user_id' => $user?->id,
            ]);
        }

        return $recipients->values();
    }

    /**
     * @return array<int, string>
     */
    public static function parseEmailList(?string $raw): array
    {
        if (! is_string($raw) || trim($raw) === '') {
            return [];
        }

        $parts = preg_split('/[\s,;]+/', $raw) ?: [];

        return collect($parts)
            ->map(fn (string $email) => trim($email))
            ->filter()
            ->unique(fn (string $email) => strtolower($email))
            ->values()
            ->all();
    }
}
