import { Head, Link, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Paginated, Resident } from "@/features/residents/types";

type IndexProps = {
    residents: Paginated<Resident>;
    filters: { search: string; sort_by: string | null; sort_dir: "asc" | "desc" | null };
    can: { create: boolean; delete: boolean };
};

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function genderBadge(gender: Resident["gender"]) {
    switch (gender) {
        case "Male":
            return <Badge variant="secondary">{t("residents.gender.male")}</Badge>;
        case "Female":
            return <Badge variant="secondary">{t("residents.gender.female")}</Badge>;
        case "Other":
            return <Badge variant="outline">{t("residents.gender.other")}</Badge>;
        default:
            return <span className="text-muted-foreground">—</span>;
    }
}

export default function ResidentsIndex() {
    const { residents, filters, can } =
        usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();

    const [search, setSearch] = useState(filters.search);
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<Resident | null>(null);
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
            route("residents.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const resident = residents.data.find((r) => r.uuid === id || r.id === id);
            if (!resident) return;
            setTimeout(
                () => router.delete(route("residents.destroy", resident.uuid), { preserveScroll: true }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const handleExport = (format: ExportFormat) => {
        if (format !== "csv") {
            toast({
                title: t("residents.exportComingSoon"),
                variant: "info",
                description: t("residents.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<Resident>({
            filename: "residents.csv",
            columns: [
                { header: t("common.name"), accessor: (r) => r.name },
                { header: t("residents.flat"), accessor: (r) => r.flat?.flat_no ?? "" },
                { header: t("residents.tower"), accessor: (r) => r.flat?.tower?.name ?? "" },
                { header: t("common.phone"), accessor: (r) => r.phone },
                { header: t("common.email"), accessor: (r) => r.email },
                { header: t("residents.occupation"), accessor: (r) => r.occupation },
                { header: t("residents.primaryContact"), accessor: (r) => (r.is_primary_contact ? t("common.yes") : t("common.no")) },
            ],
            rows: residents.data,
        });
    };

    const columns: ColumnDef<Resident>[] = useMemo(
        () => [
            {
                id: "name",
                header: t("residents.colResident"),
                sortable: true,
                cell: (resident) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                            <AvatarFallback>{initials(resident.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground">{resident.name}</p>
                            {resident.occupation && (
                                <p className="truncate text-xs text-muted-foreground">{resident.occupation}</p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                id: "flat",
                header: t("residents.flat"),
                cell: (resident) =>
                    resident.flat ? (
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">{resident.flat.flat_no}</span>
                            {resident.flat.tower?.name && (
                                <span className="text-xs text-muted-foreground">{resident.flat.tower.name}</span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "contact",
                header: t("residents.colContact"),
                cell: (resident) => (
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-foreground">{resident.phone}</span>
                        {resident.email && (
                            <span className="truncate text-xs text-muted-foreground">{resident.email}</span>
                        )}
                    </div>
                ),
            },
            {
                id: "gender",
                header: t("residents.colGender"),
                cell: (resident) => genderBadge(resident.gender),
            },
            {
                id: "status",
                header: t("common.status"),
                cell: (resident) =>
                    resident.is_primary_contact ? (
                        <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                            {t("residents.status.primary")}
                        </Badge>
                    ) : (
                        <Badge variant="outline">{t("residents.status.resident")}</Badge>
                    ),
            },
            {
                id: "actions",
                header: t("common.actions"),
                align: "right",
                cell: (resident) => (
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <RowActions
                            actions={[
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    onClick: () => router.visit(route("residents.edit", resident.uuid)),
                                },
                                {
                                    label: t("residents.remove"),
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete,
                                    onClick: () => setConfirming(resident),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
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
                route("residents.index"),
                { search: value || undefined, page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const handleDelete = () => {
        if (!confirming) return;
        const resident = confirming;
        setConfirming(null);
        router.delete(route("residents.destroy", resident.uuid), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={t("residents.title")} />

            <PageHeader
                title={t("residents.title")}
                description={t("residents.pageDescription")}
                icon={<Users className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("residents.create")}
                            icon={Plus}
                            label={t("residents.add")}
                            variant="teal"
                        />
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("residents.searchPlaceholder")}
                searchLabel={t("residents.searchLabel")}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
            >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    {t("residents.registeredCount", { count: residents.total })}
                </div>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<Resident>
                        columns={columns}
                        data={residents.data}
                        rowKey={(resident) => resident.uuid}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Users}
                                title={
                                    filters.search
                                        ? t("residents.emptySearchTitle")
                                        : t("residents.emptyTitle")
                                }
                                description={
                                    filters.search
                                        ? t("residents.emptySearchDescription")
                                        : can.create
                                          ? t("residents.emptyDescription")
                                          : t("residents.emptyDescriptionNoCreate")
                                }
                                action={
                                    can.create && !filters.search ? (
                                        <Button asChild>
                                            <Link href={route("residents.create")}>
                                                <Plus />
                                                {t("residents.add")}
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                    {residents.last_page > 1 && (
                        <Pagination
                            page={residents.current_page}
                            perPage={residents.per_page}
                            total={residents.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("residents.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun={t("residents.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("residents.nounPlural")}
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
                        ? t("residents.confirmRemoveTitle", { name: confirming.name })
                        : t("residents.confirmRemoveTitleGeneric")
                }
                description={t("residents.confirmRemoveDescription")}
                confirmLabel={t("residents.remove")}
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
