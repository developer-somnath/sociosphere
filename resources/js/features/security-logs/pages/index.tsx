import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { DataTableFull } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { exportCsv } from "@/lib/export-csv";
import { toast } from "@/lib/toast";
import type { PageProps } from "@/types";

type LogItem = {
    id: number;
    uuid: string;
    event_type: "Shift Handover" | "Incident Report" | "Blacklist Alert" | "Gate Trigger" | "Patrol Check";
    title: string;
    description: string | null;
    severity: "Low" | "Medium" | "High" | "Critical";
    created_at: string;
    recordedBy?: { id: number; name: string };
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

type Stats = {
    total: number;
    incidents: number;
    critical: number;
    handovers: number;
};

type IndexProps = {
    logs: Paginated<LogItem>;
    stats: Stats;
    filters: {
        search: string;
        event_type: string | null;
        severity: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean };
};

function severityBadge(severity: LogItem["severity"]) {
    switch (severity) {
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

export default function SecurityLogsIndex() {
    const { logs, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
    const [search, setSearch] = useState(filters.search);
    const [eventType, setEventType] = useState<string>(filters.event_type ?? "");
    const [severity, setSeverity] = useState<string>(filters.severity ?? "");
    const [showNewModal, setShowNewModal] = useState(false);
    const isFirstRender = useRef(true);

    const form = useForm({
        event_type: "Shift Handover",
        title: "",
        description: "",
        severity: "Low",
    });

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
        event_type: eventType !== "" ? eventType : undefined,
        severity: severity !== "" ? severity : undefined,
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
                route("security-logs.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, eventType, severity]);

    const handleCreateLog = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("security-logs.store"), {
            onSuccess: () => {
                setShowNewModal(false);
                form.reset();
            },
        });
    };

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("security-logs.index"),
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
        exportCsv<LogItem>({
            filename: "security-logs.csv",
            columns: [
                {
                    header: "Timestamp",
                    accessor: (log) => log.created_at,
                },
                {
                    header: "Logged By",
                    accessor: (log) => log.recordedBy?.name ?? "System / Automated",
                },
                { header: "Event Type", accessor: (log) => log.event_type },
                { header: "Title", accessor: (log) => log.title },
                { header: "Description", accessor: (log) => log.description ?? "" },
                { header: "Severity", accessor: (log) => log.severity },
            ],
            rows: logs.data,
        });
    };

    const columns: ColumnDef<LogItem>[] = useMemo(
        () => [
            {
                id: "timestamp",
                header: "Timestamp",
                sortable: true,
                sortKey: "created_at",
                cell: (log) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                    </span>
                ),
            },
            {
                id: "loggedBy",
                header: "Logged By",
                cell: (log) => (
                    <span className="font-medium text-foreground">
                        {log.recordedBy ? log.recordedBy.name : "System / Automated"}
                    </span>
                ),
            },
            {
                id: "eventType",
                header: "Event Type",
                sortable: true,
                sortKey: "event_type",
                cell: (log) => (
                    <Badge variant="outline" className="font-mono text-xs">
                        {log.event_type}
                    </Badge>
                ),
            },
            {
                id: "title",
                header: "Title & Description",
                sortable: true,
                sortKey: "title",
                cell: (log) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                            {log.title}
                        </span>
                        {log.description && (
                            <span className="line-clamp-1 text-xs text-muted-foreground">
                                {log.description}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: "severity",
                header: "Severity",
                sortable: true,
                sortKey: "severity",
                align: "right",
                cell: (log) => severityBadge(log.severity),
            },
        ],
        [],
    );

    return (
        <AppLayout>
            <Head title="Security Logbook & Incidents" />

            <PageHeader
                title="Security Logbook & Incident Reporting"
                description="Digital logbook for guard shift handovers, gate triggers, patrol logs, and security incident alerts."
                icon={<ShieldAlert className="size-5" />}
                actions={
                    can.create && (
                        <Button onClick={() => setShowNewModal(true)}>
                            <ShieldAlert />
                            Log Event / Incident
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Log Entries" value={stats.total} icon={ShieldCheck} accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                <MetricCard label="Incidents Reported" value={stats.incidents} icon={AlertTriangle} accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400" />
                <MetricCard label="Critical Alerts" value={stats.critical} icon={ShieldAlert} accent="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400" />
                <MetricCard label="Shift Handovers" value={stats.handovers} icon={UserCheck} accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search incident, guard, title..."
                searchLabel="Search logbook"
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setEventType("");
                    setSeverity("");
                    router.get(route("security-logs.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Event Types</option>
                    <option value="Shift Handover">Shift Handover</option>
                    <option value="Incident Report">Incident Report</option>
                    <option value="Blacklist Alert">Blacklist Alert</option>
                    <option value="Gate Trigger">Gate Trigger</option>
                    <option value="Patrol Check">Patrol Check</option>
                </select>

                <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Severities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<LogItem>
                        columns={columns}
                        data={logs.data}
                        rowKey={(log) => log.id}
                        sort={sort}
                        onSort={handleSort}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={ShieldCheck}
                                title="No security log entries found"
                                description="Logged incidents and shift handovers will appear here."
                            />
                        }
                    />
                    {logs.last_page > 1 && (
                        <Pagination
                            page={logs.current_page}
                            perPage={logs.per_page}
                            total={logs.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("security-logs.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun="entries"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Log Security Event Drawer */}
            <FormDrawer
                open={showNewModal}
                onOpenChange={(open) => !open && setShowNewModal(false)}
                title="Log Security Event / Incident"
                description="Record a shift handover, incident report, or gate alert."
                icon={<ShieldAlert className="size-5" />}
                footer={
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setShowNewModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="security-log-form"
                            disabled={form.processing}
                        >
                            Save Log
                        </Button>
                    </>
                }
            >
                <form
                    id="security-log-form"
                    onSubmit={handleCreateLog}
                    className="flex flex-col gap-5"
                >
                    <div className="space-y-1.5">
                        <Label>Event Type *</Label>
                        <Combobox
                            items={[
                                {
                                    value: "Shift Handover",
                                    label: "Shift Handover",
                                },
                                {
                                    value: "Incident Report",
                                    label: "Incident Report",
                                },
                                {
                                    value: "Blacklist Alert",
                                    label: "Blacklist Alert",
                                },
                                {
                                    value: "Gate Trigger",
                                    label: "Gate Trigger",
                                },
                                {
                                    value: "Patrol Check",
                                    label: "Patrol Check",
                                },
                            ]}
                            value={form.data.event_type}
                            onValueChange={(value) =>
                                form.setData(
                                    "event_type",
                                    value as LogItem["event_type"],
                                )
                            }
                            placeholder="Select event type…"
                            emptyText="No matching type"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Title *</Label>
                        <Input
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData("title", e.target.value)
                            }
                            placeholder="e.g. Visitor entry denied at South Gate"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Severity *</Label>
                        <Combobox
                            items={[
                                { value: "Low", label: "Low" },
                                { value: "Medium", label: "Medium" },
                                { value: "High", label: "High" },
                                { value: "Critical", label: "Critical" },
                            ]}
                            value={form.data.severity}
                            onValueChange={(value) =>
                                form.setData(
                                    "severity",
                                    value as LogItem["severity"],
                                )
                            }
                            placeholder="Select severity…"
                            emptyText="No matching severity"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description / Remarks</Label>
                        <textarea
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData("description", e.target.value)
                            }
                            className="min-h-[80px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Provide detailed incident notes..."
                        />
                    </div>
                </form>
            </FormDrawer>
        </AppLayout>
    );
}
