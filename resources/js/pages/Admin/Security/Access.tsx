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
import { Save, CheckCircle, Globe, Info, Smartphone } from 'lucide-react';

interface SecuritySettings {
    id: number;
    enforce_mfa_admins: boolean;
    enforce_mfa_all_users: boolean;
    mfa_grace_period_hours: number;
    allowed_mfa_methods: string[] | null;
    backup_codes_count: number;
    ip_whitelist: string | null;
    ip_blacklist: string | null;
    allow_tor_exit_nodes: boolean;
    geo_block_countries: string | null;
    force_https: boolean;
}

interface Props {
    settings: SecuritySettings;
}

const MFA_METHODS = [
    { value: 'totp', label: 'TOTP Authenticator App' },
    { value: 'passkey', label: 'Passkeys / WebAuthn' },
    { value: 'email', label: 'Email OTP' },
    { value: 'sms', label: 'SMS OTP' },
];

export default function Access({ settings }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            enforce_mfa_admins: settings.enforce_mfa_admins,
            enforce_mfa_all_users: settings.enforce_mfa_all_users,
            mfa_grace_period_hours: settings.mfa_grace_period_hours,
            allowed_mfa_methods: settings.allowed_mfa_methods ?? [
                'totp',
                'passkey',
            ],
            backup_codes_count: settings.backup_codes_count,
            ip_whitelist: settings.ip_whitelist ?? '',
            ip_blacklist: settings.ip_blacklist ?? '',
            allow_tor_exit_nodes: settings.allow_tor_exit_nodes,
            geo_block_countries: settings.geo_block_countries ?? '',
            force_https: settings.force_https,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/security/access');
    };

    const toggleMfaMethod = (method: string) => {
        const current = data.allowed_mfa_methods ?? [];
        const next = current.includes(method)
            ? current.filter((m) => m !== method)
            : [...current, method];
        setData('allowed_mfa_methods', next);
    };

    return (
        <div className="mx-auto w-full max-w-full space-y-6 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* MFA */}
                <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                    <CardHeader className="border-b border-border/30 bg-muted/10">
                        <CardTitle className="text-md flex items-center gap-2 font-bold">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />{' '}
                            Multi-Factor Authentication
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Configure MFA enforcement and allowed authentication
                            methods.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                {
                                    key: 'enforce_mfa_admins' as const,
                                    label: 'Enforce MFA for Admins & Managers',
                                },
                                {
                                    key: 'enforce_mfa_all_users' as const,
                                    label: 'Enforce MFA for All Users',
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

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    MFA Grace Period (hours)
                                </label>
                                <Input
                                    type="number"
                                    value={data.mfa_grace_period_hours}
                                    onChange={(e) =>
                                        setData(
                                            'mfa_grace_period_hours',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="0"
                                    max="168"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.mfa_grace_period_hours && (
                                    <p className="text-xs text-destructive">
                                        {errors.mfa_grace_period_hours}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Backup Codes to Generate
                                </label>
                                <Input
                                    type="number"
                                    value={data.backup_codes_count}
                                    onChange={(e) =>
                                        setData(
                                            'backup_codes_count',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="4"
                                    max="16"
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    required
                                />
                                {errors.backup_codes_count && (
                                    <p className="text-xs text-destructive">
                                        {errors.backup_codes_count}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Allowed MFA Methods
                            </label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {MFA_METHODS.map(({ value, label }) => (
                                    <div
                                        key={value}
                                        className="group flex cursor-pointer items-center space-x-3"
                                    >
                                        <Checkbox
                                            id={`mfa_${value}`}
                                            checked={(
                                                data.allowed_mfa_methods ?? []
                                            ).includes(value)}
                                            onCheckedChange={() =>
                                                toggleMfaMethod(value)
                                            }
                                            className="rounded border-border/90 data-[state=checked]:bg-primary"
                                        />
                                        <label
                                            htmlFor={`mfa_${value}`}
                                            className="cursor-pointer text-sm leading-none font-medium text-foreground/80 select-none group-hover:text-foreground"
                                        >
                                            {label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Network & IP */}
                <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                    <CardHeader className="border-b border-border/30 bg-muted/10">
                        <CardTitle className="text-md flex items-center gap-2 font-bold">
                            <Globe className="h-5 w-5 text-muted-foreground" />{' '}
                            Network & IP Controls
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Restrict or block access based on IP and geography.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                {
                                    key: 'force_https' as const,
                                    label: 'Force HTTPS (redirect all HTTP to HTTPS)',
                                },
                                {
                                    key: 'allow_tor_exit_nodes' as const,
                                    label: 'Allow Tor Exit Nodes',
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

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    IP Whitelist
                                </label>
                                <textarea
                                    value={data.ip_whitelist}
                                    onChange={(e) =>
                                        setData('ip_whitelist', e.target.value)
                                    }
                                    placeholder="192.168.1.1, 10.0.0.0/24"
                                    className="h-20 w-full rounded-lg border border-border/80 bg-card p-3 text-sm focus:border-primary/50 focus:outline-none"
                                />
                                <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Info className="h-3 w-3 shrink-0" /> Leave
                                    blank to allow all IPs.
                                </p>
                                {errors.ip_whitelist && (
                                    <p className="text-xs text-destructive">
                                        {errors.ip_whitelist}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    IP Blacklist
                                </label>
                                <textarea
                                    value={data.ip_blacklist}
                                    onChange={(e) =>
                                        setData('ip_blacklist', e.target.value)
                                    }
                                    placeholder="45.132.99.12, 1.2.3.0/24"
                                    className="h-20 w-full rounded-lg border border-border/80 bg-card p-3 text-sm focus:border-primary/50 focus:outline-none"
                                />
                                <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Info className="h-3 w-3 shrink-0" /> Always
                                    blocked regardless of whitelist.
                                </p>
                                {errors.ip_blacklist && (
                                    <p className="text-xs text-destructive">
                                        {errors.ip_blacklist}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Geo-Block Countries
                            </label>
                            <Input
                                value={data.geo_block_countries}
                                onChange={(e) =>
                                    setData(
                                        'geo_block_countries',
                                        e.target.value,
                                    )
                                }
                                placeholder="CN, RU, KP (ISO 3166-1 alpha-2, comma-separated)"
                                className="h-10 rounded-lg border-border/80 bg-card"
                            />
                            {errors.geo_block_countries && (
                                <p className="text-xs text-destructive">
                                    {errors.geo_block_countries}
                                </p>
                            )}
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
                        <Save className="h-4 w-4" /> Save Access Settings
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
