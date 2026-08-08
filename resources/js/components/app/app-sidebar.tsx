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
    FolderOpen,
    Gauge,
    History,
    LayoutDashboard,
    Megaphone,
    MessageSquareWarning,
    LogOut,
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
    useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
            { title: "nav.notices", routeName: "notices.index",   icon: Megaphone,  permission: "notice.view"   },
            { title: "nav.documents",    routeName: "documents.index", icon: FolderOpen, permission: "document.view" },
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
            { title: "nav.batchGenerate", routeName: "billing.preview",    icon: CalendarCog,   permission: "billing.configure" },
            { title: "nav.flatLedger",    routeName: "billing.ledger",     icon: BookOpenText,  permission: "invoice.view"    },
            { title: "nav.billingSettings", routeName: "billing.settings", icon: Settings2,    permission: "billing.configure" },
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
    if (href === "#") return false;
    return url === href || url.startsWith(`${href}/`);
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
                    "group relative h-9 rounded-lg px-2.5 text-sidebar-foreground/70 transition-all duration-200",
                    "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground hover:translate-x-0.5",
                    active && "bg-sidebar-primary/15 text-sidebar-primary font-semibold ring-1 ring-sidebar-primary/20 shadow-xs"
                )}
            >
                <Link href={item.href}>
                    {/* Active left indicator bar with glow */}
                    {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                    )}
                    <Icon className={cn("size-4 shrink-0 transition-colors duration-200", active ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-primary/80")} />
                    <span className="truncate text-sm">{t(item.title)}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

/* ─── AppSidebar ─────────────────────────────────────────────────────────── */

export function AppSidebar() {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const { state } = useSidebar();
    const { t } = useI18n();
    const user = auth.user;
    const permissions = user?.permissions ?? [];
    const roleLabel = user?.roles?.[0] ?? "Member";
    const collapsed = state === "collapsed";

    // Filter nav groups by permission
    const visibleGroups = NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items
            .filter((item) => !item.permission || permissions.includes(item.permission))
            .map((item) => ({ ...item, href: safeRoute(item.routeName) })),
    })).filter((group) => group.items.length > 0);

    return (
        <Sidebar
            collapsible="icon"
            className="border-r-0 bg-sidebar"
        >
            {/* ── Brand header ────────────────────────────────────────── */}
            <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-white/8 rounded-lg">
                            <Link href={safeRoute("overview")}>
                                {/* Logo mark */}
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/20 ring-1 ring-sidebar-primary/30">
                                    <Building2 className="size-4 text-sidebar-primary" />
                                </div>
                                {/* Product name */}
                                <div className="grid min-w-0 flex-1 text-left text-sm">
                                    <span className="truncate font-semibold tracking-tight text-sidebar-foreground">
                                        SocioSphere
                                    </span>
                                    <span className="truncate text-[11px] text-sidebar-foreground/50">
                                        {auth.society?.name ?? t("app.portal")}
                                    </span>
                                </div>
                                <ChevronRight className="size-3.5 shrink-0 text-sidebar-foreground/30" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Navigation ──────────────────────────────────────────── */}
            <SidebarContent className="px-2 py-3">
                {visibleGroups.map((group, gi) => (
                    <SidebarGroup key={group.label} className={gi > 0 ? "mt-1" : ""}>
                        {/* Group label — hidden when collapsed */}
                        <SidebarGroupLabel
                            className={cn(
                                "mb-0.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35",
                                "group-data-[collapsible=icon]:hidden"
                            )}
                        >
                            {t(group.label)}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <NavLink key={item.title} item={item} url={url} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* ── Footer — user profile dropdown ──────────────────────── */}
            <SidebarFooter className="border-t border-sidebar-border p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="h-11 rounded-lg hover:bg-white/8 data-[state=open]:bg-white/12"
                                >
                                    <Avatar className="size-7 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-sidebar-primary/20 text-[11px] font-semibold text-sidebar-primary">
                                            {user ? initials(user.name) : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid min-w-0 flex-1 text-left text-sm">
                                        <span className="truncate font-medium text-sidebar-foreground">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-[11px] text-sidebar-foreground/50">
                                            {t(roleKey(roleLabel))}
                                        </span>
                                    </div>
                                    <ChevronRight className="size-3.5 shrink-0 rotate-[-90deg] text-sidebar-foreground/30" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
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
                                    variant="destructive"
                                    onClick={() => {
                                        try { router.post(route("logout")); }
                                        catch { router.post("/logout"); }
                                    }}
                                >
                                    <LogOut className="size-4" />
                                    {t("auth.signOut")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
