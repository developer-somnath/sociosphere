import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BulkAction = {
    label: string;
    icon?: ReactNode;
    variant?: React.ComponentProps<typeof Button>["variant"];
    loading?: boolean;
    disabled?: boolean;
    onClick: () => void;
    destructive?: boolean;
};

type BulkActionBarProps = {
    /** Number of selected rows. */
    count: number;
    onClear: () => void;
    actions: BulkAction[];
    /** Noun for the selection summary, e.g. "residents". */
    noun?: string;
    className?: string;
};

/**
 * Floating bulk-action bar (blueprint §8 — bulk selection). Rendered when
 * rows are selected; sits above the table, fixed to the bottom-center of the
 * viewport with a blurred pill so it never hides table content. Actions
 * receive the current selection ids from the page.
 */
export function BulkActionBar({ count, onClear, actions, noun = "items", className }: BulkActionBarProps) {
    if (count === 0) return null;

    return (
        <div className={cn("pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4", className)}>
            <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-popover/95 px-3 py-2 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)] backdrop-blur">
                <p className="px-1.5 text-sm font-medium text-foreground">
                    {count} {noun} selected
                </p>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden />
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant={action.destructive ? "destructive-ghost" : action.variant ?? "secondary"}
                        size="sm"
                        loading={action.loading}
                        disabled={action.disabled}
                        onClick={action.onClick}
                        className={cn(
                            action.destructive &&
                                "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/20",
                        )}
                    >
                        {action.icon}
                        {action.label}
                    </Button>
                ))}
                <span className="mx-1 h-5 w-px bg-border" aria-hidden />
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClear}
                    aria-label="Clear selection"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                >
                    <X />
                </Button>
            </div>
        </div>
    );
}
