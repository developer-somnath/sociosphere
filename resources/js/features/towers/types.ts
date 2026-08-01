export type Tower = {
    id: number;
    uuid: string;
    name: string;
    society_id: number;
    flats_count: number;
    created_at: string;
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

export type SocietyOption = {
    id: number;
    label: string;
};
