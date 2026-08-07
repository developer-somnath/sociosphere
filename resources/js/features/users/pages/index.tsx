import { Head, Link, router, usePage } from "@inertiajs/react";
import { Inbox, Pencil, Plus, Send, Trash2, UserCog } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableFull, type Selection } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { exportCsv } from "@/lib/export-csv";
import { toast } from "@/lib/toast";
import type { PageProps } from "@/types";
import type {
    Paginated,
    RoleOption,
    User,
    UserRole,
} from "@/features/users/types";

type IndexProps = {
    users: Paginated<User>;
    filters: {
        search: string;
        role: string | null;
        status: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
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
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<User | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("");
    const [inviteSubmitting, setInviteSubmitting] = useState(false);
    const isFirstRender = useRef(true);

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
        role: role || undefined,
        status: status || undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

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

        router.get(
            route("users.index"),
            { ...params, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("users.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
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
        setRole("");
        setStatus("");
        router.get(
            route("users.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const user = users.data.find(
                (candidate) => candidate.uuid === id || candidate.id === id,
            );
            if (!user) return;
            setTimeout(
                () =>
                    router.delete(route("users.destroy", user.uuid), {
                        preserveScroll: true,
                    }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const handleDelete = () => {
        if (!confirming) return;
        const user = confirming;
        setConfirming(null);
        router.delete(route("users.destroy", user.uuid), {
            preserveScroll: true,
        });
    };

    const submitInvite = () => {
        if (!inviteEmail.trim() || !inviteRole || inviteSubmitting) return;
        setInviteSubmitting(true);
        router.post(
            route("users.invite"),
            { email: inviteEmail.trim(), role: inviteRole },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setInviteOpen(false);
                    setInviteEmail("");
                    setInviteRole("");
                    setInviteSubmitting(false);
                },
                onError: () => setInviteSubmitting(false),
            },
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
        exportCsv<User>({
            filename: "users.csv",
            columns: [
                { header: "Name", accessor: (user) => user.name },
                { header: "Email", accessor: (user) => user.email },
                { header: "Phone", accessor: (user) => user.phone ?? "" },
                {
                    header: "Role",
                    accessor: (user) => user.roles[0]?.name ?? "",
                },
                {
                    header: "Society",
                    accessor: (user) => user.society?.name ?? "",
                },
                {
                    header: "Status",
                    accessor: (user) => (user.is_active ? "Active" : "Inactive"),
                },
            ],
            rows: users.data,
        });
    };

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                id: "user",
                header: "User",
                sortable: true,
                sortKey: "name",
                cell: (user) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                            <AvatarFallback>
                                {initials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                id: "role",
                header: "Role",
                cell: (user) =>
                    roleBadge((user.roles[0]?.name ?? "") as UserRole),
            },
            {
                id: "society",
                header: "Society",
                cell: (user) => (
                    <span className="text-muted-foreground">
                        {user.society?.name ?? "—"}
                    </span>
                ),
            },
            {
                id: "contact",
                header: "Contact",
                cell: (user) => (
                    <span className="text-muted-foreground">
                        {user.phone || "—"}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Status",
                sortable: true,
                sortKey: "is_active",
                cell: (user) =>
                    user.is_active ? (
                        <Badge variant="secondary" className="gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="gap-1.5">
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
                            Inactive
                        </Badge>
                    ),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (user) => (
                    <div
                        className="flex items-center justify-end gap-0.5"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                router.post(
                                    route("users.toggle-status", user.uuid),
                                )
                            }
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <RowActions
                            actions={[
                                {
                                    label: "Edit",
                                    icon: Pencil,
                                    onClick: () =>
                                        router.visit(
                                            route("users.edit", user.uuid),
                                        ),
                                },
                                {
                                    label: "Remove",
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete,
                                    onClick: () => setConfirming(user),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [can],
    );

    const hasActiveFilters = search !== "" || role !== "" || status !== "";

    return (
        <AppLayout>
            <Head title="Users" />

            <PageHeader
                title="Users"
                description="Manage staff and resident accounts for your society."
                icon={<UserCog className="size-5" />}
                actions={
                    can.create && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setInviteOpen(true)}
                            >
                                <UserCog />
                                Invite User
                            </Button>
                            <Button asChild>
                                <Link href={route("users.create")}>
                                    <Plus />
                                    Add user
                                </Link>
                            </Button>
                        </>
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search name, email, phone…"
                searchLabel="Search users"
                activeFilters={[
                    ...(role
                        ? [
                              {
                                  label:
                                      roleOptions.find(
                                          (option) =>
                                              option.name === role,
                                      )?.label ?? role,
                                  onRemove: () => {
                                      setRole("");
                                      applyFilters({ role: "" });
                                  },
                              },
                          ]
                        : []),
                    ...(status
                        ? [
                              {
                                  label: status,
                                  onRemove: () => {
                                      setStatus("");
                                      applyFilters({ status: "" });
                                  },
                              },
                          ]
                        : []),
                ]}
                onReset={clearAll}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
            >
                <select
                    className={`${selectClasses} w-auto min-w-44`}
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
                    className={`${selectClasses} w-auto min-w-40`}
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

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCog className="size-4" />
                    {users.total} account{users.total === 1 ? "" : "s"}
                </div>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<User>
                        columns={columns}
                        data={users.data}
                        rowKey={(user) => user.uuid}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Inbox}
                                title={
                                    hasActiveFilters
                                        ? "No users match your filters"
                                        : "No users yet"
                                }
                                description={
                                    hasActiveFilters
                                        ? "Try different search terms or filters."
                                        : can.create
                                          ? "Add your first user to get started."
                                          : "Check back later."
                                }
                                action={
                                    can.create && !hasActiveFilters ? (
                                        <Button asChild>
                                            <Link href={route("users.create")}>
                                                <Plus />
                                                Add user
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                    {users.last_page > 1 && (
                        <Pagination
                            page={users.current_page}
                            perPage={users.per_page}
                            total={users.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("users.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun="users"
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun="users"
                actions={[
                    {
                        label: "Delete",
                        icon: <Trash2 />,
                        destructive: true,
                        disabled: !can.delete,
                        onClick: bulkDelete,
                    },
                ]}
            />

            <FormDrawer
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                title="Invite user"
                description="Send an email invitation with an initial role."
                icon={<UserCog className="size-5" />}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setInviteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitInvite}
                            disabled={
                                !inviteEmail.trim() ||
                                !inviteRole ||
                                inviteSubmitting
                            }
                        >
                            <Send />
                            Send invitation
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="invite-email">Email address</Label>
                        <Input
                            id="invite-email"
                            type="email"
                            placeholder="name@example.com"
                            value={inviteEmail}
                            onChange={(event) =>
                                setInviteEmail(event.target.value)
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Role</Label>
                        <Combobox
                            items={roleOptions.map((option) => ({
                                value: option.name,
                                label: option.label,
                            }))}
                            value={inviteRole}
                            onValueChange={setInviteRole}
                            placeholder="Select a role…"
                            searchPlaceholder="Search roles…"
                        />
                    </div>
                </div>
            </FormDrawer>

            <ConfirmDialog
                open={confirming !== null}
                onOpenChange={(open) => {
                    if (!open) setConfirming(null);
                }}
                title={
                    confirming
                        ? `Remove ${confirming.name} from the system?`
                        : "Remove user?"
                }
                description="This will remove the account and revoke sign-in. Historical records are kept."
                confirmLabel="Remove"
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
