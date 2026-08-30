import { Link } from "@inertiajs/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type VariantType = "teal" | "indigo" | "rose" | "amber" | "purple" | "blue";

type QuickActionPillProps = {
    href: string;
    icon: LucideIcon;
    label: string;
    variant?: VariantType;
    className?: string;
};

const variantStyles: Record<VariantType, { pill: string; iconWrapper: string }> = {
    indigo: {
        pill: "bg-primary/10 text-primary border-primary/25 hover:bg-primary hover:text-white dark:bg-primary/20 dark:text-primary dark:hover:bg-primary dark:hover:text-white shadow-primary/10",
        iconWrapper: "bg-primary/15 text-primary group-hover:bg-white/20 group-hover:text-white",
    },
    teal: {
        pill: "bg-primary/10 text-primary border-primary/25 hover:bg-primary hover:text-white dark:bg-primary/20 dark:text-primary dark:hover:bg-primary dark:hover:text-white shadow-primary/10",
        iconWrapper: "bg-primary/15 text-primary group-hover:bg-white/20 group-hover:text-white",
    },
    rose: {
        pill: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive hover:text-white dark:bg-destructive/20 dark:text-destructive dark:hover:bg-destructive dark:hover:text-white shadow-destructive/10",
        iconWrapper: "bg-destructive/15 text-destructive group-hover:bg-white/20 group-hover:text-white",
    },
    amber: {
        pill: "bg-warning/10 text-warning border-warning/30 hover:bg-warning hover:text-white dark:bg-warning/20 dark:text-warning dark:hover:bg-warning dark:hover:text-white shadow-warning/10",
        iconWrapper: "bg-warning/15 text-warning group-hover:bg-white/20 group-hover:text-white",
    },
    purple: {
        pill: "bg-brand/10 text-brand border-brand/25 hover:bg-brand hover:text-white dark:bg-brand/20 dark:text-brand dark:hover:bg-brand dark:hover:text-white shadow-brand/10",
        iconWrapper: "bg-brand/15 text-brand group-hover:bg-white/20 group-hover:text-white",
    },
    blue: {
        pill: "bg-primary/10 text-primary border-primary/25 hover:bg-primary hover:text-white dark:bg-primary/20 dark:text-primary dark:hover:bg-primary dark:hover:text-white shadow-primary/10",
        iconWrapper: "bg-primary/15 text-primary group-hover:bg-white/20 group-hover:text-white",
    },
};

export function QuickActionPill({
    href,
    icon: Icon,
    label,
    variant = "indigo",
    className,
}: QuickActionPillProps) {
    const style = variantStyles[variant];

    return (
        <Link
            href={href}
            className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                style.pill,
                className,
            )}
        >
            <div className={cn("flex size-5 items-center justify-center rounded-full transition-colors", style.iconWrapper)}>
                <Icon className="size-3 shrink-0" />
            </div>
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    );
}
