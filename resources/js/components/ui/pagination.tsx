import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZES = [25, 50, 100] as const;

type PaginationProps = {
    /** Current 1-based page. */
    page: number;
    /** Rows per page. */
    perPage: number;
    /** Total row count across all pages. */
    total: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    /** Noun for the summary line, e.g. "residents". */
    noun?: string;
    className?: string;
};

function pageWindow(page: number, lastPage: number): (number | "...")[] {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(lastPage - 1, page + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < lastPage - 1) pages.push("...");
    pages.push(lastPage);

    return pages;
}

/**
 * Server-driven pagination (blueprint §8 — pagination). Renders the
 * "Showing X–Y of Z" summary, a compact page-number window with ellipsis,
 * prev/next, and an optional page-size select. All changes are raised via
 * callbacks so the page can sync them to the URL / server.
 */
export function Pagination({
    page,
    perPage,
    total,
    onPageChange,
    onPerPageChange,
    perPageOptions = DEFAULT_PAGE_SIZES as unknown as number[],
    noun = "items",
    className,
}: PaginationProps) {
    if (total === 0) return null;

    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    return (
        <div
            className={cn(
                "flex flex-col gap-3 border-t border-border/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between",
                className,
            )}
        >
            <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
                    <span className="font-medium text-foreground">{total}</span> {noun}
                </p>
                {onPerPageChange && (
                    <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span className="sr-only">Rows per page</span>
                        <select
                            value={perPage}
                            onChange={(event) => onPerPageChange(Number(event.target.value))}
                            className="h-7 rounded-lg border border-border/70 bg-background/80 px-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                            {perPageOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <nav aria-label="Pagination" className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft />
                    Previous
                </Button>

                {pageWindow(page, lastPage).map((entry, index) =>
                    entry === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
                            …
                        </span>
                    ) : (
                        <Button
                            key={entry}
                            variant={entry === page ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => onPageChange(entry)}
                            aria-current={entry === page ? "page" : undefined}
                            className={cn(
                                "min-w-8 px-2",
                                entry === page && "cursor-default font-medium",
                            )}
                        >
                            {entry}
                        </Button>
                    ),
                )}

                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= lastPage}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    Next
                    <ChevronRight />
                </Button>
            </nav>
        </div>
    );
}
