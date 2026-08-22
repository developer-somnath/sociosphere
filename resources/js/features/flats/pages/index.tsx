import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Building2,
    DoorOpen,
    Home,
    Inbox,
    Pencil,
    Percent,
    Plus,
    Trash2,
} from "lucide-react";
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
    Flat,
    FlatStats,
    Paginated,
    TowerOption,
} from "@/features/flats/types";

type IndexProps = {
    flats: Paginated<Flat>;
    filters: {
        search: string;
        tower_id: number | null;
        status: "Occupied" | "Vacant" | "Self-Occupied" | null;
        type: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    towers: TowerOption[];
    stats: FlatStats;
    can: { create: boolean; delete: boolean };
};

const selectClasses =
    "h-10 rounded-full border border-border/70 bg-background/80 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

const statusStyles: Record<
    Flat["occupancy_status"],
    { badge: string; dot: string }
> = {
    Occupied: {
        badge:
            "border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand",
        dot: "bg-brand",
    },
    Vacant: {
        badge:
            "border-transparent bg-muted text-muted-foreground",
        dot: "bg-muted-foreground",
    },
    "Self-Occupied": {
        badge:
            "border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info",
        dot: "bg-info",
    },
};

function occupancyStatusLabel(status: Flat["occupancy_status"]): string {
    switch (status) {
        case "Occupied":
            return t("flats.status.occupied");
        case "Vacant":
            return t("flats.status.vacant");
        case "Self-Occupied":
            return t("flats.status.selfOccupied");
    }
}

export default function FlatsIndex() {
    const { flats, filters, towers, stats, can } =
        usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();

    const [search, setSearch] = useState(filters.search);
    const [towerId, setTowerId] = useState(
        filters.tower_id === null ? "" : String(filters.tower_id),
    );
    const [status, setStatus] = useState(filters.status ?? "");
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<Flat | null>(null);
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
        tower_id: towerId || undefined,
        status: status || undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    const applyFilters = (
        overrides: { search?: string; tower_id?: string; status?: string } = {},
    ) => {
        const params: Record<string, string> = {};
        const nextSearch = (overrides.search ?? search).trim();
        const nextTower = overrides.tower_id ?? towerId;
        const nextStatus = overrides.status ?? status;

        if (nextSearch !== "") params.search = nextSearch;
        if (nextTower !== "") params.tower_id = nextTower;
        if (nextStatus !== "") params.status = nextStatus;

        router.get(
            route("flats.index"),
            { ...params, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("flats.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const flat = flats.data.find(
                (candidate) => candidate.uuid === id || candidate.id === id,
            );
            if (!flat) return;
            setTimeout(
                () =>
                    router.delete(route("flats.destroy", flat.uuid), {
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
                title: t("flats.exportComingSoon"),
                variant: "info",
                description: t("flats.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<Flat>({
            filename: "flats.csv",
            columns: [
                { header: t("flats.colFlatNo"), accessor: (flat) => flat.flat_no },
                { header: t("flats.tower"), accessor: (flat) => flat.tower?.name ?? "" },
                { header: t("common.type"), accessor: (flat) => flat.flat_type ?? "" },
                { header: t("flats.colFloor"), accessor: (flat) => flat.floor_no ?? "" },
                { header: t("flats.colArea"), accessor: (flat) => flat.area_sqft ?? "" },
                { header: t("common.status"), accessor: (flat) => flat.occupancy_status },
                { header: t("flats.ownership"), accessor: (flat) => flat.ownership_type },
                { header: t("flats.residents"), accessor: (flat) => flat.residents_count },
            ],
            rows: flats.data,
        });
    };

    const columns: ColumnDef<Flat>[] = useMemo(
        () => [
            {
                id: "flat",
                header: t("flats.colFlat"),
                sortable: true,
                sortKey: "flat_no",
                cell: (flat) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                            <DoorOpen className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground">
                                {flat.flat_no}
                            </p>
                            {flat.tower?.name && (
                                <p className="truncate text-xs text-muted-foreground">
                                    {flat.tower.name}
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                id: "type",
                header: t("common.type"),
                cell: (flat) =>
                    flat.flat_type ?? (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "floor",
                header: t("flats.colFloor"),
                sortable: true,
                sortKey: "floor_no",
                cell: (flat) =>
                    flat.floor_no ?? (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "area",
                header: t("flats.colAreaShort"),
                cell: (flat) =>
                    flat.area_sqft ? (
                        <span className="text-muted-foreground">
                            {flat.area_sqft.toLocaleString()} sq. ft.
                        </span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "status",
                header: t("common.status"),
                sortable: true,
                sortKey: "occupancy_status",
                cell: (flat) => (
                    <Badge
                        variant="outline"
                        className={`gap-1.5 ${statusStyles[flat.occupancy_status].badge}`}
                    >
                        <span
                            className={`size-1.5 rounded-full ${statusStyles[flat.occupancy_status].dot}`}
                        />
                        {occupancyStatusLabel(flat.occupancy_status)}
                    </Badge>
                ),
            },
            {
                id: "ownership",
                header: t("flats.ownership"),
                cell: (flat) =>
                    flat.ownership_type === "Tenant" ? (
                        <Badge variant="outline">{t("flats.ownership.tenant")}</Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="border-warning/30 bg-warning/10 text-warning dark:text-warning"
                        >
                            {t("flats.ownership.owner")}
                        </Badge>
                    ),
            },
            {
                id: "residents",
                header: t("flats.residents"),
                cell: (flat) =>
                    flat.residents_count > 0 ? (
                        <Link
                            href={route("residents.index")}
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            {flat.residents_count}{" "}
                            {t(flat.residents_count === 1 ? "flats.residentOne" : "flats.residentMany")}
                        </Link>
                    ) : (
                        <span className="text-muted-foreground">
                            {t("flats.zeroResidents")}
                        </span>
                    ),
            },
            {
                id: "actions",
                header: t("common.actions"),
                align: "right",
                cell: (flat) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    onClick: () =>
                                        router.visit(
                                            route("flats.edit", flat.uuid),
                                        ),
                                },
                                {
                                    label: t("flats.remove"),
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete,
                                    onClick: () => setConfirming(flat),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [can, t],
    );

    // Debounced, URL-synced search (blueprint §8). Always reset to page 1
    // when the search term changes.
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
        setTowerId("");
        setStatus("");
        router.get(
            route("flats.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = () => {
        if (!confirming) return;
        const flat = confirming;
        setConfirming(null);
        router.delete(route("flats.destroy", flat.uuid), {
            preserveScroll: true,
        });
    };

    const statCards = [
        {
            label: t("flats.statTotalUnits"),
            value: stats.total_units,
            icon: Home,
            accent:
                "bg-brand text-brand dark:bg-brand/10 dark:text-brand",
        },
        {
            label: t("flats.status.occupied"),
            value: stats.occupied_units,
            icon: DoorOpen,
            accent:
                "bg-info text-info dark:bg-info/10 dark:text-info",
        },
        {
            label: t("flats.status.vacant"),
            value: stats.vacant_units,
            icon: Building2,
            accent:
                "bg-warning text-warning dark:bg-warning/10 dark:text-warning",
        },
        {
            label: t("flats.statOccupancyRate"),
            value: `${stats.occupancy_rate}%`,
            icon: Percent,
            accent:
                "bg-info text-info dark:bg-info/10 dark:text-info",
        },
    ];

    return (
        <AppLayout>
            <Head title={t("flats.title")} />

            <PageHeader
                title={t("flats.title")}
                description={t("flats.pageDescription")}
                icon={<Building2 className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("flats.create")}
                            icon={Plus}
                            label={t("flats.add")}
                            variant="teal"
                        />
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.label} className="border-border/60 bg-background/70 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div
                                className={`flex size-10 items-center justify-center rounded-xl ${card.accent}`}
                            >
                                <card.icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {card.label}
                                </p>
                                <p className="text-xl font-semibold text-foreground">
                                    {card.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("flats.searchPlaceholder")}
                searchLabel={t("flats.searchLabel")}
                activeFilters={[
                    ...(towerId
                        ? [
                              {
                                  label:
                                      towers.find(
                                          (tower) =>
                                              String(tower.id) === towerId,
                                      )?.label ?? t("flats.tower"),
                                  onRemove: () => {
                                      setTowerId("");
                                      applyFilters({ tower_id: "" });
                                  },
                              },
                          ]
                        : []),
                    ...(status
                        ? [
                              {
                                  label: occupancyStatusLabel(
                                      status as Flat["occupancy_status"],
                                  ),
                                  onRemove: () => {
                                      setStatus("");
                                      applyFilters({ status: "" });
                                  },
                              },
                          ]
                        : []),
                ]}
                onReset={clearAll}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
            >
                <select
                    aria-label={t("flats.filterByTower")}
                    className={`${selectClasses} w-auto min-w-44`}
                    value={towerId}
                    onChange={(e) => {
                        setTowerId(e.target.value);
                        applyFilters({ tower_id: e.target.value });
                    }}
                >
                    <option value="">{t("flats.allTowers")}</option>
                    {towers.map((tower) => (
                        <option key={tower.id} value={tower.id}>
                            {tower.label}
                        </option>
                    ))}
                </select>

                <select
                    aria-label={t("flats.filterByStatus")}
                    className={`${selectClasses} w-auto min-w-40`}
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        applyFilters({ status: e.target.value });
                    }}
                >
                    <option value="">{t("flats.allStatuses")}</option>
                    <option value="Occupied">{t("flats.status.occupied")}</option>
                    <option value="Vacant">{t("flats.status.vacant")}</option>
                    <option value="Self-Occupied">{t("flats.status.selfOccupied")}</option>
                </select>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<Flat>
                        columns={columns}
                        data={flats.data}
                        rowKey={(flat) => flat.uuid}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Inbox}
                                title={
                                    filters.search ||
                                    filters.tower_id ||
                                    filters.status
                                        ? t("flats.emptyFilterTitle")
                                        : t("flats.emptyTitle")
                                }
                                description={
                                    filters.search ||
                                    filters.tower_id ||
                                    filters.status
                                        ? t("flats.emptyFilterDescription")
                                        : can.create
                                          ? t("flats.emptyDescription")
                                          : t("flats.emptyDescriptionNoCreate")
                                }
                                action={
                                    can.create &&
                                    !filters.search &&
                                    !filters.tower_id &&
                                    !filters.status ? (
                                        <Button asChild>
                                            <Link href={route("flats.create")}>
                                                <Plus />
                                                {t("flats.add")}
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                    {flats.last_page > 1 && (
                        <Pagination
                            page={flats.current_page}
                            perPage={flats.per_page}
                            total={flats.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("flats.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun={t("flats.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("flats.nounPlural")}
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

            <ConfirmDialog
                open={confirming !== null}
                onOpenChange={(open) => {
                    if (!open) setConfirming(null);
                }}
                title={
                    confirming
                        ? t("flats.confirmRemoveTitle", { flatNo: confirming.flat_no })
                        : t("flats.confirmRemoveTitleGeneric")
                }
                description={t("flats.confirmRemoveDescription")}
                confirmLabel={t("flats.remove")}
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
