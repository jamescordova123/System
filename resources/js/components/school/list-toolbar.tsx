import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ListFilterOption = {
    value: string;
    label: string;
};

export type ListFilter = {
    key: string;
    label: string;
    value: string;
    options: ListFilterOption[];
    onChange: (value: string) => void;
    widthClassName?: string;
};

type Props = {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filters?: ListFilter[];
    resultCount?: number;
    totalCount?: number;
    onClear?: () => void;
};

export function ListToolbar({
    search,
    onSearchChange,
    searchPlaceholder = 'Search…',
    filters = [],
    resultCount,
    totalCount,
    onClear,
}: Props) {
    const hasActiveFilters =
        search.trim() !== '' || filters.some((f) => f.value !== 'all' && f.value !== '');

    return (
        <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="rounded-xl pl-9"
                    />
                </div>
                {filters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
                                <SelectTrigger className={`rounded-xl ${filter.widthClassName ?? 'w-[150px]'}`}>
                                    <SelectValue placeholder={filter.label} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filter.options.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                    </div>
                )}
            </div>
            {(hasActiveFilters || resultCount !== undefined) && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                        {resultCount !== undefined && totalCount !== undefined
                            ? `Showing ${resultCount} of ${totalCount}`
                            : resultCount !== undefined
                              ? `${resultCount} result${resultCount === 1 ? '' : 's'}`
                              : null}
                    </span>
                    {hasActiveFilters && onClear && (
                        <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-xs" onClick={onClear}>
                            <X className="mr-1 h-3.5 w-3.5" /> Clear filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
