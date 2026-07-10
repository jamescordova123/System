<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ActionRequest
 */
class ActionRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        // Check if the current authenticated user has administrative privileges
        $isAdmin = $user && ($user->hasRole('Super-Admin') || $user->hasRole('Admin'));

        return [
            'id'              => $this->id,
            'requester_id'    => $this->requester_id,
            'action_type'     => $this->action_type,
            'status'          => $this->status,
            'reason'          => $this->reason,
            'created_at_human'=> $this->created_at?->diffForHumans() ?? 'Just now',
            'requester_name'  => $this->requester ? ucwords($this->requester->name) : 'Unknown User',
            'recipient_name'  => $this->recipient ? ucwords($this->recipient->name) : 'System',
            'recipient_id'    => $this->recipient_id,

            // Conditionally strip out sensitive tracking data unless the authenticated user is an administrator
            'sensitive_tracking_data' => $this->when($isAdmin, $this->sensitive_tracking_data),

            // Associated media attachments list
            'attachments' => $this->getMedia('attachments')->map(fn ($media) => [
                'id' => $media->id,
                'name' => $media->file_name,
                'url' => $media->getUrl(),
                'size' => $media->human_readable_size,
                'mime_type' => $media->mime_type,
            ]),
        ];
    }
}
