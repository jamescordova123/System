import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const RANGES = [3, 6, 12, 24];

export function RangeFilter({ months, url }: { months: number; url: string }) {
    return (
        <div className="flex flex-wrap items-center gap-1 rounded-xl border bg-background p-1">
            {RANGES.map((range) => (
                <Button
                    key={range}
                    type="button"
                    size="sm"
                    variant={range === months ? 'default' : 'ghost'}
                    className="rounded-lg px-3 text-xs"
                    onClick={() =>
                        router.get(
                            url,
                            { months: range },
                            { preserveScroll: true, preserveState: true },
                        )
                    }
                >
                    {range}M
                </Button>
            ))}
        </div>
    );
}
