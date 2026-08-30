import { Head, router, useForm } from "@inertiajs/react";
import {
    Calendar as CalendarIcon,
    CalendarCheck,
    Check,
    Clock,
    MapPin,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
    UserCheck,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type AmenityOption = {
    id: number;
    name: string;
};

type EventItem = {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    venue_name: string | null;
    amenity_id: number | null;
    amenity: { id: number; name: string } | null;
    start_time: string;
    end_time: string | null;
    max_attendees: number | null;
    is_published: boolean;
    created_at: string;
    creator: { id: number; name: string } | null;
    user_rsvp: {
        status: "attending" | "maybe" | "declined";
        guests_count: number;
        remarks: string | null;
    } | null;
    attending_count: number;
    maybe_count: number;
    declined_count: number;
    total_attendees: number;
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
    upcoming: number;
    past: number;
};

type Props = {
    events: Paginated<EventItem>;
    stats: Stats;
    amenities: AmenityOption[];
    filters: {
        search: string;
        timeframe: string;
    };
    can: {
        create: boolean;
        rsvp: boolean;
        manage: boolean;
    };
};

export default function CommunityEventsIndex({ events, stats, amenities, filters, can }: Props) {
    const { t } = useI18n();

    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);

    const eventForm = useForm({
        title: "",
        description: "",
        venue_name: "",
        amenity_id: "" as string | number,
        start_time: "",
        end_time: "",
        max_attendees: "" as string | number,
        is_published: true,
    });

    const openCreateModal = () => {
        setEditingEvent(null);
        eventForm.reset();
        setFormOpen(true);
    };

    const openEditModal = (event: EventItem) => {
        setEditingEvent(event);
        eventForm.setData({
            title: event.title,
            description: event.description || "",
            venue_name: event.venue_name || "",
            amenity_id: event.amenity_id || "",
            start_time: event.start_time ? event.start_time.substring(0, 16) : "",
            end_time: event.end_time ? event.end_time.substring(0, 16) : "",
            max_attendees: event.max_attendees || "",
            is_published: event.is_published,
        });
        setFormOpen(true);
    };

    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingEvent) {
            eventForm.put(route("community-events.update", editingEvent.uuid), {
                preserveScroll: true,
                onSuccess: () => {
                    setFormOpen(false);
                    toast({
                        title: t("events.updateSuccessTitle"),
                        description: t("events.updateSuccessDesc"),
                        variant: "success",
                    });
                },
            });
        } else {
            eventForm.post(route("community-events.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setFormOpen(false);
                    eventForm.reset();
                    toast({
                        title: t("events.createSuccessTitle"),
                        description: t("events.createSuccessDesc"),
                        variant: "success",
                    });
                },
            });
        }
    };

    const handleRsvp = (event: EventItem, status: "attending" | "maybe" | "declined") => {
        router.post(
            route("community-events.rsvp", event.uuid),
            { status, guests_count: 0 },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: t("events.rsvpSuccessTitle"),
                        description: t("events.rsvpSuccessDesc"),
                        variant: "success",
                    });
                },
            }
        );
    };

    const handleDeleteEvent = () => {
        if (!deleteTarget) return;
        router.delete(route("community-events.destroy", deleteTarget.uuid), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                toast({
                    title: t("events.deleteSuccessTitle"),
                    description: t("events.deleteSuccessDesc"),
                    variant: "success",
                });
            },
        });
    };

    return (
        <AppLayout>
            <Head title={t("events.pageTitle")} />

            <div className="space-y-6">
                <PageHeader
                    title={t("events.title")}
                    description={t("events.description")}
                    breadcrumbs={[
                        { label: t("nav.home"), href: route("overview") },
                        { label: t("nav.communications") },
                        { label: t("events.title") },
                    ]}
                    actions={
                        can.create ? (
                            <Button onClick={openCreateModal} className="gap-1.5 font-semibold">
                                <Plus className="size-4" />
                                {t("events.createButton")}
                            </Button>
                        ) : undefined
                    }
                />

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard
                        label={t("events.statTotal")}
                        value={stats.total}
                        icon={CalendarIcon}
                    />
                    <MetricCard
                        label={t("events.statUpcoming")}
                        value={stats.upcoming}
                        icon={CalendarCheck}
                    />
                    <MetricCard
                        label={t("events.statPast")}
                        value={stats.past}
                        icon={Clock}
                    />
                </div>

                {/* Filter Bar */}
                <FilterBar
                    searchPlaceholder={t("events.searchPlaceholder")}
                    searchValue={filters.search}
                    onSearchChange={(val: string) =>
                        router.get(
                            route("community-events.index"),
                            { ...filters, search: val || undefined },
                            { preserveState: true, replace: true }
                        )
                    }
                    onReset={() => router.get(route("community-events.index"), {}, { preserveState: true, replace: true })}
                >
                    <div className="flex items-center gap-2">
                        <select
                            value={filters.timeframe ?? "upcoming"}
                            onChange={(e) =>
                                router.get(
                                    route("community-events.index"),
                                    { ...filters, timeframe: e.target.value },
                                    { preserveState: true, replace: true }
                                )
                            }
                            className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="upcoming">{t("events.timeframeUpcoming")}</option>
                            <option value="past">{t("events.timeframePast")}</option>
                            <option value="all">{t("events.timeframeAll")}</option>
                        </select>
                    </div>
                </FilterBar>

                {/* Events Cards Grid */}
                {events.data.length === 0 ? (
                    <Card className="rounded-2xl border border-border/60">
                        <EmptyState
                            icon={CalendarIcon}
                            title={t("events.emptyTitle")}
                            description={t("events.emptyDesc")}
                            action={
                                can.create ? (
                                    <Button onClick={openCreateModal} className="gap-1.5 font-semibold">
                                        <Plus className="size-4" />
                                        {t("events.createButton")}
                                    </Button>
                                ) : undefined
                            }
                        />
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {events.data.map((event) => {
                            const startDate = new Date(event.start_time);
                            const isPast = startDate < new Date();
                            const currentRsvp = event.user_rsvp?.status;

                            return (
                                <Card
                                    key={event.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md"
                                >
                                    <CardHeader className="space-y-3 pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            {/* Date Badge */}
                                            <div className="flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                                    {startDate.toLocaleDateString(undefined, { month: "short" })}
                                                </span>
                                                <span className="text-lg font-black leading-none text-primary">
                                                    {startDate.getDate()}
                                                </span>
                                            </div>

                                            <div className="flex flex-1 flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant={isPast ? "secondary" : "success"}
                                                        className="rounded-lg px-2.5 py-0.5 text-[11px] font-semibold"
                                                    >
                                                        {isPast ? t("events.badgePast") : t("events.badgeUpcoming")}
                                                    </Badge>

                                                    {can.manage && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditModal(event)}
                                                                className="size-7 p-0 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeleteTarget(event)}
                                                                className="size-7 p-0 text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg font-bold leading-tight">{event.title}</CardTitle>
                                            </div>
                                        </div>

                                        {event.description && (
                                            <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                                                {event.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-3 pb-4">
                                        {/* Event Venue & Timing details */}
                                        <div className="grid grid-cols-1 gap-2 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-2">
                                            <div className="flex items-center gap-2 text-foreground font-medium">
                                                <MapPin className="size-4 text-primary shrink-0" />
                                                <span className="truncate">
                                                    {event.amenity ? event.amenity.name : event.venue_name || t("events.venueTBD")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="size-4 text-primary shrink-0" />
                                                <span>
                                                    {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    {event.end_time && ` – ${new Date(event.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Attendees Strip */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                <Users className="size-3.5 text-primary" />
                                                <span>
                                                    {event.total_attendees} {t("events.attending")}
                                                </span>
                                                {event.max_attendees && (
                                                    <span className="text-muted-foreground text-[11px]">
                                                        / {event.max_attendees} max
                                                    </span>
                                                )}
                                            </div>

                                            {event.creator && (
                                                <span className="text-[11px]">
                                                    {t("events.organizedBy")}: {event.creator.name}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/10 px-6 py-3">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {t("events.yourRsvp")}:
                                        </span>

                                        {can.rsvp ? (
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant={currentRsvp === "attending" ? "default" : "outline"}
                                                    onClick={() => handleRsvp(event, "attending")}
                                                    className="h-8 gap-1 rounded-lg text-xs font-semibold"
                                                >
                                                    <Check className="size-3.5" />
                                                    {t("events.rsvpGoing")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={currentRsvp === "maybe" ? "secondary" : "outline"}
                                                    onClick={() => handleRsvp(event, "maybe")}
                                                    className="h-8 rounded-lg text-xs font-semibold"
                                                >
                                                    {t("events.rsvpMaybe")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={currentRsvp === "declined" ? "destructive" : "outline"}
                                                    onClick={() => handleRsvp(event, "declined")}
                                                    className="h-8 gap-1 rounded-lg text-xs font-semibold"
                                                >
                                                    <X className="size-3.5" />
                                                    {t("events.rsvpDecline")}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Badge variant="outline">
                                                {currentRsvp || t("events.notResponded")}
                                            </Badge>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {events.total > events.per_page && (
                    <Pagination
                        page={events.current_page}
                        perPage={events.per_page}
                        total={events.total}
                        onPageChange={(page) =>
                            router.get(
                                route("community-events.index"),
                                { ...filters, page },
                                { preserveState: true }
                            )
                        }
                    />
                )}
            </div>

            {/* Create / Edit Event Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-lg bg-card p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {editingEvent ? t("events.editTitle") : t("events.createTitle")}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {t("events.createSubtitle")}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveEvent} className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="event-title" className="text-xs font-semibold">
                                {t("events.formTitle")} *
                            </Label>
                            <Input
                                id="event-title"
                                required
                                value={eventForm.data.title}
                                onChange={(e) => eventForm.setData("title", e.target.value)}
                                placeholder="e.g. Diwali Community Gala & Dinner"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="event-desc" className="text-xs font-semibold">
                                {t("events.formDescription")}
                            </Label>
                            <Input
                                id="event-desc"
                                value={eventForm.data.description}
                                onChange={(e) => eventForm.setData("description", e.target.value)}
                                placeholder="Details, schedule, dress code, etc."
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="event-amenity" className="text-xs font-semibold">
                                    {t("events.formAmenity")}
                                </Label>
                                <select
                                    id="event-amenity"
                                    value={eventForm.data.amenity_id}
                                    onChange={(e) => eventForm.setData("amenity_id", e.target.value)}
                                    className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">{t("events.selectAmenityOptional")}</option>
                                    {amenities.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="event-venue" className="text-xs font-semibold">
                                    {t("events.formVenue")}
                                </Label>
                                <Input
                                    id="event-venue"
                                    value={eventForm.data.venue_name}
                                    onChange={(e) => eventForm.setData("venue_name", e.target.value)}
                                    placeholder="e.g. Clubhouse Terrace"
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="event-start" className="text-xs font-semibold">
                                    {t("events.formStart")} *
                                </Label>
                                <Input
                                    id="event-start"
                                    type="datetime-local"
                                    required
                                    value={eventForm.data.start_time}
                                    onChange={(e) => eventForm.setData("start_time", e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="event-end" className="text-xs font-semibold">
                                    {t("events.formEnd")}
                                </Label>
                                <Input
                                    id="event-end"
                                    type="datetime-local"
                                    value={eventForm.data.end_time}
                                    onChange={(e) => eventForm.setData("end_time", e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="event-max" className="text-xs font-semibold">
                                    {t("events.formMaxAttendees")}
                                </Label>
                                <Input
                                    id="event-max"
                                    type="number"
                                    min={1}
                                    value={eventForm.data.max_attendees}
                                    onChange={(e) => eventForm.setData("max_attendees", e.target.value)}
                                    placeholder="e.g. 150"
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={eventForm.data.is_published}
                                        onChange={(e) => eventForm.setData("is_published", e.target.checked)}
                                        className="rounded border-border text-primary focus:ring-primary"
                                    />
                                    {t("events.formPublish")}
                                </label>
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFormOpen(false)}
                                disabled={eventForm.processing}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={eventForm.processing}
                                className="font-semibold shadow-sm"
                            >
                                {eventForm.processing ? t("events.saving") : t("events.submitSave")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete */}
            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t("events.deleteConfirmTitle")}
                description={t("events.deleteConfirmDesc")}
                confirmLabel={t("common.delete")}
                destructive
                onConfirm={handleDeleteEvent}
            />
        </AppLayout>
    );
}
