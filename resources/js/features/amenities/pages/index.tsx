import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    DollarSign,
    Pencil,
    Plus,
    Sparkles,
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

type AmenityItem = {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    booking_type: "Slot" | "Hourly" | "Daily";
    capacity: number;
    fee_per_slot: string;
    rules: string | null;
    is_active: boolean;
    bookings_count: number;
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
    active: number;
    slot_based: number;
    daily_based: number;
};

type IndexProps = {
    amenities: Paginated<AmenityItem>;
    stats: Stats;
    filters: {
        search: string;
        booking_type: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean; book: boolean };
};

export default function AmenitiesIndex() {
    const { amenities, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
    const [search, setSearch] = useState(filters.search);
    const [bookingType, setBookingType] = useState<string>(filters.booking_type ?? "");
    const [deletingAmenity, setDeletingAmenity] = useState<AmenityItem | null>(null);
    const isFirstRender = useRef(true);

    const buildParams = () => ({
        search: search.trim() || undefined,
        booking_type: bookingType !== "" ? bookingType : undefined,
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
                route("amenities.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, bookingType]);

    const handleDelete = () => {
        if (!deletingAmenity) return;
        router.delete(route("amenities.destroy", deletingAmenity.id), {
            onSuccess: () => setDeletingAmenity(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Amenities & Facilities" />

            <PageHeader
                title="Amenities & Facilities"
                description="Browse, manage and book society amenities such as clubhouse, pool, gym, and halls."
                icon={<Sparkles className="size-5" />}
                actions={
                    <div className="flex items-center gap-2">
                        <QuickActionPill
                            href={route("amenity-bookings.index")}
                            icon={CalendarDays}
                            label="View Bookings"
                            variant="indigo"
                        />
                        {can.create && (
                            <QuickActionPill
                                href={route("amenities.create")}
                                icon={Plus}
                                label="Add Amenity"
                                variant="purple"
                            />
                        )}
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Amenities"
                    value={stats.total}
                    icon={Sparkles}
                    accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <MetricCard
                    label="Active Facilities"
                    value={stats.active}
                    icon={CheckCircle2}
                    accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <MetricCard
                    label="Slot-Based"
                    value={stats.slot_based}
                    icon={Clock}
                    accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                />
                <MetricCard
                    label="Daily / Event Halls"
                    value={stats.daily_based}
                    icon={CalendarDays}
                    accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search amenity name or description..."
                searchLabel="Search amenities"
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setBookingType("");
                    router.get(route("amenities.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Booking Types</option>
                    <option value="Slot">Slot-Based</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily / Day-Long</option>
                </select>
            </FilterBar>

            {amenities.data.length === 0 ? (
                <EmptyState
                    icon={Sparkles}
                    title="No amenities found"
                    description="No society amenities have been added yet."
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {amenities.data.map((amenity) => (
                        <Card
                            key={amenity.id}
                            className="flex flex-col justify-between border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] transition-all hover:border-border"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Sparkles className="size-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{amenity.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {amenity.booking_type} Booking
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={amenity.is_active ? "outline" : "secondary"}>
                                        {amenity.is_active ? "Active" : "Maintenance"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {amenity.description && (
                                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                                        {amenity.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Users className="size-3.5" />
                                        <span>Max Capacity: <strong className="text-foreground font-semibold">{amenity.capacity}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <DollarSign className="size-3.5" />
                                        <span>Fee: <strong className="text-foreground font-semibold">{Number(amenity.fee_per_slot) > 0 ? `৳${amenity.fee_per_slot}` : "Free"}</strong></span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between border-t border-border/50 pt-3">
                                <span className="text-xs text-muted-foreground">
                                    {amenity.bookings_count} booking{amenity.bookings_count !== 1 ? "s" : ""}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {can.update && (
                                        <Button variant="ghost" size="icon" className="size-8" asChild>
                                            <Link href={route("amenities.edit", amenity.id)}>
                                                <Pencil className="size-3.5" />
                                            </Link>
                                        </Button>
                                    )}
                                    {can.delete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeletingAmenity(amenity)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    )}
                                    {can.book && amenity.is_active && (
                                        <Button size="sm" asChild>
                                            <Link href={route("amenity-bookings.index", { amenity_id: amenity.id })}>
                                                Book
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {amenities.last_page > 1 && (
                <Pagination
                    page={amenities.current_page}
                    perPage={amenities.per_page}
                    total={amenities.total}
                    onPageChange={(next) =>
                        router.get(
                            route("amenities.index"),
                            { ...buildParams(), page: next },
                            { preserveState: true, replace: true },
                        )
                    }
                    noun="amenities"
                />
            )}

            <ConfirmDialog
                open={!!deletingAmenity}
                onOpenChange={(open) => !open && setDeletingAmenity(null)}
                title="Delete Amenity"
                description={`Are you sure you want to delete "${deletingAmenity?.name}"? Amenities with active bookings cannot be deleted.`}
                destructive
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
