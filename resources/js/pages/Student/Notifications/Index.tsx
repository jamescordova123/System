import { router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Notification = {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string | null;
};

type Props = { notifications: Notification[] };

export default function Index({ notifications }: Props) {
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const markRead = (id: number) => {
        router.post(`/student/notifications/${id}/read`);
    };

    const markAllRead = () => {
        router.post('/student/notifications/read-all');
    };

    return (
        <ModuleShell title="Notifications" breadcrumbs={[{ title: 'Student Portal', href: '/student' }, { title: 'Notifications', href: '/student/notifications' }]}>
            <PageHeader
                title="Notifications"
                description="Your personal notification feed from the school."
                icon={Bell}
                accent="blue"
                actions={
                    unreadCount > 0 ? (
                        <Button variant="outline" className="rounded-xl" onClick={markAllRead}>
                            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
                        </Button>
                    ) : undefined
                }
            />
            {notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <Card key={n.id} className={`rounded-2xl transition-all ${!n.is_read ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
                            <CardContent className="flex items-start justify-between gap-4 pt-6">
                                <div className="flex-1">
                                    <h4 className="font-semibold">{n.title}</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">{n.created_at}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={n.is_read ? 'read' : 'unread'} />
                                    {!n.is_read && (
                                        <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => markRead(n.id)}>
                                            Mark read
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Student Portal', href: '/student' }, { title: 'Notifications', href: '/student/notifications' }]);
