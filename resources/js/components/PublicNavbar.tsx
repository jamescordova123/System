import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { buy, rent } from '@/routes/public';
import AppLogoDynamic from '@/components/app-logo-dynamic';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function PublicNavbar() {
    const { url, props } = usePage();
    const { auth, branding } = props as any;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isHome = url === '/';
    const isBuy = url.startsWith('/buy');
    const isRent = url.startsWith('/rent');

    const appName = branding?.app_name || 'LaraEstate';

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-zinc-900 dark:bg-zinc-950/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex aspect-square h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white shadow-md shadow-red-500/20 dark:bg-red-600">
                                <AppLogoDynamic className="h-6 w-6 object-contain" iconClassName="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                                {appName}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:block">
                        <div className="flex items-center gap-8">
                            <Link
                                href="/"
                                className={cn(
                                    "relative py-1 text-sm font-medium transition-colors hover:text-red-500 dark:hover:text-red-400",
                                    isHome 
                                        ? "text-red-500 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-red-500 dark:after:bg-red-400" 
                                        : "text-zinc-600 dark:text-zinc-300"
                                )}
                            >
                                Home
                            </Link>
                            <Link
                                href={buy()}
                                className={cn(
                                    "relative py-1 text-sm font-medium transition-colors hover:text-red-500 dark:hover:text-red-400",
                                    isBuy 
                                        ? "text-red-500 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-red-500 dark:after:bg-red-400" 
                                        : "text-zinc-600 dark:text-zinc-300"
                                )}
                            >
                                Buy
                            </Link>
                            <Link
                                href={rent()}
                                className={cn(
                                    "relative py-1 text-sm font-medium transition-colors hover:text-red-500 dark:hover:text-red-400",
                                    isRent 
                                        ? "text-red-500 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-red-500 dark:after:bg-red-400" 
                                        : "text-zinc-600 dark:text-zinc-300"
                                )}
                            >
                                Rent
                            </Link>
                        </div>
                    </div>

                    {/* Right-Side Actions (Auth & Theme Toggle) */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-full p-2 text-zinc-600 hover:bg-neutral-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Authentication Links */}
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={login()}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-red-500/10 hover:bg-red-600 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Menu Icon */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Mobile Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-full p-2 text-zinc-600 hover:bg-neutral-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
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
                            className="rounded-lg p-2 text-zinc-600 hover:bg-neutral-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                        >
                            {mobileOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-neutral-100 bg-white p-4 space-y-3 dark:border-zinc-900 dark:bg-zinc-950 animate-in slide-in-from-top-4 duration-200">
                    <Link
                        href="/"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                            isHome 
                                ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400" 
                                : "text-zinc-600 hover:bg-neutral-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        )}
                    >
                        Home
                    </Link>
                    <Link
                        href={buy()}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                            isBuy 
                                ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400" 
                                : "text-zinc-600 hover:bg-neutral-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        )}
                    >
                        Buy
                    </Link>
                    <Link
                        href={rent()}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                            isRent 
                                ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400" 
                                : "text-zinc-600 hover:bg-neutral-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        )}
                    >
                        Rent
                    </Link>

                    <div className="border-t border-neutral-100 pt-3 dark:border-zinc-900">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                onClick={() => setMobileOpen(false)}
                                className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href={login()}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-neutral-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
