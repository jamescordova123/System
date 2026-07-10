import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import ImpersonationBanner from '@/components/ImpersonationBanner';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <ImpersonationBanner />
            <AppShell variant="header">
                <AppHeader breadcrumbs={breadcrumbs} />
                <AppContent variant="header">{children}</AppContent>
            </AppShell>
        </div>
    );
}
