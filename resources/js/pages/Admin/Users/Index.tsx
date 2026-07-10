import React, { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Users,
    UserPlus,
    Trash2,
    Edit3,
    Mail,
    Shield,
    ShieldCheck,
    Calendar,
    Info,
    X,
    LogIn,
} from 'lucide-react';
import type { Auth } from '@/types';
import { Pagination, LinkItem } from '@/components/Pagination';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: Role[];
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        links: LinkItem[];
        from: number | null;
        to: number | null;
        total: number;
    };
    roles: Role[];
}

const getAvatarStyle = (name: string) => {
    const hash = name
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [0, 30, 150, 200, 260, 320];
    const hue = hues[hash % hues.length];
    return {
        bg: `hsl(${hue}, 85%, 93%)`,
        text: `hsl(${hue}, 85%, 35%)`,
    };
};

export default function Index({ users, roles }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [impersonateTargetUser, setImpersonateTargetUser] =
        useState<User | null>(null);
    const canImpersonate = auth?.roles?.some((r) =>
        ['Super-Admin', 'Developer'].includes(r),
    );

    const handleImpersonate = (user: User) => {
        setImpersonateTargetUser(user);
    };

    const confirmImpersonate = () => {
        if (!impersonateTargetUser) return;

        toast.info(
            `Initializing impersonation for ${impersonateTargetUser.name}...`,
        );

        router.post(
            `/admin/impersonate/${impersonateTargetUser.id}`,
            {},
            {
                onSuccess: () => {
                    toast.success(
                        `Successfully logged in as ${impersonateTargetUser.name}`,
                    );
                    setImpersonateTargetUser(null);
                },
                onError: () => {
                    toast.error('Failed to log in as user.');
                    setImpersonateTargetUser(null);
                },
            },
        );
    };

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
        errors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            roles: user.roles.map((r) => r.name),
        });
    };

    const handleCancel = () => {
        setEditingUser(null);
        reset();
    };

    const handleCheckboxChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData(
                'roles',
                data.roles.filter((r) => r !== roleName),
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    setEditingUser(null);
                    reset();
                },
            });
        } else {
            post('/admin/users', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(`/admin/users/${id}`);
        }
    };

    const totalUsers = users.total;
    const adminCount = users.data.filter((u) =>
        u.roles.some((r) => r.name === 'Super-Admin'),
    ).length;

    return (
        <div className="max-w-full space-y-8 p-8">
            {/* Header section */}
            <div className="flex flex-col gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-3xl font-extrabold tracking-tight text-foreground">
                        User Control Center
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Monitor active accounts, assign access profiles, and
                        enforce organization boundaries.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2 shadow-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            {totalUsers} Total Users
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2 shadow-sm">
                        <Shield className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold text-foreground">
                            {adminCount} Admins
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
                {/* Users List Table */}
                <div className="space-y-6 xl:col-span-2">
                    <Card className="overflow-hidden border border-border/40 bg-card/50 shadow-sm backdrop-blur-md">
                        <CardHeader className="border-b border-border/30 bg-muted/20 px-6 py-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Users className="h-5 w-5 text-muted-foreground" />{' '}
                                    Registered Accounts
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Eager loaded list of active platform users
                                    and roles.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="border-b border-border/30 hover:bg-transparent">
                                        <TableHead className="w-[45%] pl-6">
                                            Profile & Identity
                                        </TableHead>
                                        <TableHead className="w-[30%]">
                                            Security Roles
                                        </TableHead>
                                        <TableHead className="w-[15%]">
                                            Created
                                        </TableHead>
                                        <TableHead className="w-[10%] pr-6 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => {
                                        const initials = user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase();
                                        const avatar = getAvatarStyle(
                                            user.name,
                                        );

                                        return (
                                            <TableRow
                                                key={user.id}
                                                className="border-b border-border/20 transition-all duration-200 hover:bg-muted/30"
                                            >
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-inner"
                                                            style={{
                                                                backgroundColor:
                                                                    avatar.bg,
                                                                color: avatar.text,
                                                            }}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5 truncate font-semibold text-foreground">
                                                                {user.name}
                                                                {user.email_verified_at && (
                                                                    <span
                                                                        title="Email Verified"
                                                                        className="shrink-0"
                                                                    >
                                                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                                                                <Mail className="h-3 w-3 shrink-0 opacity-60" />{' '}
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles.length ===
                                                        0 ? (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                No Roles
                                                                assigned
                                                            </span>
                                                        ) : (
                                                            user.roles.map(
                                                                (r) => {
                                                                    const isSuper =
                                                                        r.name ===
                                                                        'Super-Admin';
                                                                    const isManager =
                                                                        r.name ===
                                                                        'Manager';
                                                                    return (
                                                                        <span
                                                                            key={
                                                                                r.id
                                                                            }
                                                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ${
                                                                                isSuper
                                                                                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 shadow-inner dark:text-amber-400'
                                                                                    : isManager
                                                                                      ? 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                                      : 'border-border/80 bg-muted text-muted-foreground'
                                                                            }`}
                                                                        >
                                                                            <Shield className="h-3 w-3" />
                                                                            {
                                                                                r.name
                                                                            }
                                                                        </span>
                                                                    );
                                                                },
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1 text-xs">
                                                        <Calendar className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                                        {new Date(
                                                            user.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {canImpersonate &&
                                                            auth?.user?.id !==
                                                                user.id &&
                                                            !user.roles.some(
                                                                (r) =>
                                                                    [
                                                                        'Super-Admin',
                                                                        'Developer',
                                                                    ].includes(
                                                                        r.name,
                                                                    ),
                                                            ) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleImpersonate(
                                                                            user,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500"
                                                                    title="Login As User"
                                                                >
                                                                    <LogIn className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                </Button>
                                                            )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleEdit(user)
                                                            }
                                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            title="Edit User"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        {auth?.user?.id !==
                                                        user.id ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        user.id,
                                                                    )
                                                                }
                                                                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <div
                                                                className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground opacity-40 select-none"
                                                                title="You are logged in as this user"
                                                            >
                                                                Self
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <Pagination
                                links={users.links}
                                from={users.from}
                                to={users.to}
                                total={users.total}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Form Card Panel */}
                <div className="sticky top-6">
                    <Card className="border border-border/40 bg-card/60 shadow-md backdrop-blur-md">
                        <CardHeader className="border-b border-border/30 bg-muted/10">
                            <CardTitle className="text-md flex items-center gap-2 font-bold">
                                <UserPlus className="h-5 w-5 text-muted-foreground" />
                                {editingUser
                                    ? 'Edit Identity Details'
                                    : 'Register New Identity'}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {editingUser
                                    ? 'Modify user accounts, credentials, and roles.'
                                    : 'Create a new user with targeted roles.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Full Name
                                    </label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Jane Doe"
                                        className="h-10 rounded-lg border-border/80 bg-card pl-3 focus:border-primary/50 focus:ring-0"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="jane@example.com"
                                        className="h-10 rounded-lg border-border/80 bg-card pl-3 focus:border-primary/50 focus:ring-0"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Security Credentials
                                    </label>
                                    <Input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder={
                                            editingUser
                                                ? '••••••••'
                                                : 'Password (min. 8 chars)'
                                        }
                                        className="h-10 rounded-lg border-border/80 bg-card pl-3 focus:border-primary/50 focus:ring-0"
                                        required={!editingUser}
                                    />
                                    {editingUser && (
                                        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />{' '}
                                            Leave blank to retain current
                                            password.
                                        </p>
                                    )}
                                    {errors.password && (
                                        <p className="text-xs text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Access Permissions Roles
                                    </label>
                                    <div className="max-h-52 space-y-2.5 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-3.5">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className="group flex cursor-pointer items-center space-x-3"
                                            >
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={data.roles.includes(
                                                        role.name,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleCheckboxChange(
                                                            role.name,
                                                            !!checked,
                                                        )
                                                    }
                                                    className="rounded border-border/90 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                                />
                                                <label
                                                    htmlFor={`role-${role.id}`}
                                                    className="flex cursor-pointer items-center gap-1.5 text-sm leading-none font-medium text-foreground/80 select-none group-hover:text-foreground"
                                                >
                                                    <Shield className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                    {role.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.roles && (
                                        <p className="text-xs text-destructive">
                                            {errors.roles}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-10 w-full rounded-lg shadow-sm transition-all duration-200 hover:shadow"
                                    >
                                        {editingUser
                                            ? 'Update Profile'
                                            : 'Register User'}
                                    </Button>
                                    {editingUser && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleCancel}
                                            className="h-10 rounded-lg border border-border/40 hover:bg-muted"
                                        >
                                            <X className="mr-1 h-4 w-4" />{' '}
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                {/* Impersonation Confirmation Modal */}
                <Dialog
                    open={impersonateTargetUser !== null}
                    onOpenChange={(open) =>
                        !open && setImpersonateTargetUser(null)
                    }
                >
                    <DialogContent className="border border-border/40 bg-card/90 shadow-lg backdrop-blur-md sm:max-w-md">
                        <DialogHeader className="flex flex-col items-center sm:items-start">
                            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                                <LogIn className="h-5 w-5 animate-pulse text-amber-500" />
                                Confirm User Impersonation
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-center text-sm text-muted-foreground sm:text-left">
                                You are about to log in as{' '}
                                <strong className="text-foreground">
                                    {impersonateTargetUser?.name}
                                </strong>{' '}
                                (
                                <span className="font-mono text-xs text-foreground/80">
                                    {impersonateTargetUser?.email}
                                </span>
                                ). This action is fully audited. Do you want to
                                proceed?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setImpersonateTargetUser(null)}
                                className="h-10 rounded-lg border border-border/40 hover:bg-muted"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmImpersonate}
                                className="flex h-10 items-center gap-1.5 rounded-lg bg-amber-600 px-5 font-semibold text-white shadow-sm transition-all hover:bg-amber-500 active:scale-[0.98]"
                            >
                                <LogIn className="h-4 w-4" />
                                Proceed to Login
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
