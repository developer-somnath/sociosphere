import { FilterX, Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    searchPlaceholder = "Search…",
    searchLabel,
    children,
    activeFilters = [],
    onReset,
    className,
}: FilterBarProps) {
    return (
        <div className={cn("rounded-2xl border bg-card p-3", className)}>
            <div className="flex flex-wrap items-center gap-2">
                {onSearchChange ? (
                    <div className="relative min-w-56 flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            aria-label={searchLabel}
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="pl-8"
                        />
                        {searchValue ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Clear search"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => onSearchChange("")}
                            >
                                <X />
                            </Button>
                        ) : null}
                    </div>
                ) : null}
                {children}
                {onReset ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={activeFilters.length === 0 && !searchValue}
                        onClick={onReset}
                    >
                        <FilterX />
                        Reset
                    </Button>
                ) : null}
            </div>
            {activeFilters.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t pt-2.5">
                    {activeFilters.map((filter) => (
                        <span
                            key={filter.label}
                            className="inline-flex items-center gap-1 rounded-full border bg-muted/60 px-2 py-0.5 text-xs font-medium"
                        >
                            {filter.label}
                            {filter.onRemove ? (
                                <button
                                    type="button"
                                    onClick={filter.onRemove}
                                    aria-label={`Remove filter ${filter.label}`}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3" />
                                </button>
                            ) : null}
                        </span>
                    ))}
                    <span className="text-xs text-muted-foreground">
                        {activeFilters.length} active
                    </span>
                </div>
            ) : null}
        </div>
    );
}
