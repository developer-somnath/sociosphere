import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MessageSquareWarning,
    Plus,
    Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableFull } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { QuickActionPill } from "@/components/ui/quick-action-pill";
import { RowActions } from "@/components/ui/row-actions";
import { exportCsv } from "@/lib/export-csv";
import { t, useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import type { PageProps } from "@/types";

type ComplaintItem = {
    id: number;
    uuid: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    status: "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";
    created_at: string;
    resolved_at: string | null;
    flat?: { id: number; flat_no: string; tower?: { id: number; name: string } };
    resident?: { id: number; name: string };
    category?: { id: number; name: string };
    assignee?: { id: number; name: string };
};

type CategoryOption = { id: number; name: string };

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

type Stats = {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
};

type IndexProps = {
    complaints: Paginated<ComplaintItem>;
    stats: Stats;
    categories: CategoryOption[];
    filters: {
        search: string;
        status: string | null;
        priority: string | null;
        category_id: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

function priorityBadge(priority: ComplaintItem["priority"]) {
    switch (priority) {
        case "Critical":
            return <Badge variant="destructive">{t("complaints.priority.critical")}</Badge>;
        case "High":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("complaints.priority.high")}
                </Badge>
            );
        case "Medium":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("complaints.priority.medium")}
                </Badge>
            );
        default:
            return <Badge variant="secondary">{t("complaints.priority.low")}</Badge>;
    }
}

