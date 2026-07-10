import AppLogoDynamic from '@/components/app-logo-dynamic';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { branding } = usePage().props as any;
    const appName = branding?.app_name || 'Laravel Starter Kit';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoDynamic
                    className="size-full object-cover"
                    iconClassName="size-5 fill-current text-white dark:text-black"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {appName}
                </span>
            </div>
        </>
    );
}
