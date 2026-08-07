import { usePage } from "@inertiajs/react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PageProps } from "@/types";

type Toast = { id: number; message: string; variant: "success" | "error" };

export function FlashToaster() {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const next = flash.success
            ? { message: flash.success, variant: "success" as const }
            : flash.error
              ? { message: flash.error, variant: "error" as const }
              : null;

        if (!next) return;

        const id = Date.now();
        setToasts((current) => [...current, { id, ...next }]);
        const timeout = window.setTimeout(
            () => setToasts((current) => current.filter((toast) => toast.id !== id)),
            6000,
        );

        return () => window.clearTimeout(timeout);
    }, [flash.error, flash.success]);

    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            aria-relevant="additions"
            className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex max-w-sm flex-col gap-2 sm:left-auto sm:right-6"
        >
            {toasts.map((toast) => {
                const successful = toast.variant === "success";

                return (
                    <div
                        key={toast.id}
                        role="status"
                        className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3 shadow-xl backdrop-blur ${successful ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100" : "border-destructive/20 bg-destructive/10 text-foreground"}`}
                    >
                        {successful ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                        )}
                        <p className="flex-1 text-sm leading-5">{toast.message}</p>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="-mr-1 -mt-1"
                            aria-label="Dismiss notification"
                            onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                        >
                            <X />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
