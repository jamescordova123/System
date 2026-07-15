import { AnnouncementCard, type Announcement } from '@/components/announcements/announcement-card';
import { Pagination, type LinkItem } from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';

type PaginatedAnnouncements = {
    data: Announcement[];
    links: LinkItem[];
    from: number | null;
    to: number | null;
    total: number;
};

type AnnouncementListProps = {
    announcements: PaginatedAnnouncements;
    onEdit: (announcement: Announcement) => void;
    onDelete: (announcement: Announcement) => void;
};

export function AnnouncementList({ announcements, onEdit, onDelete }: AnnouncementListProps) {
    return (
        <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm">
            <CardContent className="grid gap-4 p-4 sm:p-6">
                {announcements.data.map((announcement) => (
                    <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </CardContent>

            <Pagination
                links={announcements.links}
                from={announcements.from}
                to={announcements.to}
                total={announcements.total}
            />
        </Card>
    );
}
