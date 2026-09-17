import { Link } from '@inertiajs/react';
import { ArrowRight, Megaphone } from 'lucide-react';

import AppLogoDynamic from '@/components/app-logo-dynamic';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] md:flex-row">
            <div className="relative hidden min-h-screen overflow-hidden bg-[#5d0000] md:flex md:w-1/2 lg:w-3/5">
                <img
                    alt="DILTC Students"
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    src="/images/diltc/hero-banner.png"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#800000]/95 via-[#800000]/75 to-[#FFD700]/10" />

                <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white lg:p-20">
                    <div className="max-w-xl">
                        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-[#FFD700] px-5 py-2 text-xs font-bold tracking-wider text-black shadow-xl">
                            <Megaphone className="h-4 w-4" />
                            ENROLLMENT NOW OPEN
                        </div>
                        <h2 className="mb-6 text-4xl leading-tight font-bold tracking-tight lg:text-6xl">
                            Build your future at{' '}
                            <span className="text-[#FFD700] italic">DILTC.</span>
                        </h2>
                        <p className="mb-10 max-w-md text-lg leading-relaxed text-white/80">
                            Empowering global citizens through excellence in language and technological training.
                        </p>
                        <Link
                            href="/enroll"
                            className="group inline-flex items-center gap-3 rounded-xl bg-[#FFD700] px-8 py-4 text-base font-bold text-[#5d0000] shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white"
                        >
                            Enroll Online Now
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center overflow-y-auto bg-white p-6 md:w-1/2 md:p-12 lg:w-2/5 lg:p-20">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center md:mb-12 md:text-left">
                        <Link
                            href={home()}
                            className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-start"
                        >
                            <img
                                alt="DILTC Logo"
                                className="h-20 w-auto object-contain drop-shadow-sm md:h-24"
                                src="/images/diltc/crest.png"
                            />
                            <div>
                                <h1 className="text-4xl leading-none font-bold tracking-tighter text-[#800000] md:text-[42px]">
                                    DIL<span className="font-light text-slate-500">Track</span>
                                </h1>
                                <p className="mt-1 text-sm font-medium tracking-wide text-slate-500">
                                    Academic Management Portal
                                </p>
                            </div>
                        </Link>

                        <div className="mb-6 hidden h-1 w-12 rounded-full bg-[#FFD700] md:block" />

                        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                        {description && (
                            <p className="mt-2 text-base text-slate-500">{description}</p>
                        )}
                    </div>

                    <div className="mb-8 flex flex-col items-center gap-4 border-b border-slate-100 pb-8 md:hidden">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <AppLogoDynamic className="h-10 w-10 object-contain" />
                        </div>
                        <Link
                            href="/enroll"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#800000] px-5 py-2.5 text-sm font-bold text-white"
                        >
                            Enroll Online Now
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {children}

                    <p className="mt-12 text-center text-[11px] font-medium text-slate-400 md:text-left">
                        © {new Date().getFullYear()} Davao del Sur Institute of Languages and Technological College Inc.
                    </p>
                </div>
            </div>
        </div>
    );
}
