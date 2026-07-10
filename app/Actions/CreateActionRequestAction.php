<?php

namespace App\Actions;

use App\Events\ActionRequestCreated;
use App\Models\ActionRequest;
use App\Models\User;
use App\Notifications\ActionRequestNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreateActionRequestAction
{
    /**
     * Execute the action to create a new ActionRequest.
     *
     * @param  User  $requester
     * @param  array<string, mixed>  $data
     * @param  Model  $actionable
     * @return ActionRequest
     *
     * @throws \Throwable
     */
    public function execute(User $requester, array $data, Model $actionable): ActionRequest
    {
        // --- Step 1: Persist the record inside a transaction ---
        // No side-effects (events/notifications) inside here.
        $actionRequest = DB::transaction(function () use ($requester, $data, $actionable) {
            /** @var ActionRequest $actionRequest */
            $actionRequest = ActionRequest::create([
                'requester_id'          => $requester->id,
                'recipient_id'          => $data['recipient_id'] ?? null,
                'action_type'           => $data['action_type'],
                'reason'                => $data['reason'],
                'status'                => 'pending',
                'sensitive_tracking_data' => $data['sensitive_tracking_data'] ?? null,
                'actionable_id'         => $actionable->getKey(),
                'actionable_type'       => $actionable->getMorphClass(),
            ]);

            // Attach file if provided
            if (
                isset($data['attachment']) &&
                $data['attachment'] instanceof \Illuminate\Http\UploadedFile
            ) {
                $actionRequest->addAttachment($data['attachment']);
            }

            return $actionRequest;
        });

        // --- Step 2: Broadcast a real-time page-refresh event to the recipient ---
        // Goes to the recipient's personal channel (App.Models.User.{id}) so their
        // Action Center tab reloads automatically. Wrapped in try/catch so Reverb
        // being offline never breaks the submission.
        try {
            // Re-load the requester relationship so broadcastWith() can read it
            $actionRequest->load('requester');
            event(new ActionRequestCreated($actionRequest));
        } catch (\Throwable $e) {
            Log::warning('ActionRequestCreated broadcast failed', [
                'action_request_id' => $actionRequest->id,
                'error'             => $e->getMessage(),
            ]);
        }

        // --- Step 3: Store a database notification + trigger the bell icon ---
        // The notification is NOT queued, so it fires synchronously right here.
        // The recipient's NotificationDropdown will update in real-time via
        // the App.Models.User.{id} channel that notification broadcasting uses.
        if ($actionRequest->recipient_id) {
            $recipient = User::find($actionRequest->recipient_id);

            if ($recipient && $recipient->id !== $requester->id) {
                $readableType = ucwords(str_replace('_', ' ', $actionRequest->action_type));

                $recipient->notify(new ActionRequestNotification(
                    $actionRequest,
                    "{$requester->name} sent you a \"{$readableType}\" request — please review it in your Action Center.",
                    'pending'
                ));
            }
        }

        return $actionRequest;
    }
}
