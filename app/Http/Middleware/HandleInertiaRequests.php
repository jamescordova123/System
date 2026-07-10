<?php

namespace App\Http\Middleware;

use App\Models\BrandingSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $branding = BrandingSetting::first();
        $appName = $branding ? $branding->app_name : config('app.name');

        return [
            ...parent::share($request),
            'name' => $appName,
            'branding' => [
                'app_name' => $appName,
                'system_logo' => $branding ? ($branding->getFirstMediaUrl('system_logo') ?: null) : null,
                'tab_logo' => $branding ? ($branding->getFirstMediaUrl('tab_logo') ?: null) : null,
            ],
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    // Append the Spatie Media Library avatar URL so the React
                    // layer receives it on every page mount without an extra
                    // API round-trip. Falls back to /images/default-avatar.png
                    // (configured via useFallbackUrl) when no avatar is set.
                    'avatar_url' => $user->getFirstMediaUrl('avatar', 'thumb')
                        ?: $user->getFirstMediaUrl('avatar')
                        ?: '/images/default-avatar.svg',
                ]) : null,
                'roles' => $user ? $user->getRoleNames() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
                'impersonator' => session()->has('impersonator_id')
                    ? User::find(session('impersonator_id'))
                    : null,
                'unread_notifications' => $user ? $user->unreadNotifications()->take(5)->get() : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
