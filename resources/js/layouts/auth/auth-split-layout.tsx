import { Link, usePage } from '@inertiajs/react';
import { Shield, Key, Fingerprint, Lock } from 'lucide-react';

import AppLogoDynamic from '@/components/app-logo-dynamic';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Custom Animations Style Tag */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes rotate-cw {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes rotate-ccw {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                @keyframes float-blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.15); }
                    66% { transform: translate(-30px, 20px) scale(0.9); }
                }
                @keyframes float-blob-reverse {
                    0%, 100% { transform: translate(0px, 0px) scale(1.1); }
                    50% { transform: translate(-45px, 45px) scale(0.95); }
                }
                @keyframes pulse-soft {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                }
                .animate-rotate-cw {
                    animation: rotate-cw 25s infinite linear;
                }
                .animate-rotate-ccw {
                    animation: rotate-ccw 20s infinite linear;
                }
                .animate-blob-1 {
                    animation: float-blob 18s infinite ease-in-out;
                }
                .animate-blob-2 {
                    animation: float-blob-reverse 22s infinite ease-in-out;
                }
                .animate-pulse-soft {
                    animation: pulse-soft 4s infinite ease-in-out;
                }
            `,
                }}
            />

            {/* Left Column: Visual Security Branding (Desktop Only) */}
            <div className="relative hidden h-full flex-col justify-between overflow-hidden border-r border-border/40 bg-zinc-950 p-10 text-white lg:flex">
                {/* Mesh Gradient Background Blobs */}
                <div className="animate-blob-1 pointer-events-none absolute top-[-10%] left-[-10%] h-[350px] w-[350px] rounded-full bg-indigo-600/20 blur-[90px]" />
                <div className="animate-blob-2 pointer-events-none absolute right-[-10%] bottom-[-10%] h-[450px] w-[450px] rounded-full bg-rose-600/15 blur-[120px]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#09090b_90%)]" />

                {/* Tech Grid Background pattern */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />

                {/* Logo & Brand Header */}
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90"
                >
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
                        <AppLogoDynamic
                            className="size-5 object-contain"
                            iconClassName="size-5 fill-current text-white"
                        />
                    </div>
                    <span className="font-semibold text-white/90">{name}</span>
                </Link>

                {/* Center Graphic: Pulsing Security Ring Visual */}
                <div className="relative z-20 flex flex-1 flex-col items-center justify-center py-12">
                    <div className="relative flex h-72 w-72 items-center justify-center">
                        {/* Outer Orbit Ring */}
                        <div className="animate-rotate-cw absolute inset-0 rounded-full border border-dashed border-indigo-500/20" />

                        {/* Middle Orbit Ring */}
                        <div className="absolute inset-6 rounded-full border border-indigo-400/10" />
                        <div className="animate-rotate-ccw absolute inset-6 rounded-full border-t border-r border-rose-500/20" />

                        {/* Inner Glowing Ring */}
                        <div className="absolute inset-14 flex items-center justify-center rounded-full border border-white/10 bg-indigo-950/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-sm">
                            {/* Animated Scanner Ring */}
                            <div className="absolute inset-1 animate-ping rounded-full border border-indigo-500/30 opacity-25" />

                            {/* Shield Icon in Core */}
                            <Shield className="size-16 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                        </div>

                        {/* Orbiting Tech Nodes */}
                        <div className="absolute top-1/2 left-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/80 shadow-lg backdrop-blur-md">
                            <Key className="size-4 text-rose-400" />
                        </div>
                        <div className="absolute top-1/2 right-0 flex h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/80 shadow-lg backdrop-blur-md">
                            <Fingerprint className="size-4 text-indigo-400" />
                        </div>
                        <div className="absolute top-0 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/80 shadow-lg backdrop-blur-md">
                            <Lock className="size-4 text-emerald-400" />
                        </div>
                    </div>

                    {/* Floating Tech Badges */}
                    <div className="mt-10 flex max-w-sm flex-wrap justify-center gap-2.5">
                        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                            Zero-Trust Access
                        </span>
                        <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
                            Passkey Enabled
                        </span>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            MFA Guarded
                        </span>
                    </div>
                </div>

                {/* Footer Banner */}
                <div className="relative z-20 max-w-md space-y-2.5">
                    <p className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">
                        Enterprise Identity Platform
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-400">
                        Secure Access Portal equipped with multi-layered
                        credential checking, brute-force mitigation, and
                        hardware-bound passkeys.
                    </p>
                </div>
            </div>

            {/* Right Column: Clean Form Layout */}
            <div className="relative flex h-full w-full items-center justify-center bg-background lg:p-8">
                {/* Decorative background gradients for mobile/tablet */}
                <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-[250px] w-[250px] rounded-full bg-indigo-500/10 blur-[80px] lg:hidden" />
                <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-rose-500/5 blur-[90px] lg:hidden" />

                <div className="relative z-10 mx-auto flex w-full max-w-[360px] flex-col justify-center space-y-6">
                    {/* Header Logo for Mobile */}
                    <Link
                        href={home()}
                        className="flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105 lg:hidden"
                    >
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 p-1 shadow-md dark:bg-zinc-100">
                            <AppLogoDynamic
                                className="size-full object-contain"
                                iconClassName="size-5 fill-current text-white dark:text-zinc-950"
                            />
                        </div>
                    </Link>

                    {/* Page Header */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="max-w-[300px] text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {/* Children Form Content */}
                    <div className="rounded-2xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-md sm:shadow-md lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
