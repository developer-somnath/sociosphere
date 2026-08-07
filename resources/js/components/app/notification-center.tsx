import { router } from "@inertiajs/react";
import {
    Bell,
    Check,
    CheckCheck,
    Inbox,
    Info,
    TriangleAlert,
} from "lucide-react";
import { Popover } from "radix-ui";
import { useEffect, useMemo, useState } from "react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";

function timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diffMs = Date.now() - then;
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

const typeIcons = {
    info: Info,
    success: Check,
    warning: TriangleAlert,
} as const;

/**
 * Notification center (blueprint §2 / §4.14). Bell with unread dot → popover
 * with All / Unread tabs, per-item context links, mark-as-read and
 * mark-all-as-read. Consumes the optional shared `notifications` prop
 * (`AppNotification[]`) — renders the empty state until the backend shares it.
 */
export function NotificationCenter({
    notifications = [],
}: {
    notifications?: AppNotification[];
}) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("all");
    const [readIds, setReadIds] = useState<Set<string | number>>(
        () => new Set(notifications.filter((n) => n.read).map((n) => n.id)),
    );

    useEffect(() => {
        setReadIds(
            new Set(notifications.filter((n) => n.read).map((n) => n.id)),
        );
    }, [notifications]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !readIds.has(n.id)).length,
        [notifications, readIds],
    );

    const isRead = (n: AppNotification) => readIds.has(n.id);

    const markRead = (n: AppNotification) => {
        if (isRead(n)) return;
        // Optimistic local update + persist; navigate to context only after
        // the write completes so the read state survives the page load.
        setReadIds((prev) => new Set(prev).add(n.id));
        router.post(
            route("notifications.read", String(n.id)),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (n.href) router.visit(n.href);
                },
            },
        );
    };

    const markAllRead = () => {
        setReadIds(new Set(notifications.map((n) => n.id)));
        router.post(route("notifications.read-all"), {}, { preserveScroll: true });
    };

    const openItem = (n: AppNotification) => {
        if (isRead(n)) {
            if (n.href) router.visit(n.href);
            return;
        }
        markRead(n);
    };

    const visible = useMemo(() => {
        if (tab === "unread") {
            return notifications.filter((n) => !isRead(n));
        }
        return notifications;
    }, [tab, notifications, readIds]);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative rounded-xl"
                    aria-label={
                        unreadCount > 0
                            ? `Notifications, ${unreadCount} unread`
                            : "Notifications"
                    }
                >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
                    )}
                </Button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-[min(400px,calc(100vw-32px))] rounded-2xl border border-border/70 bg-popover p-2 shadow-lg outline-none"
                >
                    <div className="flex items-center justify-between px-2 pb-2 pt-1">
                        <p className="text-sm font-semibold text-foreground">
                            Notifications
                        </p>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-xs text-muted-foreground"
                                onClick={markAllRead}
                            >
                                <CheckCheck className="size-3.5" />
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    <Tabs value={tab} onValueChange={setTab} variant="pills">
                        <TabsList className="w-full">
                            <TabsTrigger value="all" className="flex-1">
                                All
                                {notifications.length > 0 && (
                                    <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[10px] font-medium tabular-nums">
                                        {notifications.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="flex-1">
                                Unread
                                {unreadCount > 0 && (
                                    <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-medium tabular-nums text-primary">
                                        {unreadCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-2">
                            <NotificationList
                                notifications={visible}
                                isRead={isRead}
                                onOpen={openItem}
                            />
                        </TabsContent>
                        <TabsContent value="unread" className="mt-2">
                            <NotificationList
                                notifications={visible}
                                isRead={isRead}
                                onOpen={openItem}
                            />
                        </TabsContent>
                    </Tabs>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

function NotificationList({
    notifications,
    isRead,
    onOpen,
}: {
    notifications: AppNotification[];
    isRead: (n: AppNotification) => boolean;
    onOpen: (n: AppNotification) => void;
}) {
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted/70">
                    <Inbox className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                    No notifications yet
                </p>
                <p className="max-w-56 text-xs text-muted-foreground">
                    Updates about complaints, visitors, payments and notices
                    will appear here.
                </p>
            </div>
        );
    }

    return (
        <ul className="max-h-80 space-y-1 overflow-auto pr-0.5">
            {notifications.map((notification) => {
                const Icon = typeIcons[notification.type ?? "info"];
                const read = isRead(notification);
                const content = (
                    <>
                        <span
                            className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-full",
                                notification.type === "warning"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : notification.type === "success"
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                      : "bg-primary/10 text-primary",
                            )}
                        >
                            <Icon className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium text-foreground">
                                {notification.title}
                            </span>
                            {notification.description && (
                                <span className="line-clamp-2 text-xs text-muted-foreground">
                                    {notification.description}
                                </span>
                            )}
                            <span className="text-[11px] text-muted-foreground/70">
                                {timeAgo(notification.created_at)}
                            </span>
                        </span>
                        {!read && (
                            <span className="mt-1.5 size-2 shrink-0 self-start rounded-full bg-primary" />
                        )}
                    </>
                );

                const classes = cn(
                    "flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    read
                        ? "opacity-70 hover:opacity-100"
                        : "bg-muted/40 hover:bg-muted/70",
                );

                return (
                    <li key={String(notification.id)}>
                        <button
                            type="button"
                            className={classes}
                            onClick={() => onOpen(notification)}
                        >
                            {content}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
