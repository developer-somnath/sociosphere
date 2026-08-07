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
        pill: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white shadow-indigo-500/10",
        iconWrapper: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 group-hover:bg-white/20 group-hover:text-white",
    },
    teal: {
        pill: "bg-teal-500/10 text-teal-600 border-teal-500/30 hover:bg-teal-600 hover:text-white dark:bg-teal-500/20 dark:text-teal-400 dark:hover:bg-teal-600 dark:hover:text-white shadow-teal-500/10",
        iconWrapper: "bg-teal-500/15 text-teal-600 dark:text-teal-400 group-hover:bg-white/20 group-hover:text-white",
    },
    rose: {
        pill: "bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-600 hover:text-white dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white shadow-rose-500/10",
        iconWrapper: "bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:bg-white/20 group-hover:text-white",
    },
    amber: {
        pill: "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500 hover:text-white dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white shadow-amber-500/10",
        iconWrapper: "bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-white/20 group-hover:text-white",
    },
    purple: {
        pill: "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-600 hover:text-white dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white shadow-purple-500/10",
        iconWrapper: "bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:bg-white/20 group-hover:text-white",
    },
    blue: {
        pill: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-600 hover:text-white dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white shadow-blue-500/10",
        iconWrapper: "bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:bg-white/20 group-hover:text-white",
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
