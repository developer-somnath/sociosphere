import { useEffect, useState } from "react";

/**
 * Unsaved-changes guard (blueprint §10). Warns on tab close/reload while
 * dirty and exposes reset helpers for the form lifecycle.
 *
 *   const { dirty, markDirty, reset } = useUnsavedChanges();
 *   <input onChange={() => markDirty()} />
 */
export function useUnsavedChanges(initialDirty = false) {
    const [dirty, setDirty] = useState(initialDirty);

    useEffect(() => {
        if (!dirty) return;

        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    return {
        dirty,
        setDirty,
        markDirty: () => setDirty(true),
        reset: () => setDirty(false),
    };
}
