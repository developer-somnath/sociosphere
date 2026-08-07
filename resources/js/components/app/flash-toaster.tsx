import { usePage } from "@inertiajs/react";
import { useEffect } from "react";

import { toast } from "@/lib/toast";
import type { PageProps } from "@/types";

/**
 * Bridges server-side flash messages into the unified toast system
 * (`@/lib/toast` + `<Toaster />`). Renders nothing itself.
 */
export function FlashToaster() {
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash.success) toast({ title: flash.success, variant: "success" });
        if (flash.error) toast({ title: flash.error, variant: "error" });
    }, [flash.error, flash.success]);

    return null;
}
