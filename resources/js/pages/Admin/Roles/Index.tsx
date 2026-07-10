import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
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
    Shield,
    ShieldAlert,
    Key,
    Plus,
    Trash2,
    Edit3,
    Lock,
    Check,
    X,
    Info,
} from 'lucide-react';

import { Pagination, LinkItem } from '@/components/Pagination';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    roles: {
        data: Role[];
        links: LinkItem[];
        from: number | null;
        to: number | null;
        total: number;
    };
    permissions: Permission[];
}

export default function Index({ roles, permissions }: Props) {
    const [editingRole, setEditingRole] = useState<Role | null>(null);

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
        permissions: [] as string[],
    });

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.name),
        });
    };

    const handleCancel = () => {
        setEditingRole(null);
        reset();
    };

    const handleCheckboxChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permissionName),
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            put(`/roles/${editingRole.id}`, {
                onSuccess: () => {
                    setEditingRole(null);
                    reset();
                },
            });
        } else {
            post('/roles', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            destroy(`/roles/${id}`);
        }
    };

    const totalRoles = roles.total;
    const totalPermissions = permissions.length;

    return (
        <div className="max-w-full space-y-8 p-8">
            {/* Header section */}
            <div className="flex flex-col gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-3xl font-extrabold tracking-tight text-foreground">
                        Role Security Console
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Define high-level authorization roles and map security
                        capabilities directly to access keys.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2 shadow-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            {totalRoles} Roles
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2 shadow-sm">
                        <Key className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-foreground">
                            {totalPermissions} Capabilities
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
                {/* Roles Table */}
                <div className="space-y-6 xl:col-span-2">
                    <Card className="overflow-hidden border border-border/40 bg-card/50 shadow-sm backdrop-blur-md">
                        <CardHeader className="border-b border-border/30 bg-muted/20 px-6 py-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />{' '}
                                    Security Profiles
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Manage role permissions. System roles govern
                                    access control parameters.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="border-b border-border/30 hover:bg-transparent">
                                        <TableHead className="w-[30%] pl-6">
                                            Role Profile
                                        </TableHead>
                                        <TableHead className="w-[55%]">
                                            Active System Permissions
                                        </TableHead>
                                        <TableHead className="w-[15%] pr-6 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.data.map((role) => {
                                        const isSuperAdmin =
                                            role.name === 'Super-Admin';
                                        const isManager =
                                            role.name === 'Manager';

                                        return (
                                            <TableRow
                                                key={role.id}
                                                className="border-b border-border/20 transition-all duration-200 hover:bg-muted/30"
                                            >
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`rounded-lg border p-1.5 ${
                                                                isSuperAdmin
                                                                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                    : isManager
                                                                      ? 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                      : 'border-border bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            <Shield className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-semibold text-foreground">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {isSuperAdmin ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                                <Lock className="h-3 w-3" />{' '}
                                                                All Capabilities
                                                                (Bypassed)
                                                            </span>
                                                        ) : role.permissions
                                                              .length === 0 ? (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                No Permissions
                                                                mapped
                                                            </span>
                                                        ) : (
                                                            role.permissions.map(
                                                                (p) => (
                                                                    <span
                                                                        key={
                                                                            p.id
                                                                        }
                                                                        className="rounded-full border border-border/80 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                                                                    >
                                                                        {p.name}
                                                                    </span>
                                                                ),
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 pr-6 text-right">
                                                    {isSuperAdmin ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-muted-foreground opacity-60">
                                                            <Lock className="h-3.5 w-3.5" />{' '}
                                                            Immutable
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        role,
                                                                    )
                                                                }
                                                                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                title="Edit Role"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        role.id,
                                                                    )
                                                                }
                                                                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                title="Delete Role"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <Pagination
                                links={roles.links}
                                from={roles.from}
                                to={roles.to}
                                total={roles.total}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Form Card Panel */}
                <div className="sticky top-6">
                    <Card className="border border-border/40 bg-card/60 shadow-md backdrop-blur-md">
                        <CardHeader className="border-b border-border/30 bg-muted/10">
                            <CardTitle className="text-md flex items-center gap-2 font-bold">
                                <Plus className="h-5 w-5 text-muted-foreground" />
                                {editingRole
                                    ? 'Edit Security Role'
                                    : 'Create Security Role'}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {editingRole
                                    ? 'Modify role title and associated capabilities.'
                                    : 'Register a new role key mapping.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Role Title
                                    </label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g. Editor, Moderator"
                                        className="h-10 rounded-lg border-border/80 bg-card pl-3 focus:border-primary/50 focus:ring-0"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Map Permissions Capabilities
                                    </label>
                                    <div className="max-h-60 space-y-2.5 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-3.5">
                                        {permissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="group flex cursor-pointer items-center space-x-3"
                                            >
                                                <Checkbox
                                                    id={`perm-${permission.id}`}
                                                    checked={data.permissions.includes(
                                                        permission.name,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleCheckboxChange(
                                                            permission.name,
                                                            !!checked,
                                                        )
                                                    }
                                                    className="rounded border-border/90 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                                />
                                                <label
                                                    htmlFor={`perm-${permission.id}`}
                                                    className="flex cursor-pointer items-center gap-1.5 text-sm leading-none font-medium text-foreground/80 select-none group-hover:text-foreground"
                                                >
                                                    <Key className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                    {permission.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.permissions && (
                                        <p className="text-xs text-destructive">
                                            {errors.permissions}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-10 w-full rounded-lg shadow-sm transition-all duration-200 hover:shadow"
                                    >
                                        {editingRole
                                            ? 'Update Profile'
                                            : 'Create Role'}
                                    </Button>
                                    {editingRole && (
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
            </div>
        </div>
    );
}
