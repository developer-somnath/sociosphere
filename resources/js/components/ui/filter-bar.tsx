import { FilterX, Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ActiveFilter = { label: string; onRemove?: () => void };

type FilterBarProps = {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    searchLabel?: string;
    children?: ReactNode;
    activeFilters?: ActiveFilter[];
    onReset?: () => void;
    className?: string;
};

/**
 * Canonical filter bar (blueprint §8): debounced search + structured filter
 * controls + removable active-filter chips + reset. Every list page uses it.
 */
export function FilterBar({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    searchLabel,
    children,
    activeFilters = [],
    onReset,
    className,
}: FilterBarProps) {
    const { t } = useI18n();
    const resolvedPlaceholder = searchPlaceholder ?? t("common.search");
    return (
        <div
            className={cn(
                "rounded-2xl border border-border bg-card p-3.5 shadow-xs transition-all duration-200",
                className,
            )}
        >
            <div className="flex flex-wrap items-center gap-2.5">
                {onSearchChange ? (
                    <div className="relative min-w-[240px] flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                        <Input
                            aria-label={searchLabel}
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={resolvedPlaceholder}
                            className="h-9.5 rounded-xl border border-border bg-background pl-9.5 pr-8 text-xs font-medium shadow-2xs transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {searchValue ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={t("ui.clearSearch")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-muted"
                                onClick={() => onSearchChange("")}
                            >
                                <X className="size-3.5" />
                            </Button>
                        ) : null}
                    </div>
                ) : null}

                {children}

                {onReset ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={activeFilters.length === 0 && !searchValue}
                        onClick={onReset}
                        className="h-10 rounded-full border-border/70 bg-background/70 px-4 text-xs font-semibold hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                    >
                        <FilterX className="size-3.5" />
                        {t("ui.reset")}
                    </Button>
                ) : null}
            </div>

            {activeFilters.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {t("ui.activeFilters")}
                    </span>
                    {activeFilters.map((filter) => (
                        <span
                            key={filter.label}
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-all duration-150 shadow-2xs"
                        >
                            {filter.label}
                            {filter.onRemove ? (
                                <button
                                    type="button"
                                    onClick={filter.onRemove}
                                    aria-label={t("ui.removeFilter", { label: filter.label })}
                                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                                >
                                    <X className="size-3" />
                                </button>
                            ) : null}
                        </span>
                    ))}
                    <span className="text-[11px] font-medium text-muted-foreground">
                        {t("ui.activeFilterCount", { count: activeFilters.length })}
                    </span>
                </div>
            ) : null}
        </div>
    );
}
