import { Link, router, usePage } from "@inertiajs/react";
import {
    Building,
    Check,
    ChevronDown,
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
import { useState, type PropsWithChildren } from "react";
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
    const [societySearch, setSocietySearch] = useState("");
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
                        {user?.is_super_admin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-2 border-primary/30 bg-primary/5 px-2.5 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Building className="size-3.5 text-primary" />
                                        <span className="max-w-[140px] truncate">
                                            {auth.society?.name ?? "All Societies (Portfolio)"}
                                        </span>
                                        <ChevronDown className="size-3 text-muted-foreground opacity-70" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2 shadow-xl">
                                    <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Select Target Society
                                    </DropdownMenuLabel>

                                    <div className="relative my-1 px-1">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={societySearch}
                                            onChange={(e) => setSocietySearch(e.target.value)}
                                            placeholder="Search society..."
                                            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    <DropdownMenuSeparator className="my-1" />
                                    <div className="max-h-60 overflow-y-auto space-y-0.5">
                                        <DropdownMenuItem
                                            onClick={() => router.post(safeRoute("society.switch"), { society_id: null })}
                                            className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer ${
                                                !auth.society ? "bg-primary/10 text-primary font-semibold" : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Building className="size-4 text-muted-foreground" />
                                                <span>All Societies (Global)</span>
                                            </div>
                                            {!auth.society && <Check className="size-4 text-primary" />}
                                        </DropdownMenuItem>

                                        {auth.societies && auth.societies.length > 0 ? (
                                            auth.societies
                                                .filter((soc) =>
                                                    soc.name.toLowerCase().includes(societySearch.toLowerCase())
                                                )
                                                .map((soc) => {
                                                    const isSelected = auth.society?.id === soc.id;
                                                    return (
                                                        <DropdownMenuItem
                                                            key={soc.id}
                                                            onClick={() =>
                                                                router.post(safeRoute("society.switch"), { society_id: soc.id })
                                                            }
                                                            className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer ${
                                                                isSelected ? "bg-primary/10 text-primary font-semibold" : ""
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 truncate">
                                                                <Building className="size-4 text-muted-foreground shrink-0" />
                                                                <span className="truncate">{soc.name}</span>
                                                            </div>
                                                            {isSelected && <Check className="size-4 text-primary shrink-0" />}
                                                        </DropdownMenuItem>
                                                    );
                                                })
                                        ) : (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No societies found.
                                            </div>
                                        )}
                                    </div>
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
