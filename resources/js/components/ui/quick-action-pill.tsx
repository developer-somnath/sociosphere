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
        pill: "bg-info/10 text-info border-info/30 hover:bg-info hover:text-white dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white shadow-info/10",
        iconWrapper: "bg-info/15 text-info dark:text-info group-hover:bg-white/20 group-hover:text-white",
    },
    teal: {
        pill: "bg-info/10 text-info border-info/30 hover:bg-info hover:text-white dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white shadow-info/10",
        iconWrapper: "bg-info/15 text-info dark:text-info group-hover:bg-white/20 group-hover:text-white",
    },
    rose: {
        pill: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive hover:text-white dark:bg-destructive/20 dark:text-destructive dark:hover:bg-destructive dark:hover:text-white shadow-destructive/10",
        iconWrapper: "bg-destructive/15 text-destructive dark:text-destructive group-hover:bg-white/20 group-hover:text-white",
    },
    amber: {
        pill: "bg-warning/10 text-warning border-warning/30 hover:bg-warning hover:text-white dark:bg-warning/20 dark:text-warning dark:hover:bg-warning dark:hover:text-white shadow-warning/10",
        iconWrapper: "bg-warning/15 text-warning dark:text-warning group-hover:bg-white/20 group-hover:text-white",
    },
    purple: {
        pill: "bg-info/10 text-info border-info/30 hover:bg-info hover:text-white dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white shadow-info/10",
        iconWrapper: "bg-info/15 text-info dark:text-info group-hover:bg-white/20 group-hover:text-white",
    },
    blue: {
        pill: "bg-info/10 text-info border-info/30 hover:bg-info hover:text-white dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white shadow-info/10",
        iconWrapper: "bg-info/15 text-info dark:text-info group-hover:bg-white/20 group-hover:text-white",
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
