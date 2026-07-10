import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
    from: number | null;
    to: number | null;
    total: number;
}

export function Pagination({ links, from, to, total }: PaginationProps) {
    if (!links || links.length <= 3) return null; // Hide if there's only 1 page (includes prev, page 1, next)

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/20 bg-muted/5 px-6 py-4 sm:flex-row">
            <div className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-foreground">
                    {from ?? 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-foreground">{to ?? 0}</span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">{total}</span>{' '}
                results
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                {links.map((link, idx) => {
                    const isPrev = idx === 0;
                    const isNext = idx === links.length - 1;

                    let label = link.label;
                    if (isPrev) {
                        label = 'Previous';
                    } else if (isNext) {
                        label = 'Next';
                    }

                    // Clean up HTML entities in case Laravel paginator passes them
                    const cleanLabel = label
                        .replace(/&laquo;/g, '')
                        .replace(/&raquo;/g, '')
                        .trim();

                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-border/10 bg-transparent px-3 py-1.5 text-xs text-muted-foreground/40 select-none"
                            >
                                {isPrev && (
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                )}
                                <span>{cleanLabel}</span>
                                {isNext && (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                )}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                link.active
                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/95'
                                    : 'border-border/50 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {isPrev && <ChevronLeft className="h-3.5 w-3.5" />}
                            <span>{cleanLabel}</span>
                            {isNext && <ChevronRight className="h-3.5 w-3.5" />}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
