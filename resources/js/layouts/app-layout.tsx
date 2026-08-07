import { Link, router, usePage } from "@inertiajs/react";
import { Bell, LogOut, Search, User as UserIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { route } from "ziggy-js";

import { AppSidebar } from "@/components/app/app-sidebar";
import { FlashToaster } from "@/components/app/flash-toaster";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import type { PageProps } from "@/types";

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <SidebarProvider>
            <PageLoadingIndicator />
            <AppSidebar />

            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 lg:px-6">
                    <SidebarTrigger className="-ml-1" />

                    <Separator
                        orientation="vertical"
                        className="mr-1 data-[orientation=vertical]:h-4"
                    />

                    <div className="flex flex-1 items-center gap-2">
                        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-2 text-sm text-muted-foreground shadow-sm md:flex">
                            <Search className="size-4" />
                            <span>Search residents, flats, payments</span>
                        </div>
                        <div className="md:hidden text-sm font-medium text-muted-foreground">
                            {auth.society?.name ?? "Society Portal"}
                        </div>
                    </div>

                    <Button variant="outline" size="icon" className="rounded-xl" aria-label="Notifications">
                        <Bell className="size-4" />
                    </Button>
                    <ThemeSwitcher />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl"
                                aria-label="Account menu"
                            >
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">
                                        {user ? initials(user.name) : "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl"
                        >
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span className="truncate font-semibold">
                                        {user?.name}
                                    </span>
                                    <span className="truncate text-xs font-normal text-muted-foreground">
                                        {user?.email}
                                    </span>
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
                                onClick={() => router.post(route("logout"))}
                            >
                                <LogOut />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
                    {children}
                </main>
            </SidebarInset>
            <FlashToaster />
        </SidebarProvider>
    );
}
