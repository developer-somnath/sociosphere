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
import { RowActions } from "@/components/ui/row-actions";
import { exportCsv } from "@/lib/export-csv";
import { toast } from "@/lib/toast";
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
                title: "Export coming soon",
                variant: "info",
                description: `${format.toUpperCase()} export will be available soon.`,
            });
            return;
        }
        exportCsv<SocietyItem>({
            filename: "societies.csv",
            columns: [
                { header: "Name", accessor: (soc) => soc.name },
                { header: "Reg No", accessor: (soc) => soc.registration_no ?? "" },
                {
                    header: "Location",
                    accessor: (soc) =>
                        [soc.city, soc.state].filter(Boolean).join(", "),
                },
                { header: "Phone", accessor: (soc) => soc.phone ?? "" },
                { header: "Email", accessor: (soc) => soc.email ?? "" },
                { header: "Towers", accessor: (soc) => soc.towers_count ?? 0 },
                { header: "Users", accessor: (soc) => soc.users_count ?? 0 },
                {
                    header: "Status",
                    accessor: (soc) => (soc.status ? "Active" : "Inactive"),
                },
            ],
            rows: societies.data,
        });
    };

    const columns: ColumnDef<SocietyItem>[] = useMemo(
        () => [
            {
                id: "name",
                header: "Society Name",
                sortable: true,
                sortKey: "name",
                cell: (soc) => (
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
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
                header: "Reg No",
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
                header: "Location",
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
                header: "Towers",
                cell: (soc) => (
                    <Badge variant="outline" className="gap-1 font-mono">
                        <Building className="size-3" />
                        {soc.towers_count ?? 0}
                    </Badge>
                ),
            },
            {
                id: "users",
                header: "Users",
                cell: (soc) => (
                    <Badge variant="outline" className="gap-1 font-mono">
                        <Users className="size-3" />
                        {soc.users_count ?? 0}
                    </Badge>
                ),
            },
            {
                id: "status",
                header: "Status",
                sortable: true,
                sortKey: "status",
                cell: (soc) =>
                    soc.status ? (
                        <Badge className="border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    ),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (soc) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: "View Profile",
                                    icon: Eye,
                                    onClick: () =>
                                        router.visit(
                                            route("societies.show", soc.uuid),
                                        ),
                                },
                                {
                                    label: "Edit",
                                    icon: Pencil,
                                    disabled: !can.update,
                                    onClick: () =>
                                        router.visit(
                                            route("societies.edit", soc.uuid),
                                        ),
                                },
                                {
                                    label: "Delete",
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
        [can],
    );

    return (
        <AppLayout>
            <Head title="Societies" />

            <PageHeader
                title="Society Directory"
                description="Manage residential societies, committee members, and operational bylaws."
                icon={<Building className="size-5" />}
                actions={
                    can.create && (
                        <Button asChild>
                            <Link href={route("societies.create")}>
                                <Plus />
                                Register Society
                            </Link>
                        </Button>
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search society name, reg no, city…"
                searchLabel="Search societies"
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
                                title="No societies found"
                                description="Register your first society to get started."
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
                            noun="societies"
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun="societies"
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
                onOpenChange={(open) => !open && setConfirming(null)}
                title="Delete society?"
                description={`This will permanently delete ${confirming?.name ?? "this society"} and all related records. This action cannot be undone.`}
                confirmLabel="Delete society"
                destructive
                onConfirm={handleDestroy}
            />
        </AppLayout>
    );
}
