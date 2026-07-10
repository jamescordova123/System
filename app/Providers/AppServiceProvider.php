<?php

namespace App\Providers;

use App\Models\BrandingSetting;
use App\Models\SecuritySetting;
use App\Services\AuditLogger;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
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
        try {
            $branding = BrandingSetting::first();
            if ($branding && $branding->app_name) {
                config(['app.name' => $branding->app_name]);
            }
        } catch (\Exception $e) {
            // Revert to default
        }

        $this->configureDefaults();

        // Implicitly grant "Super-Admin" and "Developer" roles all permissions
        Gate::before(function ($user, $ability) {
            return $user->hasRole(['Super-Admin', 'Developer']) ? true : null;
        });

        $this->registerSecurityListeners();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): Password => $this->getPasswordDefaults());
    }

    /**
     * Get dynamic password rules based on security settings.
     */
    protected function getPasswordDefaults(): Password
    {
        if (app()->runningUnitTests()) {
            return Password::min(8);
        }

        try {
            $settings = SecuritySetting::firstOrCreate([]);

            $rule = Password::min($settings->password_min_length);

            if ($settings->password_require_uppercase) {
                $rule->mixedCase();
            }
            if ($settings->password_require_numeric) {
                $rule->numbers();
            }
            if ($settings->password_require_special) {
                $rule->symbols();
            }
            if ($settings->password_ban_common) {
                $rule->uncompromised();
            }

            return $rule;
        } catch (\Exception $e) {
            return Password::min(12)->mixedCase()->numbers()->symbols();
        }
    }

    /**
     * Register listeners for security/auth events to log to the audit trail.
     */
    protected function registerSecurityListeners(): void
    {
        Event::listen(Login::class, function ($event) {
            Cache::put('user_session_'.$event->user->id, session()->getId(), 86400);
            AuditLogger::log('Successful Login', 'User logged in successfully.', $event->user->id, $event->user->email);
        });

        Event::listen(Failed::class, function ($event) {
            $email = $event->credentials['email'] ?? ($event->credentials['username'] ?? 'unknown');
            AuditLogger::log('Failed Login Attempt', "Incorrect credentials entered for user: $email.", $event->user?->id, $email);
        });

        Event::listen(Logout::class, function ($event) {
            if ($event->user) {
                AuditLogger::log('User Logout', 'User logged out.', $event->user->id, $event->user->email);
            }
        });

        Event::listen(Registered::class, function ($event) {
            AuditLogger::log('User Account Registered', 'User registered a new account.', $event->user->id, $event->user->email);
        });

        Event::listen(PasswordReset::class, function ($event) {
            AuditLogger::log('Password Reset', 'User reset their password.', $event->user->id, $event->user->email);
        });
    }
}
