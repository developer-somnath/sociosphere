import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

type MetricCardProps = {
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
    /** NEW: Tailwind class for the left accent bar, e.g. "bg-blue-500" */
    accentColor?: string;
    /** NEW: Tailwind classes for the icon wrapper */
    iconColor?: string;
    /** LEGACY: old combined accent string (e.g. "bg-blue-50 text-blue-600 ...") */
    accent?: string;
    trend?: string;
    trendDir?: TrendDirection;
    className?: string;
};

export function MetricCard({
    label,
    value,
    hint,
    icon: Icon,
    accentColor,
    iconColor,
    accent,          // legacy prop — maps to iconColor (old icon wrapper style)
    trend,
    trendDir = "neutral",
    className,
}: MetricCardProps) {
    const displayValue =
        typeof value === "number" ? value.toLocaleString() : value;

    // Legacy compat: if only the old `accent` prop is passed, use it for the
    // icon wrapper. The accent bar gets a neutral primary color.
    const resolvedAccentColor = accentColor ?? "bg-primary";
    const resolvedIconColor   = iconColor ?? accent ?? "bg-primary/10 text-primary";

    const TrendIcon =
        trendDir === "up" ? TrendingUp :
        trendDir === "down" ? TrendingDown : Minus;

    const trendClass =
        trendDir === "up"   ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" :
        trendDir === "down" ? "text-rose-600    dark:text-rose-400    bg-rose-50    dark:bg-rose-500/10"    :
                              "text-muted-foreground bg-muted";

    return (
        <div
            className={cn(
                "relative flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-150 hover:shadow-md",
                className
            )}
        >
            {/* Left accent bar */}
            <div className={cn("w-1 shrink-0 rounded-l-xl", resolvedAccentColor)} />

            <div className="flex flex-1 flex-col gap-3 p-5">
                {/* Top row: label + icon */}
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", resolvedIconColor)}>
                        <Icon className="size-4" />
                    </div>
                </div>

                {/* Value */}
                <div>
                    <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                        {displayValue}
                    </p>
                    {hint && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {hint}
                        </p>
                    )}
                </div>

                {/* Trend chip */}
                {trend && (
                    <div className={cn("inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", trendClass)}>
                        <TrendIcon className="size-3" />
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}
