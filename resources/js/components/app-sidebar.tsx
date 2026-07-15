import { Link, router } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    BookOpen,
    BrainCircuit,
    ClipboardList,
    CreditCard,
    FileText,
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'view dashboard',
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

const registrarNavItems: NavItem[] = [
    {
        title: 'Registrar Hub',
        href: '/registrar',
        icon: GraduationCap,
        permission: 'manage students',
        iconClassName: 'text-indigo-500 dark:text-indigo-400',
    },
    {
        title: 'Students',
        href: '/registrar/students',
        icon: Users,
        permission: 'manage students',
        iconClassName: 'text-indigo-500 dark:text-indigo-400',
    },
    {
        title: 'Sections',
        href: '/registrar/sections',
        icon: Layers,
        permission: 'manage sections',
        iconClassName: 'text-indigo-500 dark:text-indigo-400',
    },
    {
        title: 'Enrollments',
        href: '/registrar/enrollments',
        icon: BookOpen,
        permission: 'manage enrollments',
        iconClassName: 'text-indigo-500 dark:text-indigo-400',
    },
];

const cashierNavItems: NavItem[] = [
    {
        title: 'Cashier Hub',
        href: '/cashier',
        icon: Banknote,
        permission: 'manage billing',
        iconClassName: 'text-emerald-500 dark:text-emerald-400',
    },
    {
        title: 'Billing',
        href: '/cashier/billing',
        icon: FileText,
        permission: 'manage billing',
        iconClassName: 'text-emerald-500 dark:text-emerald-400',
    },
    {
        title: 'Payments',
        href: '/cashier/payments',
        icon: CreditCard,
        permission: 'manage payments',
        iconClassName: 'text-emerald-500 dark:text-emerald-400',
    },
    {
        title: 'Receipts',
        href: '/cashier/receipts',
        icon: Receipt,
        permission: 'view receipts',
        iconClassName: 'text-emerald-500 dark:text-emerald-400',
    },
    {
        title: 'Payment History',
        href: '/cashier/payment-history',
        icon: History,
        permission: 'manage payments',
        iconClassName: 'text-emerald-500 dark:text-emerald-400',
    },
];

const studentNavItems: NavItem[] = [
    {
        title: 'Student Hub',
        href: '/student',
        icon: GraduationCap,
        permission: 'view student portal',
        iconClassName: 'text-[#8B0000] dark:text-[#FFD700]',
    },
    {
        title: 'My Enrollments',
        href: '/student/enrollments',
        icon: BookOpen,
        permission: 'view student portal',
        iconClassName: 'text-[#8B0000] dark:text-[#FFD700]',
    },
    {
        title: 'My Billing',
        href: '/student/billing',
        icon: CreditCard,
        permission: 'view student portal',
        iconClassName: 'text-[#8B0000] dark:text-[#FFD700]',
    },
    {
        title: 'Announcements',
        href: '/student/announcements',
        icon: Megaphone,
        permission: 'view announcements',
        iconClassName: 'text-[#8B0000] dark:text-[#FFD700]',
    },
    {
        title: 'Notifications',
        href: '/student/notifications',
        icon: Bell,
        permission: 'view notifications',
        iconClassName: 'text-[#8B0000] dark:text-[#FFD700]',
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'School Overview',
        href: '/admin/overview',
        icon: LayoutDashboard,
        permission: 'view school overview',
        iconClassName: 'text-violet-500 dark:text-violet-400',
    },
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
    {
        title: 'Announcements',
        href: '/admin/announcements',
        icon: Megaphone,
        permission: 'manage announcements',
        iconClassName: 'text-violet-500 dark:text-violet-400',
    },
    {
        title: 'Risk Analytics',
        href: '/admin/risk-analytics',
        icon: BrainCircuit,
        permission: 'view risk analytics',
        iconClassName: 'text-rose-500 dark:text-rose-400',
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
            </SidebarFooter>
        </Sidebar>
    );
}
