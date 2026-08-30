import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronsUpDown,
    Columns3,
    Inbox,
} from "lucide-react";
import * as React from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu, type ExportFormat } from "@/components/ui/export-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("overflow-x-auto", className)}><table className="w-full text-sm">{children}</table></div>;
}

export function DataTableHeader({ children }: { children: ReactNode }) {
    return <thead className="sticky top-0 z-[1] border-b border-slate-200/80 bg-slate-50/80 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">{children}</thead>;
}

export type SortState = { key: string; direction: "asc" | "desc" };

/**
 * Sortable column header (blueprint §8 — table sorting). Wire `onSort` to a
 * handler that toggles: same key → flip direction, new key → asc.
 * Example: `onSort={(key) => router.get(route, { sort: key, direction: sort?.key === key && sort.direction === "asc" ? "desc" : "asc" })}`
 */
export function DataTableSortHeader({
    label,
    sortKey,
    sort,
    onSort,
    align = "left",
    className,
    style,
    resizable,
    onResizeStart,
}: {
    label: string;
    sortKey: string;
    sort: SortState | null;
    onSort: (key: string) => void;
    align?: "left" | "right" | "center";
    className?: string;
    style?: React.CSSProperties;
    resizable?: boolean;
    onResizeStart?: (event: React.PointerEvent<HTMLSpanElement>) => void;
}) {
    const active = sort?.key === sortKey;
    return (
        <th
            scope="col"
            style={style}
            className={cn(
                "relative px-5 py-3",
                align === "right" && "text-right",
                align === "center" && "text-center",
                className,
            )}
        >
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className={cn(
                    "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                    active ? "text-foreground" : "text-muted-foreground",
                    align === "right" && "flex-row-reverse",
                )}
            >
                {label}
                {active && sort?.direction === "asc" ? (
                    <ChevronUp className="size-3.5" />
                ) : active && sort?.direction === "desc" ? (
                    <ChevronDown className="size-3.5" />
                ) : (
                    <ChevronsUpDown className="size-3.5 opacity-60" />
                )}
            </button>
            {resizable && onResizeStart && <ColumnResizeHandle onPointerDown={onResizeStart} />}
        </th>
    );
}

export function DataTableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
    return <DataTable><tbody>{Array.from({ length: rows }, (_, row) => <tr key={row} className="border-b border-border/40">{Array.from({ length: columns }, (_, column) => <td key={column} className="px-5 py-4"><Skeleton className="h-5 w-full" /></td>)}</tr>)}</tbody></DataTable>;
}

type PaginationProps = { from: number | null; to: number | null; total: number; previous?: string | null; next?: string | null; onNavigate: (url: string) => void; noun: string };

export function DataTablePagination({ from, to, total, previous, next, onNavigate, noun }: PaginationProps) {
    const { t } = useI18n();
    if (total === 0) return null;
    return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{t("ui.showingFromTo", { from: from ?? 0, to: to ?? 0, total, noun })}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!previous} onClick={() => previous && onNavigate(previous)}><ChevronLeft />{t("ui.previous")}</Button><Button variant="outline" size="sm" disabled={!next} onClick={() => next && onNavigate(next)}>{t("ui.next")}<ChevronRight /></Button></div></div>;
}

/* ------------------------------------------------------------------ */
/* Full-featured generic DataTable<T> (blueprint §8 — data table)      */
/* ------------------------------------------------------------------ */

export type ColumnDef<T> = {
    /** Unique stable id — used as the sort key and column-visibility key. */
    id: string;
    /** Header label. */
    header: string;
    /** Optional value accessor used for the default cell renderer. */
    accessor?: (row: T) => React.ReactNode;
    /** Custom cell renderer — takes precedence over `accessor`. */
    cell?: (row: T) => React.ReactNode;
    /** Whether the column participates in server-side sorting. */
    sortable?: boolean;
    /** Server-side sort key; defaults to `id`. */
    sortKey?: string;
    /** Whether the column width can be dragged to resize. */
    resizable?: boolean;
    /** Default visibility; overridable via `columnVisibility`. */
    hidden?: boolean;
    align?: "left" | "right" | "center";
    className?: string;
    headerClassName?: string;
};

export type Selection = Array<string | number>;

export type DataTableProps<T> = {
    columns: ColumnDef<T>[];
    data: T[];
    /** Stable unique key per row (id/uuid). */
    rowKey: (row: T) => string | number;
    /* Sorting */
    sort?: SortState | null;
    onSort?: (sort: SortState) => void;
    /* Selection */
    selectedIds?: Selection;
    onSelectionChange?: (ids: Selection) => void;
    /* Column visibility */
    columnVisibility?: Record<string, boolean>;
    onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
    /* Export */
    onExport?: (format: ExportFormat) => void;
    /* States */
    loading?: boolean;
    emptyState?: React.ReactNode;
    /* Interaction */
    onRowClick?: (row: T) => void;
    /** Enable arrow-key row navigation + Enter to open. */
    keyboardNav?: boolean;
    /* Styling */
    className?: string;
    tableClassName?: string;
    caption?: string;
};

