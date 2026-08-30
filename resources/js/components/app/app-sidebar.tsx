import { Link, usePage } from "@inertiajs/react";
import {
    BookOpenText,
    Building2,
    CalendarCog,
    CalendarDays,
    Car,
    ChevronRight,
    ClipboardCheck,
    CreditCard,
    DoorOpen,
    FileSpreadsheet,
    FolderOpen,
    Gauge,
    History,
    LayoutDashboard,
    Megaphone,
    MessageSquareWarning,
    LogOut,
    Percent,
    Receipt,
    Settings,
    Settings2,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    User as UserIcon,
    UserCog,
    Users,
    Video,
    Vote,
    Calendar,
    type LucideIcon,
} from "lucide-react";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type NavItem = {
    title: string;
    routeName: string;
    icon: LucideIcon;
    permission?: string;
};

type NavGroup = {
    label: string;
    items: NavItem[];
};

/* ─── Navigation config ──────────────────────────────────────────────────── */

const NAV_GROUPS: NavGroup[] = [
    {
        label: "nav.overview",
        items: [
            {
                title: "nav.dashboard",
                routeName: "overview",
                icon: LayoutDashboard,
                permission: "dashboard.view",
            },
        ],
    },
    {
        label: "nav.properties",
        items: [
            { title: "nav.societies",  routeName: "societies.index",     icon: Building2, permission: "society.view"  },
            { title: "nav.towers",     routeName: "towers.index",        icon: Building2, permission: "tower.view"    },
            { title: "nav.flats",      routeName: "flats.index",         icon: Building2, permission: "flat.view"     },
            { title: "nav.residents",  routeName: "residents.index",     icon: Users,     permission: "resident.view" },
            { title: "nav.parking",    routeName: "parking-slots.index", icon: Car,       permission: "parking.view"  },
        ],
    },
    {
        label: "nav.operations",
        items: [
            { title: "nav.visitors",       routeName: "visitors.index",         icon: DoorOpen,         permission: "visitor.view"      },
            { title: "nav.amenities",      routeName: "amenities.index",        icon: Sparkles,         permission: "amenity.view"      },
            { title: "nav.bookings",       routeName: "amenity-bookings.index", icon: CalendarDays,     permission: "amenity.view"      },
            { title: "nav.cctv",           routeName: "cctv-cameras.index",     icon: Video,            permission: "cctv.view"         },
            { title: "nav.securityLog",    routeName: "security-logs.index",    icon: ShieldAlert,      permission: "security_log.view" },
        ],
    },
    {
        label: "nav.communications",
        items: [
            { title: "nav.notices",   routeName: "notices.index",          icon: Megaphone,  permission: "notice.view"   },
            { title: "nav.polls",     routeName: "polls.index",            icon: Vote,       permission: "poll.view"     },
            { title: "nav.events",    routeName: "community-events.index", icon: Calendar,   permission: "event.view"    },
            { title: "nav.documents", routeName: "documents.index",        icon: FolderOpen, permission: "document.view" },
        ],
    },
    {
        label: "nav.helpdesk",
        items: [
            { title: "nav.complaints",  routeName: "complaints.index",           icon: MessageSquareWarning, permission: "complaint.view" },
            { title: "nav.categories",  routeName: "complaint-categories.index", icon: FolderOpen,            permission: "complaint.view" },
        ],
    },
    {
        label: "nav.finance",
        items: [
            { title: "nav.invoices",       routeName: "invoices.index",     icon: Receipt,       permission: "invoice.view"    },
            { title: "nav.payments",       routeName: "payments.index",     icon: CreditCard,    permission: "collection.view" },
            { title: "nav.reports",        routeName: "reports.index",      icon: FileSpreadsheet, permission: "collection.view" },
            { title: "nav.batchGenerate", routeName: "billing.preview",    icon: CalendarCog,   permission: "billing.configure" },
            { title: "nav.flatLedger",    routeName: "billing.ledger",     icon: BookOpenText,  permission: "invoice.view"    },
            { title: "nav.billingConfig", routeName: "billing.settings",   icon: Settings2,     permission: "billing.configure" },
            { title: "nav.taxSettings",   routeName: "billing.tax-settings", icon: Percent,     permission: "billing.configure" },
            { title: "nav.runHistory",    routeName: "billing.runs",       icon: History,       permission: "billing.configure" },
            { title: "nav.invariantCheck", routeName: "billing.verify",    icon: ClipboardCheck, permission: "billing.configure" },
        ],
    },
    {
        label: "nav.subscription",
        items: [
            { title: "nav.subscriptionOverview", routeName: "subscription.show", icon: Sparkles, permission: "subscription.view" },
            { title: "nav.subscriptionUsage",    routeName: "subscription.usage", icon: Gauge,    permission: "usage.view"       },
            { title: "nav.subscriptionsAdmin",   routeName: "subscriptions.index", icon: Settings2, permission: "subscription.assign" },
            { title: "nav.plans",                routeName: "plans.index",        icon: Receipt,    permission: "plan.view"        },
        ],
    },
    {
        label: "nav.admin",
        items: [
            { title: "nav.users",         routeName: "users.index",         icon: UserCog,    permission: "user.view"         },
            { title: "nav.roles",         routeName: "roles.index",         icon: ShieldCheck,permission: "role.view"         },
            { title: "nav.activityLog",  routeName: "activity-logs.index", icon: History,    permission: "activity-log.view" },
        ],
    },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function safeRoute(name: string): string {
    try { return route(name); } catch { return "#"; }
}

function initials(name: string): string {
    return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

/** Map a raw role name (e.g. "SuperAdmin") to its i18n key, falling back to "Member". */
function roleKey(label: string): string {
    const map: Record<string, string> = {
        superadmin: "roles.superAdmin",
        societyadmin: "roles.societyAdmin",
        societymanager: "roles.societyManager",
        treasurer: "roles.treasurer",
        resident: "roles.resident",
        securityguard: "roles.securityGuard",
        securitymanager: "roles.securityManager",
        accountant: "roles.accountant",
        helpdesk: "roles.helpdesk",
        member: "roles.member",
    };
    return map[label.toLowerCase()] ?? "roles.member";
}

function isActive(href: string, url: string): boolean {
    if (!href || href === "#") return false;
    try {
        const hrefPath = new URL(href, "http://localhost").pathname.replace(/\/+$/, "") || "/";
        const currentPath = url.split("?")[0].replace(/\/+$/, "") || "/";
        if (hrefPath === "/overview" || hrefPath === "/") {
            return currentPath === "/overview" || currentPath === "/";
        }
        return currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`);
    } catch {
        return false;
    }
}

/* ─── NavItem component ──────────────────────────────────────────────────── */

function NavLink({ item, url }: { item: NavItem & { href: string }; url: string }) {
    const { t } = useI18n();
    const active = isActive(item.href, url);
    const Icon = item.icon;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={t(item.title)}
                className={cn(
                    "group relative h-9.5 rounded-xl px-3 text-slate-600 transition-all duration-200 dark:text-slate-400",
                    "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
                    active && "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:text-primary"
                )}
            >
                <Link href={item.href}>
                    {/* Active left indicator bar */}
                    {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <Icon className={cn("size-4 shrink-0 transition-colors duration-200", active ? "text-primary" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300")} />
                    <span className="truncate text-sm">{t(item.title)}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

/* ─── AppSidebar ─────────────────────────────────────────────────────────── */

export function AppSidebar() {
    const { url } = usePage();
    const { auth, version, environment } = usePage<PageProps>().props;
    const { state } = useSidebar();
    const { t } = useI18n();
    const user = auth.user;
    const isSuperAdmin = user?.is_super_admin ?? false;
    const permissions = user?.permissions ?? [];
    const roleLabel = user?.roles?.[0] ?? "Member";
    const collapsed = state === "collapsed";

    // Filter nav groups by permission
    const visibleGroups = NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items
            .filter((item) => isSuperAdmin || !item.permission || permissions.includes(item.permission))
            .map((item) => ({ ...item, href: safeRoute(item.routeName) })),
    })).filter((group) => group.items.length > 0);

    const handleLogout = () => {
        router.post(safeRoute("logout"));
    };

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-sidebar-border bg-sidebar"
        >
            {/* ── Brand header ────────────────────────────────────────── */}
            <SidebarHeader className="border-b border-sidebar-border/80 px-4 py-3.5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-slate-100 rounded-xl transition-colors">
                            <Link href={safeRoute("overview")} className="flex items-center gap-3">
                                {/* Logo mark — vibrant indigo rounded square */}
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold shadow-sm shadow-primary/30">
                                    <span className="text-base font-extrabold tracking-tight">S</span>
                                </div>
                                {/* Product name */}
                                <div className="grid min-w-0 flex-1 text-left">
                                    <span className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                        SocioSphere
                                    </span>
                                    <span className="truncate text-xs font-medium text-slate-400 dark:text-slate-500">
                                        {auth.society?.name ?? "Premium SaaS"}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Navigation ──────────────────────────────────────────── */}
            <SidebarContent className="px-3 py-3 space-y-4">
                {visibleGroups.map((group, gi) => (
                    <SidebarGroup key={group.label} className="p-0">
                        {/* Group label — hidden when collapsed */}
                        <SidebarGroupLabel
                            className={cn(
                                "mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500",
                                "group-data-[collapsible=icon]:hidden"
                            )}
                        >
                            {t(group.label)}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavLink key={item.title} item={item} url={url} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <SidebarFooter className="border-t border-sidebar-border/80 p-3 space-y-2">
                {/* Upgrade / Quick CTA button */}
                <div className="group-data-[collapsible=icon]:hidden px-1">
                    <Button
                        asChild
                        className="w-full justify-center rounded-xl bg-primary text-white font-semibold shadow-sm hover:bg-primary/90"
                    >
                        <Link href={safeRoute("subscriptions.index")}>
                            {t("nav.subscription") || "Upgrade Plan"}
                        </Link>
                    </Button>
                </div>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                >
                                    <Avatar className="size-7 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                                            {user ? initials(user.name) : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid min-w-0 flex-1 text-left text-xs">
                                        <span className="truncate font-semibold text-slate-900 dark:text-white">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-[10px] text-slate-400">
                                            {t(roleKey(roleLabel))}
                                        </span>
                                    </div>
                                    <ChevronRight className="size-3.5 shrink-0 rotate-[-90deg] text-slate-400" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-3 py-2.5">
                                        <Avatar className="size-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg text-xs font-semibold">
                                                {user ? initials(user.name) : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-sm">
                                            <span className="font-semibold text-foreground">
                                                {user?.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {user?.email}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href={safeRoute("profile.edit")}>
                                        <UserIcon className="size-4" />
                                        {t("menu.profileSettings")}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                >
                                    <LogOut className="size-4" />
                                    {t("auth.logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* ── Version tag ─────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-center gap-1.5 px-2 pb-1"
                    title={t("app.versionBadge")}
                >
                    <span className="truncate text-[10px] font-medium tracking-wide text-slate-400">
                        {t("app.name")} {version}
                    </span>
                    {environment && (
                        <span
                            className={cn(
                                "shrink-0 rounded-full px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider",
                                environment === "production"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-warning/10 text-warning",
                            )}
                        >
                            {environment}
                        </span>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
