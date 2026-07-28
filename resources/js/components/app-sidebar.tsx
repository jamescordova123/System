import { Link, router } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    BookOpen,
    BrainCircuit,
    ClipboardList,
    CreditCard,
    GraduationCap,
    History,
    LayoutDashboard,
    LayoutGrid,
    Layers,
    LogOut,
    Megaphone,
    MessageSquare,
    Receipt,
    ShieldAlert,
    Users,
    Wallet,
} from 'lucide-react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavSecurity } from '@/components/nav-security';
import { logout } from '@/routes';
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

const platformHiddenRoles = ['Admin', 'Registrar', 'Student', 'Cashier'];

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'view dashboard',
        hideForRoles: platformHiddenRoles,
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageSquare,
        hideForRoles: platformHiddenRoles,
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Action Center',
        href: '/action-center',
        icon: ClipboardList,
        hideForRoles: platformHiddenRoles,
        iconClassName: 'text-sidebar-primary',
    },
];

const registrarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/registrar',
        icon: GraduationCap,
        permission: 'manage students',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Students',
        href: '/registrar/students',
        icon: Users,
        permission: 'manage students',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Sections',
        href: '/registrar/sections',
        icon: Layers,
        permission: 'manage sections',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Enrollments',
        href: '/registrar/enrollments',
        icon: BookOpen,
        permission: 'manage enrollments',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Online Applications',
        href: '/registrar/online-applications',
        icon: ClipboardList,
        permission: 'manage enrollments',
        iconClassName: 'text-sidebar-primary',
    },
];

const cashierNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/cashier',
        icon: Banknote,
        permission: 'manage billing',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Student Fees',
        href: '/cashier/student-fees',
        icon: Wallet,
        permission: 'manage billing',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Payments',
        href: '/cashier/payments',
        icon: CreditCard,
        permission: 'manage payments',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Receipts',
        href: '/cashier/receipts',
        icon: Receipt,
        permission: 'view receipts',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Risk Analytics',
        href: '/cashier/risk-analytics',
        icon: BrainCircuit,
        permission: 'manage billing',
        iconClassName: 'text-sidebar-primary',
    },
];

const studentNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/student',
        icon: GraduationCap,
        permission: 'view student portal',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'My Enrollments',
        href: '/student/enrollments',
        icon: BookOpen,
        permission: 'view student portal',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'My Information',
        href: '/student/profile',
        icon: Users,
        permission: 'view student portal',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'My Billing',
        href: '/student/billing',
        icon: Wallet,
        permission: 'view student portal',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Transaction History',
        href: '/student/transactions',
        icon: History,
        permission: 'view student portal',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Notifications',
        href: '/student/notifications',
        icon: Bell,
        permission: 'view notifications',
        iconClassName: 'text-sidebar-primary',
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'School Overview',
        href: '/admin/overview',
        icon: LayoutDashboard,
        permission: 'view school overview',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        permission: 'manage users',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Roles & Permissions',
        href: '/roles',
        icon: ShieldAlert,
        permission: 'manage roles',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Announcements',
        href: '/admin/announcements',
        icon: Megaphone,
        permission: 'manage announcements',
        iconClassName: 'text-sidebar-primary',
    },
    {
        title: 'Risk Analytics',
        href: '/admin/risk-analytics',
        icon: BrainCircuit,
        permission: 'view risk analytics',
        iconClassName: 'text-sidebar-primary',
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
                <NavMain items={registrarNavItems} label="Registrar" />
                <NavMain items={cashierNavItems} label="Cashier" />
                <NavMain items={studentNavItems} label="Student" />
                <NavMain items={adminNavItems} label="Administration" />
                <NavSecurity />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-primary"
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
            </SidebarFooter>
        </Sidebar>
    );
}
