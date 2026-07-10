<?php

namespace App\Http\Controllers;

use App\Actions\CreateActionRequestAction;
use App\Http\Requests\StoreActionRequest;
use App\Http\Resources\ActionRequestResource;
use App\Models\ActionRequest;
use App\Notifications\ActionRequestNotification;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ActionCenterController extends Controller
{
    /**
     * Display a listing of action requests.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole(['Super-Admin', 'Manager']);

        // --- Incoming / Request Queue ---
        // Shows requests that the auth user is expected to act on as a RECIPIENT.
        // Admins see all requests system-wide — EXCEPT their own submissions.
        // Regular users see only requests explicitly addressed to them.
        //
        // KEY RULE: a user must NEVER see their own submitted request in this
        //           queue, regardless of their role, to prevent self-approval.
        $incomingQuery = ActionRequest::with(['requester', 'recipient', 'actionable'])
            ->where('requester_id', '!=', $user->id); // always exclude self-submitted

        if (! $isAdmin) {
            // Non-admins: only see requests explicitly addressed to them
            $incomingQuery->where('recipient_id', $user->id);
        }

        $incomingRequests = $incomingQuery->latest()->get();

        // --- My Requests ---
        // Requests the current user submitted themselves (read-only for them).
        $myRequests = ActionRequest::with(['requester', 'recipient', 'actionable'])
            ->where('requester_id', $user->id)
            ->latest()
            ->get();

        // Recipient dropdown: all users except self
        $users = \App\Models\User::where('id', '!=', $user->id)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('ActionCenter/Index', [
            'incomingRequests' => ActionRequestResource::collection($incomingRequests),
            'myRequests'       => ActionRequestResource::collection($myRequests),
            'users'            => $users,
        ]);
    }

    /**
     * Store a newly created action request in storage.
     *
     * @param  StoreActionRequest  $request
     * @param  CreateActionRequestAction  $action
     * @return RedirectResponse
     *
     * @throws ValidationException
     * @throws \Throwable
     */
    public function store(StoreActionRequest $request, CreateActionRequestAction $action): RedirectResponse
    {
        $actionableType = $request->input('actionable_type');
        $actionableId = $request->input('actionable_id');

        // Resolve the model class mapping, handling standard morph mapping aliases safely
        $modelClass = Relation::getMorphedModel($actionableType) ?? $actionableType;

        if (! class_exists($modelClass)) {
            throw ValidationException::withMessages([
                'actionable_type' => ['The specified actionable model type is invalid or does not exist.'],
            ]);
        }

        // Retrieve the polymorphic actionable model instance
        /** @var \Illuminate\Database\Eloquent\Model $actionable */
        $actionable = $modelClass::findOrFail($actionableId);

        // Execute the single-responsibility logic inside a transaction
        $actionRequest = $action->execute(
            $request->user(),
            $request->validated(),
            $actionable
        );

        // Return a clean flash response back to the client
        return back()->with([
            'message' => 'Action request submitted successfully.',
            'action_request' => new ActionRequestResource($actionRequest),
        ]);
    }

    /**
     * Update the status of an action request.
     *
     * @param  Request  $request
     * @param  ActionRequest  $actionRequest
     * @return RedirectResponse
     */
    public function update(Request $request, ActionRequest $actionRequest): RedirectResponse
    {
        $authUser = auth()->user();

        // THE REQUESTER CAN NEVER ACT ON THEIR OWN REQUEST.
        // This is enforced first, before any role check, so even a Super-Admin
        // cannot approve a request they submitted themselves.
        if ((int) $actionRequest->requester_id === (int) $authUser->id) {
            abort(403, 'You cannot approve, reject, or return your own request.');
        }

        // Only the designated recipient OR an admin/manager may act on a request.
        $isAdmin     = $authUser->hasRole(['Super-Admin', 'Manager']);
        $isRecipient = (int) $actionRequest->recipient_id === (int) $authUser->id;

        if (! $isAdmin && ! $isRecipient) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status' => 'required|string|in:accepted,rejected,returned,deleted',
        ]);

        $status = $request->input('status');
        $actionRequest->update(['status' => $status]);

        // Notify the original requester of the outcome
        $actionRequest->requester->notify(new ActionRequestNotification(
            $actionRequest,
            "Your \"" . ucwords(str_replace('_', ' ', $actionRequest->action_type)) . "\" request has been " . strtoupper($status) . " by " . $authUser->name . ".",
            $status === 'accepted' ? 'success' : 'failed'
        ));

        return back()->with('message', "Action request has been successfully {$status}.");
    }

    /**
     * Remove the specified action request from storage.
     *
     * @param  ActionRequest  $actionRequest
     * @return RedirectResponse
     */
    public function destroy(ActionRequest $actionRequest): RedirectResponse
    {
        // Only Super-Admins can delete request logs
        if (! auth()->user()->hasRole('Super-Admin')) {
            abort(403, 'Unauthorized action.');
        }

        $actionRequest->delete();

        return back()->with('message', 'Action request record has been deleted.');
    }
}
