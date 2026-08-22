import { Filter, SlidersHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { FilterBar, type ActiveFilter } from "@/components/ui/filter-bar";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type FilterDrawerProps = {
    /** Number of currently active (non-search) filters, used for the badge. */
    activeCount?: number;
    /** Whether the search box is shown inside the drawer. */
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    searchLabel?: string;
    /** Advanced filter controls (selects, date pickers, etc.). */
    children?: ReactNode;
    activeFilters?: ActiveFilter[];
    onReset?: () => void;
    /** Called when the user taps "Apply filters" (closes the drawer). */
    onApply?: () => void;
    className?: string;
};

/**
 * Reusable filter drawer (blueprint §8 / Sprint 2 S2-5). Wraps the canonical
 * `FilterBar` in a right-side Sheet so every module with >3 filters exposes
 * advanced filtering through an identical surface. The trigger pill mirrors the
 * `FilterBar` visual language (rounded-full, border-border/70, bg-card/80).
 */
export function FilterDrawer({
    activeCount = 0,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    searchLabel,
    children,
    activeFilters = [],
    onReset,
    onApply,
    className,
}: FilterDrawerProps) {
    const { t } = useI18n();
    const hasActive = activeCount > 0 || activeFilters.length > 0 || Boolean(searchValue);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-full border-border/70 bg-card/80 px-4 text-xs font-semibold shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
                >
                    <SlidersHorizontal className="size-4" />
                    {t("ui.filters")}
                    {hasActive ? (
                        <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                            {activeCount + (searchValue ? 1 : 0) + activeFilters.length}
                        </span>
                    ) : null}
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border/60 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Filter className="size-5" />
                        </div>
                        <div>
                            <SheetTitle>{t("ui.filters")}</SheetTitle>
                            <SheetDescription className="mt-1">{t("ui.filtersDescription")}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <FilterBar
                        searchValue={searchValue}
                        onSearchChange={onSearchChange}
                        searchPlaceholder={searchPlaceholder}
                        searchLabel={searchLabel}
                        activeFilters={activeFilters}
                        onReset={onReset}
                        className={cn("rounded-2xl border-border/70 bg-card/80 shadow-none", className)}
                    >
                        {children}
                    </FilterBar>
                </div>

                <SheetFooter className="sticky bottom-0 flex-row justify-end gap-2 border-t border-border/60 bg-popover/95 px-6 py-4 backdrop-blur">
                    {onReset ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="rounded-full px-4 text-xs font-semibold hover:bg-muted"
                        >
                            <X className="size-3.5" />
                            {t("ui.reset")}
                        </Button>
                    ) : null}
                    <SheetTrigger asChild>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={onApply}
                            className="rounded-full px-4 text-xs font-semibold"
                        >
                            {t("ui.applyFilters")}
                        </Button>
                    </SheetTrigger>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
