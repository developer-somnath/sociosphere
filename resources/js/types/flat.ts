import { Resident } from "./resident";
import { Tower } from "./tower";

export interface Flat {
    id: number;
    society_id: number;
    tower_id: number;

    flat_no: string;
    floor_no: number;

    flat_type: string;

    area_sqft: number;

    ownership_type: string;
    occupancy_status: string;

    tower?: Tower;

    resident?: Resident;

    society?: {
        uuid: string;
        name: string;
    };
}
