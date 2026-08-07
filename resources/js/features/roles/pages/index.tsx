import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Inbox,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    Users,
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
import type { Paginated, Role } from "@/features/roles/types";

type IndexProps = {
    roles: Paginated<Role>;
    filters: { search: string };
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function RolesIndex() {
    const { roles, filters, can } = usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [confirming, setConfirming] = useState<string | null>(null);

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        const next = search.trim();
        if (next !== "") params.search = next;
        router.get(route("roles.index"), params, {
            preserveState: true,
            replace: true,
        });
    };

    const clearSearch = () => {
        setSearch("");
        router.get(
            route("roles.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const destroy = (role: Role) => {
        setConfirming(null);
        if (
            window.confirm(
                `Remove the "${role.name}" role? Users holding it will lose its permissions.`,
            )
        ) {
            router.delete(route("roles.destroy", role.uuid), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Roles" />

            <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create custom roles and assign feature-wise permissions.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {can.create && (
                            <Button asChild>
                                <Link href={route("roles.create")}>
                                    <Plus />
                                    New role
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] lg:flex-row lg:items-center lg:justify-between">
                <form onSubmit={submitSearch} className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search roles…"
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

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    {roles.total} role{roles.total === 1 ? "" : "s"}
                </div>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    {roles.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <Inbox className="size-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                No roles found
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Try a different search term.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Members
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Permissions
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.data.map((role) => (
                                        <tr
                                            key={role.uuid}
                                            className="border-b border-border/40 last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                        <ShieldCheck className="size-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {role.name}
                                                        </p>
                                                        {role.description && (
                                                            <p className="max-w-xs truncate text-xs text-muted-foreground">
                                                                {
                                                                    role.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Users className="size-3.5" />
                                                    {role.users_count}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {role.permissions_count}
                                            </td>
                                            <td className="px-4 py-3">
                                                {role.is_system ? (
                                                    <Badge variant="secondary">
                                                        System
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Custom
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    {can.update &&
                                                        !(
                                                            role.is_system &&
                                                            role.name ===
                                                                "SuperAdmin"
                                                        ) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        "roles.edit",
                                                                        role.uuid,
                                                                    )}
                                                                >
                                                                    <Pencil />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    {can.delete &&
                                                        !role.is_system && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setConfirming(
                                                                        role.uuid,
                                                                    )
                                                                }
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 />
                                                                Delete
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

            {roles.links.length > 3 && (
                <div className="flex items-center justify-center gap-2">
                    {roles.links.map((link, index) => (
                        <Button
                            key={index}
                            variant={
                                link.active ? "default" : "outline"
                            }
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

            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
                        <h2 className="text-lg font-semibold">Delete role?</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Users holding this role will lose its permissions.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setConfirming(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    const role = roles.data.find(
                                        (r) => r.uuid === confirming,
                                    );
                                    if (role) destroy(role);
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
