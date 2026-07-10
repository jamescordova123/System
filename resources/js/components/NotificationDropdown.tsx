import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Bell, Check, Loader2, X, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { read, readAll } from '@/routes/notifications';
import type { DatabaseNotification } from '@/types';

export function NotificationDropdown() {
    const { auth } = usePage().props;
    const dbNotifications = auth.unread_notifications || [];

    const [notifications, setNotifications] =
        useState<DatabaseNotification[]>(dbNotifications);
    const [processing, setProcessing] = useState(false);

    // Sync state when Inertia shared props update (e.g. after database updates)
    useEffect(() => {
        setNotifications(dbNotifications);
    }, [dbNotifications]);

    // Set up Echo private channel listener for real-time notifications
    useEffect(() => {
        if (!auth.user) return;

        const channelName = `App.Models.User.${auth.user.id}`;

        // Listen specifically to the private notification channel
        const channel = window.Echo.private(channelName).notification(
            (notification: any) => {
                // Confirm it matches our TransactionNotification payload format
                if (
                    notification.type === 'App\\Notifications\\TransactionNotification' ||
                    notification.type === 'App\\Notifications\\ActionRequestNotification' ||
                    (notification.data && notification.data.status)
                ) {
                    const isTransaction = (notification.type || '').includes('TransactionNotification');
                    const newNotification: DatabaseNotification = {
                        id: notification.id,
                        type:
                            notification.type ||
                            'App\\Notifications\\TransactionNotification',
                        notifiable_type: 'App\\Models\\User',
                        notifiable_id: auth.user.id,
                        data: {
                            id: notification.data?.id || notification.id,
                            amount: notification.data?.amount,
                            currency: notification.data?.currency,
                            status: notification.data?.status || 'success',
                            message:
                                notification.data?.message ||
                                (isTransaction ? 'New transaction received' : 'New request update'),
                            action_request_id: notification.data?.action_request_id,
                            action_type: notification.data?.action_type,
                        },
                        read_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    // Prepend the new notification to the local state instantly
                    setNotifications((prev) =>
                        [newNotification, ...prev].slice(0, 5),
                    );

                    // Fire browser toast alert
                    const toastMessage = newNotification.data.message;
                    const toastDesc = isTransaction
                        ? `${newNotification.data.currency || 'USD'} ${Number(newNotification.data.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} [${newNotification.data.status.toUpperCase()}]`
                        : `Status: ${newNotification.data.status.toUpperCase()}`;

                    if (newNotification.data.status === 'success') {
                        toast.success(toastMessage, { description: toastDesc });
                    } else if (newNotification.data.status === 'failed') {
                        toast.error(toastMessage, { description: toastDesc });
                    } else {
                        toast.info(toastMessage, { description: toastDesc });
                    }
                }
            },
        );

        return () => {
            window.Echo.leave(channelName);
        };
    }, [auth.user]);

    const handleMarkAsRead = (id: string) => {
        if (processing) return;
        setProcessing(true);

        router.post(
            read.url(id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (processing) return;
        setProcessing(true);

        router.post(
            readAll.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const unreadCount = notifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="group relative h-9 w-9 cursor-pointer"
                    aria-label="Notifications"
                >
                    <Bell className="!size-5 opacity-80 transition-transform duration-200 group-hover:rotate-12 group-hover:opacity-100" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 p-0 sm:w-96" align="end">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar/50 p-3 px-4">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={processing}
                            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 focus:outline-hidden disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notification Items */}
                <div className="max-h-[350px] divide-y divide-sidebar-border/60 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <Bell className="mb-2 h-8 w-8 stroke-1 opacity-50" />
                            <p className="text-xs font-medium">
                                You're all caught up!
                            </p>
                            <p className="text-[11px] opacity-75">
                                No transaction updates at the moment.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const data = notification.data;
                            const status = data.status;
                            const timeAgo = formatTimeAgo(
                                notification.created_at,
                            );

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() =>
                                        handleMarkAsRead(notification.id)
                                    }
                                    className="flex cursor-pointer items-start gap-3 p-3.5 px-4 text-left transition-colors hover:bg-muted/50 focus:outline-hidden"
                                >
                                    {/* Dynamic Icon per Status */}
                                    <div className="mt-0.5 flex shrink-0 items-center justify-center">
                                        {status === 'success' && (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500/10 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                <Check className="h-4 w-4 stroke-[3]" />
                                            </div>
                                        )}
                                        {status === 'pending' && (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-2 ring-amber-500/10 dark:bg-amber-950/50 dark:text-amber-400">
                                                <Loader2 className="h-4 w-4 animate-spin stroke-[3]" />
                                            </div>
                                        )}
                                        {status === 'failed' && (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 ring-2 ring-red-500/10 dark:bg-red-950/50 dark:text-red-400">
                                                <X className="h-4 w-4 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content & Metadata */}
                                    <div className="flex-1 space-y-1">
                                        <p className="text-xs leading-snug font-medium text-foreground">
                                            {data.message}
                                        </p>
                                        <div className="flex items-center justify-between gap-2">
                                            {notification.type.includes('TransactionNotification') ? (
                                                <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                                    {Number(
                                                        data.amount ?? 0,
                                                    ).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                    })}{' '}
                                                    {data.currency}
                                                </span>
                                            ) : (
                                                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                    Action Center
                                                </span>
                                            )}
                                            <span className="text-[10px] text-muted-foreground/75">
                                                {timeAgo}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <DropdownMenuSeparator className="m-0" />
                <div className="border-t border-sidebar-border bg-sidebar/10 p-2 text-center">
                    <span className="block text-[10px] font-medium text-muted-foreground">
                        Showing last 5 unread notifications
                    </span>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Format timestamp string into a concise human-readable time-ago string.
 */
function formatTimeAgo(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 5) return 'Just now';

        const intervals = [
            { label: 'y', seconds: 31536000 },
            { label: 'mo', seconds: 2592000 },
            { label: 'd', seconds: 86400 },
            { label: 'h', seconds: 3600 },
            { label: 'm', seconds: 60 },
            { label: 's', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count}${interval.label} ago`;
            }
        }
        return 'Just now';
    } catch (e) {
        return 'recently';
    }
}
