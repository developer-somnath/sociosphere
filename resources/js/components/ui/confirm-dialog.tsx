import { TriangleAlert } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    /** When set, the user must type this exact text to enable the confirm button. */
    requireText?: string;
    children?: ReactNode;
    className?: string;
};

/**
 * Shared destructive/default confirmation (blueprint §8). Supports impact
 * lists via `children` and typed confirmation for irreversible deletes
 * (e.g. societies).
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    destructive = false,
    loading = false,
    onConfirm,
    requireText,
    children,
    className,
}: ConfirmDialogProps) {
    const { t } = useI18n();
    const [typed, setTyped] = useState("");
    const requiresTyping = Boolean(requireText);
    const disabled = loading || (requiresTyping && typed.trim() !== requireText);
    const resolvedConfirmLabel = confirmLabel ?? t("common.confirm");
    const resolvedCancelLabel = cancelLabel ?? t("common.cancel");

    return (
        <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <AlertDialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 shadow-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        className,
                    )}
                >
                    <div className="flex items-start gap-4">
                        {destructive ? (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                                <TriangleAlert className="size-5 text-destructive" />
                            </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                            <AlertDialog.Title className="text-lg font-semibold">
                                {title}
                            </AlertDialog.Title>
                            {description ? (
                                <AlertDialog.Description className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                    {description}
                                </AlertDialog.Description>
                            ) : null}
                            {children}
                            {requiresTyping ? (
                                <div className="mt-4">
                                    <label
                                        htmlFor="confirm-dialog-input"
                                        className="text-xs font-medium text-muted-foreground"
                                    >
                                        {t("ui.typeToConfirm", { text: requireText ?? "" })}
                                    </label>
                                    <Input
                                        id="confirm-dialog-input"
                                        autoFocus
                                        value={typed}
                                        onChange={(event) => setTyped(event.target.value)}
                                        className="mt-1.5"
                                        placeholder={requireText}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            className="rounded-full px-4 text-xs font-semibold hover:bg-muted"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                        >
                            {resolvedCancelLabel}
                        </Button>
                        <Button
                            variant={destructive ? "destructive-solid" : "default"}
                            className="rounded-full px-4 text-xs font-semibold"
                            loading={loading}
                            disabled={disabled}
                            onClick={onConfirm}
                        >
                            {resolvedConfirmLabel}
                        </Button>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}
