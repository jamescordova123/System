<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Pulse\Facades\Pulse;

class PulseServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Define the authorization gate for Laravel Pulse.
        // Secure the /pulse dashboard route by ensuring ONLY authenticated users
        // with the 'Super-Admin' role or 'manage settings' permission can view the performance data.
        Gate::define('viewPulse', function (User $user) {
            return $user->hasRole('Super-Admin')
                || $user->hasPermissionTo('manage settings')
                || $user->can('manage settings');
        });

        // Customize the user resolver for Pulse cards (e.g. "Most Request-Heavy Users").
        // Display the user's name and Spatie Media Library custom avatar URL.
        Pulse::user(function (User $user) {
            return [
                'name' => $user->name,
                'extra' => $user->email,
                'avatar' => $user->avatar_url,
            ];
        });
    }
}
