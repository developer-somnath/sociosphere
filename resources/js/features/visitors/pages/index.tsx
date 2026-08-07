import { Head, Link, router, usePage } from "@inertiajs/react";
import { CheckCircle2, DoorOpen, Inbox, LogIn, LogOut, Pencil, Plus, ShieldCheck, Trash2, UserX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableFull, type Selection } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { exportCsv } from "@/lib/export-csv";
import { toast } from "@/lib/toast";
import type { PageProps } from "@/types";
import type {
    Paginated,
    VisitorPass,
    VisitorStatus,
} from "@/features/visitors/types";

type IndexProps = {
    passes: Paginated<VisitorPass>;
    filters: {
        search: string;
        status: VisitorStatus | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

const selectClasses =
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

const statusStyles: Record<VisitorStatus, string> = {
    pending:
        "border-transparent bg-amber-600/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    approved:
        "border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    checked_in:
        "border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    checked_out:
        "border-transparent bg-muted text-muted-foreground",
    rejected:
        "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
};

const statusLabels: Record<VisitorStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    rejected: "Rejected",
};

function formatDate(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function flatLabel(pass: VisitorPass): string {
    if (!pass.flat) return "—";
    const tower = pass.flat.tower?.name ? `${pass.flat.tower.name} · ` : "";
    return `${tower}${pass.flat.flat_no}`;
}

export default function VisitorsIndex() {
    const { passes, filters, can } =
        usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status ?? "");
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<VisitorPass | null>(null);
    const isFirstRender = useRef(true);

    const sort = filters.sort_by
        ? {
              key: filters.sort_by,
              direction: (filters.sort_dir === "asc" ? "asc" : "desc") as
                  | "asc"
                  | "desc",
          }
        : null;

    const buildParams = () => ({
        search: search.trim() || undefined,
        status: status || undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    const applyFilters = (
        overrides: { search?: string; status?: string } = {},
    ) => {
        const params: Record<string, string> = {};
        const nextSearch = (overrides.search ?? search).trim();
        const nextStatus = overrides.status ?? status;

        if (nextSearch !== "") params.search = nextSearch;
        if (nextStatus !== "") params.status = nextStatus;

        router.get(
            route("visitors.index"),
            { ...params, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("visitors.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    // Debounced, URL-synced search (blueprint §8)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            applyFilters({ search });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const clearAll = () => {
        setSearch("");
        setStatus("");
        router.get(
            route("visitors.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const runAction = (pass: VisitorPass, action: string) => {
        router.post(
            route(`visitors.${action}`, pass.uuid),
            {},
            { preserveScroll: true },
        );
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const pass = passes.data.find(
                (candidate) => candidate.uuid === id || candidate.id === id,
            );
            if (!pass || pass.status !== "pending") return;
            setTimeout(
                () =>
                    router.delete(route("visitors.destroy", pass.uuid), {
                        preserveScroll: true,
                    }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const handleExport = (format: ExportFormat) => {
        if (format !== "csv") {
            toast({
                title: "Export coming soon",
                variant: "info",
                description: `${format.toUpperCase()} export will be available soon.`,
            });
            return;
        }
        exportCsv<VisitorPass>({
            filename: "visitor-passes.csv",
            columns: [
                { header: "Visitor", accessor: (pass) => pass.visitor.name },
                { header: "Phone", accessor: (pass) => pass.visitor.phone },
                { header: "Email", accessor: (pass) => pass.visitor.email ?? "" },
                { header: "Flat", accessor: (pass) => flatLabel(pass) },
                { header: "Purpose", accessor: (pass) => pass.purpose },
                {
                    header: "Vehicle",
                    accessor: (pass) => pass.vehicle_number ?? "",
                },
                { header: "Status", accessor: (pass) => statusLabels[pass.status] },
                {
                    header: "Scheduled For",
                    accessor: (pass) => pass.scheduled_for ?? "",
                },
                { header: "Check In", accessor: (pass) => pass.check_in_at ?? "" },
                { header: "Check Out", accessor: (pass) => pass.check_out_at ?? "" },
            ],
            rows: passes.data,
        });
    };

    const columns: ColumnDef<VisitorPass>[] = useMemo(
        () => [
            {
                id: "visitor",
                header: "Visitor",
                sortable: true,
                sortKey: "visitor_name",
                cell: (pass) => (
                    <div className="min-w-0">
                        <p className="font-medium text-foreground">
                            {pass.visitor.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {pass.visitor.phone}
                            {pass.visitor.email
                                ? ` · ${pass.visitor.email}`
                                : ""}
                        </p>
                    </div>
                ),
            },
            {
                id: "flat",
                header: "Flat",
                cell: (pass) => (
                    <span className="text-muted-foreground">
                        {flatLabel(pass)}
                    </span>
                ),
            },
            {
                id: "purpose",
                header: "Purpose",
                sortable: true,
                sortKey: "purpose",
                cell: (pass) => (
                    <span className="text-muted-foreground">{pass.purpose}</span>
                ),
            },
            {
                id: "vehicle",
                header: "Vehicle",
                cell: (pass) => (
                    <span className="text-muted-foreground">
                        {pass.vehicle_number || "—"}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Status",
                sortable: true,
                sortKey: "status",
                cell: (pass) => (
                    <Badge className={statusStyles[pass.status]}>
                        {statusLabels[pass.status]}
                    </Badge>
                ),
            },
            {
                id: "schedule",
                header: "Schedule",
                sortable: true,
                sortKey: "scheduled_for",
                cell: (pass) => (
                    <span className="text-muted-foreground">
                        {formatDate(pass.scheduled_for)}
                    </span>
                ),
            },
            {
                id: "check",
                header: "Check In / Out",
                cell: (pass) => (
                    <div className="flex flex-col text-xs text-muted-foreground">
                        <span>In: {formatDateTime(pass.check_in_at)}</span>
                        <span>Out: {formatDateTime(pass.check_out_at)}</span>
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (pass) => (
                    <div
                        className="flex items-center justify-end gap-0.5"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {can.update && pass.status === "pending" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Approve"
                                    aria-label={`Approve ${pass.visitor.name}`}
                                    onClick={() => runAction(pass, "approve")}
                                >
                                    <CheckCircle2 className="size-4 text-emerald-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Reject"
                                    aria-label={`Reject ${pass.visitor.name}`}
                                    onClick={() => runAction(pass, "reject")}
                                >
                                    <UserX className="size-4 text-destructive" />
                                </Button>
                            </>
                        )}

                        {can.update && pass.status === "approved" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Check in"
                                aria-label={`Check in ${pass.visitor.name}`}
                                onClick={() => runAction(pass, "check-in")}
                            >
                                <LogIn className="size-4 text-emerald-600" />
                            </Button>
                        )}

                        {can.update && pass.status === "checked_in" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Check out"
                                aria-label={`Check out ${pass.visitor.name}`}
                                onClick={() => runAction(pass, "check-out")}
                            >
                                <LogOut className="size-4 text-muted-foreground" />
                            </Button>
                        )}

                        <RowActions
                            actions={[
                                {
                                    label: "Edit",
                                    icon: Pencil,
                                    onClick: () =>
                                        router.visit(
                                            route("visitors.edit", pass.uuid),
                                        ),
                                },
                                {
                                    label: "Remove",
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete || pass.status !== "pending",
                                    onClick: () => setConfirming(pass),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [can],
    );

    const handleDelete = () => {
        if (!confirming) return;
        const pass = confirming;
        setConfirming(null);
        router.delete(route("visitors.destroy", pass.uuid), {
            preserveScroll: true,
        });
    };

    const hasActiveFilters = search !== "" || status !== "";

    return (
        <AppLayout>
            <Head title="Visitors" />

            <PageHeader
                title="Visitors"
                description="Gate passes, approvals, and check-in/check-out tracking."
                icon={<DoorOpen className="size-5" />}
                actions={
                    can.create && (
                        <Button asChild>
                            <Link href={route("visitors.create")}>
                                <Plus />
                                New pass
                            </Link>
                        </Button>
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search visitor, phone, vehicle, purpose…"
                searchLabel="Search visitors"
                activeFilters={
                    status
                        ? [
                              {
                                  label: statusLabels[status as VisitorStatus],
                                  onRemove: () => {
                                      setStatus("");
                                      applyFilters({ status: "" });
                                  },
                              },
                          ]
                        : []
                }
                onReset={clearAll}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
            >
                <select
                    className={`${selectClasses} w-auto min-w-40`}
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        applyFilters({ status: e.target.value });
                    }}
                    aria-label="Filter by status"
                >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="rejected">Rejected</option>
                </select>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    {passes.total} pass{passes.total === 1 ? "" : "es"}
                </div>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<VisitorPass>
                        columns={columns}
                        data={passes.data}
                        rowKey={(pass) => pass.uuid}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Inbox}
                                title={
                                    hasActiveFilters
                                        ? "No passes match your filters"
                                        : "No visitor passes yet"
                                }
                                description={
                                    hasActiveFilters
                                        ? "Try different search terms or filters."
                                        : can.create
                                          ? "Create your first gate pass to get started."
                                          : "Check back later."
                                }
                                action={
                                    can.create && !hasActiveFilters ? (
                                        <Button asChild>
                                            <Link href={route("visitors.create")}>
                                                <Plus />
                                                New pass
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                    {passes.last_page > 1 && (
                        <Pagination
                            page={passes.current_page}
                            perPage={passes.per_page}
                            total={passes.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("visitors.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun="passes"
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun="passes"
                actions={[
                    {
                        label: "Delete",
                        icon: <Trash2 />,
                        destructive: true,
                        disabled: !can.delete,
                        onClick: bulkDelete,
                    },
                ]}
            />

            {confirming !== null && (
                <ConfirmDialog
                    open={confirming !== null}
                    onOpenChange={(open) => {
                        if (!open) setConfirming(null);
                    }}
                    title={
                        confirming
                            ? `Remove pass for ${confirming.visitor.name}?`
                            : "Remove pass?"
                    }
                    description="This removes the pending gate pass from the register."
                    confirmLabel="Remove"
                    destructive
                    onConfirm={handleDelete}
                />
            )}
        </AppLayout>
    );
}
