import React from 'react';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Terminal, Save, CheckCircle, Bell, AlertTriangle } from 'lucide-react';

interface SecuritySettings {
    id: number;
    audit_log_retention_days: number;
    log_failed_logins: boolean;
    log_permission_changes: boolean;
    notify_admin_on_breach: boolean;
    notify_admin_email: string | null;
}

interface AuditLog {
    id: number;
    event: string;
    description: string;
    user: string;
    ip: string;
    created_at: string;
}

import { Pagination, LinkItem } from '@/components/Pagination';

interface Props {
    settings: SecuritySettings;
    auditLogs: {
        data: AuditLog[];
        links: LinkItem[];
        from: number | null;
        to: number | null;
        total: number;
    };
}

export default function Audit({ settings, auditLogs }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            audit_log_retention_days: settings.audit_log_retention_days,
            log_failed_logins: settings.log_failed_logins,
            log_permission_changes: settings.log_permission_changes,
            notify_admin_on_breach: settings.notify_admin_on_breach,
            notify_admin_email: settings.notify_admin_email ?? '',
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/security/audit');
    };

    return (
        <div className="mx-auto w-full max-w-full space-y-6 p-8">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                {/* Settings Panel */}
                <div className="space-y-6 lg:col-span-1">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                            <CardHeader className="border-b border-border/30 bg-muted/10">
                                <CardTitle className="text-md flex items-center gap-2 font-bold">
                                    <Terminal className="h-5 w-5 text-muted-foreground" />{' '}
                                    Log Settings
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Choose what events to record.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Retain Logs (days)
                                    </label>
                                    <Input
                                        type="number"
                                        value={data.audit_log_retention_days}
                                        onChange={(e) =>
                                            setData(
                                                'audit_log_retention_days',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        min="30"
                                        max="3650"
                                        className="h-10 rounded-lg border-border/80 bg-card"
                                        required
                                    />
                                    {errors.audit_log_retention_days && (
                                        <p className="text-xs text-destructive">
                                            {errors.audit_log_retention_days}
                                        </p>
                                    )}
                                </div>

                                {[
                                    {
                                        key: 'log_failed_logins' as const,
                                        label: 'Log Failed Login Attempts',
                                    },
                                    {
                                        key: 'log_permission_changes' as const,
                                        label: 'Log Role / Permission Changes',
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
                            </CardContent>
                        </Card>

                        <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
                            <CardHeader className="border-b border-border/30 bg-muted/10">
                                <CardTitle className="text-md flex items-center gap-2 font-bold">
                                    <Bell className="h-5 w-5 text-muted-foreground" />{' '}
                                    Breach Notifications
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Send admin alerts on security events.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="group flex cursor-pointer items-center space-x-3">
                                    <Checkbox
                                        id="notify_admin"
                                        checked={data.notify_admin_on_breach}
                                        onCheckedChange={(v) =>
                                            setData(
                                                'notify_admin_on_breach',
                                                !!v,
                                            )
                                        }
                                        className="rounded border-border/90 data-[state=checked]:bg-primary"
                                    />
                                    <label
                                        htmlFor="notify_admin"
                                        className="cursor-pointer text-sm leading-none font-medium text-foreground/80 select-none group-hover:text-foreground"
                                    >
                                        Notify admin on suspicious events
                                    </label>
                                </div>

                                {data.notify_admin_on_breach && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Alert Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={data.notify_admin_email}
                                            onChange={(e) =>
                                                setData(
                                                    'notify_admin_email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="admin@yourdomain.com"
                                            className="h-10 rounded-lg border-border/80 bg-card"
                                        />
                                        {errors.notify_admin_email && (
                                            <p className="text-xs text-destructive">
                                                {errors.notify_admin_email}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex h-10 items-center gap-2 rounded-lg px-4 shadow-sm"
                            >
                                <Save className="h-4 w-4" /> Save
                            </Button>
                            {recentlySuccessful && (
                                <span className="flex animate-pulse items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-4 w-4" /> Saved!
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                {/* Audit Log */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden border border-border/40 bg-card/60 shadow-md backdrop-blur-md">
                        <CardHeader className="border-b border-border/30 bg-muted/10">
                            <CardTitle className="text-md flex items-center gap-2 font-bold">
                                <Terminal className="h-5 w-5 text-muted-foreground" />{' '}
                                Security Audit Log
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Live list of critical administrative events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/20 hover:bg-transparent">
                                        <TableHead className="text-xs font-semibold">
                                            Event
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold">
                                            Description
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold">
                                            User / IP
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-semibold">
                                            Time
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLogs.data.map((log) => {
                                        const isAlert =
                                            log.event
                                                .toLowerCase()
                                                .includes('failed') ||
                                            log.event
                                                .toLowerCase()
                                                .includes('blocked');
                                        return (
                                            <TableRow
                                                key={log.id}
                                                className="border-border/20 text-xs hover:bg-muted/10"
                                            >
                                                <TableCell>
                                                    <span
                                                        className={`rounded border px-2 py-0.5 font-semibold ${
                                                            isAlert
                                                                ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                : 'border-border/60 bg-muted text-foreground'
                                                        }`}
                                                    >
                                                        {log.event}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-[160px] truncate text-foreground/80">
                                                    {log.description}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-0.5 font-mono text-[10px]">
                                                        <div>{log.user}</div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <AlertTriangle className="h-3 w-3 shrink-0" />{' '}
                                                            {log.ip}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">
                                                    {new Date(
                                                        log.created_at,
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <Pagination
                                links={auditLogs.links}
                                from={auditLogs.from}
                                to={auditLogs.to}
                                total={auditLogs.total}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
