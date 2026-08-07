import { Link, usePage } from "@inertiajs/react";
import {
    Building2,
    DoorOpen,
    History,
    LayoutDashboard,
    ShieldCheck,
    UserCog,
    Users,
    type LucideIcon,
} from "lucide-react";
import { route } from "ziggy-js";

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
import { router } from "@inertiajs/react";
import { LogOut, User as UserIcon } from "lucide-react";
import type { PageProps } from "@/types";

type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    /** Required permission name, when the item should be permission-gated. */
    permission?: string;
};

const navGroups: { label: string; items: NavItem[] }[] = [
    {
        label: "Management",
        items: [
            {
                title: "Overview",
                href: route("overview"),
                icon: LayoutDashboard,
                permission: "dashboard.view",
            },
            {
                title: "Residents",
                href: route("residents.index"),
                icon: Users,
                permission: "resident.view",
            },
            {
                title: "Towers",
                href: route("towers.index"),
                icon: Building2,
                permission: "tower.view",
            },
            {
                title: "Flats",
                href: route("flats.index"),
                icon: Building2,
                permission: "flat.view",
            },
            {
                title: "Users",
                href: route("users.index"),
                icon: UserCog,
                permission: "user.view",
            },
            {
                title: "Visitors",
                href: route("visitors.index"),
                icon: DoorOpen,
                permission: "visitor.view",
            },
            {
                title: "Roles",
                href: route("roles.index"),
                icon: ShieldCheck,
                permission: "role.view",
            },
            {
                title: "Activity Log",
                href: route("activity-logs.index"),
                icon: History,
                permission: "activity-log.view",
            },
        ],
    },
];

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function handleSignOut() {
    router.post(route("logout"));
}

export function AppSidebar() {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const permissions = user?.permissions ?? [];
    const roleLabel = user?.roles?.[0] ?? "Member";

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route("overview")}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
                                    <Building2 className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        SocioSphere
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {auth.society?.name ?? "Society Portal"}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items
                                    .filter(
                                        (item) =>
                                            !item.permission ||
                                            permissions.includes(
                                                item.permission,
                                            ),
                                    )
                                    .map((item) => {
                                        const active =
                                            url === item.href ||
                                            url.startsWith(
                                                `${item.href}/`,
                                            );

                                        return (
                                            <SidebarMenuItem
                                                key={item.href}
                                            >
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={active}
                                                    tooltip={item.title}
                                                    className={active ? "bg-sidebar-accent/80 text-sidebar-accent-foreground" : undefined}
                                                >
                                                    <Link href={item.href}>
                                                        <item.icon />
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            {user ? initials(user.name) : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {roleLabel}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="size-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg">
                                                {user ? initials(user.name) : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">
                                                {user?.name}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {user?.email}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route("profile.edit")}>
                                        <UserIcon />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={handleSignOut}
                                >
                                    <LogOut />
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
