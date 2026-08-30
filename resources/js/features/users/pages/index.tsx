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
import { t, useI18n } from "@/lib/i18n";
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
    "h-10 rounded-full border border-border/70 bg-background/80 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

/** Map a raw role name to its i18n key (users module roles). */
function roleKey(name: string): string {
    const map: Record<string, string> = {
        superadmin: "roles.superAdmin",
        societyadmin: "roles.societyAdmin",
        treasurer: "roles.treasurer",
        securityguard: "roles.securityGuard",
        maintenancestaff: "roles.maintenanceStaff",
        resident: "roles.resident",
    };
    return map[name.toLowerCase()] ?? name;
}

function roleBadge(role: UserRole) {
    switch (role) {
        case "SuperAdmin":
            return (
                <Badge className="border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info">
                    {t("roles.superAdmin")}
                </Badge>
            );
        case "SocietyAdmin":
            return (
                <Badge className="border-transparent bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning">
                    {t("roles.societyAdmin")}
                </Badge>
            );
        case "Treasurer":
            return (
                <Badge className="border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info">
                    {t("roles.treasurer")}
                </Badge>
            );
        case "SecurityGuard":
            return (
                <Badge variant="secondary">{t("roles.securityGuard")}</Badge>
            );
        case "MaintenanceStaff":
            return (
                <Badge variant="secondary">{t("roles.maintenanceStaff")}</Badge>
            );
        case "Resident":
            return <Badge variant="outline">{t("roles.resident")}</Badge>;
        default:
            return <span className="text-muted-foreground">—</span>;
    }
}

