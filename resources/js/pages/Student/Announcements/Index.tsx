import { Megaphone } from 'lucide-react';
import { EmptyState } from '@/components/school/empty-state';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { Card, CardContent } from '@/components/ui/card';

type Announcement = {
    id: number;
    title: string;
    message: string;
    created_by: string | null;
    created_at: string | null;
};

type Props = { announcements: Announcement[] };

export default function Index({ announcements }: Props) {
    return (
        <ModuleShell title="Announcements" breadcrumbs={[{ title: 'Student Portal', href: '/student' }, { title: 'Announcements', href: '/student/announcements' }]}>
            <PageHeader title="Announcements" description="Stay updated with the latest school news and notices." icon={Megaphone} accent="blue" />
            {announcements.length === 0 ? (
                <EmptyState icon={Megaphone} title="No announcements" description="Check back later for school updates." />
            ) : (
                <div className="grid gap-4">
                    {announcements.map((a) => (
                        <Card key={a.id} className="rounded-2xl border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold">{a.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.message}</p>
                                <p className="mt-4 text-xs text-muted-foreground">{a.created_at} · Posted by {a.created_by}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Student Portal', href: '/student' }, { title: 'Announcements', href: '/student/announcements' }]);
