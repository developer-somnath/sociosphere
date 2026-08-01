import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Inbox,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PageProps } from "@/types";
import type { Paginated, Resident } from "@/features/residents/types";

type IndexProps = {
    residents: Paginated<Resident>;
    filters: { search: string };
    can: { create: boolean; delete: boolean };
};

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function genderBadge(gender: Resident["gender"]) {
    switch (gender) {
        case "Male":
            return <Badge variant="secondary">Male</Badge>;
        case "Female":
            return <Badge variant="secondary">Female</Badge>;
        case "Other":
            return <Badge variant="outline">Other</Badge>;
        default:
            return <span className="text-muted-foreground">—</span>;
    }
}

export default function ResidentsIndex() {
    const { residents, filters, can } =
        usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [confirming, setConfirming] = useState<number | null>(null);

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route("residents.index"),
            { search: search.trim() },
            { preserveState: true, replace: true },
        );
    };

    const clearSearch = () => {
        setSearch("");
        router.get(
            route("residents.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const destroy = (resident: Resident) => {
        setConfirming(null);
        if (window.confirm(`Remove ${resident.name} from this society?`)) {
            router.delete(route("residents.destroy", resident.uuid), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Residents" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Residents</h1>
                <p className="text-sm text-muted-foreground">
                    Manage the people living in your society.
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
                        placeholder="Search name, phone, email, flat…"
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
                        <Link href={route("residents.create")}>
                            <Plus />
                            Add Resident
                        </Link>
                    </Button>
                )}
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="p-0">
                    {residents.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <Inbox className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">
                                {filters.search
                                    ? "No residents match your search."
                                    : "No residents yet."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {filters.search
                                    ? "Try a different search term."
                                    : can.create
                                      ? "Add your first resident to get started."
                                      : "Check back later."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-5 py-3 font-medium">
                                            Resident
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Flat
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Contact
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Gender
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {residents.data.map((resident) => (
                                        <tr
                                            key={resident.id}
                                            className="border-b border-border/40 last:border-b-0 hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {initials(
                                                                resident.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-medium">
                                                            {resident.name}
                                                        </p>
                                                        {resident.occupation && (
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {resident.occupation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="font-medium">
                                                    {resident.flat?.flat_no ??
                                                        "—"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {resident.flat?.tower?.name ??
                                                        ""}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p>{resident.phone}</p>
                                                {resident.email && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {resident.email}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                {genderBadge(resident.gender)}
                                            </td>
                                            <td className="px-5 py-3">
                                                {resident.is_primary_contact ? (
                                                    <Badge className="bg-emerald-600 text-white">
                                                        Primary
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Resident
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        aria-label={`Edit ${resident.name}`}
                                                    >
                                                        <Link
                                                            href={route(
                                                                "residents.edit",
                                                                resident.uuid,
                                                            )}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    {can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Remove ${resident.name}`}
                                                            onClick={() =>
                                                                setConfirming(
                                                                    resident.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {confirming === resident.id && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                                        <Card className="w-full max-w-sm shadow-lg">
                                                            <CardContent className="p-6">
                                                                <h2 className="text-lg font-semibold">
                                                                    Remove{" "}
                                                                    {resident.name}
                                                                    ?
                                                                </h2>
                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    This will
                                                                    remove the
                                                                    resident from
                                                                    the society.
                                                                    This action
                                                                    can be
                                                                    undone by an
                                                                    administrator.
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
                                                                                resident,
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

            {residents.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {residents.from ?? 0}–{residents.to ?? 0}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {residents.total}
                        </span>{" "}
                        residents
                    </p>
                    <div className="flex gap-2">
                        {residents.current_page > 1 && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={
                                        residents.links[0]?.url ??
                                        route("residents.index")
                                    }
                                >
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {residents.current_page < residents.last_page && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={
                                        residents.links.at(-1)?.url ??
                                        route("residents.index")
                                    }
                                >
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {residents.total} resident
                {residents.total === 1 ? "" : "s"} registered
            </div>
        </AppLayout>
    );
}
