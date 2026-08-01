import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Building2,
    DoorOpen,
    Home,
    Inbox,
    Pencil,
    Percent,
    Plus,
    Search,
    Trash2,
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
    Flat,
    FlatStats,
    Paginated,
    TowerOption,
} from "@/features/flats/types";

type IndexProps = {
    flats: Paginated<Flat>;
    filters: {
        search: string;
        tower_id: number | null;
        status: "Occupied" | "Vacant" | "Self-Occupied" | null;
    };
    towers: TowerOption[];
    stats: FlatStats;
    can: { create: boolean; delete: boolean };
};

const selectClasses =
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

const statusStyles: Record<
    Flat["occupancy_status"],
    { badge: string; dot: string }
> = {
    Occupied: {
        badge:
            "border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    Vacant: {
        badge:
            "border-transparent bg-muted text-muted-foreground",
        dot: "bg-muted-foreground",
    },
    "Self-Occupied": {
        badge:
            "border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
        dot: "bg-sky-500",
    },
};

export default function FlatsIndex() {
    const { flats, filters, towers, stats, can } =
        usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [towerId, setTowerId] = useState(
        filters.tower_id === null ? "" : String(filters.tower_id),
    );
    const [status, setStatus] = useState(filters.status ?? "");
    const [confirming, setConfirming] = useState<number | null>(null);

    const applyFilters = (
        overrides: { search?: string; tower_id?: string; status?: string } = {},
    ) => {
        const params: Record<string, string> = {};
        const nextSearch = (overrides.search ?? search).trim();
        const nextTower = overrides.tower_id ?? towerId;
        const nextStatus = overrides.status ?? status;

        if (nextSearch !== "") params.search = nextSearch;
        if (nextTower !== "") params.tower_id = nextTower;
        if (nextStatus !== "") params.status = nextStatus;

        router.get(route("flats.index"), params, {
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
        setTowerId("");
        setStatus("");
        router.get(
            route("flats.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const destroy = (flat: Flat) => {
        setConfirming(null);
        if (
            window.confirm(
                `Remove flat "${flat.flat_no}"? Flats with residents cannot be removed.`,
            )
        ) {
            router.delete(route("flats.destroy", flat.uuid), {
                preserveScroll: true,
            });
        }
    };

    const statCards = [
        {
            label: "Total Units",
            value: stats.total_units,
            icon: Home,
            accent:
                "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        },
        {
            label: "Occupied",
            value: stats.occupied_units,
            icon: DoorOpen,
            accent:
                "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
        },
        {
            label: "Vacant",
            value: stats.vacant_units,
            icon: Building2,
            accent:
                "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        },
        {
            label: "Occupancy Rate",
            value: `${stats.occupancy_rate}%`,
            icon: Percent,
            accent:
                "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
        },
    ];

    return (
        <AppLayout>
            <Head title="Flats" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Flats</h1>
                <p className="text-sm text-muted-foreground">
                    Manage the property units in your society.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.label} className="border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div
                                className={`flex size-10 items-center justify-center rounded-md ${card.accent}`}
                            >
                                <card.icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {card.label}
                                </p>
                                <p className="text-xl font-bold">
                                    {card.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <form
                    onSubmit={submitSearch}
                    className="relative w-full max-w-sm"
                >
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search flats, towers, residents…"
                        className="pl-9 pr-9"
                    />
                    {search !== "" && (
                        <button
                            type="button"
                            onClick={() => applyFilters({ search: "" })}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </form>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        aria-label="Filter by tower"
                        className={`${selectClasses} w-auto min-w-44`}
                        value={towerId}
                        onChange={(e) => {
                            setTowerId(e.target.value);
                            applyFilters({ tower_id: e.target.value });
                        }}
                    >
                        <option value="">All towers</option>
                        {towers.map((tower) => (
                            <option key={tower.id} value={tower.id}>
                                {tower.label}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Filter by status"
                        className={`${selectClasses} w-auto min-w-40`}
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilters({ status: e.target.value });
                        }}
                    >
                        <option value="">All statuses</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Vacant">Vacant</option>
                        <option value="Self-Occupied">Self-Occupied</option>
                    </select>

                    {(search !== "" || towerId !== "" || status !== "") && (
                        <Button variant="outline" size="sm" onClick={clearAll}>
                            <X />
                            Clear
                        </Button>
                    )}

                    {can.create && (
                        <Button
                            asChild
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Link href={route("flats.create")}>
                                <Plus />
                                Add Flat
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="p-0">
                    {flats.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <Inbox className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">
                                {filters.search ||
                                filters.tower_id ||
                                filters.status
                                    ? "No flats match your filters."
                                    : "No flats yet."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {filters.search ||
                                filters.tower_id ||
                                filters.status
                                    ? "Try adjusting your search or filters."
                                    : can.create
                                      ? "Add your first flat to get started."
                                      : "Check back later."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-5 py-3 font-medium">
                                            Flat
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Type
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Floor
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Area
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Ownership
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Residents
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flats.data.map((flat) => (
                                        <tr
                                            key={flat.id}
                                            className="border-b border-border/40 last:border-b-0 hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600">
                                                        <DoorOpen className="size-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {flat.flat_no}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {flat.tower?.name ??
                                                                "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                {flat.flat_type ?? (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                {flat.floor_no ?? (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                {flat.area_sqft ? (
                                                    <span className="text-muted-foreground">
                                                        {flat.area_sqft.toLocaleString()}{" "}
                                                        sq. ft.
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`gap-1.5 ${statusStyles[flat.occupancy_status].badge}`}
                                                >
                                                    <span
                                                        className={`size-1.5 rounded-full ${statusStyles[flat.occupancy_status].dot}`}
                                                    />
                                                    {flat.occupancy_status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3">
                                                {flat.ownership_type ===
                                                "Tenant" ? (
                                                    <Badge variant="outline">
                                                        Tenant
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                    >
                                                        Owner
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-muted-foreground">
                                                    {flat.residents_count > 0 ? (
                                                        <Link
                                                            href={route(
                                                                "residents.index",
                                                            )}
                                                            className="font-medium text-foreground underline-offset-4 hover:underline"
                                                        >
                                                            {flat.residents_count}{" "}
                                                            resident
                                                            {flat.residents_count ===
                                                            1
                                                                ? ""
                                                                : "s"}
                                                        </Link>
                                                    ) : (
                                                        "0 residents"
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        aria-label={`Edit ${flat.flat_no}`}
                                                    >
                                                        <Link
                                                            href={route(
                                                                "flats.edit",
                                                                flat.uuid,
                                                            )}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    {can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Remove ${flat.flat_no}`}
                                                            onClick={() =>
                                                                setConfirming(
                                                                    flat.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {confirming === flat.id && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                                        <Card className="w-full max-w-sm shadow-lg">
                                                            <CardContent className="p-6">
                                                                <h2 className="text-lg font-semibold">
                                                                    Remove flat{" "}
                                                                    {flat.flat_no}
                                                                    ?
                                                                </h2>
                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    This will
                                                                    remove the
                                                                    flat from
                                                                    the society.
                                                                    Flats with
                                                                    residents
                                                                    attached
                                                                    cannot be
                                                                    removed.
                                                                </p>
                                                                <div className="mt-5 flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            setConfirming(
                                                                                null,
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            destroy(
                                                                                flat,
                                                                            )
                                                                        }
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {flats.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {flats.from ?? 0}–{flats.to ?? 0}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {flats.total}
                        </span>{" "}
                        flats
                    </p>
                    <div className="flex gap-2">
                        {flats.current_page > 1 && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={
                                        flats.links[0]?.url ??
                                        route("flats.index")
                                    }
                                >
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {flats.current_page < flats.last_page && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={
                                        flats.links.at(-1)?.url ??
                                        route("flats.index")
                                    }
                                >
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
