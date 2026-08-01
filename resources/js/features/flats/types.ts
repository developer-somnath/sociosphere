export type Flat = {
    id: number;
    uuid: string;
    tower_id: number;
    society_id: number;
    flat_no: string;
    floor_no: number | null;
    flat_type: string | null;
    area_sqft: number | null;
    ownership_type: "Owner" | "Tenant";
    occupancy_status: "Occupied" | "Vacant" | "Self-Occupied";
    created_at: string;
    tower: { id: number; name: string } | null;
    resident: { id: number; name: string } | null;
    residents_count: number;
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

export type TowerOption = {
    id: number;
    label: string;
};

export type FlatStats = {
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
};
