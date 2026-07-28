import { router } from '@inertiajs/react';
import { Bell, CheckCheck, Megaphone } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatusBadge } from '@/components/school/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Notification = {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string | null;
};

type Announcement = {
    id: number;
    title: string;
    message: string;
    created_by: string | null;
    created_at: string | null;
};

type Props = {
    notifications: Notification[];
    announcements: Announcement[];
};

export default function Index({ notifications, announcements }: Props) {
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const markRead = (id: number) => {
        router.post(`/student/notifications/${id}/read`);
    };

    const markAllRead = () => {
        router.post('/student/notifications/read-all');
    };

    return (
        <ModuleShell
            title="Notifications"
            breadcrumbs={[
                { title: 'Student Portal', href: '/student' },
                { title: 'Notifications', href: '/student/notifications' },
            ]}
        >
            <PageHeader
                title="Notifications & Announcements"
                description="Personal alerts and school-wide announcements in one place."
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

            <Tabs defaultValue="inbox" className="w-full">
                <TabsList>
                    <TabsTrigger value="inbox">
                        <Bell className="mr-1.5 h-4 w-4" />
                        My Inbox
                        {unreadCount > 0 && (
                            <span className="ml-2 rounded-full bg-[#800000] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="announcements">
                        <Megaphone className="mr-1.5 h-4 w-4" />
                        School Announcements
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="mt-4">
                    {notifications.length === 0 ? (
                        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((n) => (
                                <Card
                                    key={n.id}
                                    className={`rounded-2xl transition-all ${!n.is_read ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
                                >
                                    <CardContent className="flex items-start justify-between gap-4 pt-6">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{n.title}</h4>
                                            <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                                            <p className="mt-2 text-xs text-muted-foreground">{n.created_at}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <StatusBadge status={n.is_read ? 'read' : 'unread'} />
                                            {!n.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl text-xs"
                                                    onClick={() => markRead(n.id)}
                                                >
                                                    Mark read
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="announcements" className="mt-4">
                    {announcements.length === 0 ? (
                        <EmptyState
                            icon={Megaphone}
                            title="No announcements"
                            description="Check back later for school updates."
                        />
                    ) : (
                        <div className="grid gap-4">
                            {announcements.map((a) => (
                                <Card
                                    key={a.id}
                                    className="rounded-2xl border-l-4 border-l-[#800000] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <CardContent className="pt-6">
                                        <h3 className="text-lg font-semibold">{a.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.message}</p>
                                        <p className="mt-4 text-xs text-muted-foreground">
                                            {a.created_at} · Posted by {a.created_by}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([
    { title: 'Student Portal', href: '/student' },
    { title: 'Notifications', href: '/student/notifications' },
]);
