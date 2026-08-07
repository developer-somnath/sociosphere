import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    BellRing,
    CalendarClock,
    CheckCircle2,
    Megaphone,
    Pencil,
    Pin,
    PinOff,
    Plus,
    Trash2,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { QuickActionPill } from "@/components/ui/quick-action-pill";
import { Pagination } from "@/components/ui/pagination";
import type { PageProps } from "@/types";

type NoticeItem = {
    id: number;
    uuid: string;
    title: string;
    category: string | null;
    is_pinned: boolean;
    target_audience: "All" | "Owners" | "Tenants";
    description: string | null;
    publish_from: string | null;
    publish_to: string | null;
    created_at: string;
    author: { id: number; name: string } | null;
    acknowledgements_count: number;
    acknowledged: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Stats = {
    total: number;
    published: number;
    pinned: number;
    scheduled: number;
};

type IndexProps = {
    notices: Paginated<NoticeItem>;
    stats: Stats;
    categories: string[];
    filters: {
        search: string;
        category: string | null;
        target_audience: string | null;
        status: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

const AUDIENCE_STYLES: Record<string, string> = {
    All: "bg-primary/10 text-primary",
    Owners: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Tenants: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function NoticesIndex() {
    const { notices, stats, categories, filters, can } = usePage<PageProps<IndexProps>>().props;
    const [search, setSearch] = useState(filters.search);
    const [category, setCategory] = useState<string>(filters.category ?? "");
    const [targetAudience, setTargetAudience] = useState<string>(filters.target_audience ?? "");
    const [status, setStatus] = useState<string>(filters.status ?? "");
    const [deletingNotice, setDeletingNotice] = useState<NoticeItem | null>(null);
    const isFirstRender = useRef(true);

    const buildParams = () => ({
        search: search.trim() || undefined,
        category: category !== "" ? category : undefined,
        target_audience: targetAudience !== "" ? targetAudience : undefined,
        status: status !== "" ? status : undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                route("notices.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, category, targetAudience, status]);

    const handleDelete = () => {
        if (!deletingNotice) return;
        router.delete(route("notices.destroy", deletingNotice.uuid), {
            onSuccess: () => setDeletingNotice(null),
        });
    };

    const handleTogglePin = (notice: NoticeItem) => {
        router.post(route("notices.toggle-pin", notice.uuid), {}, { preserveScroll: true });
    };

    const handleAcknowledge = (notice: NoticeItem) => {
        router.post(route("notices.acknowledge", notice.uuid), {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Notice Board" />

            <PageHeader
                title="Notice Board"
                description="Publish and manage society announcements, circulars, and important updates."
                icon={<Megaphone className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("notices.create")}
                            icon={Plus}
                            label="New Notice"
                            variant="purple"
                        />
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Notices"
                    value={stats.total}
                    icon={Megaphone}
                    accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <MetricCard
                    label="Published"
                    value={stats.published}
                    icon={CheckCircle2}
                    accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <MetricCard
                    label="Pinned"
                    value={stats.pinned}
                    icon={Pin}
                    accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
                <MetricCard
                    label="Scheduled"
                    value={stats.scheduled}
                    icon={CalendarClock}
                    accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search notice title or description..."
                searchLabel="Search notices"
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setCategory("");
                    setTargetAudience("");
                    setStatus("");
                    router.get(route("notices.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Audiences</option>
                    <option value="All">All Residents</option>
                    <option value="Owners">Owners</option>
                    <option value="Tenants">Tenants</option>
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                </select>
            </FilterBar>

            {notices.data.length === 0 ? (
                <EmptyState
                    icon={Megaphone}
                    title="No notices found"
                    description="No society notices match your filters yet."
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {notices.data.map((notice) => (
                        <Card
                            key={notice.id}
                            className={`flex flex-col justify-between border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] transition-all hover:border-border ${
                                notice.is_pinned ? "ring-1 ring-amber-500/30" : ""
                            }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex size-9 items-center justify-center rounded-lg ${notice.is_pinned ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"}`}>
                                            {notice.is_pinned ? <Pin className="size-5" /> : <Megaphone className="size-5" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base leading-snug">{notice.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {notice.author?.name ?? "Society"} · {formatDate(notice.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {notice.is_pinned && (
                                        <Badge variant="warning">Pinned</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {notice.description && (
                                    <p className="line-clamp-3 text-xs text-muted-foreground leading-relaxed">
                                        {notice.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {notice.category && (
                                        <Badge variant="outline">{notice.category}</Badge>
                                    )}
                                    <span className={`inline-flex h-5 items-center rounded-4xl px-2 text-xs font-medium ${AUDIENCE_STYLES[notice.target_audience] ?? AUDIENCE_STYLES.All}`}>
                                        <Users className="mr-1 size-3" />
                                        {notice.target_audience}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <CalendarClock className="size-3.5" />
                                        <span>From: <strong className="text-foreground font-semibold">{formatDate(notice.publish_from)}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <CalendarClock className="size-3.5" />
                                        <span>To: <strong className="text-foreground font-semibold">{formatDate(notice.publish_to)}</strong></span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between border-t border-border/50 pt-3">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CheckCircle2 className="size-3.5" />
                                    {notice.acknowledgements_count} acknowledged
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {!notice.acknowledged && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAcknowledge(notice)}
                                        >
                                            <CheckCircle2 className="size-3.5" />
                                            Acknowledge
                                        </Button>
                                    )}
                                    {can.update && (
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => handleTogglePin(notice)} title={notice.is_pinned ? "Unpin" : "Pin"}>
                                            {notice.is_pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                                        </Button>
                                    )}
                                    {can.update && (
                                        <Button variant="ghost" size="icon" className="size-8" asChild>
                                            <Link href={route("notices.edit", notice.uuid)}>
                                                <Pencil className="size-3.5" />
                                            </Link>
                                        </Button>
                                    )}
                                    {can.delete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeletingNotice(notice)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {notices.last_page > 1 && (
                <Pagination
                    page={notices.current_page}
                    perPage={notices.per_page}
                    total={notices.total}
                    onPageChange={(next) =>
                        router.get(
                            route("notices.index"),
                            { ...buildParams(), page: next },
                            { preserveState: true, replace: true },
                        )
                    }
                    noun="notices"
                />
            )}

            <ConfirmDialog
                open={!!deletingNotice}
                onOpenChange={(open) => !open && setDeletingNotice(null)}
                title="Delete Notice"
                description={`Are you sure you want to delete "${deletingNotice?.title}"? This action cannot be undone.`}
                destructive
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}