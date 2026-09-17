import { usePage } from '@inertiajs/react';
import AppLogoDynamic from '@/components/app-logo-dynamic';

export default function AppLogo() {
    const { branding } = usePage().props as { branding?: { app_name?: string; system_logo?: string } };
    const appName = branding?.app_name || 'DILTrack';

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-lg border border-sidebar-primary/30 bg-white/10 shadow-sm">
                {branding?.system_logo ? (
                    <AppLogoDynamic
                        className="size-full object-contain p-0.5"
                        iconClassName="size-5 fill-current text-sidebar-primary"
                    />
                ) : (
                    <img
                        src="/images/diltc/crest.png"
                        alt="DILTrack crest"
                        className="size-full object-contain p-0.5"
                    />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-sidebar-foreground">
                    {appName}
                </span>
                <span className="truncate text-[10px] font-medium tracking-wide text-sidebar-primary/80 uppercase">
                    Academic Portal
                </span>
            </div>
        </>
    );
}
