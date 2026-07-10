import { router } from '@inertiajs/react';
import {
    CornerDownLeft,
    Loader2,
    Search,
    User as UserIcon,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    avatar_url?: string;
    url: string;
    type: string;
}

export function HeaderSearch() {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Debounce input value changes (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    // 2. Fetch search results from API when debounced value changes
    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        let isCurrent = true;
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
                );
                const json = await response.json();

                if (isCurrent && json.success) {
                    setResults(json.data);
                    setIsOpen(json.data.length > 0);
                    setActiveIndex(-1);
                }
            } catch (error) {
                console.error('Failed fetching search results:', error);
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        fetchResults();

        return () => {
            isCurrent = false;
        };
    }, [debouncedQuery]);

    // 3. Register global shortcut (⌘K or Ctrl+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // 4. Click outside to close results dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        router.visit(item.url);
    };

    // 5. Keyboard Navigation Logic
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < results.length - 1 ? prev + 1 : 0,
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : results.length - 1,
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < results.length) {
                handleSelect(results[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-[240px] md:max-w-[320px]"
        >
            {/* Search Input Container */}
            <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                        <Search className="h-4 w-4 text-neutral-400 transition-colors group-focus-within:text-neutral-900 dark:group-focus-within:text-neutral-100" />
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() =>
                        query.trim().length >= 2 &&
                        results.length > 0 &&
                        setIsOpen(true)
                    }
                    placeholder="Search users..."
                    className="w-full rounded-full border-none bg-neutral-100 py-1.5 pr-12 pl-10 text-sm text-neutral-900 transition-all placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:focus-visible:ring-neutral-600"
                />

                {/* Keyboard shortcut guide badge */}
                <kbd className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="hidden h-5 items-center gap-0.5 rounded border border-neutral-200 bg-white px-1.5 font-mono text-[10px] font-medium text-neutral-400 select-none sm:inline-flex dark:border-neutral-700 dark:bg-neutral-900">
                        <span className="text-xs">⌘</span>K
                    </span>
                </kbd>
            </div>

            {/* Floating Dropdown Results Card */}
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-full origin-top-right animate-in rounded-lg border border-neutral-200 bg-white/95 p-1 text-neutral-950 shadow-lg backdrop-blur-md fade-in-50 outline-none slide-in-from-top-1 dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-50">
                    <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                        Search Results
                    </div>

                    <ul
                        role="listbox"
                        className="max-h-[300px] space-y-0.5 overflow-y-auto"
                    >
                        {results.map((item, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <li
                                    key={`${item.type}-${item.id}`}
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={cn(
                                        'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors select-none',
                                        isActive
                                            ? 'dark:bg-neutral-850 bg-neutral-100 text-neutral-900 dark:text-neutral-50'
                                            : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50',
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.avatar_url ? (
                                            <img
                                                src={item.avatar_url}
                                                alt={item.title}
                                                className="dark:border-neutral-850 h-7 w-7 rounded-full border border-neutral-200 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                <UserIcon className="h-4 w-4 text-neutral-500" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="leading-none font-medium">
                                                {item.title}
                                            </span>
                                            <span className="mt-0.5 text-xs text-neutral-400">
                                                {item.subtitle}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-600 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                                            {item.type}
                                        </span>
                                        {isActive && (
                                            <CornerDownLeft className="h-3.5 w-3.5 animate-pulse text-neutral-400 dark:text-neutral-500" />
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
