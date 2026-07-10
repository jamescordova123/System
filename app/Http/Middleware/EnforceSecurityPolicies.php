<?php

namespace App\Http\Middleware;

use App\Models\SecuritySetting;
use App\Models\User;
use App\Services\AuditLogger;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class EnforceSecurityPolicies
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $settings = SecuritySetting::firstOrCreate([]);
        } catch (QueryException $e) {
            $settings = new SecuritySetting;
        }

        $ip = $request->ip();

        // 1. Force HTTPS
        if ($settings->force_https && ! $request->secure() && ! app()->environment('local', 'testing')) {
            return redirect()->secure($request->getRequestUri());
        }

        // 2. IP Blacklist Check
        if ($settings->ip_blacklist) {
            $blacklist = $this->parseIpList($settings->ip_blacklist);
            foreach ($blacklist as $blockedIp) {
                if ($this->ipMatchesRange($ip, $blockedIp)) {
                    AuditLogger::log('Suspicious Request Blocked', "Request from blacklisted IP address {$ip} was blocked.");
                    abort(403, 'Access Denied: Your IP address is blacklisted.');
                }
            }
        }

        // 3. IP Whitelist Check
        if ($settings->ip_whitelist) {
            $whitelist = $this->parseIpList($settings->ip_whitelist);
            $allowed = false;
            foreach ($whitelist as $allowedIp) {
                if ($this->ipMatchesRange($ip, $allowedIp)) {
                    $allowed = true;
                    break;
                }
            }
            if (! $allowed) {
                AuditLogger::log('Suspicious Request Blocked', "Request from non-whitelisted IP address {$ip} was blocked.");
                abort(403, 'Access Denied: Your IP address is not whitelisted.');
            }
        }

        // 4. Tor Exit Node Check
        if (! $settings->allow_tor_exit_nodes) {
            if ($this->isTorExitNode($ip)) {
                AuditLogger::log('Suspicious Request Blocked', "Request from Tor exit node {$ip} was blocked.");
                abort(403, 'Access Denied: Tor exit nodes are not allowed.');
            }
        }

        // 5. Geo-Blocking Check
        if ($settings->geo_block_countries) {
            $blockedCountries = array_filter(array_map('trim', array_map('strtoupper', explode(',', $settings->geo_block_countries))));
            if (! empty($blockedCountries)) {
                $countryCode = $request->header('CF-IPCountry') ?: $request->server('HTTP_CF_IPCOUNTRY');
                if (! $countryCode && ! in_array($ip, ['127.0.0.1', '::1'])) {
                    $countryCode = Cache::remember("ip_country_{$ip}", 86400, function () use ($ip) {
                        try {
                            $response = file_get_contents("http://ip-api.com/json/{$ip}?fields=status,countryCode");
                            $data = json_decode($response, true);

                            return ($data && $data['status'] === 'success') ? strtoupper($data['countryCode']) : null;
                        } catch (\Exception $e) {
                            return null;
                        }
                    });
                }
                if ($countryCode && in_array(strtoupper($countryCode), $blockedCountries)) {
                    AuditLogger::log('Suspicious Request Blocked', "Request from geo-blocked country {$countryCode} (IP: {$ip}) was blocked.");
                    abort(403, "Access Denied: Access is blocked from your region ({$countryCode}).");
                }
            }
        }

        // 6. Registration Settings Check
        if ($request->is('register') || $request->routeIs('register')) {
            if (! $settings->registration_enabled) {
                return redirect()->route('login')->with('error', 'New registrations are currently disabled.');
            }
            if ($settings->max_users && User::count() >= $settings->max_users) {
                return redirect()->route('login')->with('error', 'New registrations are currently closed (user limit reached).');
            }
        }

        // authenticated checks
        if (auth()->check()) {
            $user = auth()->user();

            // 7. Idle Timeout
            $idleTimeout = (int) $settings->idle_timeout_minutes;
            if ($idleTimeout > 0) {
                $lastActivity = session('last_activity_time');
                if ($lastActivity && (time() - $lastActivity) > ($idleTimeout * 60)) {
                    auth()->logout();
                    session()->invalidate();
                    session()->regenerateToken();

                    return redirect()->route('login')->with('error', 'Your session has expired due to inactivity.');
                }
                session(['last_activity_time' => time()]);
            }

            // 8. Session IP / UA Invalidation
            if ($settings->session_invalidate_on_ip_change) {
                $storedIp = session('user_ip');
                if ($storedIp && $storedIp !== $ip) {
                    auth()->logout();
                    session()->invalidate();
                    session()->regenerateToken();

                    return redirect()->route('login')->with('error', 'Session terminated due to IP address change.');
                }
                if (! $storedIp) {
                    session(['user_ip' => $ip]);
                }
            }

            if ($settings->session_invalidate_on_ua_change) {
                $storedUa = session('user_agent');
                $currentUa = $request->userAgent();
                if ($storedUa && $storedUa !== $currentUa) {
                    auth()->logout();
                    session()->invalidate();
                    session()->regenerateToken();

                    return redirect()->route('login')->with('error', 'Session terminated due to device/browser change.');
                }
                if (! $storedUa) {
                    session(['user_agent' => $currentUa]);
                }
            }

            // 9. Single Active Session Enforcer
            if ($settings->session_single_device_only) {
                $currentSessionId = session()->getId();
                $activeSessionId = Cache::get("user_session_{$user->id}");

                // If there's no active session in cache, set it.
                if (! $activeSessionId) {
                    Cache::put("user_session_{$user->id}", $currentSessionId, 86400);
                } elseif ($activeSessionId !== $currentSessionId) {
                    auth()->logout();
                    session()->invalidate();
                    session()->regenerateToken();

                    return redirect()->route('login')->with('error', 'Your account has been logged in on another device.');
                }
            }

            // 10. MFA Enforcement
            $mustEnforceMfa = false;
            if ($settings->enforce_mfa_all_users) {
                $mustEnforceMfa = true;
            } elseif ($settings->enforce_mfa_admins) {
                if ($user->hasAnyRole(['Super-Admin', 'Admin', 'Manager'])) {
                    $mustEnforceMfa = true;
                }
            }

            if ($mustEnforceMfa && is_null($user->two_factor_confirmed_at)) {
                $allowedRoutes = [
                    'security.edit',
                    'two-factor.enable',
                    'two-factor.disable',
                    'two-factor.qr-code',
                    'two-factor.secret-key',
                    'two-factor.recovery-codes',
                    'logout',
                ];

                $currentRouteName = $request->route()?->getName();

                if (! in_array($currentRouteName, $allowedRoutes) && ! $request->is('logout') && ! $request->is('two-factor/*')) {
                    return redirect()->route('security.edit')->with('error', 'Multi-Factor Authentication is required by policy. Please enable it to proceed.');
                }
            }
        }

        return $next($request);
    }

    private function parseIpList(?string $list): array
    {
        if (! $list) {
            return [];
        }

        return array_filter(array_map('trim', preg_split('/[\s,]+/', $list)));
    }

    private function ipMatchesRange(string $ip, string $range): bool
    {
        if (str_contains($range, '/')) {
            [$subnet, $bits] = explode('/', $range);
            $ip_dec = ip2long($ip);
            $subnet_dec = ip2long($subnet);
            if ($ip_dec === false || $subnet_dec === false) {
                return false;
            }
            $mask = ~((1 << (32 - (int) $bits)) - 1);

            return ($ip_dec & $mask) === ($subnet_dec & $mask);
        }

        return $ip === $range;
    }

    private function isTorExitNode(string $ip): bool
    {
        return Cache::remember("is_tor_{$ip}", 86400, function () use ($ip) {
            $ipParts = explode('.', $ip);
            if (count($ipParts) !== 4) {
                return false;
            }
            $reverseIp = implode('.', array_reverse($ipParts));
            $serverIp = request()->server('SERVER_ADDR') ?: '127.0.0.1';
            $serverIpParts = explode('.', $serverIp);
            $reverseServerIp = count($serverIpParts) === 4 ? implode('.', array_reverse($serverIpParts)) : '1.0.0.127';

            $query = "{$reverseIp}.80.{$reverseServerIp}.ip-port.exitlist.torproject.org";

            try {
                $records = dns_get_record($query, DNS_A);
                if (! empty($records)) {
                    foreach ($records as $record) {
                        if ($record['ip'] === '127.0.0.2') {
                            return true;
                        }
                    }
                }
            } catch (\Exception $e) {
                // Fail gracefully
            }

            return false;
        });
    }
}
