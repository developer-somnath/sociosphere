import { Head, router, usePage } from "@inertiajs/react";
import { History, Inbox } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableFull } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "@/lib/toast";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { PageProps } from "@/types";
import type {
    ActivityLog,
    ActivityLogFilters,
    FilterOptions,
    Paginated,
} from "@/features/activity-logs/types";

type IndexProps = {
    logs: Paginated<ActivityLog>;
    filters: ActivityLogFilters & {
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    filterOptions: FilterOptions;
    stats: { today: number };
};

const selectClasses =
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function actionBadge(action: string) {
    switch (action) {
        case "created":
        case "create":
        case "store":
        case "registered":
            return (
                <Badge className="border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {action}
                </Badge>
            );
        case "updated":
        case "update":
        case "restored":
            return (
                <Badge className="border-transparent bg-amber-600/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    {action}
                </Badge>
            );
        case "deleted":
        case "delete":
        case "destroy":
        case "failed":
            return (
                <Badge className="border-transparent bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    {action}
                </Badge>
            );
        case "login":
        case "logout":
            return (
                <Badge className="border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                    {action}
                </Badge>
            );
        default:
            return <Badge variant="secondary">{action}</Badge>;
    }
}

function entityName(log: ActivityLog): string {
    if (!log.entity_type) return "—";
    const parts = log.entity_type.split("\\");
    return parts[parts.length - 1] ?? log.entity_type;
}

export default function ActivityLogsIndex() {
    const { logs, filters, filterOptions, stats } =
        usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [module, setModule] = useState(filters.module ?? "");
    const [action, setAction] = useState(filters.action ?? "");
    const [causerId, setCauserId] = useState(
        filters.causer_id ? String(filters.causer_id) : "",
    );
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
    const [dateTo, setDateTo] = useState(filters.date_to ?? "");
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const isFirstRender = useRef(true);

    const sort = filters.sort_by
        ? {
              key: filters.sort_by,
              direction: (filters.sort_dir === "asc" ? "asc" : "desc") as
                  | "asc"
                  | "desc",
          }
        : null;

    const buildParams = (): Record<string, string> => {
        const params: Record<string, string> = {};
        const nextSearch = search.trim();
        if (nextSearch !== "") params.search = nextSearch;
        if (module !== "") params.module = module;
        if (action !== "") params.action = action;
        if (causerId !== "") params.causer_id = causerId;
        if (dateFrom !== "") params.date_from = dateFrom;
        if (dateTo !== "") params.date_to = dateTo;
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.sort_dir) params.sort_dir = filters.sort_dir;
        return params;
    };

    const applyFilters = (
        overrides: {
            search?: string;
            module?: string;
            action?: string;
            causer_id?: string;
            date_from?: string;
            date_to?: string;
        } = {},
    ) => {
        const params: Record<string, string> = {};
        const nextSearch = (overrides.search ?? search).trim();
        const nextModule = overrides.module ?? module;
        const nextAction = overrides.action ?? action;
        const nextCauser = overrides.causer_id ?? causerId;
        const nextFrom = overrides.date_from ?? dateFrom;
        const nextTo = overrides.date_to ?? dateTo;

        if (nextSearch !== "") params.search = nextSearch;
        if (nextModule !== "") params.module = nextModule;
        if (nextAction !== "") params.action = nextAction;
        if (nextCauser !== "") params.causer_id = nextCauser;
        if (nextFrom !== "") params.date_from = nextFrom;
        if (nextTo !== "") params.date_to = nextTo;
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.sort_dir) params.sort_dir = filters.sort_dir;

        router.get(route("activity-logs.index"), { ...params, page: 1 }, {
            preserveState: true,
            replace: true,
        });
    };

    // Debounced, URL-synced search (blueprint §8)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            applyFilters({ search });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const clearAll = () => {
        setSearch("");
        setModule("");
        setAction("");
        setCauserId("");
        setDateFrom("");
        setDateTo("");
        router.get(
            route("activity-logs.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const exportUrl = `${route("activity-logs.export")}?${new URLSearchParams(
        buildParams(),
    ).toString()}`;

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("activity-logs.index"),
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
        window.location.href = exportUrl;
    };

    const columns: ColumnDef<ActivityLog>[] = useMemo(
        () => [
            {
                id: "when",
                header: "When",
                sortable: true,
                sortKey: "created_at",
                cell: (log) => (
                    <span className="whitespace-nowrap text-muted-foreground">
                        {formatTime(log.created_at)}
                    </span>
                ),
            },
            {
                id: "user",
                header: "User",
                cell: (log) =>
                    log.causer ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                                <AvatarFallback className="text-[10px]">
                                    {initials(log.causer.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">
                                    {log.causer.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {log.causer.email}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">System</span>
                    ),
            },
            {
                id: "module",
                header: "Module",
                sortable: true,
                sortKey: "module",
                cell: (log) => <Badge variant="outline">{log.module}</Badge>,
            },
            {
                id: "action",
                header: "Action",
                sortable: true,
                sortKey: "action",
                cell: (log) => actionBadge(log.action),
            },
            {
                id: "entity",
                header: "Entity",
                sortable: true,
                sortKey: "entity_type",
                cell: (log) => (
                    <span className="text-muted-foreground">
                        {entityName(log)}
                        {log.entity_id ? ` #${log.entity_id}` : ""}
                    </span>
                ),
            },
            {
                id: "details",
                header: "Details",
                cell: (log) => (
                    <p className="max-w-md truncate text-muted-foreground">
                        {log.remarks ?? "—"}
                    </p>
                ),
            },
            {
                id: "ip",
                header: "IP",
                cell: (log) => (
                    <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {log.ip_address ?? "—"}
                    </span>
                ),
            },
        ],
        [],
    );

    const formatTime = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <AppLayout>
            <Head title="Activity Logs" />

            <PageHeader
                title="Activity Logs"
                description="Searchable audit trail of who did what, when, and where."
                icon={<History className="size-5" />}
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search remarks, module, user…"
                searchLabel="Search activity logs"
                activeFilters={[
                    ...(module
                        ? [
                              {
                                  label: `Module: ${module}`,
                                  onRemove: () => {
                                      setModule("");
                                      applyFilters({ module: "" });
                                  },
                              },
                          ]
                        : []),
                    ...(action
                        ? [
                              {
                                  label: `Action: ${action}`,
                                  onRemove: () => {
                                      setAction("");
                                      applyFilters({ action: "" });
                                  },
                              },
                          ]
                        : []),
                    ...(causerId
                        ? [
                              {
                                  label: `User: ${
                                      filterOptions.causers.find(
                                          (causer) =>
                                              String(causer.id) === causerId,
                                      )?.name ?? causerId
                                  }`,
                                  onRemove: () => {
                                      setCauserId("");
                                      applyFilters({ causer_id: "" });
                                  },
                              },
                          ]
                        : []),
                    ...(dateFrom
                        ? [
                              {
                                  label: `From ${dateFrom}`,
                                  onRemove: () => {
                                      setDateFrom("");
                                      applyFilters({ date_from: "" });
                                  },
                              },
                          ]
                        : []),
                    ...(dateTo
                        ? [
                              {
                                  label: `To ${dateTo}`,
                                  onRemove: () => {
                                      setDateTo("");
                                      applyFilters({ date_to: "" });
                                  },
                              },
                          ]
                        : []),
                ]}
                onReset={clearAll}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
            >
                <select
                    className={`${selectClasses} w-auto min-w-36`}
                    value={module}
                    onChange={(e) => {
                        setModule(e.target.value);
                        applyFilters({ module: e.target.value });
                    }}
                    aria-label="Filter by module"
                >
                    <option value="">All modules</option>
                    {filterOptions.modules.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <select
                    className={`${selectClasses} w-auto min-w-36`}
                    value={action}
                    onChange={(e) => {
                        setAction(e.target.value);
                        applyFilters({ action: e.target.value });
                    }}
                    aria-label="Filter by action"
                >
                    <option value="">All actions</option>
                    {filterOptions.actions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <select
                    className={`${selectClasses} w-auto min-w-40`}
                    value={causerId}
                    onChange={(e) => {
                        setCauserId(e.target.value);
                        applyFilters({ causer_id: e.target.value });
                    }}
                    aria-label="Filter by user"
                >
                    <option value="">All users</option>
                    {filterOptions.causers.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>

                <Input
                    type="date"
                    className="h-10 w-auto"
                    value={dateFrom}
                    onChange={(e) => {
                        setDateFrom(e.target.value);
                        applyFilters({ date_from: e.target.value });
                    }}
                    aria-label="Filter from date"
                />

                <Input
                    type="date"
                    className="h-10 w-auto"
                    value={dateTo}
                    onChange={(e) => {
                        setDateTo(e.target.value);
                        applyFilters({ date_to: e.target.value });
                    }}
                    aria-label="Filter to date"
                />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Inbox className="size-4" />
                    {stats.today} entries today
                </div>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<ActivityLog>
                        columns={columns}
                        data={logs.data}
                        rowKey={(log) => log.id}
                        sort={sort}
                        onSort={handleSort}
                        onExport={handleExport}
                        onRowClick={(log) => setSelectedLog(log)}
                        emptyState={
                            <EmptyState
                                icon={Inbox}
                                title="No activity found"
                                description="Try adjusting your search or filters."
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
                                    route("activity-logs.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun="entries"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Blueprint §8 Slide-Over Detail Drawer */}
            <Sheet open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <SheetContent side="right" className="sm:max-w-xl p-0 overflow-y-auto">
                    {selectedLog && (
                        <div className="flex flex-col gap-6 p-6">
                            <SheetHeader className="p-0 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{selectedLog.module}</Badge>
                                    {actionBadge(selectedLog.action)}
                                    <span className="ml-auto text-xs text-muted-foreground font-mono">
                                        #{selectedLog.id}
                                    </span>
                                </div>
                                <SheetTitle className="text-lg font-semibold text-foreground">
                                    {selectedLog.remarks ?? `${selectedLog.action} ${selectedLog.module}`}
                                </SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">
                                    {formatTime(selectedLog.created_at)}
                                </SheetDescription>
                            </SheetHeader>

                            {/* User & Telemetry Section */}
                            <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Causer & Network Telemetry
                                </h4>
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-9">
                                        <AvatarFallback>
                                            {selectedLog.causer ? initials(selectedLog.causer.name) : "SYS"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {selectedLog.causer?.name ?? "System Process"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedLog.causer?.email ?? "Automated System Event"}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">IP Address: </span>
                                        <span className="font-mono font-medium">{selectedLog.ip_address ?? "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">HTTP Method: </span>
                                        <span className="font-semibold">{selectedLog.method ?? "—"}</span>
                                    </div>
                                    <div className="col-span-2 truncate">
                                        <span className="text-muted-foreground">Request URL: </span>
                                        <span className="font-mono text-[11px]">{selectedLog.request_url ?? "—"}</span>
                                    </div>
                                    {selectedLog.society && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Society: </span>
                                            <span className="font-medium">{selectedLog.society.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Target Entity Section */}
                            <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-2 text-xs">
                                <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px]">
                                    Target Entity Context
                                </h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Entity Type:</span>
                                    <span className="font-mono font-medium">{selectedLog.entity_type ?? "—"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Entity ID:</span>
                                    <span className="font-mono font-medium">{selectedLog.entity_id ?? "—"}</span>
                                </div>
                                {selectedLog.user_agent && (
                                    <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground truncate">
                                        Agent: {selectedLog.user_agent}
                                    </div>
                                )}
                            </div>

                            {/* Diff / Payload Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Recorded Diff & Payload
                                </h4>

                                {selectedLog.old_values && selectedLog.new_values ? (
                                    <div className="grid gap-3">
                                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5">
                                                Before (Previous Attributes)
                                            </p>
                                            <pre className="overflow-x-auto rounded-lg bg-background/80 p-3 font-mono text-[11px] text-foreground border border-border/50">
                                                {JSON.stringify(selectedLog.old_values, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                                                After (Updated Attributes)
                                            </p>
                                            <pre className="overflow-x-auto rounded-lg bg-background/80 p-3 font-mono text-[11px] text-foreground border border-border/50">
                                                {JSON.stringify(selectedLog.new_values, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ) : selectedLog.new_values ? (
                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                                            Created Payload
                                        </p>
                                        <pre className="overflow-x-auto rounded-lg bg-background/80 p-3 font-mono text-[11px] text-foreground border border-border/50">
                                            {JSON.stringify(selectedLog.new_values, null, 2)}
                                        </pre>
                                    </div>
                                ) : selectedLog.properties ? (
                                    <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                                        <pre className="overflow-x-auto rounded-lg bg-background/80 p-3 font-mono text-[11px] text-foreground border border-border/50">
                                            {JSON.stringify(selectedLog.properties, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                        No value diff payload recorded for this operation.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
