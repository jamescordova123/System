<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TransactionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @param array{
     *     id: string|int,
     *     amount: float|int|string,
     *     currency: string,
     *     status: 'success'|'pending'|'failed',
     *     message: string
     * } $details
     */
    public function __construct(protected array $details)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification for database storage.
     *
     * @return array{
     *     id: string|int,
     *     amount: float|int|string,
     *     currency: string,
     *     status: 'success'|'pending'|'failed',
     *     message: string
     * }
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id' => $this->details['id'],
            'amount' => $this->details['amount'],
            'currency' => $this->details['currency'],
            'status' => $this->details['status'],
            'message' => $this->details['message'],
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     *
     * Crucially, we wrap the custom payload under the 'data' key so that
     * the real-time event matches the database schema format exactly.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'data' => [
                'id' => $this->details['id'],
                'amount' => $this->details['amount'],
                'currency' => $this->details['currency'],
                'status' => $this->details['status'],
                'message' => $this->details['message'],
            ],
        ]);
    }
}
