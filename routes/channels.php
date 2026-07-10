<?php

use App\Models\ActionRequest;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{receiverId}', function ($user, $receiverId) {
    return (int) $user->id === (int) $receiverId;
});

/*
 * Action Center private channel.
 * Admins and Managers see all requests.
 * Regular users can listen if they are the recipient of at least one request.
 */
Broadcast::channel('action-center', function ($user) {
    // Admins and managers always have access
    if ($user->hasRole(['Super-Admin', 'Manager', 'Developer'])) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    // Regular users: only if they have an incoming request (recipient)
    $hasIncoming = ActionRequest::where('recipient_id', $user->id)->exists();
    if ($hasIncoming) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    return false;
});
