import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("overflow-x-auto", className)}><table className="w-full text-sm">{children}</table></div>;
}

export function DataTableHeader({ children }: { children: ReactNode }) {
    return <thead className="sticky top-0 z-[1] bg-card/95 text-left text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">{children}</thead>;
}

export function DataTableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
    return <DataTable><tbody>{Array.from({ length: rows }, (_, row) => <tr key={row} className="border-b border-border/40">{Array.from({ length: columns }, (_, column) => <td key={column} className="px-5 py-4"><Skeleton className="h-5 w-full" /></td>)}</tr>)}</tbody></DataTable>;
}

type PaginationProps = { from: number | null; to: number | null; total: number; previous?: string | null; next?: string | null; onNavigate: (url: string) => void; noun: string };

export function DataTablePagination({ from, to, total, previous, next, onNavigate, noun }: PaginationProps) {
    if (total === 0) return null;
    return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Showing <span className="font-medium text-foreground">{from ?? 0}–{to ?? 0}</span> of <span className="font-medium text-foreground">{total}</span> {noun}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!previous} onClick={() => previous && onNavigate(previous)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={!next} onClick={() => next && onNavigate(next)}>Next<ChevronRight /></Button></div></div>;
}
