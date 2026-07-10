import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import type { PageProps } from '@inertiajs/core';

export default function ImpersonationBanner() {
    const { auth } = usePage<PageProps>().props;
    const [isLeaving, setIsLeaving] = useState(false);

    // If there is no impersonator active, do not render the banner
    if (!auth || !auth.impersonator) {
        return null;
    }

    const handleLeave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLeaving(true);
        router.post(
            '/admin/impersonate/leave',
            {},
            {
                onFinish: () => setIsLeaving(false),
            },
        );
    };

    return (
        <div className="sticky top-0 z-[100] w-full border-b border-amber-500/30 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-2.5 text-white shadow-md backdrop-blur-md transition-all duration-300">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm sm:flex-row">
                <div className="flex items-center gap-3">
                    <div className="animate-pulse rounded-lg bg-white/20 p-1.5">
                        <ShieldAlert className="h-4 w-4 text-amber-100" />
                    </div>
                    <div className="text-center sm:text-left">
                        <span className="font-semibold tracking-wide">
                            Impersonation Session Active:{' '}
                        </span>
                        <span>
                            Logged in as{' '}
                            <strong className="font-bold underline decoration-amber-300">
                                {auth.user.name}
                            </strong>{' '}
                            ({auth.user.email})
                        </span>
                        <span className="hidden text-amber-200 md:inline">
                            {' '}
                            •{' '}
                        </span>
                        <span className="mt-0.5 block text-xs text-amber-100 md:mt-0 md:inline">
                            Original: {auth.impersonator.name} (
                            {auth.impersonator.email})
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wider text-white uppercase transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:bg-white/30 disabled:opacity-50"
                >
                    {isLeaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <LogOut className="h-3.5 w-3.5" />
                    )}
                    Return to Admin
                </button>
            </div>
        </div>
    );
}
