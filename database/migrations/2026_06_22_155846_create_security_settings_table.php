<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('security_settings', function (Blueprint $table) {
            $table->id();

            // --- Password Policy ---
            $table->integer('password_min_length')->default(12);
            $table->boolean('password_require_uppercase')->default(true);
            $table->boolean('password_require_numeric')->default(true);
            $table->boolean('password_require_special')->default(true);
            $table->integer('password_max_age_days')->default(90);
            $table->integer('password_history_count')->default(5);
            $table->boolean('password_ban_common')->default(true);

            // --- Brute Force & Rate Limiting ---
            $table->integer('login_max_attempts')->default(5);
            $table->integer('lockout_duration_minutes')->default(15);
            $table->integer('captcha_after_attempts')->default(3);
            $table->boolean('progressive_lockout_enabled')->default(false);

            // --- Session Security ---
            $table->integer('session_lifetime_minutes')->default(120);
            $table->integer('idle_timeout_minutes')->default(30);
            $table->integer('remember_me_max_days')->default(30);
            $table->boolean('session_invalidate_on_ip_change')->default(true);
            $table->boolean('session_invalidate_on_ua_change')->default(true);
            $table->boolean('session_single_device_only')->default(false);

            // --- MFA & Access Control ---
            $table->boolean('enforce_mfa_admins')->default(false);
            $table->boolean('enforce_mfa_all_users')->default(false);
            $table->integer('mfa_grace_period_hours')->default(24);
            $table->text('allowed_mfa_methods')->nullable(); // JSON: ["totp","passkey","email"]
            $table->integer('backup_codes_count')->default(8);
            $table->text('ip_whitelist')->nullable();
            $table->text('ip_blacklist')->nullable();
            $table->boolean('allow_tor_exit_nodes')->default(false);
            $table->text('geo_block_countries')->nullable(); // JSON: ["CN","RU"]
            $table->boolean('force_https')->default(true);

            // --- Account Lifecycle ---
            $table->boolean('registration_enabled')->default(true);
            $table->boolean('require_email_verification')->default(true);
            $table->integer('account_inactive_days')->default(90);
            $table->boolean('allow_self_deletion')->default(false);
            $table->integer('max_users')->nullable();

            // --- Audit & Notifications ---
            $table->integer('audit_log_retention_days')->default(365);
            $table->boolean('log_failed_logins')->default(true);
            $table->boolean('log_permission_changes')->default(true);
            $table->boolean('notify_admin_on_breach')->default(true);
            $table->string('notify_admin_email')->nullable();

            $table->timestamps();
        });

        // Insert default configuration row
        DB::table('security_settings')->insert([
            // Password Policy
            'password_min_length' => 12,
            'password_require_uppercase' => true,
            'password_require_numeric' => true,
            'password_require_special' => true,
            'password_max_age_days' => 90,
            'password_history_count' => 5,
            'password_ban_common' => true,
            // Brute Force
            'login_max_attempts' => 5,
            'lockout_duration_minutes' => 15,
            'captcha_after_attempts' => 3,
            'progressive_lockout_enabled' => false,
            // Session Security
            'session_lifetime_minutes' => 120,
            'idle_timeout_minutes' => 30,
            'remember_me_max_days' => 30,
            'session_invalidate_on_ip_change' => true,
            'session_invalidate_on_ua_change' => true,
            'session_single_device_only' => false,
            // MFA & Access
            'enforce_mfa_admins' => false,
            'enforce_mfa_all_users' => false,
            'mfa_grace_period_hours' => 24,
            'allowed_mfa_methods' => json_encode(['totp', 'passkey']),
            'backup_codes_count' => 8,
            'ip_whitelist' => null,
            'ip_blacklist' => null,
            'allow_tor_exit_nodes' => false,
            'geo_block_countries' => null,
            'force_https' => true,
            // Account Lifecycle
            'registration_enabled' => true,
            'require_email_verification' => true,
            'account_inactive_days' => 90,
            'allow_self_deletion' => false,
            'max_users' => null,
            // Audit & Notifications
            'audit_log_retention_days' => 365,
            'log_failed_logins' => true,
            'log_permission_changes' => true,
            'notify_admin_on_breach' => true,
            'notify_admin_email' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_settings');
    }
};
