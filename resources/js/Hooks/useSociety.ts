import { usePage } from "@inertiajs/react";

export function useSociety() {
    const page = usePage();

    return page.props.society as any;
}
