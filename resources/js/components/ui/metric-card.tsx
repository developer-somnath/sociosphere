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
    const resolvedIconColor   = iconColor ?? accent ?? "bg-primary/10 text-primary border-primary/20";

    const TrendIcon =
        trendDir === "up" ? TrendingUp :
        trendDir === "down" ? TrendingDown : Minus;

    const trendClass =
        trendDir === "up"   ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
        trendDir === "down" ? "text-rose-600    dark:text-rose-400    bg-rose-500/10    border-rose-500/20"    :
                              "text-muted-foreground bg-muted border-border/40";

    return (
        <div
            className={cn(
                "group relative flex overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[0_4px_20px_-10px_rgba(15,23,42,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg dark:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.4)]",
                className
            )}
        >
            {/* Left accent pill bar */}
            <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-200 group-hover:w-1.5", resolvedAccentColor)} />

            <div className="flex flex-1 flex-col justify-between gap-4 pl-2">
                {/* Top row: label + icon */}
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105", resolvedIconColor)}>
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
