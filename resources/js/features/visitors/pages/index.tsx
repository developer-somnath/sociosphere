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
import { QuickActionPill } from "@/components/ui/quick-action-pill";
import { RowActions } from "@/components/ui/row-actions";
import { exportCsv } from "@/lib/export-csv";
import { t, useI18n } from "@/lib/i18n";
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
    "h-10 rounded-full border border-border/70 bg-background/80 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

const statusStyles: Record<VisitorStatus, string> = {
    pending:
        "border-transparent bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning",
    approved:
        "border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info",
    checked_in:
        "border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand",
    checked_out:
        "border-transparent bg-muted text-muted-foreground",
    rejected:
        "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
};

function statusLabel(status: VisitorStatus): string {
    switch (status) {
        case "pending":
            return t("common.pending");
        case "approved":
            return t("common.approved");
        case "checked_in":
            return t("visitors.status.checkedIn");
        case "checked_out":
            return t("visitors.status.checkedOut");
        case "rejected":
            return t("common.rejected");
        default:
            return status;
    }
}

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
    const { t } = useI18n();

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
                title: t("visitors.exportComingSoon"),
                variant: "info",
                description: t("visitors.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<VisitorPass>({
            filename: "visitor-passes.csv",
            columns: [
                { header: t("visitors.colVisitor"), accessor: (pass) => pass.visitor.name },
                { header: t("common.phone"), accessor: (pass) => pass.visitor.phone },
                { header: t("common.email"), accessor: (pass) => pass.visitor.email ?? "" },
                { header: t("visitors.colFlat"), accessor: (pass) => flatLabel(pass) },
                { header: t("visitors.colPurpose"), accessor: (pass) => pass.purpose },
                {
                    header: t("visitors.colVehicle"),
                    accessor: (pass) => pass.vehicle_number ?? "",
                },
                { header: t("common.status"), accessor: (pass) => statusLabel(pass.status) },
                {
                    header: t("visitors.colScheduledFor"),
                    accessor: (pass) => pass.scheduled_for ?? "",
                },
                { header: t("visitors.colCheckIn"), accessor: (pass) => pass.check_in_at ?? "" },
                { header: t("visitors.colCheckOut"), accessor: (pass) => pass.check_out_at ?? "" },
            ],
            rows: passes.data,
        });
    };

    const columns: ColumnDef<VisitorPass>[] = useMemo(
        () => [
            {
                id: "visitor",
                header: t("visitors.colVisitor"),
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
                header: t("visitors.colFlat"),
                cell: (pass) => (
                    <span className="text-muted-foreground">
                        {flatLabel(pass)}
                    </span>
                ),
            },
            {
                id: "purpose",
                header: t("visitors.colPurpose"),
                sortable: true,
                sortKey: "purpose",
                cell: (pass) => (
                    <span className="text-muted-foreground">{pass.purpose}</span>
                ),
            },
            {
                id: "vehicle",
                header: t("visitors.colVehicle"),
                cell: (pass) => (
                    <span className="text-muted-foreground">
                        {pass.vehicle_number || "—"}
                    </span>
                ),
            },
            {
                id: "status",
                header: t("common.status"),
                sortable: true,
                sortKey: "status",
                cell: (pass) => (
                    <Badge className={statusStyles[pass.status]}>
                        {statusLabel(pass.status)}
                    </Badge>
                ),
            },
            {
                id: "schedule",
                header: t("visitors.colSchedule"),
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
                header: t("visitors.colCheckInOut"),
                cell: (pass) => (
                    <div className="flex flex-col text-xs text-muted-foreground">
                        <span>
                            {t("visitors.checkInShort", {
                                time: formatDateTime(pass.check_in_at),
                            })}
                        </span>
                        <span>
                            {t("visitors.checkOutShort", {
                                time: formatDateTime(pass.check_out_at),
                            })}
                        </span>
                    </div>
                ),
            },
            {
                id: "actions",
                header: t("common.actions"),
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
                                    title={t("visitors.approve")}
                                    aria-label={t("visitors.approveAria", {
                                        name: pass.visitor.name,
                                    })}
                                    onClick={() => runAction(pass, "approve")}
                                >
                                    <CheckCircle2 className="size-4 text-brand" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title={t("visitors.reject")}
                                    aria-label={t("visitors.rejectAria", {
                                        name: pass.visitor.name,
                                    })}
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
                                title={t("visitors.checkIn")}
                                aria-label={t("visitors.checkInAria", {
                                    name: pass.visitor.name,
                                })}
                                onClick={() => runAction(pass, "check-in")}
                            >
                                <LogIn className="size-4 text-brand" />
                            </Button>
                        )}

                        {can.update && pass.status === "checked_in" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title={t("visitors.checkOut")}
                                aria-label={t("visitors.checkOutAria", {
                                    name: pass.visitor.name,
                                })}
                                onClick={() => runAction(pass, "check-out")}
                            >
                                <LogOut className="size-4 text-muted-foreground" />
                            </Button>
                        )}

                        <RowActions
                            actions={[
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    onClick: () =>
                                        router.visit(
                                            route("visitors.edit", pass.uuid),
                                        ),
                                },
                                {
                                    label: t("visitors.remove"),
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
        [can, t],
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
            <Head title={t("visitors.title")} />

            <PageHeader
                title={t("visitors.title")}
                description={t("visitors.pageDescription")}
                icon={<DoorOpen className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("visitors.create")}
                            icon={Plus}
                            label={t("visitors.createPass")}
                            variant="blue"
                        />
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("visitors.searchPlaceholder")}
                searchLabel={t("visitors.searchLabel")}
                activeFilters={
                    status
                        ? [
                              {
                                  label: statusLabel(status as VisitorStatus),
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
                    aria-label={t("visitors.filterByStatus")}
                >
                    <option value="">{t("visitors.statusAll")}</option>
                    <option value="pending">{t("common.pending")}</option>
                    <option value="approved">{t("common.approved")}</option>
                    <option value="checked_in">
                        {t("visitors.status.checkedIn")}
                    </option>
                    <option value="checked_out">
                        {t("visitors.status.checkedOut")}
                    </option>
                    <option value="rejected">{t("common.rejected")}</option>
                </select>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    {passes.total}{" "}
                    {passes.total === 1
                        ? t("visitors.passSingular")
                        : t("visitors.passPlural")}
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
                                        ? t("visitors.emptySearchTitle")
                                        : t("visitors.emptyTitle")
                                }
                                description={
                                    hasActiveFilters
                                        ? t("visitors.emptySearchDescription")
                                        : can.create
                                          ? t("visitors.emptyDescription")
                                          : t("visitors.emptyDescriptionNoCreate")
                                }
                                action={
                                    can.create && !hasActiveFilters ? (
                                        <Button asChild>
                                            <Link href={route("visitors.create")}>
                                                <Plus />
                                                {t("visitors.newPass")}
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
                            noun={t("visitors.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("visitors.nounPlural")}
                actions={[
                    {
                        label: t("common.delete"),
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
                            ? t("visitors.confirmRemoveTitle", {
                                  name: confirming.visitor.name,
                              })
                            : t("visitors.confirmRemoveTitleGeneric")
                    }
                    description={t("visitors.confirmRemoveDescription")}
                    confirmLabel={t("visitors.remove")}
                    destructive
                    onConfirm={handleDelete}
                />
            )}
        </AppLayout>
    );
}
