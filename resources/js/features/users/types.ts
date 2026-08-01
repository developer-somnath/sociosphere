export type UserRole =
    | "SuperAdmin"
    | "SocietyAdmin"
    | "Treasurer"
    | "SecurityGuard"
    | "MaintenanceStaff"
    | "Resident";

export type User = {
    id: number;
    uuid: string;
    society_id: number | null;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    roles: { name: UserRole }[];
    society: { id: number; name: string } | null;
    role?: UserRole;
    society_name?: string | null;
};

export type Paginated<T> = {
    data: T[];
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

export type RoleOption = {
    name: string;
    label: string;
};

export type SocietyOption = {
    id: number;
    label: string;
};
