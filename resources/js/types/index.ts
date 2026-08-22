export type AuthUser = {
    id: number;
    uuid: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    society_id: number | null;
    is_super_admin?: boolean;
    locale?: string;
};

export type AuthSociety = {
    id: number;
    uuid: string;
    name: string;
    registration_no: string | null;
};

export type AppNotification = {
    id: string | number;
    title: string;
    description?: string;
    /** Inertia route to jump to context (e.g. a complaint detail). */
    href?: string;
    read: boolean;
    /** ISO timestamp */
    created_at: string;
    type?: "info" | "success" | "warning";
};

export type SharedProps = {
    auth: {
        user: AuthUser | null;
        society: AuthSociety | null;
        societies?: AuthSociety[];
        locale?: string;
        is_rtl?: boolean;
        languages?: {
            code: string;
            name: string;
            native_name: string;
            script_dir: "ltr" | "rtl";
        }[];
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    /** Platform release info (blueprint §3). */
    version?: string;
    environment?: string;
    /** Shared by the backend via HandleInertiaRequests — optional until wired. */
    notifications?: AppNotification[];
    /** WebPush VAPID public key (PWA — S4-1). Empty until keys are generated. */
    vapid_public_key?: string | null;
};

export type PageProps<T = Record<string, unknown>> = T & SharedProps;

export type DashboardStats = {
    residents: number;
    flats: number;
    occupied_flats: number;
    towers: number;
    open_complaints: number;
    active_notices: number;
    pending_payments: number;
};
