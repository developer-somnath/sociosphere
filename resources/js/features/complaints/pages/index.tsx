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
import { exportCsv } from "@/lib/export-csv";
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
    flat?: { id: number; flat_number: string; tower?: { id: number; name: string } };
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
            return <Badge variant="destructive">Critical</Badge>;
        case "High":
            return (
                <Badge className="border-transparent bg-orange-500/20 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    High
                </Badge>
            );
        case "Medium":
            return (
                <Badge className="border-transparent bg-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    Medium
                </Badge>
            );
        default:
            return <Badge variant="secondary">Low</Badge>;
    }
}

function statusBadge(status: ComplaintItem["status"]) {
    switch (status) {
        case "Open":
            return (
                <Badge className="border-transparent bg-blue-500/20 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    Open
                </Badge>
            );
        case "Assigned":
            return (
                <Badge className="border-transparent bg-purple-500/20 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                    Assigned
                </Badge>
            );
        case "In Progress":
            return (
                <Badge className="border-transparent bg-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    In Progress
                </Badge>
            );
        case "Resolved":
            return (
                <Badge className="border-transparent bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Resolved
                </Badge>
            );
        case "Closed":
            return <Badge variant="secondary">Closed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function ComplaintsIndex() {
    const { complaints, stats, categories, filters, can } =
        usePage<PageProps<IndexProps>>().props;
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
                title: "Export coming soon",
                variant: "info",
                description: `${format.toUpperCase()} export will be available soon.`,
            });
            return;
        }
        exportCsv<ComplaintItem>({
            filename: "complaints.csv",
            columns: [
                { header: "ID", accessor: (c) => String(c.id) },
                { header: "Title", accessor: (c) => c.title },
                { header: "Category", accessor: (c) => c.category?.name ?? "" },
                { header: "Flat", accessor: (c) => c.flat?.flat_number ?? "" },
                { header: "Resident", accessor: (c) => c.resident?.name ?? "" },
                { header: "Priority", accessor: (c) => c.priority },
                { header: "Status", accessor: (c) => c.status },
                { header: "Assigned To", accessor: (c) => c.assignee?.name ?? "Unassigned" },
                { header: "Created", accessor: (c) => c.created_at },
                { header: "Resolved", accessor: (c) => c.resolved_at ?? "" },
            ],
            rows: complaints.data,
        });
    };

    const columns: ColumnDef<ComplaintItem>[] = useMemo(
        () => [
            {
                id: "title",
                header: "Complaint",
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
                            {c.category?.name ?? "Uncategorized"} · {c.flat?.flat_number ?? "—"}
                            {c.flat?.tower ? ` (${c.flat.tower.name})` : ""}
                        </span>
                    </div>
                ),
            },
            {
                id: "resident",
                header: "Reported By",
                cell: (c) => (
                    <span className="text-sm text-foreground">
                        {c.resident?.name ?? "—"}
                    </span>
                ),
            },
            {
                id: "priority",
                header: "Priority",
                sortable: true,
                sortKey: "priority",
                cell: (c) => priorityBadge(c.priority),
            },
            {
                id: "status",
                header: "Status",
                sortable: true,
                sortKey: "status",
                cell: (c) => statusBadge(c.status),
            },
            {
                id: "assignee",
                header: "Assigned To",
                cell: (c) => (
                    <span className="text-sm text-muted-foreground">
                        {c.assignee?.name ?? "Unassigned"}
                    </span>
                ),
            },
            {
                id: "created_at",
                header: "Raised",
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
        [],
    );

    return (
        <AppLayout>
            <Head title="Complaints & Helpdesk" />

            <PageHeader
                title="Complaints & Helpdesk"
                description="Track, manage and resolve resident complaints and service requests."
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    can.create && (
                        <Button asChild>
                            <Link href={route("complaints.create")}>
                                <Plus className="size-4" />
                                Raise Complaint
                            </Link>
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Complaints"
                    value={stats.total}
                    icon={MessageSquareWarning}
                    accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <MetricCard
                    label="Open"
                    value={stats.open}
                    icon={AlertTriangle}
                    accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
                <MetricCard
                    label="In Progress"
                    value={stats.in_progress}
                    icon={Clock}
                    accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                />
                <MetricCard
                    label="Resolved / Closed"
                    value={stats.resolved}
                    icon={CheckCircle2}
                    accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search complaints..."
                searchLabel="Search complaints"
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
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>

                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>

                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Categories</option>
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
                                title="No complaints found"
                                description="Complaints raised by residents will appear here."
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
                            noun="complaints"
                        />
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
