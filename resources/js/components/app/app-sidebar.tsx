import { Link, usePage } from "@inertiajs/react";
import {
    Building2,
    CalendarDays,
    Car,
    ChevronRight,
    CreditCard,
    DoorOpen,
    FolderOpen,
    History,
    LayoutDashboard,
    MessageSquareWarning,
    LogOut,
    Receipt,
    Settings,
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
        label: "Overview",
        items: [
            {
                title: "Dashboard",
                routeName: "overview",
                icon: LayoutDashboard,
                permission: "dashboard.view",
            },
        ],
    },
    {
        label: "Properties",
        items: [
            { title: "Societies",  routeName: "societies.index",     icon: Building2, permission: "society.view"  },
            { title: "Towers",     routeName: "towers.index",        icon: Building2, permission: "tower.view"    },
            { title: "Flats",      routeName: "flats.index",         icon: Building2, permission: "flat.view"     },
            { title: "Residents",  routeName: "residents.index",     icon: Users,     permission: "resident.view" },
            { title: "Parking",    routeName: "parking-slots.index", icon: Car,       permission: "parking.view"  },
        ],
    },
    {
        label: "Operations",
        items: [
            { title: "Visitors",       routeName: "visitors.index",         icon: DoorOpen,         permission: "visitor.view"      },
            { title: "Amenities",      routeName: "amenities.index",        icon: Sparkles,         permission: "amenity.view"      },
            { title: "Bookings",       routeName: "amenity-bookings.index", icon: CalendarDays,     permission: "amenity.view"      },
            { title: "CCTV Feeds",     routeName: "cctv-cameras.index",     icon: Video,            permission: "cctv.view"         },
            { title: "Security Log",   routeName: "security-logs.index",    icon: ShieldAlert,      permission: "security_log.view" },
        ],
    },
    {
        label: "Helpdesk",
        items: [
            { title: "Complaints",  routeName: "complaints.index",           icon: MessageSquareWarning, permission: "complaint.view" },
            { title: "Categories",  routeName: "complaint-categories.index", icon: FolderOpen,            permission: "complaint.view" },
        ],
    },
    {
        label: "Finance",
        items: [
            { title: "Invoices",  routeName: "invoices.index", icon: Receipt,     permission: "invoice.view"    },
            { title: "Payments",  routeName: "payments.index", icon: CreditCard,  permission: "collection.view" },
        ],
    },
    {
        label: "Admin",
        items: [
            { title: "Users",         routeName: "users.index",         icon: UserCog,    permission: "user.view"         },
            { title: "Roles",         routeName: "roles.index",         icon: ShieldCheck,permission: "role.view"         },
            { title: "Activity Log",  routeName: "activity-logs.index", icon: History,    permission: "activity-log.view" },
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

function isActive(href: string, url: string): boolean {
    if (href === "#") return false;
    return url === href || url.startsWith(`${href}/`);
}

/* ─── NavItem component ──────────────────────────────────────────────────── */

function NavLink({ item, url }: { item: NavItem & { href: string }; url: string }) {
    const active = isActive(item.href, url);
    const Icon = item.icon;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                className={cn(
                    "group relative h-8 rounded-md px-2.5 text-sidebar-foreground/70 transition-all duration-100",
                    "hover:bg-white/8 hover:text-sidebar-foreground",
                    active && "bg-white/12 text-sidebar-foreground font-medium"
                )}
            >
                <Link href={item.href}>
                    {/* Active left indicator bar */}
                    {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary" />
                    )}
                    <Icon className={cn("size-4 shrink-0", active ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                    <span className="truncate text-sm">{item.title}</span>
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
                                        {auth.society?.name ?? "Society Portal"}
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
                            {group.label}
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu className="gap-0.5">
                                {group.items.map((item) => (
                                    <NavLink key={item.routeName} item={item} url={url} />
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
                                            {roleLabel}
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
                                        Profile settings
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
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
