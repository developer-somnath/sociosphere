export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastAction = { label: string; onClick: () => void };

export type ToastOptions = {
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
    action?: ToastAction;
};

export type Toast = ToastOptions & {
    id: number;
    variant: ToastVariant;
    dismiss: () => void;
};

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let snapshot: Toast[] = [];
let counter = 0;
const listeners = new Set<Listener>();

function emit(): void {
    snapshot = [...toasts];
    listeners.forEach((listener) => listener(snapshot));
}

/**
 * Imperative toast API — usage:
 *
 *   toast({ title: "Flat created", variant: "success" });
 *   toast({ title: "Deleted", action: { label: "Undo", onClick: restore } });
 */
export function toast(options: ToastOptions): () => void {
    const id = ++counter;
    const dismiss = (): void => {
        toasts = toasts.filter((toastItem) => toastItem.id !== id);
        emit();
    };

    const item: Toast = {
        id,
        variant: "success",
        ...options,
        dismiss,
    };

    toasts = [...toasts, item];
    emit();

    const duration = options.duration ?? (options.variant === "error" ? 8000 : 4000);
    window.setTimeout(dismiss, duration);

    return dismiss;
}

export function subscribeToasts(listener: Listener): () => void {
    listeners.add(listener);
    listener(snapshot);
    return () => listeners.delete(listener);
}

export function getToastSnapshot(): Toast[] {
    return snapshot;
}
