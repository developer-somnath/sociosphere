import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Inbox,
    Pencil,
    Plus,
    ShieldCheck,
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
import { RowActions } from "@/components/ui/row-actions";
import { exportCsv } from "@/lib/export-csv";
import { toast } from "@/lib/toast";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";
import type { Paginated, Role } from "@/features/roles/types";

type IndexProps = {
    roles: Paginated<Role>;
    filters: {
        search: string;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function RolesIndex() {
    const { roles, filters, can } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();

    const [search, setSearch] = useState(filters.search);
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<Role | null>(null);
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

    // Debounced, URL-synced search (blueprint §8)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            const value = search.trim();
            router.get(
                route("roles.index"),
                value ? { search: value, page: 1 } : { page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("roles.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const role = roles.data.find(
                (candidate) => candidate.uuid === id,
            );
            if (!role || role.is_system) return;
            setTimeout(
                () =>
                    router.delete(route("roles.destroy", role.uuid), {
                        preserveScroll: true,
                    }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const handleDelete = () => {
        if (!confirming) return;
        const role = confirming;
        setConfirming(null);
        router.delete(route("roles.destroy", role.uuid), {
            preserveScroll: true,
        });
    };

    const handleExport = (format: ExportFormat) => {
        if (format !== "csv") {
            toast({
                title: t("roles.exportComingSoon"),
                variant: "info",
                description: t("roles.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<Role>({
            filename: "roles.csv",
            columns: [
                {
                    header: t("roles.colRole"),
                    accessor: (role) => role.name,
                },
                {
                    header: t("roles.colDescription"),
                    accessor: (role) => role.description ?? "",
                },
                {
                    header: t("roles.colMembers"),
                    accessor: (role) => role.users_count,
                },
                {
                    header: t("roles.colPermissions"),
                    accessor: (role) => role.permissions_count,
                },
                {
                    header: t("roles.colType"),
                    accessor: (role) =>
                        role.is_system
                            ? t("roles.system")
                            : t("roles.custom"),
                },
            ],
            rows: roles.data,
        });
    };

    const columns: ColumnDef<Role>[] = useMemo(
        () => [
            {
                id: "role",
                header: t("roles.colRole"),
                sortable: true,
                sortKey: "name",
                cell: (role) => (
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-info/10 text-info dark:bg-info/10 dark:text-info">
                            <ShieldCheck className="size-4" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {role.name}
                            </p>
                            {role.description && (
                                <p className="max-w-xs truncate text-xs text-muted-foreground">
                                    {role.description}
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                id: "members",
                header: t("roles.colMembers"),
                sortable: true,
                sortKey: "users_count",
                cell: (role) => (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-3.5" />
                        {role.users_count}
                    </div>
                ),
            },
            {
                id: "permissions",
                header: t("roles.colPermissions"),
                sortable: true,
                sortKey: "permissions_count",
                cell: (role) => (
                    <span className="text-muted-foreground">
                        {role.permissions_count}
                    </span>
                ),
            },
            {
                id: "type",
                header: t("roles.colType"),
                cell: (role) =>
                    role.is_system ? (
                        <Badge variant="secondary">{t("roles.system")}</Badge>
                    ) : (
                        <Badge variant="outline">{t("roles.custom")}</Badge>
                    ),
            },
            {
                id: "actions",
                header: t("common.actions"),
                align: "right",
                cell: (role) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    disabled:
                                        !can.update ||
                                        (role.is_system &&
                                            role.name === "SuperAdmin"),
                                    onClick: () =>
                                        router.visit(
                                            route("roles.edit", role.uuid),
                                        ),
                                },
                                {
                                    label: t("common.delete"),
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete || role.is_system,
                                    onClick: () => setConfirming(role),
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
            <Head title={t("roles.title")} />

            <PageHeader
                title={t("roles.title")}
                description={t("roles.pageDescription")}
                icon={<ShieldCheck className="size-5" />}
                actions={
                    can.create && (
                        <Button asChild>
                            <Link href={route("roles.create")}>
                                <Plus />
                                {t("roles.new")}
                            </Link>
                        </Button>
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("roles.searchPlaceholder")}
                searchLabel={t("roles.searchLabel")}
                onReset={() => {
                    setSearch("");
                    router.get(
                        route("roles.index"),
                        {},
                        { preserveState: true, replace: true },
                    );
                }}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
            >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    {roles.total}{" "}
                    {t(
                        roles.total === 1
                            ? "roles.countOne"
                            : "roles.countMany",
                    )}
                </div>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<Role>
                        columns={columns}
                        data={roles.data}
                        rowKey={(role) => role.uuid}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Inbox}
                                title={
                                    filters.search
                                        ? t("roles.emptySearchTitle")
                                        : t("roles.emptyTitle")
                                }
                                description={
                                    filters.search
                                        ? t("roles.emptySearchDescription")
                                        : can.create
                                          ? t("roles.emptyDescription")
                                          : t("roles.emptyDescriptionNoCreate")
                                }
                                action={
                                    can.create && !filters.search ? (
                                        <Button asChild>
                                            <Link href={route("roles.create")}>
                                                <Plus />
                                                {t("roles.new")}
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                    {roles.last_page > 1 && (
                        <Pagination
                            page={roles.current_page}
                            perPage={roles.per_page}
                            total={roles.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("roles.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun={t("roles.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("roles.nounPlural")}
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
                        ? t("roles.confirmRemoveTitle", {
                              name: confirming.name,
                          })
                        : t("roles.confirmRemoveTitleGeneric")
                }
                description={t("roles.confirmRemoveDescription")}
                confirmLabel={t("roles.remove")}
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
