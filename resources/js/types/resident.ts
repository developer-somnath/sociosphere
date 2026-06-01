import { Flat } from "./flat";

export interface Resident {
    id: number;

    society_id: number;
    flat_id: number;

    name: string;
    email: string;
    phone: string;

    date_of_birth: string;
    gender: string;
    occupation: string;

    is_primary_contact: boolean;

    flat?: Flat;
}
