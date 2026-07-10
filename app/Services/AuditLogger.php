<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\SecuritySetting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Log a security event.
     */
    public static function log(string $event, string $description, ?int $userId = null, ?string $userEmail = null): void
    {
        try {
            $settings = SecuritySetting::firstOrCreate([]);

            // Check if logging is enabled for specific event types
            if ($event === 'Failed Login Attempt' && ! $settings->log_failed_logins) {
                return;
            }

            $permissionEvents = [
                'Role Created',
                'Role Permissions Updated',
                'Role Deleted',
                'User Role Assigned',
                'User Deleted',
            ];

            if (in_array($event, $permissionEvents) && ! $settings->log_permission_changes) {
                return;
            }

            // Create the audit log record
            $log = AuditLog::create([
                'event' => $event,
                'description' => $description,
                'user_id' => $userId ?? auth()->id(),
                'user_email' => $userEmail ?? auth()->user()?->email,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);

            // Prune old logs based on retention days settings
            $retentionDays = (int) $settings->audit_log_retention_days;
            if ($retentionDays > 0) {
                AuditLog::where('created_at', '<', now()->subDays($retentionDays))->delete();
            }

            // Handle breach/alert email notifications
            if ($settings->notify_admin_on_breach && $settings->notify_admin_email) {
                $isAlert = str_contains(strtolower($event), 'failed') ||
                           str_contains(strtolower($event), 'blocked') ||
                           str_contains(strtolower($event), 'suspicious') ||
                           str_contains(strtolower($event), 'blacklist');

                if ($isAlert) {
                    try {
                        Mail::raw(
                            "Security Alert: {$event}\n\n".
                            "Description: {$description}\n".
                            'IP Address: '.Request::ip()."\n".
                            'User Agent: '.Request::userAgent()."\n".
                            'Time: '.now()->toDateTimeString()."\n",
                            function ($message) use ($settings, $event) {
                                $message->to($settings->notify_admin_email)
                                    ->subject("Security Alert: {$event}");
                            }
                        );
                    } catch (\Exception $mailEx) {
                        Log::warning('Failed to send security breach notification email: '.$mailEx->getMessage());
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to write security audit log: '.$e->getMessage());
        }
    }
}
