<?php

namespace App\Events;

use App\Models\ActionRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActionRequestCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The action request instance.
     *
     * @var ActionRequest
     */
    public $actionRequest;

    /**
     * Create a new event instance.
     */
    public function __construct(ActionRequest $actionRequest)
    {
        $this->actionRequest = $actionRequest;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * The event is pushed to the recipient's own personal private channel
     * (App.Models.User.{id}), which is already authenticated by the framework.
     * This ensures ONLY the designated recipient receives the real-time refresh.
     *
     * If no recipient is specified, fall back to the shared admin channel
     * so administrators still see the new request.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $recipientId = $this->actionRequest->recipient_id;

        if ($recipientId) {
            // Deliver only to the intended recipient's private channel
            return [new PrivateChannel("App.Models.User.{$recipientId}")];
        }

        // Fallback: broadcast on the shared action-center channel for admins
        return [new PrivateChannel('action-center')];
    }

    /**
     * The event name broadcast over WebSockets.
     */
    public function broadcastAs(): string
    {
        return 'ActionRequestCreated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id'          => $this->actionRequest->id,
            'action_type' => $this->actionRequest->action_type,
            'status'      => $this->actionRequest->status,
            'reason'      => $this->actionRequest->reason,
            'created_at'  => $this->actionRequest->created_at?->toISOString(),
            'requester'   => [
                'id'   => $this->actionRequest->requester->id,
                'name' => $this->actionRequest->requester->name,
            ],
        ];
    }
}
