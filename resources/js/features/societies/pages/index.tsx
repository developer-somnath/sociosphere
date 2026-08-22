import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Building,
    Eye,
    Pencil,
    Plus,
    Trash2,
    Users,
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
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type SocietyItem = {
    id: number;
    uuid: string;
    name: string;
    registration_no: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    email: string | null;
    towers_count?: number;
    users_count?: number;
    status: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type IndexProps = {
    societies: Paginated<SocietyItem>;
    filters: {
        search: string;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function SocietiesIndex() {
    const { societies, filters, can } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search);
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<SocietyItem | null>(null);
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
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                route("societies.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("societies.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const handleDestroy = () => {
        if (!confirming) return;
        const society = confirming;
        setConfirming(null);
        router.delete(route("societies.destroy", society.uuid));
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const society = societies.data.find(
                (candidate) => candidate.id === id || candidate.uuid === id,
            );
            if (!society) return;
            setTimeout(
                () =>
                    router.delete(route("societies.destroy", society.uuid), {
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
                title: t("societies.exportComingSoon"),
                variant: "info",
                description: t("societies.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<SocietyItem>({
            filename: "societies.csv",
            columns: [
                { header: t("common.name"), accessor: (soc) => soc.name },
                {
                    header: t("societies.regNo"),
                    accessor: (soc) => soc.registration_no ?? "",
                },
                {
                    header: t("societies.location"),
                    accessor: (soc) =>
                        [soc.city, soc.state].filter(Boolean).join(", "),
                },
                { header: t("common.phone"), accessor: (soc) => soc.phone ?? "" },
                { header: t("common.email"), accessor: (soc) => soc.email ?? "" },
                {
                    header: t("societies.towers"),
                    accessor: (soc) => soc.towers_count ?? 0,
                },
                {
                    header: t("societies.users"),
                    accessor: (soc) => soc.users_count ?? 0,
                },
                {
                    header: t("common.status"),
                    accessor: (soc) =>
                        soc.status ? t("common.active") : t("common.inactive"),
                },
            ],
            rows: societies.data,
        });
    };

    const columns: ColumnDef<SocietyItem>[] = useMemo(
        () => [
            {
                id: "name",
                header: t("societies.colName"),
                sortable: true,
                sortKey: "name",
                cell: (soc) => (
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-info/10 text-info dark:bg-info/10 dark:text-info">
                            <Building className="size-4" />
                        </div>
                        <Link
                            href={route("societies.show", soc.uuid)}
                            className="font-medium text-foreground hover:underline"
                        >
                            {soc.name}
                        </Link>
                    </div>
                ),
            },
            {
                id: "regNo",
                header: t("societies.regNo"),
                sortable: true,
                sortKey: "registration_no",
                cell: (soc) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {soc.registration_no ?? "—"}
                    </span>
                ),
            },
            {
                id: "location",
                header: t("societies.location"),
                sortable: true,
                sortKey: "city",
                cell: (soc) => (
                    <span className="text-muted-foreground">
                        {[soc.city, soc.state].filter(Boolean).join(", ") ||
                            "—"}
                    </span>
                ),
            },
            {
                id: "towers",
                header: t("societies.towers"),
                cell: (soc) => (
                    <Badge variant="outline" className="gap-1 font-mono">
                        <Building className="size-3" />
                        {soc.towers_count ?? 0}
                    </Badge>
                ),
            },
            {
                id: "users",
                header: t("societies.users"),
                cell: (soc) => (
                    <Badge variant="outline" className="gap-1 font-mono">
                        <Users className="size-3" />
                        {soc.users_count ?? 0}
                    </Badge>
                ),
            },
            {
                id: "status",
                header: t("common.status"),
                sortable: true,
                sortKey: "status",
                cell: (soc) =>
                    soc.status ? (
                        <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                            {t("common.active")}
                        </Badge>
                    ) : (
                        <Badge variant="secondary">{t("common.inactive")}</Badge>
                    ),
            },
            {
                id: "actions",
                header: t("common.actions"),
                align: "right",
                cell: (soc) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: t("societies.viewProfile"),
                                    icon: Eye,
                                    onClick: () =>
                                        router.visit(
                                            route("societies.show", soc.uuid),
                                        ),
                                },
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    disabled: !can.update,
                                    onClick: () =>
                                        router.visit(
                                            route("societies.edit", soc.uuid),
                                        ),
                                },
                                {
                                    label: t("common.delete"),
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete,
                                    onClick: () => setConfirming(soc),
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

    return (
        <AppLayout>
            <Head title={t("societies.title")} />

            <PageHeader
                title={t("societies.directory")}
                description={t("societies.pageDescription")}
                icon={<Building className="size-5" />}
                breadcrumbs={[
                    { label: t("residents.breadcrumb.section"), href: "/dashboard" },
                    { label: t("nav.societies") },
                ]}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("societies.create")}
                            icon={Plus}
                            label={t("societies.register")}
                            variant="indigo"
                        />
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("societies.searchPlaceholder")}
                searchLabel={t("societies.searchLabel")}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    router.get(route("societies.index"), {}, { preserveState: true, replace: true });
                }}
            />

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<SocietyItem>
                        columns={columns}
                        data={societies.data}
                        rowKey={(soc) => soc.id}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Building}
                                title={
                                    filters.search
                                        ? t("societies.emptySearchTitle")
                                        : t("societies.emptyTitle")
                                }
                                description={
                                    filters.search
                                        ? t("societies.emptySearchDescription")
                                        : t("societies.emptyDescription")
                                }
                                action={
                                    can.create && !filters.search ? (
                                        <Button asChild>
                                            <Link href={route("societies.create")}>
                                                <Plus />
                                                {t("societies.register")}
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                    {societies.last_page > 1 && (
                        <Pagination
                            page={societies.current_page}
                            perPage={societies.per_page}
                            total={societies.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("societies.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun={t("societies.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("societies.nounPlural")}
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
                onOpenChange={(open) => !open && setConfirming(null)}
                title={t("societies.confirmDeleteTitle")}
                description={t("societies.confirmDeleteDescription", {
                    name: confirming?.name ?? t("societies.thisSociety"),
                })}
                confirmLabel={t("societies.deleteSociety")}
                destructive
                onConfirm={handleDestroy}
            />
        </AppLayout>
    );
}
