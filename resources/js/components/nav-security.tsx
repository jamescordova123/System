import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Shield } from 'lucide-react';
import React from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/usePermission';

const securitySubItems = [
    {
        title: 'Overview',
        href: '/admin/security',
        match: (url: string) => url === '/admin/security',
    },
    {
        title: 'Password Policy',
        href: '/admin/security/password',
        match: (url: string) => url.startsWith('/admin/security/password'),
    },
    {
        title: 'Sessions & Lockout',
        href: '/admin/security/sessions',
        match: (url: string) => url.startsWith('/admin/security/sessions'),
    },
    {
        title: 'MFA & Access',
        href: '/admin/security/access',
        match: (url: string) => url.startsWith('/admin/security/access'),
    },
    {
        title: 'Account Lifecycle',
        href: '/admin/security/accounts',
        match: (url: string) => url.startsWith('/admin/security/accounts'),
    },
    {
        title: 'Audit & Alerts',
        href: '/admin/security/audit',
        match: (url: string) => url.startsWith('/admin/security/audit'),
    },
    {
        title: 'Performance Logs',
        href: '/pulse',
        match: (url: string) => url.startsWith('/pulse'),
        external: true,
    },
];

export function NavSecurity() {
    const { hasRole } = usePermission();
    const { url } = usePage();

    if (!hasRole('Super-Admin')) return null;

    const isAnySecurityActive = url.startsWith('/admin/security');
    const [open, setOpen] = React.useState(isAnySecurityActive);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Security</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible open={open} onOpenChange={setOpen} asChild>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                tooltip={{ children: 'Security Settings' }}
                                isActive={isAnySecurityActive}
                                className="cursor-pointer"
                            >
                                <Shield className="text-rose-500 dark:text-rose-400" />
                                <span>Security Settings</span>
                                <ChevronRight
                                    className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                        open ? 'rotate-90' : ''
                                    }`}
                                />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {securitySubItems.map((item) => (
                                    <SidebarMenuSubItem key={item.href}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={item.match(url)}
                                        >
                                            {item.external ? (
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <span>{item.title}</span>
                                                </a>
                                            ) : (
                                                <Link href={item.href} prefetch>
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
