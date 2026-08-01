export type VisitorStatus =
    | "pending"
    | "approved"
    | "checked_in"
    | "checked_out"
    | "rejected";

export type Visitor = {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
};

export type VisitorPass = {
    id: number;
    uuid: string;
    status: VisitorStatus;
    purpose: string;
    vehicle_number: string | null;
    scheduled_for: string | null;
    check_in_at: string | null;
    check_out_at: string | null;
    approved_at: string | null;
    created_at: string;
    visitor: Visitor;
    flat: {
        id: number;
        flat_no: string;
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
