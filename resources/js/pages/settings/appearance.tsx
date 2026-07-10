import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';
import { usePermission } from '@/hooks/usePermission';
import BrandingSettingsForm from '@/components/branding-settings-form';
import { Separator } from '@/components/ui/separator';

export default function Appearance() {
    const { hasRole } = usePermission();

    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />
                <AppearanceTabs />

                {hasRole('Super-Admin') && (
                    <>
                        <Separator className="my-6" />
                        <Heading
                            variant="small"
                            title="System Branding settings"
                            description="Change the app name, system logo, and tab favicon (Admins only)"
                        />
                        <BrandingSettingsForm />
                    </>
                )}
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
