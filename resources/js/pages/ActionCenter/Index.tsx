import { useEffect, useState } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import {
    Check,
    X,
    RotateCcw,
    Trash2,
    Plus,
    ClipboardList,
    Loader2,
    AlertCircle,
    FileText,
    Layers,
    CheckCircle,
    Inbox,
    SendHorizonal,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Auth } from '@/types';
import actionCenter from '@/routes/action-center';

// ---------- Types ----------

type ActionRequestAttachment = {
    id: number;
    name: string;
    url: string;
    size: string;
    mime_type: string;
};

type ActionRequest = {
    id: number;
    requester_id: number;
    action_type: 'delete_request' | 'return_item' | 'accept_transaction';
    status: 'pending' | 'accepted' | 'rejected' | 'returned' | 'deleted';
    reason: string;
    created_at_human: string;
    requester_name: string;
    recipient_name?: string;
    recipient_id?: number;
    sensitive_tracking_data?: string;
    attachments: ActionRequestAttachment[];
};

type UserDropdownItem = {
    id: number;
    name: string;
    email: string;
};

// ---------- Sub-components ----------

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'pending':
            return (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 animate-pulse">
                    Pending
                </Badge>
            );
        case 'accepted':
            return (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                    Accepted
                </Badge>
            );
        case 'rejected':
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50">
                    Rejected
                </Badge>
            );
        case 'returned':
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50">
                    Returned
                </Badge>
            );
        case 'deleted':
            return (
                <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950/20 dark:text-neutral-400 dark:border-neutral-900/50">
                    Deleted
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function AttachmentCell({ attachments }: { attachments: ActionRequestAttachment[] }) {
    if (!attachments || attachments.length === 0) {
        return <span className="text-xs text-muted-foreground/50">No files</span>;
    }
    return (
        <div className="flex flex-col gap-1">
            {attachments.map((file) => (
                <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline"
                >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-[120px] truncate" title={file.name}>{file.name}</span>
                    <span className="text-[9px] text-muted-foreground/85">({file.size})</span>
                </a>
            ))}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg border-sidebar-border bg-muted/20">
            <Inbox className="h-10 w-10 text-muted-foreground/50 mb-3 stroke-1" />
            <p className="text-sm font-semibold text-foreground">No requests found</p>
            <p className="text-xs text-muted-foreground/80 mt-1">{message}</p>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="border border-sidebar-border bg-sidebar/20 backdrop-blur-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-[11px] text-muted-foreground/80 mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

// ---------- Request Table ----------

interface RequestTableProps {
    requests: ActionRequest[];
    authUserId: number;              // current logged-in user — used to block self-approval
    showAdminActions: boolean;       // can accept/reject/return
    showRequesterCol: boolean;       // show "Requester" column (incoming queue)
    showRecipientCol: boolean;       // show "Recipient" column (my requests)
    showSensitiveCol: boolean;       // admins only
    showDeleteBtn: boolean;          // Super-Admin only
    emptyMessage: string;
    onUpdateStatus: (id: number, status: 'accepted' | 'rejected' | 'returned' | 'deleted') => void;
    onDelete: (id: number) => void;
}

function RequestTable({
    requests,
    authUserId,
    showAdminActions,
    showRequesterCol,
    showRecipientCol,
    showSensitiveCol,
    showDeleteBtn,
    emptyMessage,
    onUpdateStatus,
    onDelete,
}: RequestTableProps) {
    if (requests.length === 0) return <EmptyState message={emptyMessage} />;

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">ID</TableHead>
                        <TableHead>Type</TableHead>
                        {showRequesterCol && <TableHead>Requester</TableHead>}
                        {showRecipientCol && <TableHead>Sent To</TableHead>}
                        <TableHead>Reason</TableHead>
                        <TableHead>Attachments</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        {showSensitiveCol && <TableHead>Sensitive Data</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="font-mono text-xs">{request.id}</TableCell>
                            <TableCell>
                                <span className="font-semibold capitalize">
                                    {request.action_type.replace(/_/g, ' ')}
                                </span>
                            </TableCell>
                            {showRequesterCol && <TableCell>{request.requester_name}</TableCell>}
                            {showRecipientCol && (
                                <TableCell>{request.recipient_name || 'System'}</TableCell>
                            )}
                            <TableCell className="max-w-xs truncate" title={request.reason}>
                                {request.reason}
                            </TableCell>
                            <TableCell>
                                <AttachmentCell attachments={request.attachments} />
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={request.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {request.created_at_human}
                            </TableCell>
                            {showSensitiveCol && (
                                <TableCell className="font-mono text-xs max-w-xs truncate text-rose-600 dark:text-rose-400">
                                    {request.sensitive_tracking_data || (
                                        <span className="text-muted-foreground/50 font-normal">None</span>
                                    )}
                                </TableCell>
                            )}
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    {/* Only show action buttons if:
                                        1. This tab has actions enabled (showAdminActions)
                                        2. The request is still pending
                                        3. The current user is NOT the one who submitted it */}
                                    {showAdminActions &&
                                        request.status === 'pending' &&
                                        request.requester_id !== authUserId && (
                                        <>
                                            <Button
                                                onClick={() => onUpdateStatus(request.id, 'accepted')}
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
                                                title="Accept Request"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => onUpdateStatus(request.id, 'rejected')}
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                                                title="Reject Request"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => onUpdateStatus(request.id, 'returned')}
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer"
                                                title="Return Request"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    {showDeleteBtn && (
                                        <Button
                                            onClick={() => onDelete(request.id)}
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                                            title="Delete Request Log"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ---------- Main Page ----------

export default function Index() {
    const { auth, incomingRequests, myRequests, users } = usePage<{
        auth: Auth;
        incomingRequests: { data: ActionRequest[] };
        myRequests: { data: ActionRequest[] };
        users: UserDropdownItem[];
    }>().props;

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const incoming = incomingRequests?.data || [];
    const mine     = myRequests?.data     || [];

    const isAdmin    = auth.user && (auth.roles.includes('Super-Admin') || auth.roles.includes('Manager'));
    const isSuperAdmin = auth.user && auth.roles.includes('Super-Admin');

    // --- Echo real-time: listen on the personal channel so ONLY this user
    //     receives the refresh event when someone sends them a request ---
    useEffect(() => {
        if (!auth.user) return;

        const personalChannel = `App.Models.User.${auth.user.id}`;

        window.Echo.private(personalChannel)
            .listen('.ActionRequestCreated', (e: any) => {
                // Show a toast so the recipient knows immediately
                const type = (e.action_type || '').replace(/_/g, ' ');
                toast.message('📋 New Action Request', {
                    description: `${e.requester?.name ?? 'Someone'} sent you a "${type}" request. Review it in the Request Queue tab.`,
                });

                // Reload only the two table data sets — keeps the current tab active
                router.reload({ only: ['incomingRequests', 'myRequests'], preserveUrl: true });
            });

        return () => {
            // Leave the personal channel when the component unmounts
            window.Echo.leave(personalChannel);
        };
    }, [auth.user?.id]);

    // --- Create form ---
    const createForm = useForm({
        action_type: 'delete_request',
        reason: '',
        actionable_type: 'App\\Models\\User',
        actionable_id: auth.user?.id || 1,
        sensitive_tracking_data: '',
        attachment: null as File | null,
        recipient_id: '',
    });

    const updateForm = useForm({ status: '' });

    const submitCreateRequest = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(actionCenter.requests.store.url(), {
            onSuccess: () => {
                toast.success('Action request submitted successfully!');
                setIsCreateOpen(false);
                createForm.reset();
            },
            onError: (errors) => {
                toast.error(`Validation Failed: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const handleUpdateStatus = (id: number, status: 'accepted' | 'rejected' | 'returned' | 'deleted') => {
        updateForm.setData('status', status);
        updateForm.put(actionCenter.requests.update.url({ actionRequest: id }), {
            onSuccess: () => toast.success(`Request successfully ${status}!`),
            onError: (errors: Record<string, string>) =>
                toast.error('Failed to update request: ' + Object.values(errors).join(', ')),
        });
    };

    const handleDeleteRecord = (id: number) => {
        if (!confirm('Are you sure you want to delete this action request log?')) return;
        router.delete(actionCenter.requests.destroy.url({ actionRequest: id }), {
            onSuccess: () => toast.success('Action request log deleted.'),
            onError: (errors) =>
                toast.error('Deletion failed: ' + Object.values(errors).join(', ')),
        });
    };

    // --- Stats (scoped to incoming for admins, mine for regular users) ---
    const statSource = incoming;
    const totalCount    = statSource.length;
    const pendingCount  = statSource.filter((r) => r.status === 'pending').length;
    const acceptedCount = statSource.filter((r) => r.status === 'accepted').length;
    const rejectedCount = statSource.filter((r) => ['rejected', 'returned'].includes(r.status)).length;

    return (
        <>
            <Head title="Action Center" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 transition-all duration-300">

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Action Center
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isAdmin
                                ? 'Process and manage system requests from all modules.'
                                : 'Submit requests and track their status.'}
                        </p>
                    </div>

                    {/* New Request Dialog */}
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button
                                id="btn-new-action-request"
                                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> New Action Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={submitCreateRequest}>
                                <DialogHeader>
                                    <DialogTitle>Submit Action Request</DialogTitle>
                                    <DialogDescription>
                                        Submit a structured request to a recipient for their action or approval.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {/* Recipient */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="recipient_id">Send To (Recipient)</Label>
                                        <Select
                                            defaultValue={createForm.data.recipient_id}
                                            onValueChange={(val) => createForm.setData('recipient_id', val)}
                                        >
                                            <SelectTrigger id="recipient_id">
                                                <SelectValue placeholder="Search or select recipient..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[250px] overflow-y-auto">
                                                {users?.map((u) => (
                                                    <SelectItem key={u.id} value={u.id.toString()}>
                                                        {u.name} ({u.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.recipient_id && (
                                            <p className="text-xs text-red-500">{createForm.errors.recipient_id}</p>
                                        )}
                                    </div>

                                    {/* Action Type */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="action_type">Action Type</Label>
                                        <Select
                                            defaultValue={createForm.data.action_type}
                                            onValueChange={(val) => createForm.setData('action_type', val)}
                                        >
                                            <SelectTrigger id="action_type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="delete_request">Delete Request</SelectItem>
                                                <SelectItem value="return_item">Return Item</SelectItem>
                                                <SelectItem value="accept_transaction">Accept Transaction</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Reason */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="reason">Reason / Justification</Label>
                                        <Input
                                            id="reason"
                                            value={createForm.data.reason}
                                            onChange={(e) => createForm.setData('reason', e.target.value)}
                                            placeholder="Provide justification (min 10 characters)..."
                                            required
                                        />
                                        {createForm.errors.reason && (
                                            <p className="text-xs text-red-500">{createForm.errors.reason}</p>
                                        )}
                                    </div>

                                    {/* Sensitive Data */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="sensitive_tracking_data">Sensitive Data (Optional)</Label>
                                        <Input
                                            id="sensitive_tracking_data"
                                            value={createForm.data.sensitive_tracking_data}
                                            onChange={(e) =>
                                                createForm.setData('sensitive_tracking_data', e.target.value)
                                            }
                                            placeholder="Tracking codes or credentials (visible to admins only)..."
                                        />
                                    </div>

                                    {/* Attachment */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="attachment">Attachment (Optional)</Label>
                                        <Input
                                            id="attachment"
                                            type="file"
                                            onChange={(e) =>
                                                createForm.setData('attachment', e.target.files?.[0] || null)
                                            }
                                            className="cursor-pointer"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Allowed: JPG, PNG, WEBP, GIF, PDF, DOCX, XLSX, TXT (Max 10MB)
                                        </p>
                                        {createForm.errors.attachment && (
                                            <p className="text-xs text-red-500">{createForm.errors.attachment}</p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {createForm.processing && (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        )}
                                        <SendHorizonal className="mr-1.5 h-3.5 w-3.5" />
                                        Submit Request
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* ── Summary Stat Cards (based on incoming queue) ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Incoming"
                        value={totalCount}
                        subtitle={isAdmin ? 'All system requests' : 'Requests sent to you'}
                        icon={<Layers className="h-4 w-4 text-violet-500" />}
                    />
                    <StatCard
                        title="Pending Review"
                        value={pendingCount}
                        subtitle="Needs your action"
                        icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
                    />
                    <StatCard
                        title="Accepted"
                        value={acceptedCount}
                        subtitle="Successfully resolved"
                        icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
                    />
                    <StatCard
                        title="Rejected / Returned"
                        value={rejectedCount}
                        subtitle="Sent back or rejected"
                        icon={<X className="h-4 w-4 text-red-500" />}
                    />
                </div>

                {/* ── Two-Tab Table ── */}
                <Tabs defaultValue="queue" className="w-full">
                    <TabsList className="mb-4 h-10">
                        <TabsTrigger value="queue" id="tab-request-queue" className="flex items-center gap-2 cursor-pointer">
                            <ClipboardList className="h-4 w-4" />
                            Request Queue
                            {pendingCount > 0 && (
                                <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-amber-500 text-white border-0">
                                    {pendingCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="mine" id="tab-my-requests" className="flex items-center gap-2 cursor-pointer">
                            <SendHorizonal className="h-4 w-4" />
                            My Requests
                            {mine.filter((r) => r.status === 'pending').length > 0 && (
                                <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-indigo-500 text-white border-0">
                                    {mine.filter((r) => r.status === 'pending').length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* ── TAB 1: Request Queue (requests addressed TO me / all for admins) ── */}
                    <TabsContent value="queue">
                        <Card className="border border-sidebar-border/80">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <ClipboardList className="h-5 w-5 text-indigo-500" />
                                    Request Queue
                                </CardTitle>
                                <CardDescription>
                                    {isAdmin
                                        ? 'All requests submitted across the system. Accept, reject, or return as needed.'
                                        : 'Requests that other users have sent to you for your action or approval.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RequestTable
                                    requests={incoming}
                                    authUserId={auth.user?.id ?? 0}
                                    showAdminActions={true}
                                    showRequesterCol={true}
                                    showRecipientCol={false}
                                    showSensitiveCol={!!isAdmin}
                                    showDeleteBtn={!!isSuperAdmin}
                                    emptyMessage={
                                        isAdmin
                                            ? 'No requests have been submitted yet.'
                                            : 'No one has sent you a request yet.'
                                    }
                                    onUpdateStatus={handleUpdateStatus}
                                    onDelete={handleDeleteRecord}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── TAB 2: My Requests (requests I submitted) ── */}
                    <TabsContent value="mine">
                        <Card className="border border-sidebar-border/80">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <SendHorizonal className="h-5 w-5 text-indigo-500" />
                                    My Requests
                                </CardTitle>
                                <CardDescription>
                                    All requests you have submitted. Track their current status here.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RequestTable
                                    requests={mine}
                                    authUserId={auth.user?.id ?? 0}
                                    showAdminActions={false}
                                    showRequesterCol={false}
                                    showRecipientCol={true}
                                    showSensitiveCol={false}
                                    showDeleteBtn={!!isSuperAdmin}
                                    emptyMessage="You haven't submitted any requests yet. Use the New Action Request button above!"
                                    onUpdateStatus={handleUpdateStatus}
                                    onDelete={handleDeleteRecord}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => page;
