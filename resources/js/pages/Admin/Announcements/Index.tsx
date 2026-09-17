import { useState, useMemo } from 'react';
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

type StudentItem = {
    id: number;
    name: string;
    email: string;
    student_number: string;
};

type Props = {
    announcements: PaginatedData;
    stats: { total: number };
    students: StudentItem[];
};

const emptyForm = { title: '', message: '', notify_students: true, recipient_emails: '' };

export default function Index({ announcements, stats, students = [] }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Announcement | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const [studentSearch, setStudentSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredStudents = useMemo(() => {
        const term = studentSearch.trim().toLowerCase();
        if (!term) return [];
        return students.filter(s => 
            s.name.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term) ||
            s.student_number.toLowerCase().includes(term)
        ).slice(0, 5);
    }, [students, studentSearch]);

    const handleAddEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const parts = value.split(/[\s,;]+/).map(p => p.trim()).filter(Boolean);
        const validEmails: string[] = [];
        
        parts.forEach(part => {
            if (emailRegex.test(part)) {
                validEmails.push(part);
            }
        });

        if (validEmails.length > 0) {
            const current = data.recipient_emails.split(',').map(e => e.trim()).filter(Boolean);
            const updated = [...current];
            validEmails.forEach(email => {
                if (!updated.includes(email)) {
                    updated.push(email);
                }
            });
            setData('recipient_emails', updated.join(', '));
            setStudentSearch('');
            setShowSuggestions(false);
            toast.success(`Added ${validEmails.length} email(s).`);
        } else {
            toast.error('Please enter a valid email address.');
        }
    };

    const handleSelectStudent = (student: StudentItem) => {
        const current = data.recipient_emails.split(',').map(e => e.trim()).filter(Boolean);
        if (!current.includes(student.email)) {
            const updated = [...current, student.email];
            setData('recipient_emails', updated.join(', '));
        }
        setStudentSearch('');
        setShowSuggestions(false);
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        const current = data.recipient_emails.split(',').map(e => e.trim()).filter(Boolean);
        const updated = current.filter(e => e !== emailToRemove);
        setData('recipient_emails', updated.join(', '));
    };

    const currentEmails = useMemo(() => {
        return data.recipient_emails.split(',').map(e => e.trim()).filter(Boolean);
    }, [data.recipient_emails]);

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
                            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox id="notify_students" checked={data.notify_students} onCheckedChange={(c) => setData('notify_students', !!c)} />
                                    <Label htmlFor="notify_students" className="text-sm font-semibold">Email all students</Label>
                                </div>
                                
                                {!data.notify_students && (
                                    <div className="space-y-3 pt-2 border-t border-border/40">
                                        <div className="relative">
                                            <Label htmlFor="student_search" className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                                Select Recipients
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="student_search"
                                                    value={studentSearch}
                                                    onChange={(e) => {
                                                        setStudentSearch(e.target.value);
                                                        setShowSuggestions(true);
                                                    }}
                                                    onFocus={() => setShowSuggestions(true)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddEmail(studentSearch);
                                                        }
                                                    }}
                                                    placeholder="Search student by name/email or type custom email..."
                                                    className="rounded-xl flex-1 text-sm h-10"
                                                />
                                                <Button 
                                                    type="button" 
                                                    onClick={() => handleAddEmail(studentSearch)}
                                                    variant="secondary"
                                                    className="rounded-xl h-10 px-4"
                                                >
                                                    Add
                                                </Button>
                                            </div>

                                            {showSuggestions && filteredStudents.length > 0 && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                                                    <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                        {filteredStudents.map(student => (
                                                            <button
                                                                key={student.id}
                                                                type="button"
                                                                onClick={() => handleSelectStudent(student)}
                                                                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-xs flex justify-between items-center border-b border-border/30 last:border-b-0"
                                                            >
                                                                <div>
                                                                    <span className="font-semibold">{student.name}</span>
                                                                    <span className="text-muted-foreground ml-2">({student.student_number})</span>
                                                                </div>
                                                                <span className="text-muted-foreground text-[10px]">{student.email}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                                Recipient List ({currentEmails.length})
                                            </Label>
                                            {currentEmails.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">No recipients selected yet. Announcements will only be sent to those added below.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-border/40 rounded-xl bg-background/50">
                                                    {currentEmails.map(email => {
                                                        const match = students.find(s => s.email === email);
                                                        return (
                                                            <div 
                                                                key={email} 
                                                                className="flex items-center gap-1 bg-[#800000]/10 dark:bg-[#FFD700]/10 text-[#800000] dark:text-[#FFD700] px-2.5 py-1 rounded-full text-xs font-semibold border border-[#800000]/20 dark:border-[#FFD700]/20"
                                                            >
                                                                <span>{match ? `${match.name} (${email})` : email}</span>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemoveEmail(email)} 
                                                                    className="hover:text-red-500 dark:hover:text-red-400 font-bold ml-1 focus:outline-none"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
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
