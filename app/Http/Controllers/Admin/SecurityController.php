<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SecuritySetting;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityController extends Controller
{
    /**
     * Security Overview / Dashboard
     */
    public function index()
    {
        $settings = SecuritySetting::firstOrCreate([]);

        $auditLogs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(5);

        $auditLogs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'event' => $log->event,
                'description' => $log->description,
                'user' => $log->user ? $log->user->email : ($log->user_email ?? 'System'),
                'ip' => $log->ip_address ?? 'N/A',
                'created_at' => $log->created_at->toIso8601String(),
            ];
        });

        return Inertia::render('Admin/Security/Index', [
            'settings' => $settings,
            'auditLogs' => $auditLogs,
        ]);
    }

    /**
     * Password Policy sub-page
     */
    public function password()
    {
        $settings = SecuritySetting::firstOrCreate([]);

        return Inertia::render('Admin/Security/Password', ['settings' => $settings]);
    }

    /**
     * Session & Lockout sub-page
     */
    public function sessions()
    {
        $settings = SecuritySetting::firstOrCreate([]);

        return Inertia::render('Admin/Security/Sessions', ['settings' => $settings]);
    }

    /**
     * MFA & Access Control sub-page
     */
    public function access()
    {
        $settings = SecuritySetting::firstOrCreate([]);

        return Inertia::render('Admin/Security/Access', ['settings' => $settings]);
    }

    /**
     * Account Lifecycle sub-page
     */
    public function accounts()
    {
        $settings = SecuritySetting::firstOrCreate([]);

        return Inertia::render('Admin/Security/Accounts', ['settings' => $settings]);
    }

    /**
     * Audit & Notifications sub-page
     */
    public function audit()
    {
        $settings = SecuritySetting::firstOrCreate([]);

        $auditLogs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $auditLogs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'event' => $log->event,
                'description' => $log->description,
                'user' => $log->user ? $log->user->email : ($log->user_email ?? 'System'),
                'ip' => $log->ip_address ?? 'N/A',
                'created_at' => $log->created_at->toIso8601String(),
            ];
        });

        return Inertia::render('Admin/Security/Audit', [
            'settings' => $settings,
            'auditLogs' => $auditLogs,
        ]);
    }

    /**
     * Update a specific section of security settings
     */
    public function update(Request $request, string $section)
    {
        $settings = SecuritySetting::firstOrCreate([]);
        $oldSettings = $settings->replicate();

        $rules = match ($section) {
            'password' => [
                'password_min_length' => 'required|integer|min:8|max:64',
                'password_require_uppercase' => 'required|boolean',
                'password_require_numeric' => 'required|boolean',
                'password_require_special' => 'required|boolean',
                'password_max_age_days' => 'required|integer|min:1|max:365',
                'password_history_count' => 'required|integer|min:0|max:24',
                'password_ban_common' => 'required|boolean',
            ],
            'sessions' => [
                'login_max_attempts' => 'required|integer|min:3|max:20',
                'lockout_duration_minutes' => 'required|integer|min:1|max:1440',
                'captcha_after_attempts' => 'required|integer|min:1|max:10',
                'progressive_lockout_enabled' => 'required|boolean',
                'session_lifetime_minutes' => 'required|integer|min:5|max:10080',
                'idle_timeout_minutes' => 'required|integer|min:5|max:1440',
                'remember_me_max_days' => 'required|integer|min:1|max:365',
                'session_invalidate_on_ip_change' => 'required|boolean',
                'session_invalidate_on_ua_change' => 'required|boolean',
                'session_single_device_only' => 'required|boolean',
            ],
            'access' => [
                'enforce_mfa_admins' => 'required|boolean',
                'enforce_mfa_all_users' => 'required|boolean',
                'mfa_grace_period_hours' => 'required|integer|min:0|max:168',
                'backup_codes_count' => 'required|integer|min:4|max:16',
                'allow_tor_exit_nodes' => 'required|boolean',
                'force_https' => 'required|boolean',
                'ip_whitelist' => 'nullable|string',
                'ip_blacklist' => 'nullable|string',
                'geo_block_countries' => 'nullable|string',
                'allowed_mfa_methods' => 'nullable|array',
                'allowed_mfa_methods.*' => 'string|in:totp,passkey,email,sms',
            ],
            'accounts' => [
                'registration_enabled' => 'required|boolean',
                'require_email_verification' => 'required|boolean',
                'account_inactive_days' => 'required|integer|min:30|max:730',
                'allow_self_deletion' => 'required|boolean',
                'max_users' => 'nullable|integer|min:1',
            ],
            'audit' => [
                'audit_log_retention_days' => 'required|integer|min:30|max:3650',
                'log_failed_logins' => 'required|boolean',
                'log_permission_changes' => 'required|boolean',
                'notify_admin_on_breach' => 'required|boolean',
                'notify_admin_email' => 'nullable|email',
            ],
            default => abort(404),
        };

        $validated = $request->validate($rules);

        // Cast JSON fields
        if (isset($validated['allowed_mfa_methods'])) {
            $validated['allowed_mfa_methods'] = json_encode($validated['allowed_mfa_methods']);
        }

        $settings->update($validated);

        // Compare old and new settings to log human-readable audit descriptions
        $changes = [];
        $keyLabels = [
            'password_min_length' => 'Min length',
            'password_require_uppercase' => 'Require uppercase',
            'password_require_numeric' => 'Require numbers',
            'password_require_special' => 'Require special characters',
            'password_ban_common' => 'Ban common passwords',
            'password_max_age_days' => 'Max password age',
            'password_history_count' => 'Password history count',
            'login_max_attempts' => 'Max login attempts',
            'lockout_duration_minutes' => 'Lockout duration',
            'captcha_after_attempts' => 'CAPTCHA attempts threshold',
            'progressive_lockout_enabled' => 'Progressive lockout',
            'session_lifetime_minutes' => 'Session lifetime',
            'idle_timeout_minutes' => 'Idle timeout',
            'remember_me_max_days' => 'Remember me duration',
            'session_invalidate_on_ip_change' => 'Invalidate session on IP change',
            'session_invalidate_on_ua_change' => 'Invalidate session on User Agent change',
            'session_single_device_only' => 'Single active session policy',
            'enforce_mfa_admins' => 'MFA enforcement for admins',
            'enforce_mfa_all_users' => 'MFA enforcement for all users',
            'mfa_grace_period_hours' => 'MFA grace period',
            'backup_codes_count' => 'Backup codes count',
            'ip_whitelist' => 'IP whitelist',
            'ip_blacklist' => 'IP blacklist',
            'allow_tor_exit_nodes' => 'Tor exit nodes access',
            'geo_block_countries' => 'Geo-blocked countries',
            'force_https' => 'Force HTTPS redirection',
            'registration_enabled' => 'User registration',
            'require_email_verification' => 'Require email verification',
            'account_inactive_days' => 'Account inactivity threshold',
            'allow_self_deletion' => 'Allow self deletion',
            'max_users' => 'Max user cap',
            'audit_log_retention_days' => 'Audit log retention period',
            'log_failed_logins' => 'Failed logins logging',
            'log_permission_changes' => 'Permission changes logging',
            'notify_admin_on_breach' => 'Admin breach notification alert',
            'notify_admin_email' => 'Admin breach alert email',
        ];

        foreach ($validated as $key => $value) {
            $oldVal = $oldSettings->$key;
            $newVal = $settings->$key;

            if ($oldVal != $newVal) {
                $label = $keyLabels[$key] ?? $key;

                // Format values for human readability
                $oldValStr = is_bool($oldVal) ? ($oldVal ? 'enabled' : 'disabled') : (is_null($oldVal) ? 'none' : (string) $oldVal);
                $newValStr = is_bool($newVal) ? ($newVal ? 'enabled' : 'disabled') : (is_null($newVal) ? 'none' : (string) $newVal);

                $changes[] = "$label changed from \"$oldValStr\" to \"$newValStr\"";
            }
        }

        if (! empty($changes)) {
            $description = ucfirst($section).' settings updated: '.implode(', ', $changes).'.';
            AuditLogger::log('Security Settings Updated', $description);
        }

        return back()->with('message', 'Security settings updated successfully.');
    }
}
