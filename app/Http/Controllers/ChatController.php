<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Display the chat room with the selected receiver.
     */
    public function index(User $receiver)
    {
        $authId = auth()->id();

        // Prevent chatting with oneself
        if ($authId === $receiver->id) {
            return redirect()->route('chat.fallback');
        }

        // Fetch messages exchanged between auth user and receiver
        $messages = Message::query()
            ->where(function ($query) use ($authId, $receiver) {
                $query->where('sender_id', $authId)
                    ->where('receiver_id', $receiver->id);
            })
            ->orWhere(function ($query) use ($authId, $receiver) {
                $query->where('sender_id', $receiver->id)
                    ->where('receiver_id', $authId);
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Fetch all other users to list in the sidebar
        $users = User::query()
            ->where('id', '!=', $authId)
            ->get();

        return Inertia::render('ChatRoom', [
            'receiver' => $receiver,
            'messages' => $messages,
            'users' => $users,
        ]);
    }

    /**
     * Store and broadcast a new message.
     */
    public function store(Request $request, User $receiver)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $receiver->id,
            'body' => $validated['body'],
        ]);

        // Load the sender relationship for the broadcast payload
        $message->load('sender');

        // Broadcast the event immediately (ShouldBroadcastNow)
        broadcast(new MessageSent($message))->toOthers();

        return back();
    }

    /**
     * Fallback route to redirect to the first available user.
     */
    public function fallback()
    {
        $authId = auth()->id();
        $firstUser = User::query()
            ->where('id', '!=', $authId)
            ->first();

        if ($firstUser) {
            return redirect()->route('chat.index', $firstUser->id);
        }

        return Inertia::render('ChatRoom', [
            'receiver' => null,
            'messages' => [],
            'users' => [],
        ]);
    }
}
