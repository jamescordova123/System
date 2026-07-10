import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import { cn } from '@/lib/utils';

interface AppLogoDynamicProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    iconClassName?: string;
}

export default function AppLogoDynamic({
    iconClassName,
    className,
    ...props
}: AppLogoDynamicProps) {
    const { branding } = usePage().props as any;
    const systemLogo = branding?.system_logo;

    if (systemLogo) {
        return (
            <img
                src={systemLogo}
                alt="System Logo"
                className={cn('object-contain', className)}
                {...props}
            />
        );
    }

    return <AppLogoIcon className={cn(iconClassName || className)} />;
}
