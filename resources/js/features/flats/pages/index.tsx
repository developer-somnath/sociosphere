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
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

const statusStyles: Record<
    Flat["occupancy_status"],
    { badge: string; dot: string }
> = {
    Occupied: {
        badge:
            "border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    Vacant: {
        badge:
            "border-transparent bg-muted text-muted-foreground",
        dot: "bg-muted-foreground",
    },
    "Self-Occupied": {
        badge:
            "border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
        dot: "bg-sky-500",
    },
};

export default function FlatsIndex() {
    const { flats, filters, towers, stats, can } =
        usePage<PageProps<IndexProps>>().props;

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
                title: "Export coming soon",
                variant: "info",
                description: `${format.toUpperCase()} export will be available soon.`,
            });
            return;
        }
        exportCsv<Flat>({
            filename: "flats.csv",
            columns: [
                { header: "Flat No", accessor: (flat) => flat.flat_no },
                { header: "Tower", accessor: (flat) => flat.tower?.name ?? "" },
                { header: "Type", accessor: (flat) => flat.flat_type ?? "" },
                { header: "Floor", accessor: (flat) => flat.floor_no ?? "" },
                { header: "Area (sq ft)", accessor: (flat) => flat.area_sqft ?? "" },
                { header: "Status", accessor: (flat) => flat.occupancy_status },
                { header: "Ownership", accessor: (flat) => flat.ownership_type },
                { header: "Residents", accessor: (flat) => flat.residents_count },
            ],
            rows: flats.data,
        });
    };

    const columns: ColumnDef<Flat>[] = useMemo(
        () => [
            {
                id: "flat",
                header: "Flat",
                sortable: true,
                sortKey: "flat_no",
                cell: (flat) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600">
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
                header: "Type",
                cell: (flat) =>
                    flat.flat_type ?? (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "floor",
                header: "Floor",
                sortable: true,
                sortKey: "floor_no",
                cell: (flat) =>
                    flat.floor_no ?? (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "area",
                header: "Area",
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
                header: "Status",
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
                        {flat.occupancy_status}
                    </Badge>
                ),
            },
            {
                id: "ownership",
                header: "Ownership",
                cell: (flat) =>
                    flat.ownership_type === "Tenant" ? (
                        <Badge variant="outline">Tenant</Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        >
                            Owner
                        </Badge>
                    ),
            },
            {
                id: "residents",
                header: "Residents",
                cell: (flat) =>
                    flat.residents_count > 0 ? (
                        <Link
                            href={route("residents.index")}
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            {flat.residents_count} resident
                            {flat.residents_count === 1 ? "" : "s"}
                        </Link>
                    ) : (
                        <span className="text-muted-foreground">
                            0 residents
                        </span>
                    ),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (flat) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: "Edit",
                                    icon: Pencil,
                                    onClick: () =>
                                        router.visit(
                                            route("flats.edit", flat.uuid),
                                        ),
                                },
                                {
                                    label: "Remove",
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
        [can],
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
            label: "Total Units",
            value: stats.total_units,
            icon: Home,
            accent:
                "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        },
        {
            label: "Occupied",
            value: stats.occupied_units,
            icon: DoorOpen,
            accent:
                "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
        },
        {
            label: "Vacant",
            value: stats.vacant_units,
            icon: Building2,
            accent:
                "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        },
        {
            label: "Occupancy Rate",
            value: `${stats.occupancy_rate}%`,
            icon: Percent,
            accent:
                "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
        },
    ];

    return (
        <AppLayout>
            <Head title="Flats" />

            <PageHeader
                title="Flats"
                description="Manage the property units, occupancy states, and resident assignments."
                icon={<Building2 className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("flats.create")}
                            icon={Plus}
                            label="Add Flat"
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
                searchPlaceholder="Search flats, towers, residents…"
                searchLabel="Search flats"
                activeFilters={[
                    ...(towerId
                        ? [
                              {
                                  label:
                                      towers.find(
                                          (tower) =>
                                              String(tower.id) === towerId,
                                      )?.label ?? "Tower",
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
                                  label: status,
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
                    aria-label="Filter by tower"
                    className={`${selectClasses} w-auto min-w-44`}
                    value={towerId}
                    onChange={(e) => {
                        setTowerId(e.target.value);
                        applyFilters({ tower_id: e.target.value });
                    }}
                >
                    <option value="">All towers</option>
                    {towers.map((tower) => (
                        <option key={tower.id} value={tower.id}>
                            {tower.label}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Filter by status"
                    className={`${selectClasses} w-auto min-w-40`}
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        applyFilters({ status: e.target.value });
                    }}
                >
                    <option value="">All statuses</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Vacant">Vacant</option>
                    <option value="Self-Occupied">Self-Occupied</option>
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
                                        ? "No flats match your filters"
                                        : "No flats yet"
                                }
                                description={
                                    filters.search ||
                                    filters.tower_id ||
                                    filters.status
                                        ? "Try adjusting your search or filters."
                                        : can.create
                                          ? "Add your first flat to get started."
                                          : "Check back later."
                                }
                                action={
                                    can.create &&
                                    !filters.search &&
                                    !filters.tower_id &&
                                    !filters.status ? (
                                        <Button asChild>
                                            <Link href={route("flats.create")}>
                                                <Plus />
                                                Add flat
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
                            noun="flats"
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun="flats"
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

            <ConfirmDialog
                open={confirming !== null}
                onOpenChange={(open) => {
                    if (!open) setConfirming(null);
                }}
                title={
                    confirming
                        ? `Remove flat ${confirming.flat_no}?`
                        : "Remove flat?"
                }
                description="This will remove the flat from the society. Flats with residents attached cannot be removed."
                confirmLabel="Remove"
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
