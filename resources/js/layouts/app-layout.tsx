import { Link, router, usePage } from "@inertiajs/react";
import {
    Building,
    DoorOpen,
    History,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    User as UserIcon,
    UserCog,
    UserRound,
} from "lucide-react";
import type { PropsWithChildren } from "react";
import { route } from "ziggy-js";

import {
    CommandPalette,
    openCommandPalette,
    type CommandGroup,
} from "@/components/app/command-palette";
import { AppSidebar } from "@/components/app/app-sidebar";
import { FlashToaster } from "@/components/app/flash-toaster";
import { NotificationCenter } from "@/components/app/notification-center";
import { PageLoadingIndicator } from "@/components/app/page-loading-indicator";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { PageProps } from "@/types";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function safeRoute(name: string, params: Record<string, unknown> = {}): string {
    try { return route(name, params); } catch { return "#"; }
}

function initials(name: string): string {
    return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

/* ─── AppLayout ──────────────────────────────────────────────────────────── */

export default function AppLayout({ children }: PropsWithChildren) {
    // Build groups inside component — deferred to render so route() is safe
    const commandGroups: CommandGroup[] = [
        {
            label: "Overview",
            items: [
                {
                    id: "overview", label: "Dashboard", icon: LayoutDashboard,
                    hint: "Go to overview", keywords: ["home", "overview", "dashboard"],
                    onSelect: () => router.visit(safeRoute("overview")),
                },
            ],
        },
        {
            label: "Properties",
            items: [
                { id: "towers",    label: "Towers",    icon: Building,  hint: "Go to towers",    keywords: ["building", "blocks", "wings"],            onSelect: () => router.visit(safeRoute("towers.index"))    },
                { id: "flats",     label: "Flats",     icon: Layers,    hint: "Go to flats",     keywords: ["apartments", "units", "houses"],          onSelect: () => router.visit(safeRoute("flats.index"))     },
                { id: "residents", label: "Residents", icon: UserRound, hint: "Go to residents", keywords: ["people", "owners", "tenants", "families"], onSelect: () => router.visit(safeRoute("residents.index")) },
            ],
        },
        {
            label: "Operations",
            items: [
                { id: "visitors", label: "Visitors", icon: DoorOpen, hint: "Go to visitors", keywords: ["gate", "pass", "security"], onSelect: () => router.visit(safeRoute("visitors.index")) },
            ],
        },
        {
            label: "Administration",
            items: [
                { id: "users",         label: "Users",         icon: UserCog,    hint: "Go to users",         keywords: ["accounts", "team"],        onSelect: () => router.visit(safeRoute("users.index"))          },
                { id: "roles",         label: "Roles",         icon: ShieldCheck,hint: "Go to roles",         keywords: ["permissions", "rbac"],     onSelect: () => router.visit(safeRoute("roles.index"))          },
                { id: "activity-logs", label: "Activity Logs", icon: History,    hint: "Go to activity logs", keywords: ["audit", "history"],        onSelect: () => router.visit(safeRoute("activity-logs.index"))  },
            ],
        },
        {
            label: "Quick create",
            items: [
                { id: "create-tower",    label: "New Tower",    icon: Plus, hint: "Create", keywords: ["add", "new"], onSelect: () => router.visit(safeRoute("towers.create"))    },
                { id: "create-flat",     label: "New Flat",     icon: Plus, hint: "Create", keywords: ["add", "new"], onSelect: () => router.visit(safeRoute("flats.create"))     },
                { id: "create-resident", label: "New Resident", icon: Plus, hint: "Create", keywords: ["add", "new"], onSelect: () => router.visit(safeRoute("residents.create")) },
            ],
        },
    ];

    const { auth, notifications } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <SidebarProvider>
            <PageLoadingIndicator />
            <AppSidebar />
            <CommandPalette groups={commandGroups} />
            <Toaster />

            <SidebarInset>
                {/* ── Topbar ──────────────────────────────────────────────── */}
                <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 lg:px-5">
                    {/* Left: sidebar trigger */}
                    <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                    <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />

                    {/* Center: search */}
                    <div className="flex flex-1 items-center">
                        <button
                            type="button"
                            onClick={openCommandPalette}
                            className="hidden h-8 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:bg-muted md:flex"
                            aria-label="Open command palette"
                        >
                            <Search className="size-3.5 shrink-0" />
                            <span className="text-sm">Search…</span>
                            <kbd className="ml-8 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:block">
                                ⌘K
                            </kbd>
                        </button>
                    </div>

                    {/* Right: society switcher (Super Admin) + bell + theme + avatar */}
                    <div className="flex items-center gap-1.5">
                        {/* Society switcher — Super Admin only */}
                        {user?.is_super_admin && auth.societies && auth.societies.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
                                        <Building className="size-3.5 text-muted-foreground" />
                                        <span className="max-w-[120px] truncate">
                                            {auth.society?.name ?? "All Societies"}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                    <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                                        Switch society
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => router.post(safeRoute("society.switch"), { society_id: null })}
                                        className={!auth.society ? "bg-accent" : ""}
                                    >
                                        All Societies
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {auth.societies.map((soc) => (
                                        <DropdownMenuItem
                                            key={soc.id}
                                            onClick={() => router.post(safeRoute("society.switch"), { society_id: soc.id })}
                                            className={auth.society?.id === soc.id ? "bg-accent" : ""}
                                        >
                                            <Building className="size-3.5" />
                                            <span className="truncate">{soc.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Non-super-admin society chip */}
                        {!user?.is_super_admin && auth.society && (
                            <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground md:flex">
                                <Building className="size-3.5" />
                                <span>{auth.society.name}</span>
                            </div>
                        )}

                        <NotificationCenter notifications={notifications} />
                        <ThemeSwitcher />

                        {/* Avatar dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg"
                                    aria-label="Account menu"
                                >
                                    <Avatar className="size-7 rounded-lg">
                                        <AvatarFallback className="rounded-lg text-[11px] font-semibold">
                                            {user ? initials(user.name) : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold">{user?.name}</span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {user?.email}
                                        </span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={safeRoute("profile.edit")}>
                                        <UserIcon className="size-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => router.post(safeRoute("logout"))}
                                >
                                    <LogOut className="size-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* ── Page content ──────────────────────────────────────── */}
                <main className="flex flex-1 flex-col gap-6 p-5 lg:p-7">
                    {children}
                </main>
            </SidebarInset>

            <FlashToaster />
        </SidebarProvider>
    );
}
