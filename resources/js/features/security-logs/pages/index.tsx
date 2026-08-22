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
import { t, useI18n } from "@/lib/i18n";
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
            return <Badge variant="destructive">{t("securityLogs.severityCritical")}</Badge>;
        case "High":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("securityLogs.severityHigh")}
                </Badge>
            );
        case "Medium":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("securityLogs.severityMedium")}
                </Badge>
            );
        default:
            return <Badge variant="secondary">{t("securityLogs.severityLow")}</Badge>;
    }
}

export default function SecurityLogsIndex() {
    const { logs, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();
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
                title: t("securityLogs.exportComingSoon"),
                variant: "info",
                description: t("securityLogs.exportFormatComingSoon", { format: format.toUpperCase() }),
            });
            return;
        }
        exportCsv<LogItem>({
            filename: "security-logs.csv",
            columns: [
                {
                    header: t("securityLogs.colTimestamp"),
                    accessor: (log) => log.created_at,
                },
                {
                    header: t("securityLogs.colLoggedBy"),
                    accessor: (log) => log.recordedBy?.name ?? t("securityLogs.systemAutomated"),
                },
                { header: t("securityLogs.colEventType"), accessor: (log) => log.event_type },
                { header: t("securityLogs.title"), accessor: (log) => log.title },
                { header: t("securityLogs.colDescription"), accessor: (log) => log.description ?? "" },
                { header: t("securityLogs.colSeverity"), accessor: (log) => log.severity },
            ],
            rows: logs.data,
        });
    };

    const columns: ColumnDef<LogItem>[] = useMemo(
        () => [
            {
                id: "timestamp",
                header: t("securityLogs.colTimestamp"),
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
                header: t("securityLogs.colLoggedBy"),
                cell: (log) => (
                    <span className="font-medium text-foreground">
                        {log.recordedBy ? log.recordedBy.name : t("securityLogs.systemAutomated")}
                    </span>
                ),
            },
            {
                id: "eventType",
                header: t("securityLogs.colEventType"),
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
                header: t("securityLogs.colTitleDescription"),
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
                header: t("securityLogs.colSeverity"),
                sortable: true,
                sortKey: "severity",
                align: "right",
                cell: (log) => severityBadge(log.severity),
            },
        ],
        [t],
    );

    return (
        <AppLayout>
            <Head title={t("securityLogs.headTitle")} />

            <PageHeader
                title={t("securityLogs.pageTitle")}
                description={t("securityLogs.pageDescription")}
                icon={<ShieldAlert className="size-5" />}
                actions={
                    can.create && (
                        <Button onClick={() => setShowNewModal(true)}>
                            <ShieldAlert />
                            {t("securityLogs.logEvent")}
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label={t("securityLogs.totalEntries")} value={stats.total} icon={ShieldCheck} accent="border-info/20 bg-info/10 text-info dark:text-info" />
                <MetricCard label={t("securityLogs.incidentsReported")} value={stats.incidents} icon={AlertTriangle} accent="border-warning/20 bg-warning/10 text-warning dark:text-warning" />
                <MetricCard label={t("securityLogs.criticalAlerts")} value={stats.critical} icon={ShieldAlert} accent="border-destructive/20 bg-destructive/10 text-destructive dark:text-destructive" />
                <MetricCard label={t("securityLogs.shiftHandovers")} value={stats.handovers} icon={UserCheck} accent="border-brand/20 bg-brand/10 text-brand dark:text-brand" />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("securityLogs.searchPlaceholder")}
                searchLabel={t("securityLogs.searchLabel")}
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
                    <option value="">{t("securityLogs.allEventTypes")}</option>
                    <option value="Shift Handover">{t("securityLogs.eventType.shiftHandover")}</option>
                    <option value="Incident Report">{t("securityLogs.eventType.incidentReport")}</option>
                    <option value="Blacklist Alert">{t("securityLogs.eventType.blacklistAlert")}</option>
                    <option value="Gate Trigger">{t("securityLogs.eventType.gateTrigger")}</option>
                    <option value="Patrol Check">{t("securityLogs.eventType.patrolCheck")}</option>
                </select>

                <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">{t("securityLogs.allSeverities")}</option>
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
                                title={t("securityLogs.emptyTitle")}
                                description={t("securityLogs.emptyDescription")}
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
                            noun={t("securityLogs.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Log Security Event Drawer */}
            <FormDrawer
                open={showNewModal}
                onOpenChange={(open) => !open && setShowNewModal(false)}
                title={t("securityLogs.drawerTitle")}
                description={t("securityLogs.drawerDescription")}
                icon={<ShieldAlert className="size-5" />}
                footer={
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setShowNewModal(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            form="security-log-form"
                            disabled={form.processing}
                        >
                            {t("securityLogs.saveLog")}
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
                        <Label>{t("securityLogs.eventType")} *</Label>
                        <Combobox
                            items={[
                                {
                                    value: "Shift Handover",
                                    label: t("securityLogs.eventType.shiftHandover"),
                                },
                                {
                                    value: "Incident Report",
                                    label: t("securityLogs.eventType.incidentReport"),
                                },
                                {
                                    value: "Blacklist Alert",
                                    label: t("securityLogs.eventType.blacklistAlert"),
                                },
                                {
                                    value: "Gate Trigger",
                                    label: t("securityLogs.eventType.gateTrigger"),
                                },
                                {
                                    value: "Patrol Check",
                                    label: t("securityLogs.eventType.patrolCheck"),
                                },
                            ]}
                            value={form.data.event_type}
                            onValueChange={(value) =>
                                form.setData(
                                    "event_type",
                                    value as LogItem["event_type"],
                                )
                            }
                            placeholder={t("securityLogs.selectEventType")}
                            emptyText={t("securityLogs.noMatchingType")}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("securityLogs.title")} *</Label>
                        <Input
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData("title", e.target.value)
                            }
                            placeholder={t("securityLogs.titlePlaceholder")}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("securityLogs.severity")} *</Label>
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
                            placeholder={t("securityLogs.selectSeverity")}
                            emptyText={t("securityLogs.noMatchingSeverity")}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("securityLogs.descriptionRemarks")}</Label>
                        <textarea
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData("description", e.target.value)
                            }
                            className="min-h-[80px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={t("securityLogs.descriptionPlaceholder")}
                        />
                    </div>
                </form>
            </FormDrawer>
        </AppLayout>
    );
}
