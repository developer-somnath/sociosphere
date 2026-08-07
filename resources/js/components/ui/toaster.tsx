import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { getToastSnapshot, subscribeToasts, type ToastVariant } from "@/lib/toast";
import { cn } from "@/lib/utils";

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: CircleAlert,
    warning: TriangleAlert,
    info: Info,
};

const TONES: Record<ToastVariant, string> = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
    error: "border-destructive/20 bg-destructive/10 text-foreground",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-100",
    info: "border-sky-500/20 bg-sky-500/10 text-sky-950 dark:text-sky-100",
};

const ICON_TONES: Record<ToastVariant, string> = {
    success: "text-emerald-600 dark:text-emerald-400",
    error: "text-destructive",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-sky-600 dark:text-sky-400",
};

/** Renders the toast stack. Mount once, inside the app shell (see AppLayout). */
export function Toaster() {
    const toasts = useSyncExternalStore(subscribeToasts, getToastSnapshot);

    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            aria-relevant="additions"
            className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex max-w-sm flex-col gap-2 sm:left-auto sm:right-6"
        >
            {toasts.map((toastItem) => {
                const Icon = ICONS[toastItem.variant];

                return (
                    <div
                        key={toastItem.id}
                        role="status"
                        className={cn(
                            "pointer-events-auto flex items-start gap-3 rounded-2xl border p-3 shadow-xl backdrop-blur animate-in slide-in-from-bottom-2 fade-in duration-200",
                            TONES[toastItem.variant],
                        )}
                    >
                        <Icon
                            className={cn("mt-0.5 size-4 shrink-0", ICON_TONES[toastItem.variant])}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-5">{toastItem.title}</p>
                            {toastItem.description ? (
                                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                    {toastItem.description}
                                </p>
                            ) : null}
                            {toastItem.action ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="-ml-2 mt-1 h-6 text-xs font-semibold"
                                    onClick={() => {
                                        toastItem.action?.onClick();
                                        toastItem.dismiss();
                                    }}
                                >
                                    {toastItem.action.label}
                                </Button>
                            ) : null}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="-mr-1 -mt-1"
                            aria-label="Dismiss notification"
                            onClick={toastItem.dismiss}
                        >
                            <X />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
