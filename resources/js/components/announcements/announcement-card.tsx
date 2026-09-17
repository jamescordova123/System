import { Calendar, Edit3, Megaphone, MoreVertical, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Announcement = {
    id: number;
    title: string;
    message: string;
    created_by: string | null;
    created_at: string | null;
};

type AnnouncementCardProps = {
    announcement: Announcement;
    onEdit: (announcement: Announcement) => void;
    onDelete: (announcement: Announcement) => void;
};

export function AnnouncementCard({ announcement, onEdit, onDelete }: AnnouncementCardProps) {
    return (
        <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#800000]/25 hover:shadow-xl hover:shadow-[#800000]/10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#800000] via-[#800000] to-[#FFD700]" />

            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#800000] to-[#5d0000] text-[#FFD700] shadow-md shadow-[#800000]/25">
                    <Megaphone className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-2">
                        <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-[#800000] dark:group-hover:text-[#FFD700] sm:text-lg">
                            {announcement.title}
                        </h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {announcement.message}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {announcement.created_by && (
                            <span className="inline-flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                {announcement.created_by}
                            </span>
                        )}
                        {announcement.created_at && (
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {announcement.created_at}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-[#800000]/8 hover:text-[#800000] sm:hidden dark:hover:bg-[#FFD700]/10 dark:hover:text-[#FFD700]"
                        onClick={() => onEdit(announcement)}
                    >
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:hidden"
                        onClick={() => onDelete(announcement)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden h-9 w-9 rounded-lg sm:inline-flex"
                            >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => onEdit(announcement)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(announcement)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}
