import React from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import { Link, usePage } from '@inertiajs/react';
import { login } from '@/routes';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { props } = usePage();
    const { branding } = props as any;
    const appName = branding?.app_name || 'DILTrack';

    return (
        <div className="flex min-h-screen flex-col bg-white text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
            {/* Sticky Public Header */}
            <PublicNavbar />

            {/* Main Content Area */}
            <main className="flex-grow">{children}</main>

            {/* Minimal Institutional Footer */}
            <footer className="border-t border-[#800000]/10 bg-[#fdf9f2] text-zinc-600 transition-colors duration-300 dark:border-[#FFD700]/10 dark:bg-zinc-950 dark:text-zinc-400">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
                        <div className="flex items-center gap-3">
                            <div className="flex aspect-square h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#800000]/15 bg-white dark:border-[#FFD700]/15">
                                <img
                                    src="/images/diltc/crest.png"
                                    alt={`${appName} crest`}
                                    className="h-full w-full object-contain p-0.5"
                                />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold tracking-tight text-[#800000] dark:text-[#FFD700]">
                                    {appName}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Davao del Sur Institute of Languages and Technological College Inc.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm font-medium">
                            <Link href="/enroll" className="transition-colors hover:text-[#800000] dark:hover:text-[#FFD700]">
                                Enroll Online
                            </Link>
                            <Link href={login()} className="transition-colors hover:text-[#800000] dark:hover:text-[#FFD700]">
                                Log in
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-[#800000]/10 pt-6 dark:border-[#FFD700]/10">
                        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                            &copy; {new Date().getFullYear()} {appName}. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
