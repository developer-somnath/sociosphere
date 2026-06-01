export interface User {
    id: number;

    society_id?: number;

    name: string;

    email: string;

    phone?: string;

    is_active: boolean;
}
