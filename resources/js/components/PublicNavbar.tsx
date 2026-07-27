import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import AppLogoDynamic from '@/components/app-logo-dynamic';
import { Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function PublicNavbar() {
    const { props } = usePage();
    const { auth, branding } = props as any;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [mobileOpen, setMobileOpen] = useState(false);

    const appName = branding?.app_name || 'DILTrack';

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#800000]/10 bg-white/85 backdrop-blur-md transition-colors duration-300 dark:border-[#FFD700]/10 dark:bg-zinc-950/85">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex aspect-square h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#800000]/15 bg-white shadow-sm dark:border-[#FFD700]/15">
                            <AppLogoDynamic className="h-full w-full object-contain p-0.5" iconClassName="h-6 w-6 text-[#800000]" />
                        </div>
                        <div className="leading-tight">
                            <span className="block text-lg font-bold tracking-tight text-[#800000] dark:text-[#FFD700]">
                                {appName}
                            </span>
                            <span className="block text-[10px] font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
                                Academic Portal
                            </span>
                        </div>
                    </Link>

                    {/* Right-Side Actions (Auth & Theme Toggle) */}
                    <div className="hidden items-center gap-3 md:flex">
                        <button
                            onClick={toggleTheme}
                            className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-[#800000]/5 hover:text-[#800000] dark:text-zinc-300 dark:hover:bg-[#FFD700]/10 dark:hover:text-[#FFD700]"
                            aria-label="Toggle Theme"
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center justify-center rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#800000]/20 transition-all hover:bg-[#5d0000] active:scale-[0.98]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/enroll"
                                    className="rounded-lg px-4 py-2 text-sm font-semibold text-[#800000] transition-colors hover:bg-[#800000]/5 dark:text-[#FFD700] dark:hover:bg-[#FFD700]/10"
                                >
                                    Enroll Online
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#800000]/20 transition-colors hover:bg-[#5d0000]"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Menu Icon */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={toggleTheme}
                            className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-[#800000]/5 dark:text-zinc-300 dark:hover:bg-[#FFD700]/10"
                            aria-label="Toggle Theme"
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-[#800000]/5 dark:text-zinc-300 dark:hover:bg-[#FFD700]/10"
                        >
                            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileOpen && (
                <div className="space-y-2 border-t border-[#800000]/10 bg-white p-4 duration-200 animate-in slide-in-from-top-4 dark:border-[#FFD700]/10 dark:bg-zinc-950">
                    <Link
                        href="/enroll"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            'flex items-center justify-between rounded-lg bg-[#800000]/5 px-4 py-2.5 text-sm font-semibold text-[#800000] dark:bg-[#FFD700]/10 dark:text-[#FFD700]',
                        )}
                    >
                        Enroll Online Now
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    <div className="grid grid-cols-2 gap-2 border-t border-[#800000]/10 pt-3 dark:border-[#FFD700]/10">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                onClick={() => setMobileOpen(false)}
                                className="col-span-2 flex w-full items-center justify-center rounded-lg bg-[#800000] px-4 py-2.5 text-sm font-semibold text-white"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center rounded-lg border border-[#800000]/15 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-[#800000]/5 dark:border-[#FFD700]/15 dark:text-zinc-300"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center rounded-lg bg-[#800000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5d0000]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
