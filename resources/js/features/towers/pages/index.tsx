import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Building2,
    Inbox,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PageProps } from "@/types";
import type { Paginated, Tower } from "@/features/towers/types";

type IndexProps = {
    towers: Paginated<Tower>;
    filters: { search: string };
    can: { create: boolean; delete: boolean };
};

export default function TowersIndex() {
    const { towers, filters, can } = usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [confirming, setConfirming] = useState<number | null>(null);

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route("towers.index"),
            { search: search.trim() },
            { preserveState: true, replace: true },
        );
    };

    const clearSearch = () => {
        setSearch("");
        router.get(
            route("towers.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const destroy = (tower: Tower) => {
        setConfirming(null);
        if (window.confirm(`Remove tower "${tower.name}"?`)) {
            router.delete(route("towers.destroy", tower.uuid), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Towers" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Towers</h1>
                <p className="text-sm text-muted-foreground">
                    Manage the towers in your society.
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
                        placeholder="Search towers…"
                        className="pl-9 pr-9"
                    />
                    {search !== "" && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </form>

                {can.create && (
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href={route("towers.create")}>
                            <Plus />
                            Add Tower
                        </Link>
                    </Button>
                )}
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="p-0">
                    {towers.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <Building2 className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">
                                {filters.search
                                    ? "No towers match your search."
                                    : "No towers yet."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {filters.search
                                    ? "Try a different search term."
                                    : can.create
                                      ? "Add your first tower to get started."
                                      : "Check back later."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-5 py-3 font-medium">
                                            Tower
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Flats
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {towers.data.map((tower) => (
                                        <tr
                                            key={tower.id}
                                            className="border-b border-border/40 last:border-b-0 hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600">
                                                        <Building2 className="size-4" />
                                                    </div>
                                                    <p className="font-medium">
                                                        {tower.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-muted-foreground">
                                                    {tower.flats_count} flat
                                                    {tower.flats_count === 1
                                                        ? ""
                                                        : "s"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        aria-label={`Edit ${tower.name}`}
                                                    >
                                                        <Link
                                                            href={route(
                                                                "towers.edit",
                                                                tower.uuid,
                                                            )}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    {can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Remove ${tower.name}`}
                                                            onClick={() =>
                                                                setConfirming(
                                                                    tower.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {confirming === tower.id && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                                        <Card className="w-full max-w-sm shadow-lg">
                                                            <CardContent className="p-6">
                                                                <h2 className="text-lg font-semibold">
                                                                    Remove{" "}
                                                                    {tower.name}
                                                                    ?
                                                                </h2>
                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    This will
                                                                    remove the
                                                                    tower from
                                                                    the society.
                                                                    Towers with
                                                                    flats
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
                                                                                tower,
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

            {towers.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {towers.from ?? 0}–{towers.to ?? 0}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {towers.total}
                        </span>{" "}
                        towers
                    </p>
                    <div className="flex gap-2">
                        {towers.current_page > 1 && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={
                                        towers.links[0]?.url ??
                                        route("towers.index")
                                    }
                                >
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {towers.current_page < towers.last_page && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={
                                        towers.links.at(-1)?.url ??
                                        route("towers.index")
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
