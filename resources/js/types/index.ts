export type AuthUser = {
    id: number;
    uuid: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    society_id: number | null;
};

export type AuthSociety = {
    id: number;
    uuid: string;
    name: string;
    registration_no: string | null;
};

export type SharedProps = {
    auth: {
        user: AuthUser | null;
        society: AuthSociety | null;
    };
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
