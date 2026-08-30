import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

type MetricCardProps = {
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
    accentColor?: string;
    iconColor?: string;
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
    accent,
    trend,
    trendDir = "neutral",
    className,
}: MetricCardProps) {
    const displayValue =
        typeof value === "number" ? value.toLocaleString() : value;

    const resolvedAccentColor = accentColor ?? "bg-primary";
    const resolvedIconColor = iconColor ?? accent ?? "bg-primary/10 text-primary border-primary/20";

    const TrendIcon =
        trendDir === "up" ? TrendingUp :
            trendDir === "down" ? TrendingDown : Minus;

    const trendClass =
        trendDir === "up" ? "text-success dark:text-success bg-success/10 border-success/20" :
            trendDir === "down" ? "text-destructive    dark:text-destructive    bg-destructive/10    border-destructive/20" :
                "text-muted-foreground bg-muted border-border/40";

    return (
        <div
            className={cn(
                "group relative flex overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700",
                className
            )}
        >
            {/* Left accent pill bar */}
            <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all duration-200 group-hover:w-1.5", resolvedAccentColor)} />

            <div className="relative z-10 flex flex-1 flex-col justify-between gap-4 pl-2">
                {/* Top row: label + icon */}
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-300 group-hover:scale-110", resolvedIconColor)}>
                        <Icon className="size-4" />
                    </div>
                </div>

                {/* Value & Hint */}
                <div>
                    <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                        {displayValue}
                    </p>
                    {hint && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {hint}
                        </p>
                    )}
                </div>

                {/* Trend badge */}
                {trend && (
                    <div className={cn("inline-flex w-fit items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold transition-colors", trendClass)}>
                        <TrendIcon className="size-3" />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