export default function UsersIndex() {
    const { users, filters, roleOptions, can } =
        usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();

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
                title: t("users.exportComingSoon"),
                variant: "info",
                description: t("users.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<User>({
            filename: "users.csv",
            columns: [
                { header: t("common.name"), accessor: (user) => user.name },
                { header: t("common.email"), accessor: (user) => user.email },
                {
                    header: t("common.phone"),
                    accessor: (user) => user.phone ?? "",
                },
                {
                    header: t("users.colRole"),
                    accessor: (user) => user.roles[0]?.name ?? "",
                },
                {
                    header: t("users.colSociety"),
                    accessor: (user) => user.society?.name ?? "",
                },
                {
                    header: t("common.status"),
                    accessor: (user) =>
                        user.is_active
                            ? t("common.active")
                            : t("common.inactive"),
                },
            ],
            rows: users.data,
        });
    };

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                id: "user",
                header: t("users.colUser"),
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
                header: t("users.colRole"),
                cell: (user) =>
                    roleBadge((user.roles[0]?.name ?? "") as UserRole),
            },
            {
                id: "society",
                header: t("users.colSociety"),
                cell: (user) => (
                    <span className="text-muted-foreground">
                        {user.society?.name ?? "—"}
                    </span>
                ),
            },
            {
                id: "contact",
                header: t("users.colContact"),
                cell: (user) => (
                    <span className="text-muted-foreground">
                        {user.phone || "—"}
                    </span>
                ),
            },
            {
                id: "status",
                header: t("common.status"),
                sortable: true,
                sortKey: "is_active",
                cell: (user) =>
                    user.is_active ? (
                        <Badge variant="secondary" className="gap-1.5">
                            <span className="size-1.5 rounded-full bg-brand" />
                            {t("common.active")}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="gap-1.5">
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
                            {t("common.inactive")}
                        </Badge>
                    ),
            },
            {
                id: "actions",
                header: t("common.actions"),
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
                            {user.is_active
                                ? t("users.deactivate")
                                : t("users.activate")}
                        </Button>
                        <RowActions
                            actions={[
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    onClick: () =>
                                        router.visit(
                                            route("users.edit", user.uuid),
                                        ),
                                },
                                {
                                    label: t("users.remove"),
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
        [can, t],
    );

    const hasActiveFilters = search !== "" || role !== "" || status !== "";

    return (
        <AppLayout>
            <Head title={t("nav.users")} />

            <PageHeader
                title={t("nav.users")}
                description={t("users.pageDescription")}
                icon={<UserCog className="size-5" />}
                actions={
                    can.create && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setInviteOpen(true)}
                            >
                                <UserCog />
                                {t("users.inviteUser")}
                            </Button>
                            <Button asChild>
                                <Link href={route("users.create")}>
                                    <Plus />
                                    {t("users.add")}
                                </Link>
                            </Button>
                        </>
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("users.searchPlaceholder")}
                searchLabel={t("users.searchLabel")}
                activeFilters={[
                    ...(role
                        ? [
                              {
                                  label: t(
                                      roleKey(
                                          roleOptions.find(
                                              (option) =>
                                                  option.name === role,
                                          )?.label ?? role,
                                      ),
                                  ),
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
                                  label:
                                      status === "Active"
                                          ? t("common.active")
                                          : t("common.inactive"),
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
                <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select
                        className={`${selectClasses} w-full`}
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                            applyFilters({ role: e.target.value });
                        }}
                        aria-label={t("users.filterByRole")}
                    >
                        <option value="">{t("users.allRoles")}</option>
                        {roleOptions.map((option) => (
                            <option key={option.name} value={option.name}>
                                {t(roleKey(option.label))}
                            </option>
                        ))}
                    </select>

                    <select
                        className={`${selectClasses} w-full`}
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilters({ status: e.target.value });
                        }}
                        aria-label={t("users.filterByStatus")}
                    >
                        <option value="">{t("users.allStatuses")}</option>
                        <option value="Active">{t("common.active")}</option>
                        <option value="Inactive">{t("common.inactive")}</option>
                    </select>

                    <div className="flex h-10 items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 text-xs font-semibold text-muted-foreground shadow-2xs">
                        <UserCog className="size-4 text-primary" />
                        <span>
                            {users.total}{" "}
                            {t(
                                users.total === 1
                                    ? "users.accountOne"
                                    : "users.accountMany",
                            )}
                        </span>
                    </div>
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
                                        ? t("users.emptySearchTitle")
                                        : t("users.emptyTitle")
                                }
                                description={
                                    hasActiveFilters
                                        ? t("users.emptySearchDescription")
                                        : can.create
                                          ? t("users.emptyDescription")
                                          : t("users.emptyDescriptionNoCreate")
                                }
                                action={
                                    can.create && !hasActiveFilters ? (
                                        <Button asChild>
                                            <Link href={route("users.create")}>
                                                <Plus />
                                                {t("users.add")}
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
                            noun={t("users.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("users.nounPlural")}
                actions={[
                    {
                        label: t("common.delete"),
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
                title={t("users.inviteTitle")}
                description={t("users.inviteDescription")}
                icon={<UserCog className="size-5" />}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setInviteOpen(false)}
                        >
                            {t("common.cancel")}
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
                            {t("users.sendInvitation")}
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="invite-email">
                            {t("users.inviteEmail")}
                        </Label>
                        <Input
                            id="invite-email"
                            type="email"
                            placeholder={t("users.inviteEmailPlaceholder")}
                            value={inviteEmail}
                            onChange={(event) =>
                                setInviteEmail(event.target.value)
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>{t("users.inviteRole")}</Label>
                        <Combobox
                            items={roleOptions.map((option) => ({
                                value: option.name,
                                label: t(roleKey(option.label)),
                            }))}
                            value={inviteRole}
                            onValueChange={setInviteRole}
                            placeholder={t("users.inviteRolePlaceholder")}
                            searchPlaceholder={t(
                                "users.inviteRoleSearchPlaceholder",
                            )}
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
                        ? t("users.confirmRemoveTitle", {
                              name: confirming.name,
                          })
                        : t("users.confirmRemoveTitleGeneric")
                }
                description={t("users.confirmRemoveDescription")}
                confirmLabel={t("users.remove")}
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
