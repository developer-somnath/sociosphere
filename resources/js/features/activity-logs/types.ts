export type ActivityLog = {
    id: number;
    module: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    properties: Record<string, unknown> | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    remarks: string | null;
    ip_address: string | null;
    user_agent: string | null;
    method: string | null;
    request_url: string | null;
    created_at: string;
    causer: { id: number; name: string; email: string } | null;
    society: { id: number; name: string } | null;
};

export type Filters = {
    search: string;
    module: string | null;
    action: string | null;
    causer_id: number | null;
    date_from: string | null;
    date_to: string | null;
};

export type FilterOptions = {
    modules: string[];
    actions: string[];
    causers: { id: number; name: string }[];
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

export type ActivityLogFilters = Filters;
