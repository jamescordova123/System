export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    /** Spatie Media Library URL — thumb conversion, falls back to /images/default-avatar.png */
    avatar_url: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type NotificationData = {
    id: string | number;
    amount?: number | string;
    currency?: string;
    status: 'success' | 'pending' | 'failed';
    message: string;
    action_request_id?: number;
    action_type?: string;
};

export type DatabaseNotification = {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Auth = {
    user: User;
    roles: string[];
    permissions: string[];
    impersonator?: User | null;
    unread_notifications?: DatabaseNotification[];
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
