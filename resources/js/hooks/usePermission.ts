import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

type SharedProps = {
    auth: Auth;
};

export function usePermission() {
    const { auth } = usePage<SharedProps>().props;

    const roles = auth?.roles ?? [];
    const permissions = auth?.permissions ?? [];

    /**
     * Determine if the user has the given role.
     * Super-Admin is automatically granted access.
     */
    const hasRole = (role: string): boolean => {
        return (
            roles.includes(role) ||
            roles.includes('Super-Admin') ||
            roles.includes('Developer')
        );
    };

    /**
     * Determine if the user has the given permission.
     * Super-Admin and Developer are automatically granted access.
     */
    const hasPermission = (permission: string): boolean => {
        return (
            permissions.includes(permission) ||
            roles.includes('Super-Admin') ||
            roles.includes('Developer')
        );
    };

    /**
     * Determine if the user has any of the given permissions.
     * Super-Admin and Developer are automatically granted access.
     */
    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        if (roles.includes('Super-Admin') || roles.includes('Developer'))
            return true;
        return requiredPermissions.some((permission) =>
            permissions.includes(permission),
        );
    };

    return {
        roles,
        permissions,
        hasRole,
        hasPermission,
        hasAnyPermission,
    };
}
