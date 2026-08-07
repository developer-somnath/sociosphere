import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    Plus,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { DataTableFull } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import type { PageProps } from "@/types";

type AmenityOption = { id: number; name: string };
type FlatOption = { id: number; flat_number: string; tower?: { id: number; name: string } };
type ResidentOption = { id: number; name: string; flat_id: number };

type BookingItem = {
    id: number;
    uuid: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_fee: string;
    status: "Pending" | "Approved" | "Rejected" | "Cancelled";
    payment_status: "Unpaid" | "Paid";
    remarks: string | null;
    created_at: string;
    amenity?: { id: number; name: string };
    flat?: { id: number; flat_number: string; tower?: { id: number; name: string } };
    resident?: { id: number; name: string };
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
    pending: number;
    approved: number;
    cancelled: number;
};

type BookingsProps = {
    bookings: Paginated<BookingItem>;
    stats: Stats;
    amenities: AmenityOption[];
    flats: FlatOption[];
    residents: ResidentOption[];
    filters: {
        search: string;
        status: string | null;
        amenity_id: string | null;
        booking_date: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { book: boolean; approve: boolean };
};

function statusBadge(status: BookingItem["status"]) {
    switch (status) {
        case "Pending":
            return (
                <Badge className="border-transparent bg-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    Pending Approval
                </Badge>
            );
        case "Approved":
            return (
                <Badge className="border-transparent bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Approved
                </Badge>
            );
        case "Rejected":
            return <Badge variant="destructive">Rejected</Badge>;
        case "Cancelled":
            return <Badge variant="secondary">Cancelled</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function AmenityBookingsIndex() {
    const { bookings, stats, amenities, flats, residents, filters, can } =
        usePage<PageProps<BookingsProps>>().props;

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState<string>(filters.status ?? "");
    const [amenityId, setAmenityId] = useState<string>(filters.amenity_id ?? "");
    const [bookingDate, setBookingDate] = useState<string>(filters.booking_date ?? "");
    const [showNewModal, setShowNewModal] = useState(false);
    const isFirstRender = useRef(true);

    const form = useForm({
        amenity_id: filters.amenity_id ?? "",
        flat_id: "",
        resident_id: "",
        booking_date: new Date().toISOString().split("T")[0],
        start_time: "10:00",
        end_time: "12:00",
        remarks: "",
    });

    const filteredResidents = form.data.flat_id
        ? residents.filter((r) => String(r.flat_id) === form.data.flat_id)
        : residents;

    const sort = filters.sort_by
        ? {
              key: filters.sort_by,
              direction: (filters.sort_dir === "asc" ? "asc" : "desc") as
                  | "asc"
                  | "desc",
          }
        : null;

    const buildParams = () => ({
        search: search.trim() || undefined,
        status: status !== "" ? status : undefined,
        amenity_id: amenityId !== "" ? amenityId : undefined,
        booking_date: bookingDate !== "" ? bookingDate : undefined,
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
                route("amenity-bookings.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, status, amenityId, bookingDate]);

    const handleCreateBooking = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("amenity-bookings.store"), {
            onSuccess: () => {
                setShowNewModal(false);
                form.reset();
            },
        });
    };

    const handleApprove = (id: number) => {
        router.post(route("amenity-bookings.approve", id));
    };

    const handleReject = (id: number) => {
        router.post(route("amenity-bookings.reject", id));
    };

    const handleCancel = (id: number) => {
        router.post(route("amenity-bookings.cancel", id));
    };

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("amenity-bookings.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const columns: ColumnDef<BookingItem>[] = useMemo(
        () => [
            {
                id: "amenity",
                header: "Amenity",
                cell: (b) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                            {b.amenity?.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Flat {b.flat?.flat_number ?? "—"} ({b.resident?.name ?? "—"})
                        </span>
                    </div>
                ),
            },
            {
                id: "booking_date",
                header: "Date & Time",
                sortable: true,
                sortKey: "booking_date",
                cell: (b) => (
                    <div className="flex flex-col text-xs font-mono">
                        <span className="text-foreground font-medium">
                            {b.booking_date}
                        </span>
                        <span className="text-muted-foreground">
                            {b.start_time} - {b.end_time}
                        </span>
                    </div>
                ),
            },
            {
                id: "total_fee",
                header: "Fee",
                sortable: true,
                sortKey: "total_fee",
                cell: (b) => (
                    <span className="font-medium text-foreground">
                        {Number(b.total_fee) > 0 ? `৳${b.total_fee}` : "Free"}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Status",
                sortable: true,
                sortKey: "status",
                cell: (b) => statusBadge(b.status),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (b) => (
                    <div className="flex items-center justify-end gap-1.5">
                        {can.approve && b.status === "Pending" && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                    onClick={() => handleApprove(b.id)}
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                    onClick={() => handleReject(b.id)}
                                >
                                    Reject
                                </Button>
                            </>
                        )}
                        {(b.status === "Pending" || b.status === "Approved") && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => handleCancel(b.id)}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        [can],
    );

    return (
        <AppLayout>
            <Head title="Facility Bookings" />

            <PageHeader
                title="Amenity & Facility Bookings"
                description="Manage booking requests, time slots, and resident facility reservations."
                icon={<CalendarDays className="size-5" />}
                actions={
                    can.book && (
                        <Button onClick={() => setShowNewModal(true)}>
                            <Plus className="size-4" />
                            Book Facility
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Bookings"
                    value={stats.total}
                    icon={CalendarDays}
                    accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <MetricCard
                    label="Pending Approval"
                    value={stats.pending}
                    icon={Clock}
                    accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
                <MetricCard
                    label="Approved Bookings"
                    value={stats.approved}
                    icon={CheckCircle2}
                    accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <MetricCard
                    label="Cancelled / Rejected"
                    value={stats.cancelled}
                    icon={XCircle}
                    accent="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search amenity or resident..."
                searchLabel="Search bookings"
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setStatus("");
                    setAmenityId("");
                    setBookingDate("");
                    router.get(route("amenity-bookings.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select
                    value={amenityId}
                    onChange={(e) => setAmenityId(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Amenities</option>
                    {amenities.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                            {a.name}
                        </option>
                    ))}
                </select>

                <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="h-9 w-auto rounded-xl border border-border/70 bg-card px-3 text-xs"
                />
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<BookingItem>
                        columns={columns}
                        data={bookings.data}
                        rowKey={(b) => b.id}
                        sort={sort}
                        onSort={handleSort}
                        emptyState={
                            <EmptyState
                                icon={CalendarDays}
                                title="No bookings found"
                                description="Facility reservation requests will appear here."
                            />
                        }
                    />
                    {bookings.last_page > 1 && (
                        <Pagination
                            page={bookings.current_page}
                            perPage={bookings.per_page}
                            total={bookings.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("amenity-bookings.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun="bookings"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Book Facility Drawer */}
            <FormDrawer
                open={showNewModal}
                onOpenChange={(open) => !open && setShowNewModal(false)}
                title="Book Amenity / Facility"
                description="Select a facility, flat, date and time slot."
                icon={<CalendarDays className="size-5" />}
                footer={
                    <>
                        <Button variant="outline" type="button" onClick={() => setShowNewModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="booking-form" disabled={form.processing}>
                            Submit Booking Request
                        </Button>
                    </>
                }
            >
                <form id="booking-form" onSubmit={handleCreateBooking} className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <Label>Facility / Amenity *</Label>
                        <Combobox
                            items={amenities.map((a) => ({
                                value: String(a.id),
                                label: a.name,
                            }))}
                            value={form.data.amenity_id}
                            onValueChange={(value) => form.setData("amenity_id", value)}
                            placeholder="Select facility…"
                            emptyText="No active facilities"
                        />
                        {form.errors.amenity_id && (
                            <p className="text-xs text-destructive">{form.errors.amenity_id}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Flat *</Label>
                            <Combobox
                                items={flats.map((f) => ({
                                    value: String(f.id),
                                    label: `${f.flat_number}${f.tower ? ` (${f.tower.name})` : ""}`,
                                }))}
                                value={form.data.flat_id}
                                onValueChange={(value) => {
                                    form.setData("flat_id", value);
                                    form.setData("resident_id", "");
                                }}
                                placeholder="Select flat…"
                                emptyText="No flats"
                            />
                            {form.errors.flat_id && (
                                <p className="text-xs text-destructive">{form.errors.flat_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Resident *</Label>
                            <Combobox
                                items={filteredResidents.map((r) => ({
                                    value: String(r.id),
                                    label: r.name,
                                }))}
                                value={form.data.resident_id}
                                onValueChange={(value) => form.setData("resident_id", value)}
                                placeholder="Select resident…"
                                emptyText="No resident selected"
                            />
                            {form.errors.resident_id && (
                                <p className="text-xs text-destructive">{form.errors.resident_id}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Booking Date *</Label>
                        <Input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={form.data.booking_date}
                            onChange={(e) => form.setData("booking_date", e.target.value)}
                            required
                        />
                        {form.errors.booking_date && (
                            <p className="text-xs text-destructive">{form.errors.booking_date}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Start Time *</Label>
                            <Input
                                type="time"
                                value={form.data.start_time}
                                onChange={(e) => form.setData("start_time", e.target.value)}
                                required
                            />
                            {form.errors.start_time && (
                                <p className="text-xs text-destructive">{form.errors.start_time}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>End Time *</Label>
                            <Input
                                type="time"
                                value={form.data.end_time}
                                onChange={(e) => form.setData("end_time", e.target.value)}
                                required
                            />
                            {form.errors.end_time && (
                                <p className="text-xs text-destructive">{form.errors.end_time}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Remarks / Special Requests</Label>
                        <textarea
                            value={form.data.remarks}
                            onChange={(e) => form.setData("remarks", e.target.value)}
                            className="min-h-[80px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            placeholder="Provide any additional notes or event requirements..."
                        />
                    </div>
                </form>
            </FormDrawer>
        </AppLayout>
    );
}
