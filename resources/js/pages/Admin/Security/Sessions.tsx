import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Save, CheckCircle, Clock, Lock } from 'lucide-react';

interface SecuritySettings {
    id: number;
    login_max_attempts: number;
    lockout_duration_minutes: number;
    captcha_after_attempts: number;
    progressive_lockout_enabled: boolean;
    session_lifetime_minutes: number;
    idle_timeout_minutes: number;
    remember_me_max_days: number;
    session_invalidate_on_ip_change: boolean;
    session_invalidate_on_ua_change: boolean;
    session_single_device_only: boolean;
}

interface Props {
    settings: SecuritySettings;
}

export default function Sessions({ settings }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            login_max_attempts: settings.login_max_attempts,
            lockout_duration_minutes: settings.lockout_duration_minutes,
            captcha_after_attempts: settings.captcha_after_attempts,
            progressive_lockout_enabled: settings.progressive_lockout_enabled,
            session_lifetime_minutes: settings.session_lifetime_minutes,
            idle_timeout_minutes: settings.idle_timeout_minutes,
            remember_me_max_days: settings.remember_me_max_days,
            session_invalidate_on_ip_change:
                settings.session_invalidate_on_ip_change,
            session_invalidate_on_ua_change:
                settings.session_invalidate_on_ua_change,
            session_single_device_only: settings.session_single_device_only,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/security/sessions');
    };

    return (
        <div className="mx-auto w-full max-w-full space-y-6 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Brute Force */}
                <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                    <CardHeader className="border-b border-border/30 bg-muted/10">
                        <CardTitle className="text-md flex items-center gap-2 font-bold">
                            <Lock className="h-5 w-5 text-muted-foreground" />{' '}
                            Brute Force Protection
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Limit failed login attempts and enforce lockouts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Max Login Attempts
                                </label>
                                <Input
                                    type="number"
                                    value={data.login_max_attempts}
                                    onChange={(e) =>
                                        setData(
                                            'login_max_attempts',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="3"
                                    max="20"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.login_max_attempts && (
                                    <p className="text-xs text-destructive">
                                        {errors.login_max_attempts}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Lockout Duration (min)
                                </label>
                                <Input
                                    type="number"
                                    value={data.lockout_duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'lockout_duration_minutes',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="1"
                                    max="1440"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.lockout_duration_minutes && (
                                    <p className="text-xs text-destructive">
                                        {errors.lockout_duration_minutes}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    CAPTCHA after N Attempts
                                </label>
                                <Input
                                    type="number"
                                    value={data.captcha_after_attempts}
                                    onChange={(e) =>
                                        setData(
                                            'captcha_after_attempts',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="1"
                                    max="10"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.captcha_after_attempts && (
                                    <p className="text-xs text-destructive">
                                        {errors.captcha_after_attempts}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="group flex cursor-pointer items-center space-x-3 pt-2">
                            <Checkbox
                                id="progressive_lockout"
                                checked={data.progressive_lockout_enabled}
                                onCheckedChange={(v) =>
                                    setData('progressive_lockout_enabled', !!v)
                                }
                                className="rounded border-border/90 data-[state=checked]:bg-primary"
                            />
                            <label
                                htmlFor="progressive_lockout"
                                className="cursor-pointer text-sm leading-none font-medium text-foreground/80 select-none group-hover:text-foreground"
                            >
                                Enable Progressive Lockout (lockout time doubles
                                per subsequent violation)
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Session Lifetime */}
                <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                    <CardHeader className="border-b border-border/30 bg-muted/10">
                        <CardTitle className="text-md flex items-center gap-2 font-bold">
                            <Clock className="h-5 w-5 text-muted-foreground" />{' '}
                            Session Lifetime
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Control how long sessions remain active.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Session Lifetime (min)
                                </label>
                                <Input
                                    type="number"
                                    value={data.session_lifetime_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'session_lifetime_minutes',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="5"
                                    max="10080"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.session_lifetime_minutes && (
                                    <p className="text-xs text-destructive">
                                        {errors.session_lifetime_minutes}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Idle Timeout (min)
                                </label>
                                <Input
                                    type="number"
                                    value={data.idle_timeout_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'idle_timeout_minutes',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="5"
                                    max="1440"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.idle_timeout_minutes && (
                                    <p className="text-xs text-destructive">
                                        {errors.idle_timeout_minutes}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Remember Me Max (days)
                                </label>
                                <Input
                                    type="number"
                                    value={data.remember_me_max_days}
                                    onChange={(e) =>
                                        setData(
                                            'remember_me_max_days',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="1"
                                    max="365"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.remember_me_max_days && (
                                    <p className="text-xs text-destructive">
                                        {errors.remember_me_max_days}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                            {[
                                {
                                    key: 'session_invalidate_on_ip_change' as const,
                                    label: 'Invalidate session if IP address changes',
                                },
                                {
                                    key: 'session_invalidate_on_ua_change' as const,
                                    label: 'Invalidate session if browser/device changes',
                                },
                                {
                                    key: 'session_single_device_only' as const,
                                    label: 'Allow only one active session per user',
                                },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    className="group flex cursor-pointer items-center space-x-3"
                                >
                                    <Checkbox
                                        id={key}
                                        checked={data[key]}
                                        onCheckedChange={(v) =>
                                            setData(key, !!v)
                                        }
                                        className="rounded border-border/90 data-[state=checked]:bg-primary"
                                    />
                                    <label
                                        htmlFor={key}
                                        className="cursor-pointer text-sm leading-none font-medium text-foreground/80 select-none group-hover:text-foreground"
                                    >
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex h-10 items-center gap-2 rounded-lg px-6 shadow-sm"
                    >
                        <Save className="h-4 w-4" /> Save Session Settings
                    </Button>
                    {recentlySuccessful && (
                        <span className="flex animate-pulse items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4" /> Saved
                            successfully!
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
