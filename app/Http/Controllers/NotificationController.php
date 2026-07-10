<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Mark an individual notification as read.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->unreadNotifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return back()->with('flash', [
            'toast' => [
                'type' => 'success',
                'message' => 'Notification marked as read.',
            ],
        ]);
    }

    /**
     * Mark all unread notifications for the authenticated user as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()
            ->unreadNotifications
            ->markAsRead();

        return back()->with('flash', [
            'toast' => [
                'type' => 'success',
                'message' => 'All notifications marked as read.',
            ],
        ]);
    }
}
