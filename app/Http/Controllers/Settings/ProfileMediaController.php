<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileMediaController extends Controller
{
    /**
     * Update the authenticated user's avatar.
     *
     * Validation boundaries:
     *  - Only standard image MIME types are accepted (jpeg, png, webp).
     *  - Payload is hard-capped at 5 MB (5120 KB).
     *
     * After validation the file is handed to Spatie Media Library which:
     *  1. Stores the original in the configured disk.
     *  2. Dispatches an async queue job to generate the 'thumb' conversion.
     *
     * The singleFile() constraint on the collection ensures the old avatar
     * is automatically removed so orphaned files never accumulate.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => [
                'required',
                'file',
                'mimes:jpeg,png,webp',
                'max:5120', // 5 MB in kilobytes
            ],
        ]);

        /** @var User $user */
        $user = $request->user();

        $user
            ->addMediaFromRequest('avatar')
            ->toMediaCollection('avatar');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Avatar updated successfully.'),
        ]);

        return to_route('profile.edit');
    }

    /**
     * Remove the authenticated user's avatar, reverting to the fallback.
     */
    public function destroyAvatar(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->clearMediaCollection('avatar');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Avatar removed.'),
        ]);

        return to_route('profile.edit');
    }
}
