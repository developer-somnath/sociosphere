import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Download,
    Inbox,
    Search,
    X,
} from "lucide-react";
import { FormEvent, Fragment, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PageProps } from "@/types";
import type {
    ActivityLog,
    ActivityLogFilters,
    FilterOptions,
    Paginated,
} from "@/features/activity-logs/types";

type IndexProps = {
    logs: Paginated<ActivityLog>;
    filters: ActivityLogFilters;
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
    const [expanded, setExpanded] = useState<number | null>(null);

    const buildParams = (): Record<string, string> => {
        const params: Record<string, string> = {};
        const nextSearch = search.trim();
        if (nextSearch !== "") params.search = nextSearch;
        if (module !== "") params.module = module;
        if (action !== "") params.action = action;
        if (causerId !== "") params.causer_id = causerId;
        if (dateFrom !== "") params.date_from = dateFrom;
        if (dateTo !== "") params.date_to = dateTo;
        return params;
    };

    const applyFilters = () => {
        router.get(route("activity-logs.index"), buildParams(), {
            preserveState: true,
            replace: true,
        });
    };

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

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

    const hasActiveFilters =
        search !== "" ||
        module !== "" ||
        action !== "" ||
        causerId !== "" ||
        dateFrom !== "" ||
        dateTo !== "";

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

            <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Activity Logs
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Searchable audit trail of who did what, when, and where.
                        </p>
                    </div>
                    <a
                        href={exportUrl}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-background px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
                    >
                        <Download />
                        Export CSV
                    </a>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] lg:flex-row lg:items-center lg:justify-between">
                <form onSubmit={submitSearch} className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search remarks, module, user…"
                        className="pl-9 pr-9"
                    />
                    {search !== "" && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                applyFilters();
                            }}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </form>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Inbox className="size-4" />
                    {stats.today} entries today
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="module-filter">Module</Label>
                    <select
                        id="module-filter"
                        className={`${selectClasses} w-auto`}
                        value={module}
                        onChange={(e) => {
                            setModule(e.target.value);
                            applyFilters();
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
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="action-filter">Action</Label>
                    <select
                        id="action-filter"
                        className={`${selectClasses} w-auto`}
                        value={action}
                        onChange={(e) => {
                            setAction(e.target.value);
                            applyFilters();
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
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="causer-filter">User</Label>
                    <select
                        id="causer-filter"
                        className={`${selectClasses} w-auto`}
                        value={causerId}
                        onChange={(e) => {
                            setCauserId(e.target.value);
                            applyFilters();
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
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="date-from">From</Label>
                    <Input
                        id="date-from"
                        type="date"
                        className="h-10 w-auto"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            applyFilters();
                        }}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="date-to">To</Label>
                    <Input
                        id="date-to"
                        type="date"
                        className="h-10 w-auto"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            applyFilters();
                        }}
                    />
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-muted-foreground"
                    >
                        <X />
                        Clear filters
                    </Button>
                )}
            </div>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    {logs.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <Inbox className="size-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                No activity found
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">
                                            When
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            User
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Module
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Action
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Entity
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Details
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            IP
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <Fragment key={log.id}>
                                            <tr
                                                onClick={() =>
                                                    setExpanded(
                                                        expanded === log.id
                                                            ? null
                                                            : log.id,
                                                    )
                                                }
                                                className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                                    {formatTime(log.created_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.causer ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="size-6">
                                                                <AvatarFallback className="text-[10px]">
                                                                    {initials(
                                                                        log.causer.name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        log
                                                                            .causer
                                                                            .name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        log
                                                                            .causer
                                                                            .email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            System
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">
                                                        {log.module}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {actionBadge(log.action)}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {entityName(log)}
                                                    {log.entity_id
                                                        ? ` #${log.entity_id}`
                                                        : ""}
                                                </td>
                                                <td className="max-w-md px-4 py-3">
                                                    <p className="truncate text-muted-foreground">
                                                        {log.remarks ?? "—"}
                                                    </p>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                                    {log.ip_address ?? "—"}
                                                </td>
                                            </tr>
                                            {expanded === log.id && (
                                                <tr
                                                    className="border-b border-border/40 bg-muted/20"
                                                >
                                                    <td
                                                        colSpan={7}
                                                        className="px-4 py-4"
                                                    >
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div className="flex flex-col gap-1.5">
                                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                    Request
                                                                </p>
                                                                <p className="text-sm">
                                                                    {log.method ??
                                                                        "—"}{" "}
                                                                    <span className="text-muted-foreground">
                                                                        {
                                                                            log.request_url
                                                                        }
                                                                    </span>
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Society:{" "}
                                                                    {log.society
                                                                        ?.name ??
                                                                        "—"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Entity:{" "}
                                                                    {log.entity_type ??
                                                                        "—"}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col gap-1.5">
                                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                    Change
                                                                </p>
                                                                {log.old_values &&
                                                                    log.new_values ? (
                                                                    <div className="grid gap-2 text-xs">
                                                                        <div>
                                                                            <p className="mb-1 font-medium text-amber-600 dark:text-amber-400">
                                                                                Before
                                                                            </p>
                                                                            <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-[11px]">
                                                                                {JSON.stringify(
                                                                                    log.old_values,
                                                                                    null,
                                                                                    2,
                                                                                )}
                                                                            </pre>
                                                                        </div>
                                                                        <div>
                                                                            <p className="mb-1 font-medium text-emerald-600 dark:text-emerald-400">
                                                                                After
                                                                            </p>
                                                                            <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-[11px]">
                                                                                {JSON.stringify(
                                                                                    log.new_values,
                                                                                    null,
                                                                                    2,
                                                                                )}
                                                                            </pre>
                                                                        </div>
                                                                    </div>
                                                                ) : log.properties ? (
                                                                    <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-[11px]">
                                                                        {JSON.stringify(
                                                                            log.properties,
                                                                            null,
                                                                            2,
                                                                        )}
                                                                    </pre>
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        No
                                                                        property
                                                                        changes
                                                                        recorded.
                                                                    </p>
                                                                )}
                                                                {log.user_agent && (
                                                                    <p className="truncate text-[11px] text-muted-foreground">
                                                                        {log.user_agent}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
                <p>
                    Showing {logs.from ?? 0}–{logs.to ?? 0} of {logs.total}{" "}
                    entries · {stats.today} today
                </p>
                {logs.links.length > 3 && (
                    <div className="flex items-center gap-2">
                        {logs.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                asChild={link.url !== null}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
