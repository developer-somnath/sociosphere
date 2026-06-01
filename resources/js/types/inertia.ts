import { AuthUser } from "./auth";
import { Society } from "./society";

export interface SharedProps {
    auth: {
        user: AuthUser | null;
        society: Society | null;
    };
}
