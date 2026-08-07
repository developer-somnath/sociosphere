import { MoreHorizontal } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type RowAction = {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    destructive?: boolean;
    disabled?: boolean;
    /** Render a separator before this action. */
    separatorBefore?: boolean;
};

/**
 * Compact row action menu (blueprint §8 — row actions). Renders a
 * "kebab" trigger that opens a dropdown of View / Edit / Delete style
 * actions. `onSelect` keeps the menu closing behaviour of Radix and
 * fires the page's handler (typically an Inertia `router` call).
 */
export function RowActions({ actions }: { actions: RowAction[] }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Row actions"
                    className="size-8"
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {actions.map((action, index) => (
                    <Fragment key={`${action.label}-${index}`}>
                        {action.separatorBefore && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            disabled={action.disabled}
                            onSelect={action.onClick}
                            className={cn(
                                action.destructive &&
                                    "text-destructive focus:bg-destructive/10 focus:text-destructive",
                            )}
                        >
                            {action.icon && <action.icon className="size-4" />}
                            {action.label}
                        </DropdownMenuItem>
                    </Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
