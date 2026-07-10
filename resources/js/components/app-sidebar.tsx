import { Link, router } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardList,
    FolderGit2,
    LayoutGrid,
    LogOut,
    MessageSquare,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavSecurity } from '@/components/nav-security';
import { logout } from '@/routes';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        iconClassName: 'text-blue-500 dark:text-blue-400',
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageSquare,
        iconClassName: 'text-pink-500 dark:text-pink-400',
    },
    {
        title: 'Action Center',
        href: '/action-center',
        icon: ClipboardList,
        iconClassName: 'text-violet-500 dark:text-violet-400',
    },
];

const managerNavItems: NavItem[] = [
    {
        title: 'Edit Articles',
        href: '/manager/articles',
        icon: BookOpen,
        permission: 'edit articles',
        iconClassName: 'text-indigo-500 dark:text-indigo-400',
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        permission: 'manage users',
        iconClassName: 'text-emerald-500 dark:text-emerald-400',
    },
    {
        title: 'Roles & Permissions',
        href: '/roles',
        icon: ShieldAlert,
        role: 'Super-Admin',
        iconClassName: 'text-amber-500 dark:text-amber-400',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
        iconClassName: 'text-violet-500 dark:text-violet-400',
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
        iconClassName: 'text-sky-500 dark:text-sky-400',
    },
];

export function AppSidebar() {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Platform" />
                <NavMain items={managerNavItems} label="Management" />
                <NavMain items={adminNavItems} label="Administration" />
                <NavSecurity />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        >
                            <Link
                                href={logout()}
                                as="button"
                                onClick={handleLogout}
                                data-test="logout-button"
                            >
                                <LogOut />
                                <span>Log out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* <NavUser /> */}
            </SidebarFooter>
        </Sidebar>
    );
}
