export type Role = {
    uuid: string;
    name: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
    permissions_count: number;
    created_at: string;
};

export type PermissionItem = {
    id: number;
    name: string;
    action: string;
};

export type PermissionGroup = {
    feature: string;
    label: string;
    permissions: PermissionItem[];
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

export type RoleFormValues = {
    name: string;
    description: string;
    permissions: number[];
};
