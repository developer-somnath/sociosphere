export type Resident = {
    id: number;
    uuid: string;
    flat_id: number;
    name: string;
    email: string | null;
    phone: string;
    date_of_birth: string | null;
    gender: "Male" | "Female" | "Other" | null;
    occupation: string | null;
    is_primary_contact: boolean;
    created_at: string;
    flat: {
        id: number;
        flat_no: string;
        floor_no: number | null;
        tower: { id: number; name: string } | null;
    } | null;
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

export type FlatOption = {
    id: number;
    label: string;
};
