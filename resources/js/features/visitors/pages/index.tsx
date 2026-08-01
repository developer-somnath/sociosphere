import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    CheckCircle2,
    Inbox,
    LogIn,
    LogOut,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UserX,
    X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PageProps } from "@/types";
import type {
    Paginated,
    VisitorPass,
    VisitorStatus,
} from "@/features/visitors/types";

type IndexProps = {
    passes: Paginated<VisitorPass>;
    filters: { search: string; status: VisitorStatus | null };
    can: { create: boolean; update: boolean; delete: boolean };
};

const selectClasses =
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

const statusStyles: Record<VisitorStatus, string> = {
    pending:
        "border-transparent bg-amber-600/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    approved:
        "border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    checked_in:
        "border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    checked_out:
        "border-transparent bg-muted text-muted-foreground",
    rejected:
        "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
};

const statusLabels: Record<VisitorStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    rejected: "Rejected",
};

function formatDate(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function flatLabel(pass: VisitorPass): string {
    if (!pass.flat) return "—";
    const tower = pass.flat.tower?.name ? `${pass.flat.tower.name} · ` : "";
    return `${tower}${pass.flat.flat_no}`;
}

export default function VisitorsIndex() {
    const { passes, filters, can } =
        usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status ?? "");
    const [confirming, setConfirming] = useState<number | null>(null);

    const applyFilters = (
        overrides: { search?: string; status?: string } = {},
    ) => {
        const params: Record<string, string> = {};
        const nextSearch = (overrides.search ?? search).trim();
        const nextStatus = overrides.status ?? status;

        if (nextSearch !== "") params.search = nextSearch;
        if (nextStatus !== "") params.status = nextStatus;

        router.get(route("visitors.index"), params, {
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
        setStatus("");
        router.get(
            route("visitors.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const runAction = (pass: VisitorPass, action: string) => {
        router.post(
            route(`visitors.${action}`, pass.uuid),
            {},
            { preserveScroll: true },
        );
    };

    const destroy = (pass: VisitorPass) => {
        setConfirming(null);
        if (window.confirm(`Remove the pass for ${pass.visitor.name}?`)) {
            router.delete(route("visitors.destroy", pass.uuid), {
                preserveScroll: true,
            });
        }
    };

    const hasActiveFilters = search !== "" || status !== "";

    return (
        <AppLayout>
            <Head title="Visitors" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>
                <p className="text-sm text-muted-foreground">
                    Gate passes, approvals, and check-in/check-out tracking.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form
                    onSubmit={submitSearch}
                    className="relative w-full max-w-sm"
                >
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search visitor, phone, vehicle, purpose…"
                        className="pl-9 pr-9"
                    />
                    {search !== "" && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                applyFilters({ search: "" });
                            }}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </form>

                {can.create && (
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href={route("visitors.create")}>
                            <Plus />
                            New Pass
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <select
                    className={`${selectClasses} w-auto`}
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        applyFilters({ status: e.target.value });
                    }}
                    aria-label="Filter by status"
                >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="rejected">Rejected</option>
                </select>

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

            <Card className="border-border/60 shadow-sm">
                <CardContent className="p-0">
                    {passes.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <Inbox className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">
                                {hasActiveFilters
                                    ? "No passes match your filters."
                                    : "No visitor passes yet."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? "Try different search terms or filters."
                                    : can.create
                                      ? "Create your first gate pass to get started."
                                      : "Check back later."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-5 py-3 font-medium">
                                            Visitor
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Flat
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Purpose
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Vehicle
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Schedule
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Check In / Out
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {passes.data.map((pass) => (
                                        <tr
                                            key={pass.id}
                                            className="border-b border-border/40 last:border-b-0 hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="min-w-0">
                                                    <p className="font-medium">
                                                        {pass.visitor.name}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {pass.visitor.phone}
                                                        {pass.visitor.email
                                                            ? ` · ${pass.visitor.email}`
                                                            : ""}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {flatLabel(pass)}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {pass.purpose}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {pass.vehicle_number || "—"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge
                                                    className={statusStyles[pass.status]}
                                                >
                                                    {statusLabels[pass.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {formatDate(pass.scheduled_for)}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                <div className="flex flex-col text-xs">
                                                    <span>
                                                        In:{" "}
                                                        {formatDateTime(
                                                            pass.check_in_at,
                                                        )}
                                                    </span>
                                                    <span>
                                                        Out:{" "}
                                                        {formatDateTime(
                                                            pass.check_out_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {can.update &&
                                                        pass.status ===
                                                            "pending" && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Approve"
                                                                    aria-label={`Approve ${pass.visitor.name}`}
                                                                    onClick={() =>
                                                                        runAction(
                                                                            pass,
                                                                            "approve",
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="size-4 text-emerald-600" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Reject"
                                                                    aria-label={`Reject ${pass.visitor.name}`}
                                                                    onClick={() =>
                                                                        runAction(
                                                                            pass,
                                                                            "reject",
                                                                        )
                                                                    }
                                                                >
                                                                    <UserX className="size-4 text-destructive" />
                                                                </Button>
                                                            </>
                                                        )}

                                                    {can.update &&
                                                        pass.status ===
                                                            "approved" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Check in"
                                                                aria-label={`Check in ${pass.visitor.name}`}
                                                                onClick={() =>
                                                                    runAction(
                                                                        pass,
                                                                        "check-in",
                                                                    )
                                                                }
                                                            >
                                                                <LogIn className="size-4 text-emerald-600" />
                                                            </Button>
                                                        )}

                                                    {can.update &&
                                                        pass.status ===
                                                            "checked_in" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Check out"
                                                                aria-label={`Check out ${pass.visitor.name}`}
                                                                onClick={() =>
                                                                    runAction(
                                                                        pass,
                                                                        "check-out",
                                                                    )
                                                                }
                                                            >
                                                                <LogOut className="size-4 text-muted-foreground" />
                                                            </Button>
                                                        )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                "visitors.edit",
                                                                pass.uuid,
                                                            )}
                                                            aria-label={`Edit ${pass.visitor.name}`}
                                                        >
                                                            <Pencil />
                                                        </Link>
                                                    </Button>

                                                    {can.delete &&
                                                        pass.status ===
                                                            "pending" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    setConfirming(
                                                                        pass.id,
                                                                    )
                                                                }
                                                                aria-label={`Remove ${pass.visitor.name}`}
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {passes.data.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {passes.from}
                        </span>
                        –
                        <span className="font-medium text-foreground">
                            {passes.to}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {passes.total}
                        </span>{" "}
                        passes
                    </p>
                    <div className="flex items-center gap-2">
                        {passes.links[0]?.url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get(passes.links[0].url!)}
                            >
                                Previous
                            </Button>
                        )}
                        {passes.links.at(-1)?.url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(passes.links.at(-1)!.url!)
                                }
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {confirming !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setConfirming(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-xl bg-background p-6 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                                <ShieldCheck className="size-5 text-destructive" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Remove pass</h3>
                                <p className="text-sm text-muted-foreground">
                                    {passes.data.find(
                                        (pass) => pass.id === confirming,
                                    )?.visitor.name ?? "This visitor"}
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            This removes the pending gate pass from the
                            register.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setConfirming(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    const pass = passes.data.find(
                                        (item) => item.id === confirming,
                                    );
                                    if (pass) destroy(pass);
                                }}
                            >
                                <Trash2 />
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
