import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Megaphone, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AnnouncementList } from '@/components/announcements/announcement-list';
import type { Announcement } from '@/components/announcements/announcement-card';
import { EmptyState } from '@/components/school/empty-state';
import { FormField } from '@/components/school/form-field';
import { ModuleShell, setModuleLayout } from '@/components/school/module-shell';
import { PageHeader } from '@/components/school/page-header';
import { StatCard } from '@/components/school/stat-card';
import type { LinkItem } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PaginatedData = {
    data: Announcement[];
    links: LinkItem[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    announcements: PaginatedData;
    stats: { total: number };
};

const emptyForm = { title: '', message: '', notify_students: true, recipient_emails: '' };

export default function Index({ announcements, stats }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Announcement | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => { setEditing(null); reset(); setOpen(true); };
    const openEdit = (announcement: Announcement) => {
        setEditing(announcement);
        setData({ title: announcement.title, message: announcement.message, notify_students: false, recipient_emails: '' });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: () => { setOpen(false); reset(); setEditing(null); }, onError: () => toast.error('Please fix the form errors.') };
        editing ? put(`/admin/announcements/${editing.id}`, options) : post('/admin/announcements', options);
    };

    const handleDelete = (announcement: Announcement) => {
        if (!confirm(`Delete announcement "${announcement.title}"?`)) return;
        router.delete(`/admin/announcements/${announcement.id}`);
    };

    return (
        <ModuleShell title="Announcements" breadcrumbs={[{ title: 'Administration', href: '/admin/overview' }, { title: 'Announcements', href: '/admin/announcements' }]}>
            <PageHeader 
                title="Manage Announcements" 
                description="Create and broadcast announcements to students and staff." 
                icon={Megaphone} 
                accent="violet" 
                actions={
                    <Button className="rounded-xl bg-[#800000] font-semibold shadow-md shadow-[#800000]/20 hover:bg-[#5d0000] dark:bg-[#FFD700] dark:text-[#5d0000] dark:hover:bg-[#fff3b0]" onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Announcement
                    </Button>
                } 
            />
            
            <StatCard label="Total Announcements" value={stats.total} icon={Megaphone} accent="violet" />
            
            {announcements.data.length === 0 ? (
                <EmptyState 
                    icon={Megaphone} 
                    title="No announcements" 
                    description="Create your first announcement to notify the school community." 
                    action={<Button onClick={openCreate} className="rounded-xl">New Announcement</Button>} 
                />
            ) : (
                <AnnouncementList
                    announcements={announcements}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                />
            )}
            
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-2xl sm:max-w-lg">
                    <DialogHeader><DialogTitle>{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="Title" htmlFor="title" error={errors.title} required>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} className="rounded-xl" placeholder="Announcement title" />
                        </FormField>
                        <FormField label="Message" htmlFor="message" error={errors.message} required>
                            <textarea id="message" value={data.message} onChange={(e) => setData('message', e.target.value)} rows={5} className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" placeholder="Write your announcement..." />
                        </FormField>
                        {!editing && (
                            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox id="notify_students" checked={data.notify_students} onCheckedChange={(c) => setData('notify_students', !!c)} />
                                    <Label htmlFor="notify_students" className="text-sm">Email all students</Label>
                                </div>
                                <FormField label="Or specific email addresses" htmlFor="recipient_emails" error={errors.recipient_emails}>
                                    <textarea
                                        id="recipient_emails"
                                        value={data.recipient_emails}
                                        onChange={(e) => setData('recipient_emails', e.target.value)}
                                        rows={3}
                                        className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        placeholder="student1@school.edu, student2@school.edu"
                                    />
                                    <p className="text-xs text-muted-foreground">Separate multiple emails with commas, spaces, or new lines.</p>
                                </FormField>
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl" disabled={processing}>{editing ? 'Save' : 'Publish'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ModuleShell>
    );
}

Index.layout = setModuleLayout([{ title: 'Administration', href: '/admin/overview' }, { title: 'Announcements', href: '/admin/announcements' }]);
