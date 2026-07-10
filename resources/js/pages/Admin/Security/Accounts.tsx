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
import { Save, CheckCircle, UserX, Info, Users } from 'lucide-react';

interface SecuritySettings {
    id: number;
    registration_enabled: boolean;
    require_email_verification: boolean;
    account_inactive_days: number;
    allow_self_deletion: boolean;
    max_users: number | null;
}

interface Props {
    settings: SecuritySettings;
}

export default function Accounts({ settings }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            registration_enabled: settings.registration_enabled,
            require_email_verification: settings.require_email_verification,
            account_inactive_days: settings.account_inactive_days,
            allow_self_deletion: settings.allow_self_deletion,
            max_users: settings.max_users ?? '',
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/security/accounts');
    };

    return (
        <div className="mx-auto w-full max-w-full space-y-6 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration */}
                <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                    <CardHeader className="border-b border-border/30 bg-muted/10">
                        <CardTitle className="text-md flex items-center gap-2 font-bold">
                            <Users className="h-5 w-5 text-muted-foreground" />{' '}
                            Registration & Verification
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Control who can sign up and what verification is
                            required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                {
                                    key: 'registration_enabled' as const,
                                    label: 'Allow New User Registrations',
                                },
                                {
                                    key: 'require_email_verification' as const,
                                    label: 'Require Email Verification Before Login',
                                },
                                {
                                    key: 'allow_self_deletion' as const,
                                    label: 'Allow Users to Delete Their Own Account',
                                },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    className="group flex cursor-pointer items-center space-x-3"
                                >
                                    <Checkbox
                                        id={key}
                                        checked={data[key] as boolean}
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

                        <div className="max-w-xs space-y-2">
                            <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Maximum Users (blank = unlimited)
                            </label>
                            <Input
                                type="number"
                                value={data.max_users ?? ''}
                                onChange={(e) =>
                                    setData(
                                        'max_users',
                                        e.target.value === ''
                                            ? ''
                                            : parseInt(e.target.value),
                                    )
                                }
                                min="1"
                                placeholder="Unlimited"
                                className="h-10 rounded-lg border-border/80 bg-card"
                            />
                            {errors.max_users && (
                                <p className="text-xs text-destructive">
                                    {errors.max_users}
                                </p>
                            )}
                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Info className="h-3 w-3 shrink-0" /> Once the
                                cap is reached, new registrations are blocked.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Inactivity */}
                <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                    <CardHeader className="border-b border-border/30 bg-muted/10">
                        <CardTitle className="text-md flex items-center gap-2 font-bold">
                            <UserX className="h-5 w-5 text-muted-foreground" />{' '}
                            Inactivity Policy
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Automatically disable accounts that haven't logged
                            in recently.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="max-w-xs space-y-2">
                            <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Disable Accounts Inactive for (days)
                            </label>
                            <Input
                                type="number"
                                value={data.account_inactive_days}
                                onChange={(e) =>
                                    setData(
                                        'account_inactive_days',
                                        parseInt(e.target.value),
                                    )
                                }
                                min="30"
                                max="730"
                                className="h-10 rounded-lg border-border/80 bg-card"
                                required
                            />
                            {errors.account_inactive_days && (
                                <p className="text-xs text-destructive">
                                    {errors.account_inactive_days}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Set to 730 (2 years) to effectively disable this
                                rule.
                            </p>
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
                        <Save className="h-4 w-4" /> Save Account Settings
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
