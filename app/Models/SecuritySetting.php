<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecuritySetting extends Model
{
    protected $table = 'security_settings';

    protected $attributes = [
        'password_min_length' => 12,
        'password_require_uppercase' => true,
        'password_require_numeric' => true,
        'password_require_special' => true,
        'password_max_age_days' => 90,
        'password_history_count' => 5,
        'password_ban_common' => true,
        'login_max_attempts' => 5,
        'lockout_duration_minutes' => 15,
        'captcha_after_attempts' => 3,
        'progressive_lockout_enabled' => false,
        'session_lifetime_minutes' => 120,
        'idle_timeout_minutes' => 30,
        'remember_me_max_days' => 30,
        'session_invalidate_on_ip_change' => true,
        'session_invalidate_on_ua_change' => true,
        'session_single_device_only' => false,
        'enforce_mfa_admins' => false,
        'enforce_mfa_all_users' => false,
        'mfa_grace_period_hours' => 24,
        'allowed_mfa_methods' => '["totp", "passkey"]',
        'backup_codes_count' => 8,
        'ip_whitelist' => null,
        'ip_blacklist' => null,
        'allow_tor_exit_nodes' => false,
        'geo_block_countries' => null,
        'force_https' => true,
        'registration_enabled' => true,
        'require_email_verification' => true,
        'account_inactive_days' => 90,
        'allow_self_deletion' => false,
        'max_users' => null,
        'audit_log_retention_days' => 365,
        'log_failed_logins' => true,
        'log_permission_changes' => true,
        'notify_admin_on_breach' => true,
        'notify_admin_email' => null,
    ];

    protected $fillable = [
        // Password Policy
        'password_min_length',
        'password_require_uppercase',
        'password_require_numeric',
        'password_require_special',
        'password_max_age_days',
        'password_history_count',
        'password_ban_common',
        // Brute Force
        'login_max_attempts',
        'lockout_duration_minutes',
        'captcha_after_attempts',
        'progressive_lockout_enabled',
        // Session Security
        'session_lifetime_minutes',
        'idle_timeout_minutes',
        'remember_me_max_days',
        'session_invalidate_on_ip_change',
        'session_invalidate_on_ua_change',
        'session_single_device_only',
        // MFA & Access Control
        'enforce_mfa_admins',
        'enforce_mfa_all_users',
        'mfa_grace_period_hours',
        'allowed_mfa_methods',
        'backup_codes_count',
        'ip_whitelist',
        'ip_blacklist',
        'allow_tor_exit_nodes',
        'geo_block_countries',
        'force_https',
        // Account Lifecycle
        'registration_enabled',
        'require_email_verification',
        'account_inactive_days',
        'allow_self_deletion',
        'max_users',
        // Audit & Notifications
        'audit_log_retention_days',
        'log_failed_logins',
        'log_permission_changes',
        'notify_admin_on_breach',
        'notify_admin_email',
    ];

    protected $casts = [
        // Password Policy
        'password_min_length' => 'integer',
        'password_require_uppercase' => 'boolean',
        'password_require_numeric' => 'boolean',
        'password_require_special' => 'boolean',
        'password_max_age_days' => 'integer',
        'password_history_count' => 'integer',
        'password_ban_common' => 'boolean',
        // Brute Force
        'login_max_attempts' => 'integer',
        'lockout_duration_minutes' => 'integer',
        'captcha_after_attempts' => 'integer',
        'progressive_lockout_enabled' => 'boolean',
        // Session Security
        'session_lifetime_minutes' => 'integer',
        'idle_timeout_minutes' => 'integer',
        'remember_me_max_days' => 'integer',
        'session_invalidate_on_ip_change' => 'boolean',
        'session_invalidate_on_ua_change' => 'boolean',
        'session_single_device_only' => 'boolean',
        // MFA & Access Control
        'enforce_mfa_admins' => 'boolean',
        'enforce_mfa_all_users' => 'boolean',
        'mfa_grace_period_hours' => 'integer',
        'allowed_mfa_methods' => 'array',
        'backup_codes_count' => 'integer',
        'allow_tor_exit_nodes' => 'boolean',
        'force_https' => 'boolean',
        // Account Lifecycle
        'registration_enabled' => 'boolean',
        'require_email_verification' => 'boolean',
        'account_inactive_days' => 'integer',
        'allow_self_deletion' => 'boolean',
        'max_users' => 'integer',
        // Audit & Notifications
        'audit_log_retention_days' => 'integer',
        'log_failed_logins' => 'boolean',
        'log_permission_changes' => 'boolean',
        'notify_admin_on_breach' => 'boolean',
    ];
}
