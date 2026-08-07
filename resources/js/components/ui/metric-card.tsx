import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
    accent: string;
    trend?: string;
    className?: string;
};

export function MetricCard({
    label,
    value,
    hint,
    icon: Icon,
    accent,
    trend,
    className,
}: MetricCardProps) {
    const displayValue =
        typeof value === "number" ? value.toLocaleString() : value;

    return (
        <Card
            className={`group relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-background/80 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.38)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-28px_rgba(15,23,42,0.45)] ${className ?? ""}`.trim()}
        >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-muted-foreground">
                                {label}
                            </p>
                            {trend ? (
                                <Badge variant="secondary" className="rounded-full">
                                    {trend}
                                </Badge>
                            ) : null}
                        </div>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                            {displayValue}
                        </p>
                        {hint ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {hint}
                            </p>
                        ) : null}
                    </div>
                    <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${accent}`}
                    >
                        <Icon className="size-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