function ColumnResizeHandle({ onPointerDown }: { onPointerDown: (event: React.PointerEvent<HTMLSpanElement>) => void }) {
    return (
        <span
            role="separator"
            aria-orientation="vertical"
            aria-hidden="true"
            onPointerDown={onPointerDown}
            className="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border hover:after:bg-primary/60"
        />
    );
}

/**
 * Enterprise data table with typed columns (blueprint §8).
 *
 * Features: server-driven sorting, bulk selection with select-all,
 * column visibility toggles, CSV/XLSX/PDF export, resizable columns,
 * loading skeletons, empty states, row click, and optional keyboard
 * navigation (↑/↓/Home/End to move, Enter to open, Esc to clear).
 *
 * This is the canonical table for all module lists. The legacy `DataTable`
 * (plain children mode) remains exported for already-built pages.
 */
export function DataTableFull<T>({
    columns,
    data,
    rowKey,
    sort,
    onSort,
    selectedIds = [],
    onSelectionChange,
    columnVisibility,
    onColumnVisibilityChange,
    onExport,
    loading = false,
    emptyState,
    onRowClick,
    keyboardNav = false,
    className,
    tableClassName,
    caption,
}: DataTableProps<T>) {
    const { t } = useI18n();
    const selectable = !!onSelectionChange;

    const [widths, setWidths] = React.useState<Record<string, number>>({});
    const resizeRef = React.useRef<{ columnId: string; startX: number; startWidth: number } | null>(null);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const bodyRef = React.useRef<HTMLTableSectionElement | null>(null);

    const visibility = React.useMemo(() => {
        const base: Record<string, boolean> = {};
        for (const column of columns) base[column.id] = !column.hidden;
        return { ...base, ...columnVisibility };
    }, [columns, columnVisibility]);

    const visibleColumns = React.useMemo(() => columns.filter((column) => visibility[column.id]), [columns, visibility]);

    const allVisibleSelected = selectable && data.length > 0 && data.every((row) => selectedIds.includes(rowKey(row)));
    const someVisibleSelected = selectable && data.some((row) => selectedIds.includes(rowKey(row))) && !allVisibleSelected;

    /* Resizable columns -------------------------------------------------- */

    const stopResize = React.useCallback(() => {
        resizeRef.current = null;
        window.removeEventListener("pointermove", onResizeMove);
        window.removeEventListener("pointerup", stopResize);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, []);

    function onResizeMove(event: PointerEvent) {
        const resize = resizeRef.current;
        if (!resize) return;
        const next = Math.max(96, resize.startWidth + (event.clientX - resize.startX));
        setWidths((prev) => ({ ...prev, [resize.columnId]: next }));
    }

    const startResize = (columnId: string) => (event: React.PointerEvent<HTMLSpanElement>) => {
        event.preventDefault();
        const th = (event.currentTarget as HTMLElement).closest("th");
        const startWidth = th?.getBoundingClientRect().width ?? 160;
        resizeRef.current = { columnId, startX: event.clientX, startWidth };
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onResizeMove);
        window.addEventListener("pointerup", stopResize);
    };

    /* Selection ---------------------------------------------------------- */

    const toggleAll = () => {
        if (!onSelectionChange) return;
        if (allVisibleSelected) {
            onSelectionChange(selectedIds.filter((id) => !data.some((row) => rowKey(row) === id)));
        } else {
            const keys = data.map(rowKey);
            onSelectionChange([...new Set([...selectedIds, ...keys])]);
        }
    };

    const toggleRow = (row: T) => {
        if (!onSelectionChange) return;
        const key = rowKey(row);
        onSelectionChange(selectedIds.includes(key) ? selectedIds.filter((id) => id !== key) : [...selectedIds, key]);
    };

    /* Keyboard navigation ------------------------------------------------ */

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!keyboardNav || data.length === 0) return;
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActiveIndex((prev) => {
                    const next = prev === null ? 0 : Math.min(prev + 1, data.length - 1);
                    bodyRef.current?.querySelector(`[data-row-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
                    return next;
                });
                break;
            case "ArrowUp":
                event.preventDefault();
                setActiveIndex((prev) => {
                    const next = prev === null ? data.length - 1 : Math.max(prev - 1, 0);
                    bodyRef.current?.querySelector(`[data-row-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
                    return next;
                });
                break;
            case "Home":
                event.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                event.preventDefault();
                setActiveIndex(data.length - 1);
                break;
            case "Enter":
                event.preventDefault();
                if (activeIndex !== null && onRowClick) onRowClick(data[activeIndex]);
                break;
            case "Escape":
                setActiveIndex(null);
                break;
        }
    };

    const rowCount = visibleColumns.length + (selectable ? 1 : 0);
    const emptyContent = emptyState ?? (
        <EmptyState
            icon={Inbox}
            title={t("ui.nothingHereYet")}
            description={t("ui.noRecordsMatch")}
        />
    );

    const showToolbar = !!(onExport || onColumnVisibilityChange || selectedIds.length > 0);

    return (
        <div className={cn("overflow-x-auto", className)}>
            {/* Toolbar: selection summary · export · column visibility */}
            {showToolbar && (
                <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-2.5">
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                        {selectedIds.length > 0 ? (
                            <>{t("ui.xSelected", { count: selectedIds.length })}</>
                        ) : (
                            <span className="sr-only">{t("ui.tableToolbar")}</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        {onExport && <ExportMenu onExport={onExport} disabled={loading} />}
                        {onColumnVisibilityChange && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" aria-label={t("ui.toggleColumnVisibility")}>
                                        <Columns3 />
                                        {t("ui.columns")}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t("ui.visibleColumns")}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {columns.map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={visibility[column.id] ?? false}
                                            onCheckedChange={(checked) =>
                                                onColumnVisibilityChange({ ...visibility, [column.id]: checked })
                                            }
                                        >
                                            {column.header}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            )}

            <div
                onKeyDown={onKeyDown}
                tabIndex={keyboardNav ? 0 : undefined}
                aria-label={caption}
                className={cn(keyboardNav && "outline-none focus-visible:ring-2 focus-visible:ring-ring/40")}
            >
                <table className={cn("w-full text-sm", tableClassName)}>
                    {caption && <caption className="sr-only">{caption}</caption>}
                    <thead className="sticky top-0 z-[1] border-b border-slate-200/80 bg-slate-50/80 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                        <tr>
                            {selectable && (
                                <th scope="col" className="w-12 px-5 py-3">
                                    <Checkbox
                                        checked={someVisibleSelected ? "indeterminate" : allVisibleSelected}
                                        onCheckedChange={toggleAll}
                                        aria-label={t("ui.selectAllRows")}
                                    />
                                </th>
                            )}
                            {visibleColumns.map((column) => {
                                const columnWidth = widths[column.id];
                                const style = columnWidth ? { width: columnWidth, minWidth: columnWidth } : undefined;
                                const alignClass =
                                    column.align === "right"
                                        ? "text-right"
                                        : column.align === "center"
                                            ? "text-center"
                                            : undefined;

                                if (column.sortable) {
                                    return (
                                        <DataTableSortHeader
                                            key={column.id}
                                            label={column.header}
                                            sortKey={column.sortKey ?? column.id}
                                            sort={sort ?? null}
                                            onSort={(key) =>
                                                onSort?.({
                                                    key,
                                                    direction:
                                                        sort?.key === key && sort.direction === "asc" ? "desc" : "asc",
                                                })
                                            }
                                            align={column.align}
                                            style={style}
                                            className={column.headerClassName}
                                            resizable={column.resizable}
                                            onResizeStart={startResize(column.id)}
                                        />
                                    );
                                }

                                return (
                                    <th
                                        key={column.id}
                                        scope="col"
                                        style={style}
                                        className={cn("relative px-5 py-3", alignClass, column.headerClassName)}
                                    >
                                        {column.header}
                                        {column.resizable && <ColumnResizeHandle onPointerDown={startResize(column.id)} />}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody ref={bodyRef}>
                        {loading && data.length === 0
                            ? Array.from({ length: 6 }, (_, row) => (
                                <tr key={`skeleton-${row}`} className="border-b border-border/40">
                                    {Array.from({ length: rowCount }, (_, column) => (
                                        <td key={column} className="px-5 py-4">
                                            <Skeleton className="h-5 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                            : data.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={rowCount} className="px-5 py-4">
                                            {emptyContent}
                                        </td>
                                    </tr>
                                )
                                : data.map((row, index) => {
                                    const key = rowKey(row);
                                    const isSelected = selectedIds.includes(key);
                                    const isActive = keyboardNav && activeIndex === index;
                                    return (
                                        <tr
                                            key={key}
                                            data-row-index={index}
                                            aria-selected={isSelected || undefined}
                                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                                            onMouseEnter={keyboardNav ? () => setActiveIndex(index) : undefined}
                                            className={cn(
                                                "border-b border-border/40 transition-colors duration-150 hover:bg-accent/30",
                                                isSelected && "bg-primary/10 font-medium",
                                                isActive && "bg-accent/50",
                                                onRowClick && "cursor-pointer",
                                            )}
                                        >
                                            {selectable && (
                                                <td className="px-5 py-3.5">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleRow(row)}
                                                        aria-label={`Select row ${index + 1}`}
                                                    />
                                                </td>
                                            )}
                                            {visibleColumns.map((column) => {
                                                const value = column.cell
                                                    ? column.cell(row)
                                                    : column.accessor
                                                        ? column.accessor(row)
                                                        : null;
                                                return (
                                                    <td
                                                        key={column.id}
                                                        className={cn(
                                                            "px-5 py-3.5",
                                                            column.align === "right" && "text-right",
                                                            column.align === "center" && "text-center",
                                                            column.className,
                                                        )}
                                                    >
                                                        {value}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
