import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Inbox,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCog,
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
import type { Paginated, RoleOption, User, UserRole } from "@/features/users/types";

type IndexProps = {
    users: Paginated<User>;
    filters: { search: string; role: string | null; status: string | null };
    roleOptions: RoleOption[];
    can: { create: boolean; delete: boolean };
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

function roleBadge(role: UserRole) {
    switch (role) {
        case "SuperAdmin":
            return (
                <Badge className="border-transparent bg-purple-600/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                    Super Admin
                </Badge>
            );
        case "SocietyAdmin":
            return (
                <Badge className="border-transparent bg-amber-600/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    Society Admin
                </Badge>
            );
        case "Treasurer":
            return (
                <Badge className="border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                    Treasurer
                </Badge>
            );
        case "SecurityGuard":
            return <Badge variant="secondary">Security Guard</Badge>;
        case "MaintenanceStaff":
            return <Badge variant="secondary">Maintenance</Badge>;
        case "Resident":
            return <Badge variant="outline">Resident</Badge>;
        default:
            return <span className="text-muted-foreground">—</span>;
    }
}

export default function UsersIndex() {
    const { users, filters, roleOptions, can } =
        usePage<PageProps<IndexProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [role, setRole] = useState(filters.role ?? "");
    const [status, setStatus] = useState(filters.status ?? "");
    const [confirming, setConfirming] = useState<number | null>(null);

    const applyFilters = (
        overrides: { search?: string; role?: string; status?: string } = {},
    ) => {
        const params: Record<string, string> = {};
        const nextSearch = (overrides.search ?? search).trim();
        const nextRole = overrides.role ?? role;
        const nextStatus = overrides.status ?? status;

        if (nextSearch !== "") params.search = nextSearch;
        if (nextRole !== "") params.role = nextRole;
        if (nextStatus !== "") params.status = nextStatus;

        router.get(route("users.index"), params, {
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
        setRole("");
        setStatus("");
        router.get(
            route("users.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const destroy = (user: User) => {
        setConfirming(null);
        if (window.confirm(`Remove ${user.name} from the system?`)) {
            router.delete(route("users.destroy", user.uuid), {
                preserveScroll: true,
            });
        }
    };

    const hasActiveFilters = search !== "" || role !== "" || status !== "";

    return (
        <AppLayout>
            <Head title="Users" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                <p className="text-sm text-muted-foreground">
                    Manage staff and resident accounts for your society.
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
                        placeholder="Search name, email, phone…"
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
                        <Link href={route("users.create")}>
                            <Plus />
                            Add User
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <select
                    className={`${selectClasses} w-auto`}
                    value={role}
                    onChange={(e) => {
                        setRole(e.target.value);
                        applyFilters({ role: e.target.value });
                    }}
                    aria-label="Filter by role"
                >
                    <option value="">All roles</option>
                    {roleOptions.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.label}
                        </option>
                    ))}
                </select>

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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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
                    {users.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <Inbox className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">
                                {hasActiveFilters
                                    ? "No users match your filters."
                                    : "No users yet."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? "Try different search terms or filters."
                                    : can.create
                                      ? "Add your first user to get started."
                                      : "Check back later."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-5 py-3 font-medium">
                                            User
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Role
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Society
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Contact
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
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-border/40 last:border-b-0 hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {initials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-medium">
                                                            {user.name}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                {roleBadge(
                                                    (user.roles[0]?.name ??
                                                        "") as UserRole,
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {user.society?.name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {user.phone || "—"}
                                            </td>
                                            <td className="px-5 py-3">
                                                {user.is_active ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1.5"
                                                    >
                                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1.5"
                                                    >
                                                        <span className="size-1.5 rounded-full bg-muted-foreground" />
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                "users.edit",
                                                                user.uuid,
                                                            )}
                                                            aria-label={`Edit ${user.name}`}
                                                        >
                                                            <Pencil />
                                                        </Link>
                                                    </Button>
                                                    {can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                setConfirming(
                                                                    user.id,
                                                                )
                                                            }
                                                            aria-label={`Remove ${user.name}`}
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

            {users.data.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {users.from}
                        </span>
                        –
                        <span className="font-medium text-foreground">
                            {users.to}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {users.total}
                        </span>{" "}
                        users
                    </p>
                    <div className="flex items-center gap-2">
                        {users.links[0]?.url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get(users.links[0].url!)}
                            >
                                Previous
                            </Button>
                        )}
                        {users.links.at(-1)?.url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(users.links.at(-1)!.url!)
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
                                <UserCog className="size-5 text-destructive" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Remove user</h3>
                                <p className="text-sm text-muted-foreground">
                                    {users.data.find(
                                        (user) => user.id === confirming,
                                    )?.name ?? "This user"}
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            This will remove the account and revoke sign-in.
                            Historical records are kept.
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
                                    const user = users.data.find(
                                        (item) => item.id === confirming,
                                    );
                                    if (user) destroy(user);
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
