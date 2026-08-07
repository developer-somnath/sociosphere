import type { CSSProperties, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

/**
 * Chart wrappers (blueprint §9 — chart palette, hover tooltip card,
 * click-to-toggle legend). Dependency-free over recharts v3.
 *
 * Usage:
 *   const config = { occupied: { label: "Occupied", color: "var(--color-chart-1)" } };
 *   <ChartContainer config={config} className="h-64">
 *     <BarChart data={data}>…</BarChart>
 *   </ChartContainer>
 *   <Tooltip content={<ChartTooltipContent config={config} />} />
 */

export type ChartConfig = Record<
    string,
    { label: string; color: string }
>;

export function ChartContainer({
    config,
    children,
    className,
}: {
    config: ChartConfig;
    children: ReactNode;
    className?: string;
}) {
    const cssVars = Object.entries(config).reduce<Record<string, string>>(
        (acc, [key, item]) => {
            acc[`--color-${key}`] = item.color;
            return acc;
        },
        {},
    );

    return (
        <div
            className={cn("h-64 w-full", className)}
            style={cssVars as CSSProperties}
        >
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );
}

type TooltipPayloadItem = {
    name?: string | number;
    value?: number | string | Array<number | string>;
    color?: string;
    fill?: string;
    dataKey?: string | number;
};

type ChartTooltipContentProps = {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string | number;
    config: ChartConfig;
    formatter?: (value: number | string) => string;
    labelFormatter?: (label: string | number) => string;
    className?: string;
};

export function ChartTooltipContent({
    active,
    payload,
    label,
    config,
    formatter,
    labelFormatter,
    className,
}: ChartTooltipContentProps) {
    if (!active || !payload?.length) return null;

    const defaultFormatter = (value: number | string) =>
        typeof value === "number"
            ? new Intl.NumberFormat().format(value)
            : String(value);

    return (
        <div
            className={cn(
                "rounded-xl border border-border/70 bg-popover px-3 py-2 text-sm shadow-lg",
                className,
            )}
        >
            {label !== undefined && (
                <p className="mb-1.5 font-medium text-foreground">
                    {labelFormatter ? labelFormatter(label) : String(label)}
                </p>
            )}
            <ul className="space-y-1">
                {payload.map((item, index) => {
                    const key = String(item.dataKey ?? item.name ?? index);
                    const cfg = config[key];
                    const color = item.color ?? item.fill ?? cfg?.color;
                    return (
                        <li
                            key={index}
                            className="flex items-center justify-between gap-4"
                        >
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                {cfg?.label ?? key}
                            </span>
                            <span className="font-medium tabular-nums text-foreground">
                                {formatter
                                    ? formatter(item.value as number | string)
                                    : defaultFormatter(
                                          item.value as number | string,
                                      )}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function ChartLegend({
    config,
    onToggle,
    className,
}: {
    config: ChartConfig;
    /** Provide to make legend chips clickable (toggle series). */
    onToggle?: (key: string) => void;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
            {Object.entries(config).map(([key, item]) => (
                <button
                    key={key}
                    type="button"
                    onClick={onToggle ? () => onToggle(key) : undefined}
                    className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors",
                        onToggle && "cursor-pointer hover:text-foreground",
                    )}
                >
                    <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                </button>
            ))}
        </div>
    );
}
