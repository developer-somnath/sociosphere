import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

export function useAuth() {
    return usePage<PageProps>().props.auth;
}
