import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types';

type ModuleShellProps = {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    children: ReactNode;
};

export function ModuleShell({ title, breadcrumbs, children }: ModuleShellProps) {
    return (
        <>
            <Head title={title} />
            <div className="flex flex-1 flex-col gap-6 bg-gradient-to-b from-background to-[#FFD700]/[0.03] p-4 md:p-6">{children}</div>
        </>
    );
}

export function setModuleLayout(breadcrumbs: BreadcrumbItem[]) {
    return { breadcrumbs };
}
