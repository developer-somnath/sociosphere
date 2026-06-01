import { AuthUser } from "./auth";
import { Society } from "./society";

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: AuthUser | null;
        society: Society | null;
    };
};
