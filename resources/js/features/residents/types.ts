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
    family_members?: FamilyMember[];
    vehicles?: Vehicle[];
};

export type FamilyMember = {
    id: number;
    uuid: string;
    resident_id: number;
    name: string;
    relation: "Spouse" | "Child" | "Parent" | "Sibling" | "Other";
    date_of_birth: string | null;
    gender: "Male" | "Female" | "Other" | null;
    phone: string | null;
    email: string | null;
    is_dependent: boolean;
    created_at: string;
};

export type Vehicle = {
    id: number;
    uuid: string;
    resident_id: number;
    vehicle_number: string | null;
    vehicle_model: string | null;
    vehicle_type: "Car" | "Bike" | "SUV" | "Other";
    parking_slot: string | null;
    is_active: boolean;
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

export type FlatOption = {
    id: number;
    label: string;
};
