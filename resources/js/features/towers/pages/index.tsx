import { Head, Link, router, usePage } from "@inertiajs/react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
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
import type { Paginated, Tower } from "@/features/towers/types";

type IndexProps = {
    towers: Paginated<Tower>;
    filters: { search: string; sort_by: string | null; sort_dir: "asc" | "desc" | null };
    can: { create: boolean; delete: boolean };
};

export default function TowersIndex() {
    const { towers, filters, can } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();

    const [search, setSearch] = useState(filters.search);
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<Tower | null>(null);
    const isFirstRender = useRef(true);

    const sort = filters.sort_by
        ? { key: filters.sort_by, direction: (filters.sort_dir === "asc" ? "asc" : "desc") as "asc" | "desc" }
        : null;

    const buildParams = () => ({
        search: search.trim() || undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("towers.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const tower = towers.data.find((tower) => tower.uuid === id || tower.id === id);
            if (!tower) return;
            setTimeout(
                () => router.delete(route("towers.destroy", tower.uuid), { preserveScroll: true }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const handleExport = (format: ExportFormat) => {
        if (format !== "csv") {
            toast({
                title: t("towers.exportComingSoon"),
                variant: "info",
                description: t("towers.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<Tower>({
            filename: "towers.csv",
            columns: [
                { header: t("common.name"), accessor: (tower) => tower.name },
                { header: t("towers.colFlats"), accessor: (tower) => tower.flats_count },
                { header: t("common.createdAt"), accessor: (tower) => tower.created_at ?? "" },
            ],
            rows: towers.data,
        });
    };

    const columns: ColumnDef<Tower>[] = useMemo(
        () => [
            {
                id: "name",
                header: t("towers.colTower"),
                sortable: true,
                cell: (tower) => (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                            <Building2 className="size-4" />
                        </div>
                        <span className="font-medium text-foreground">{tower.name}</span>
                    </div>
                ),
            },
            {
                id: "flats_count",
                header: t("towers.colFlats"),
                cell: (tower) => (
                    <span className="text-muted-foreground">
                        {tower.flats_count}{" "}
                        {t(tower.flats_count === 1 ? "towers.flatOne" : "towers.flatMany")}
                    </span>
                ),
            },
            {
                id: "actions",
                header: t("common.actions"),
                align: "right",
                cell: (tower) => (
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <RowActions
                            actions={[
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    onClick: () => router.visit(route("towers.edit", tower.uuid)),
                                },
                                {
                                    label: t("towers.remove"),
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete,
                                    onClick: () => setConfirming(tower),
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
            const value = search.trim();
            router.get(
                route("towers.index"),
                { search: value || undefined, page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const handleDelete = () => {
        if (!confirming) return;
        const tower = confirming;
        setConfirming(null);
        router.delete(route("towers.destroy", tower.uuid), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={t("towers.title")} />

            <PageHeader
                title={t("towers.title")}
                description={t("towers.pageDescription")}
                icon={<Building2 className="size-5" />}
                breadcrumbs={[{ label: t("nav.properties") }, { label: t("nav.towers") }]}
                actions={can.create && <QuickActionPill href={route("towers.create")} icon={Plus} label={t("towers.new")} variant="indigo" />}
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("towers.searchPlaceholder")}
                searchLabel={t("towers.searchLabel")}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
            >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="size-4" />
                    {t("towers.countManaged", { count: towers.total })}
                </div>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<Tower>
                        columns={columns}
                        data={towers.data}
                        rowKey={(tower) => tower.uuid}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Building2}
                                title={filters.search ? t("towers.emptySearchTitle") : t("towers.emptyTitle")}
                                description={
                                    filters.search
                                        ? t("towers.emptySearchDescription")
                                        : can.create
                                          ? t("towers.emptyDescription")
                                          : t("towers.emptyDescriptionNoCreate")
                                }
                                action={
                                    can.create && !filters.search ? (
                                        <Button asChild>
                                            <Link href={route("towers.create")}>
                                                <Plus />
                                                {t("towers.add")}
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                    {towers.last_page > 1 && (
                        <Pagination
                            page={towers.current_page}
                            perPage={towers.per_page}
                            total={towers.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("towers.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun={t("towers.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("towers.nounPlural")}
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
                        ? t("towers.confirmRemoveTitle", { name: confirming.name })
                        : t("towers.confirmRemoveTitleGeneric")
                }
                description={t("towers.confirmRemoveDescription")}
                confirmLabel={t("towers.remove")}
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
