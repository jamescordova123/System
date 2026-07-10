import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import type { Auth as BaseAuth } from './auth';

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps {
        auth: BaseAuth & {
            roles: string[];
            permissions: string[];
        };
    }
}

export interface ApiToken {
    id: number;
    name: string;
    abilities: string[];
    last_used_at: string | null;
    last_used_at_diff: string | null;
    created_at: string;
    created_at_diff: string;
}
