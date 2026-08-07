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
                title: "Export coming soon",
                variant: "info",
                description: `${format.toUpperCase()} export will be available soon.`,
            });
            return;
        }
        exportCsv<Role>({
            filename: "roles.csv",
            columns: [
                { header: "Role", accessor: (role) => role.name },
                { header: "Description", accessor: (role) => role.description ?? "" },
                { header: "Members", accessor: (role) => role.users_count },
                {
                    header: "Permissions",
                    accessor: (role) => role.permissions_count,
                },
                {
                    header: "Type",
                    accessor: (role) => (role.is_system ? "System" : "Custom"),
                },
            ],
            rows: roles.data,
        });
    };

    const columns: ColumnDef<Role>[] = useMemo(
        () => [
            {
                id: "role",
                header: "Role",
                sortable: true,
                sortKey: "name",
                cell: (role) => (
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
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
                header: "Members",
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
                header: "Permissions",
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
                header: "Type",
                cell: (role) =>
                    role.is_system ? (
                        <Badge variant="secondary">System</Badge>
                    ) : (
                        <Badge variant="outline">Custom</Badge>
                    ),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (role) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: "Edit",
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
                                    label: "Delete",
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
        [can],
    );

    return (
        <AppLayout>
            <Head title="Roles" />

            <PageHeader
                title="Roles"
                description="Create custom roles and assign feature-wise permissions."
                icon={<ShieldCheck className="size-5" />}
                actions={
                    can.create && (
                        <Button asChild>
                            <Link href={route("roles.create")}>
                                <Plus />
                                New role
                            </Link>
                        </Button>
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search roles…"
                searchLabel="Search roles"
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
                    {roles.total} role{roles.total === 1 ? "" : "s"}
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
                                        ? "No roles match your search"
                                        : "No roles yet"
                                }
                                description={
                                    filters.search
                                        ? "Try a different search term."
                                        : can.create
                                          ? "Create your first role to get started."
                                          : "Check back later."
                                }
                                action={
                                    can.create && !filters.search ? (
                                        <Button asChild>
                                            <Link href={route("roles.create")}>
                                                <Plus />
                                                New role
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
                            noun="roles"
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun="roles"
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
                        ? `Remove the "${confirming.name}" role?`
                        : "Remove role?"
                }
                description="Users holding this role will lose its permissions."
                confirmLabel="Remove"
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
