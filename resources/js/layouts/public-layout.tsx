import React from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import { Link, usePage } from '@inertiajs/react';
import { buy, rent } from '@/routes/public';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { props } = usePage();
    const { branding } = props as any;
    const appName = branding?.app_name || 'LaraEstate';

    return (
        <div className="flex min-h-screen flex-col bg-white text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
            {/* Sticky Public Header */}
            <PublicNavbar />

            {/* Main Content Area */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Premium, Interactive Footer */}
            <footer className="border-t border-neutral-100 bg-neutral-50 text-zinc-600 transition-colors duration-300 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        {/* Brand Column */}
                        <div className="space-y-6 xl:col-span-1">
                            <div className="flex items-center gap-2">
                                <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white dark:bg-red-600">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                                    {appName}
                                </span>
                            </div>
                            <p className="text-sm max-w-xs text-neutral-500 dark:text-zinc-500">
                                Offering the finest selection of luxury villas, penthouses, and modern apartments. Find your dream place with us.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        {/* Navigation Columns */}
                        <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-300">
                                        Properties
                                    </h3>
                                    <ul role="list" className="mt-4 space-y-3">
                                        <li>
                                            <Link href={buy()} className="text-sm hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                Buy Listing
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={rent()} className="text-sm hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                Rent Listing
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-300">
                                        Company
                                    </h3>
                                    <ul role="list" className="mt-4 space-y-3">
                                        <li>
                                            <a href="#" className="text-sm hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                About Us
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="text-sm hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                Careers
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-300">
                                    Contact Info
                                </h3>
                                <ul role="list" className="mt-4 space-y-3">
                                    <li className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 shrink-0 text-red-500" />
                                        <span>742 Evergreen Terrace, Springfield</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 shrink-0 text-red-500" />
                                        <span>+1 (555) 019-2834</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 shrink-0 text-red-500" />
                                        <span>info@laraestate.com</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-neutral-100 pt-8 dark:border-zinc-900">
                        <p className="text-xs text-neutral-400 dark:text-zinc-500 text-center">
                            &copy; {new Date().getFullYear()} {appName}. All rights reserved. Built with Laravel 13, React 19 & Reverb.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
