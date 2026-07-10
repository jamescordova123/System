<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonateController extends Controller
{
    /**
     * Start impersonating a user.
     */
    public function impersonate(Request $request, User $user)
    {
        // 1. Authorize: Ensure the current authenticated user has permission
        if (! $request->user()->hasAnyRole(['Super-Admin', 'Developer'])) {
            abort(403, 'Unauthorized. Only Super-Admins or Developers can impersonate.');
        }

        // 2. Prevent self-impersonation
        if ($request->user()->id === $user->id) {
            return back()->with('error', 'You cannot impersonate yourself.');
        }

        // 3. Security Guard: Prevent impersonating other Super-Admins or Developers to avoid privilege escalation
        if ($user->hasAnyRole(['Super-Admin', 'Developer'])) {
            return back()->with('error', 'Cannot impersonate another administrator or developer.');
        }

        // 4. Save the original developer/admin ID in the session
        session(['impersonator_id' => $request->user()->id]);

        // 5. Audit log the action
        AuditLogger::log(
            'Impersonation Started',
            "User {$request->user()->email} started impersonating {$user->email}.",
            $user->id,
            $user->email
        );

        // 6. Log in as the target user
        Auth::loginUsingId($user->id);

        return redirect()->route('dashboard')->with('message', "You are now logged in as {$user->name}.");
    }

    /**
     * Stop impersonating and return to the original user session.
     */
    public function leave(Request $request)
    {
        // 1. Ensure we are actually impersonating
        if (! session()->has('impersonator_id')) {
            abort(403, 'No impersonation session active.');
        }

        // 2. Retrieve the original administrator ID
        $originalId = session()->pull('impersonator_id');
        $originalUser = User::find($originalId);

        if (! $originalUser) {
            abort(404, 'Original admin user not found.');
        }

        // 3. Audit log the exit
        AuditLogger::log(
            'Impersonation Ended',
            "Impersonation session ended. Returned to original account: {$originalUser->email}."
        );

        // 4. Switch session back to original admin
        Auth::loginUsingId($originalUser->id);

        return redirect()->route('users.index')->with('message', 'Returned to your administrator account.');
    }
}
