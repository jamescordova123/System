<?php

namespace App\Notifications;

use App\Models\ActionRequest;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to the recipient of an Action Request.
 *
 * Intentionally NOT queued so it fires synchronously — the recipient
 * sees the bell-icon update immediately without needing a queue worker.
 */
class ActionRequestNotification extends Notification
{
    /**
     * Create a new notification instance.
     *
     * @param  ActionRequest  $actionRequest
     * @param  string  $message        Human-readable description for the bell
     * @param  string  $status         'pending' | 'success' | 'failed'
     */
    public function __construct(
        protected ActionRequest $actionRequest,
        protected string $message,
        protected string $status = 'pending'
    ) {}

    /**
     * Deliver via both database (persistent) and broadcast (real-time bell).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Database payload — stored in the notifications table.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id'                 => $this->actionRequest->id,
            'action_request_id'  => $this->actionRequest->id,
            'action_type'        => $this->actionRequest->action_type,
            'status'             => $this->status,
            'message'            => $this->message,
            'requester_name'     => $this->actionRequest->requester?->name ?? 'System',
            'link'               => '/action-center/requests',
        ];
    }

    /**
     * Real-time broadcast payload — mirrors the database format exactly
     * so the NotificationDropdown component processes it identically.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'data' => $this->toArray($notifiable),
        ]);
    }
}
