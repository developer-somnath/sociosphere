export interface AuthUser {
    id: number;
    uuid: string;
    name: string;
    email: string;
    role: string;
    society_id: number | null;
}