function statusBadge(status: ComplaintItem["status"]) {
    switch (status) {
        case "Open":
            return (
                <Badge className="border-transparent bg-info/20 text-info dark:bg-info/20 dark:text-info">
                    {t("complaints.status.open")}
                </Badge>
            );
        case "Assigned":
            return (
                <Badge className="border-transparent bg-info/20 text-info dark:bg-info/20 dark:text-info">
                    {t("complaints.status.assigned")}
                </Badge>
            );
        case "In Progress":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("complaints.status.inProgress")}
                </Badge>
            );
        case "Resolved":
            return (
                <Badge className="border-transparent bg-brand/20 text-brand dark:bg-brand/20 dark:text-brand">
                    {t("complaints.status.resolved")}
                </Badge>
            );
        case "Closed":
            return <Badge variant="secondary">{t("complaints.status.closed")}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function ComplaintsIndex() {
    const { complaints, stats, categories, filters, can } =
        usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState<string>(filters.status ?? "");
    const [priority, setPriority] = useState<string>(filters.priority ?? "");
    const [categoryId, setCategoryId] = useState<string>(filters.category_id ?? "");
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
        status: status !== "" ? status : undefined,
        priority: priority !== "" ? priority : undefined,
        category_id: categoryId !== "" ? categoryId : undefined,
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
                route("complaints.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, status, priority, categoryId]);

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("complaints.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const handleExport = (format: ExportFormat) => {
        if (format !== "csv") {
            toast({
                title: t("complaints.exportComingSoon"),
                variant: "info",
                description: t("complaints.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<ComplaintItem>({
            filename: "complaints.csv",
            columns: [
                { header: t("complaints.colId"), accessor: (c) => String(c.id) },
                { header: t("complaints.colTitle"), accessor: (c) => c.title },
                { header: t("common.category"), accessor: (c) => c.category?.name ?? "" },
                { header: t("complaints.colFlat"), accessor: (c) => c.flat?.flat_no ?? "" },
                { header: t("complaints.colResident"), accessor: (c) => c.resident?.name ?? "" },
                { header: t("common.priority"), accessor: (c) => c.priority },
                { header: t("common.status"), accessor: (c) => c.status },
                { header: t("common.assignedTo"), accessor: (c) => c.assignee?.name ?? t("complaints.unassigned") },
                { header: t("complaints.colCreated"), accessor: (c) => c.created_at },
                { header: t("complaints.colResolved"), accessor: (c) => c.resolved_at ?? "" },
            ],
            rows: complaints.data,
        });
    };

    const columns: ColumnDef<ComplaintItem>[] = useMemo(
        () => [
            {
                id: "title",
                header: t("complaints.colComplaint"),
                sortable: true,
                sortKey: "title",
                cell: (c) => (
                    <div className="flex flex-col gap-0.5">
                        <Link
                            href={route("complaints.show", c.uuid)}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                            {c.title}
                        </Link>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                            {c.category?.name ?? t("complaints.uncategorized")} · {c.flat?.flat_no ?? "—"}
                            {c.flat?.tower ? ` (${c.flat.tower.name})` : ""}
                        </span>
                    </div>
                ),
            },
            {
                id: "resident",
                header: t("complaints.colReportedBy"),
                cell: (c) => (
                    <span className="text-sm text-foreground">
                        {c.resident?.name ?? "—"}
                    </span>
                ),
            },
            {
                id: "priority",
                header: t("common.priority"),
                sortable: true,
                sortKey: "priority",
                cell: (c) => priorityBadge(c.priority),
            },
            {
                id: "status",
                header: t("common.status"),
                sortable: true,
                sortKey: "status",
                cell: (c) => statusBadge(c.status),
            },
            {
                id: "assignee",
                header: t("common.assignedTo"),
                cell: (c) => (
                    <span className="text-sm text-muted-foreground">
                        {c.assignee?.name ?? t("complaints.unassigned")}
                    </span>
                ),
            },
            {
                id: "created_at",
                header: t("complaints.colRaised"),
                sortable: true,
                sortKey: "created_at",
                align: "right",
                cell: (c) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                    </span>
                ),
            },
        ],
        [t],
    );

    return (
        <AppLayout>
            <Head title={t("complaints.title")} />

            <PageHeader
                title={t("complaints.title")}
                description={t("complaints.pageDescription")}
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("complaints.create")}
                            icon={Plus}
                            label={t("complaints.raiseComplaint")}
                            variant="amber"
                        />
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label={t("complaints.statTotal")}
                    value={stats.total}
                    icon={MessageSquareWarning}
                    accent="border-info/20 bg-info/10 text-info dark:text-info"
                />
                <MetricCard
                    label={t("complaints.statOpen")}
                    value={stats.open}
                    icon={AlertTriangle}
                    accent="border-warning/20 bg-warning/10 text-warning dark:text-warning"
                />
                <MetricCard
                    label={t("complaints.statInProgress")}
                    value={stats.in_progress}
                    icon={Clock}
                    accent="border-info/20 bg-info/10 text-info dark:text-info"
                />
                <MetricCard
                    label={t("complaints.statResolvedClosed")}
                    value={stats.resolved}
                    icon={CheckCircle2}
                    accent="border-brand/20 bg-brand/10 text-brand dark:text-brand"
                />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("complaints.searchPlaceholder")}
                searchLabel={t("complaints.searchLabel")}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setStatus("");
                    setPriority("");
                    setCategoryId("");
                    router.get(route("complaints.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-10 rounded-full border border-border/70 bg-background/80 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">{t("complaints.allStatuses")}</option>
                    <option value="Open">{t("complaints.status.open")}</option>
                    <option value="Assigned">{t("complaints.status.assigned")}</option>
                    <option value="In Progress">{t("complaints.status.inProgress")}</option>
                    <option value="Resolved">{t("complaints.status.resolved")}</option>
                    <option value="Closed">{t("complaints.status.closed")}</option>
                </select>

                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-10 rounded-full border border-border/70 bg-background/80 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">{t("complaints.allPriorities")}</option>
                    <option value="Low">{t("complaints.priority.low")}</option>
                    <option value="Medium">{t("complaints.priority.medium")}</option>
                    <option value="High">{t("complaints.priority.high")}</option>
                    <option value="Critical">{t("complaints.priority.critical")}</option>
                </select>

                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">{t("complaints.allCategories")}</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<ComplaintItem>
                        columns={columns}
                        data={complaints.data}
                        rowKey={(c) => c.id}
                        sort={sort}
                        onSort={handleSort}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={MessageSquareWarning}
                                title={t("complaints.emptyTitle")}
                                description={t("complaints.emptyDescription")}
                            />
                        }
                    />
                    {complaints.last_page > 1 && (
                        <Pagination
                            page={complaints.current_page}
                            perPage={complaints.per_page}
                            total={complaints.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("complaints.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun={t("complaints.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
