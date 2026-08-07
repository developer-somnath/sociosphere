import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Car,
    CarFront,
    CircleAlert,
    Clock,
    KeyRound,
    Map,
    ParkingMeter,
    Plus,
    Table2,
    Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableFull, type ColumnDef, type Selection } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDrawer } from "@/components/ui/form-drawer";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { PageProps } from "@/types";

type SlotType = "Four Wheeler" | "Two Wheeler" | "Visitor";
type SlotStatus = "Available" | "Allocated" | "Reserved" | "Maintenance";

type ParkingItem = {
    id: number;
    uuid: string;
    slot_number: string;
    type: SlotType;
    status: SlotStatus;
    vehicle_number: string | null;
    vehicle_model: string | null;
    rfid_tag: string | null;
    expires_at: string | null;
    notes: string | null;
    tower?: { id: number; name: string } | null;
    flat?: {
        id: number;
        flat_no: string;
        resident?: { id: number; name: string } | null;
    } | null;
};

type FlatOption = {
    id: number;
    flat_no: string;
    tower_name: string | null;
    resident_name: string | null;
};

type Stats = {
    total: number;
    four_wheeler: number;
    two_wheeler: number;
    visitor: number;
    allocated: number;
    available: number;
    reserved: number;
    maintenance: number;
};

type IndexProps = {
    slots: ParkingItem[];
    flats: FlatOption[];
    stats: Stats;
    can: { create: boolean; delete: boolean; allocate: boolean };
};

const STATUS_STYLES: Record<SlotStatus, { card: string; dot: string; badge: string; label: string }> = {
    Available: {
        card: "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/50",
        dot: "bg-emerald-500",
        badge: "border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        label: "Available",
    },
    Allocated: {
        card: "border-blue-500/25 bg-blue-500/5 hover:border-blue-500/50",
        dot: "bg-blue-500",
        badge: "border-transparent bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        label: "Allocated",
    },
    Reserved: {
        card: "border-amber-500/25 bg-amber-500/5 hover:border-amber-500/50",
        dot: "bg-amber-500",
        badge: "border-transparent bg-amber-600/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        label: "Reserved",
    },
    Maintenance: {
        card: "border-zinc-400/30 bg-muted/40 hover:border-zinc-400/50",
        dot: "bg-zinc-400",
        badge: "border-transparent bg-zinc-500/10 text-zinc-500 dark:bg-zinc-400/10 dark:text-zinc-400",
        label: "Maintenance",
    },
};

const TYPE_ICON: Record<SlotType, typeof Car> = {
    "Four Wheeler": Car,
    "Two Wheeler": CarFront,
    Visitor: Clock,
};

const CATEGORIES = [
    { value: "All", label: "All" },
    { value: "Four Wheeler", label: "4 Wheeler" },
    { value: "Two Wheeler", label: "2 Wheeler" },
    { value: "Visitor", label: "Visitor" },
] as const;

const formatDate = (iso: string | null): string => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const toISODate = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const todayISO = toISODate(new Date());

export default function ParkingIndex() {
    const { slots, flats, stats, can } = usePage<PageProps<IndexProps>>().props;

    /* View + filters ------------------------------------------------------ */
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("All");
    const [view, setView] = useState<"map" | "table">("map");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"" | SlotStatus>("");

    /* Selection (bulk) ---------------------------------------------------- */
    const [selectedIds, setSelectedIds] = useState<Selection>([]);

    /* Allocation drawer --------------------------------------------------- */
    const [allocating, setAllocating] = useState<ParkingItem | null>(null);
    const [deallocating, setDeallocating] = useState<ParkingItem | null>(null);
    const [deleting, setDeleting] = useState<ParkingItem | null>(null);

    /* Table pagination (client-side) --------------------------------------- */
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);
    const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    /* Derived -------------------------------------------------------------- */

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return slots.filter((slot) => {
            if (category !== "All" && slot.type !== category) return false;
            if (status !== "" && slot.status !== status) return false;
            if (q === "") return true;
            return (
                slot.slot_number.toLowerCase().includes(q) ||
                (slot.vehicle_number ?? "").toLowerCase().includes(q) ||
                (slot.vehicle_model ?? "").toLowerCase().includes(q) ||
                (slot.flat?.flat_no ?? "").toLowerCase().includes(q) ||
                (slot.flat?.resident?.name ?? "").toLowerCase().includes(q)
            );
        });
    }, [slots, category, status, search]);

    const sorted = useMemo(() => {
        if (!sort) return filtered;
        const { key, direction } = sort;
        const get = (slot: ParkingItem): string | number => {
            switch (key) {
                case "slot_number":
                    return slot.slot_number;
                case "type":
                    return slot.type;
                case "status":
                    return slot.status;
                case "flat_no":
                    return slot.flat?.flat_no ?? "";
                case "vehicle_number":
                    return slot.vehicle_number ?? "";
                case "expires_at":
                    return slot.expires_at ?? "";
                default:
                    return slot.slot_number;
            }
        };
        return [...filtered].sort((a, b) => {
            const av = get(a);
            const bv = get(b);
            const cmp =
                typeof av === "number" && typeof bv === "number"
                    ? av - bv
                    : String(av).localeCompare(String(bv));
            return direction === "asc" ? cmp : -cmp;
        });
    }, [filtered, sort]);

    const pageRows = useMemo(() => {
        const start = (page - 1) * perPage;
        return sorted.slice(start, start + perPage);
    }, [sorted, page, perPage]);

    const flatOptions: ComboboxItem[] = useMemo(
        () =>
            flats.map((flat) => ({
                value: String(flat.id),
                label: `Flat ${flat.flat_no}`,
                description: [flat.tower_name, flat.resident_name].filter(Boolean).join(" · "),
            })),
        [flats],
    );

    const resetPagination = () => setPage(1);

    /* Allocation drawer form ---------------------------------------------- */

    const [allocForm, setAllocForm] = useState({
        flat_id: "",
        vehicle_number: "",
        vehicle_model: "",
        rfid_tag: "",
        expires_at: "",
        notes: "",
    });
    const [allocSubmitting, setAllocSubmitting] = useState(false);

    const openAllocation = (slot: ParkingItem) => {
        setAllocForm({
            flat_id: "",
            vehicle_number: "",
            vehicle_model: "",
            rfid_tag: "",
            expires_at: "",
            notes: "",
        });
        setAllocating(slot);
    };

    const submitAllocation = () => {
        if (!allocating) return;
        setAllocSubmitting(true);
        router.post(
            route("parking-slots.allocate", allocating.uuid),
            {
                ...allocForm,
                flat_id: allocForm.flat_id !== "" ? Number(allocForm.flat_id) : null,
                expires_at: allocForm.expires_at !== "" ? allocForm.expires_at : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setAllocating(null),
                onFinish: () => setAllocSubmitting(false),
                onError: () =>
                    toast({ title: "Allocation failed", variant: "error", description: "Check the form and try again." }),
            },
        );
    };

    /* Bulk + destroy handlers --------------------------------------------- */

    const deallocateOne = (slot: ParkingItem) => {
        router.post(route("parking-slots.deallocate", slot.uuid), {}, { preserveScroll: true });
        setDeallocating(null);
    };

    const bulkDeallocate = () => {
        selectedIds.forEach((id, index) => {
            const slot = slots.find((s) => s.uuid === id || s.id === id);
            if (!slot || slot.status !== "Allocated") return;
            setTimeout(
                () => router.post(route("parking-slots.deallocate", slot.uuid), {}, { preserveScroll: true }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const slot = slots.find((s) => s.uuid === id || s.id === id);
            if (!slot) return;
            setTimeout(
                () => router.delete(route("parking-slots.destroy", slot.uuid), { preserveScroll: true }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const deleteOne = (slot: ParkingItem) => {
        router.delete(route("parking-slots.destroy", slot.uuid), { preserveScroll: true });
        setDeleting(null);
    };

    /* CSV export ---------------------------------------------------------- */

    const exportCsv = () => {
        const header = ["Slot No", "Type", "Status", "Flat", "Tower", "Resident", "Vehicle No", "Vehicle Model", "Valid Till"];
        const rows = sorted.map((slot) => [
            slot.slot_number,
            slot.type,
            slot.status,
            slot.flat?.flat_no ?? "",
            slot.tower?.name ?? "",
            slot.flat?.resident?.name ?? "",
            slot.vehicle_number ?? "",
            slot.vehicle_model ?? "",
            slot.expires_at ?? "",
        ]);
        const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
        const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "parking-slots.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExport = (format: ExportFormat) => {
        if (format === "csv") {
            exportCsv();
            return;
        }
        toast({
            title: "Export coming soon",
            variant: "info",
            description: `${format.toUpperCase()} export will be available in a later phase.`,
        });
    };

    /* Table columns -------------------------------------------------------- */

    const columns: ColumnDef<ParkingItem>[] = useMemo(
        () => [
            {
                id: "slot_number",
                header: "Slot No",
                sortable: true,
                cell: (slot) => <span className="font-mono font-semibold text-foreground">{slot.slot_number}</span>,
            },
            {
                id: "type",
                header: "Type",
                sortable: true,
                cell: (slot) => (
                    <Badge variant="outline" className="font-mono text-xs">
                        {slot.type}
                    </Badge>
                ),
            },
            {
                id: "flat_no",
                header: "Assigned Flat",
                sortable: true,
                cell: (slot) =>
                    slot.flat ? (
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">Flat {slot.flat.flat_no}</span>
                            {slot.flat.resident && (
                                <span className="text-[11px] text-muted-foreground">{slot.flat.resident.name}</span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "vehicle_number",
                header: "Vehicle",
                sortable: true,
                cell: (slot) =>
                    slot.vehicle_number ? (
                        <div className="flex flex-col">
                            <span className="font-mono text-xs font-medium text-foreground">{slot.vehicle_number}</span>
                            {slot.vehicle_model && (
                                <span className="text-[11px] text-muted-foreground">{slot.vehicle_model}</span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: "expires_at",
                header: "Valid Till",
                sortable: true,
                cell: (slot) => <span className="text-muted-foreground">{formatDate(slot.expires_at)}</span>,
            },
            {
                id: "status",
                header: "Status",
                sortable: true,
                cell: (slot) => (
                    <Badge className={STATUS_STYLES[slot.status].badge}>{STATUS_STYLES[slot.status].label}</Badge>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (slot) => (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {can.allocate && slot.status === "Available" && (
                            <Button variant="ghost" size="sm" onClick={() => openAllocation(slot)}>
                                <KeyRound />
                                Allocate
                            </Button>
                        )}
                        {can.allocate && slot.status === "Allocated" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-600 hover:text-amber-700"
                                onClick={() => setDeallocating(slot)}
                            >
                                Deallocate
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("parking-slots.edit", slot.uuid)}>Edit</Link>
                        </Button>
                        {can.delete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleting(slot)}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [can, slots],
    );

    return (
        <AppLayout>
            <Head title="Parking Management" />

            {/* Header */}
            <PageHeader
                title="Parking Management"
                description="Allocate Four Wheeler, Two Wheeler, and Visitor parking slots across basement & surface bays."
                icon={<ParkingMeter className="size-5" />}
                actions={
                    can.create && (
                        <Button asChild>
                            <Link href={route("parking-slots.create")}>
                                <Plus />
                                Add Parking Slot
                            </Link>
                        </Button>
                    )
                }
            />

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Slots" value={stats.total} icon={ParkingMeter} accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
                <MetricCard label="Four Wheeler" value={stats.four_wheeler} icon={Car} accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                <MetricCard label="Two Wheeler" value={stats.two_wheeler} icon={CarFront} accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400" />
                <MetricCard label="Visitor Parking" value={stats.visitor} icon={Clock} accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            </div>

            {/* Overview card: category tabs + filters + view toggle */}
            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs
                            value={category}
                            onValueChange={(value) => {
                                setCategory(value as (typeof CATEGORIES)[number]["value"]);
                                resetPagination();
                            }}
                            variant="pills"
                        >
                            <TabsList>
                                {CATEGORIES.map((item) => (
                                    <TabsTrigger key={item.value} value={item.value} className="gap-2">
                                        {item.label}
                                        {item.value !== "All" && (
                                            <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                                                {item.value === "Four Wheeler"
                                                    ? stats.four_wheeler
                                                    : item.value === "Two Wheeler"
                                                      ? stats.two_wheeler
                                                      : stats.visitor}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <Tabs
                            value={view}
                            onValueChange={(value) => setView(value as "map" | "table")}
                            variant="segmented"
                            className="w-full sm:w-auto"
                        >
                            <TabsList className="w-full sm:w-auto">
                                <TabsTrigger value="map" className="gap-1.5">
                                    <Map />
                                    Map
                                </TabsTrigger>
                                <TabsTrigger value="table" className="gap-1.5">
                                    <Table2 />
                                    Table
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <FilterBar
                        searchValue={search}
                        onSearchChange={(value) => {
                            setSearch(value);
                            resetPagination();
                        }}
                        searchPlaceholder="Search slot, vehicle no, resident, flat…"
                        searchLabel="Search parking slots"
                        className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                        onReset={() => {
                            setSearch("");
                            setStatus("");
                            setCategory("All");
                            resetPagination();
                        }}
                    >
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as "" | SlotStatus);
                                resetPagination();
                            }}
                            className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">All Statuses</option>
                            <option value="Available">Available</option>
                            <option value="Allocated">Allocated</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                        <span className="inline-flex h-9 items-center rounded-xl bg-muted/60 px-3 font-mono text-xs tabular-nums text-muted-foreground">
                            {filtered.length} slot{filtered.length === 1 ? "" : "s"}
                        </span>
                    </FilterBar>

                    {/* Slot map */}
                    {view === "map" && (
                        slots.length === 0 ? (
                            <EmptyState
                                icon={ParkingMeter}
                                title="No parking slots yet"
                                description="Generate 4W, 2W, and visitor slots to start allocation. Use the 'Add Parking Slot' button to define your first bay."
                                action={
                                    can.create ? (
                                        <Button asChild>
                                            <Link href={route("parking-slots.create")}>
                                                <Plus />
                                                Add first slot
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={CircleAlert}
                                title="No slots match your filters"
                                description="Try a different category, status, or search term."
                            />
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                                    {filtered.map((slot) => {
                                        const style = STATUS_STYLES[slot.status];
                                        const TypeIcon = TYPE_ICON[slot.type];
                                        const clickable = can.allocate && slot.status === "Available";
                                        return (
                                            <button
                                                key={slot.uuid}
                                                type="button"
                                                onClick={clickable ? () => openAllocation(slot) : undefined}
                                                className={cn(
                                                    "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                                                    style.card,
                                                    clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : "cursor-default",
                                                )}
                                            >
                                                <div className="flex w-full items-start justify-between">
                                                    <span className="font-mono text-sm font-semibold text-foreground">{slot.slot_number}</span>
                                                    <TypeIcon className="size-4 text-muted-foreground" />
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn("size-2 rounded-full", style.dot)} />
                                                    <span className="text-xs font-medium text-foreground">{style.label}</span>
                                                </div>

                                                {slot.flat && (
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-medium text-foreground">Flat {slot.flat.flat_no}</p>
                                                        {slot.flat.resident && (
                                                            <p className="truncate text-[11px] text-muted-foreground">{slot.flat.resident.name}</p>
                                                        )}
                                                    </div>
                                                )}
                                                {slot.vehicle_number && (
                                                    <p className="truncate font-mono text-[11px] text-muted-foreground">{slot.vehicle_number}</p>
                                                )}
                                                {slot.status === "Allocated" && slot.expires_at && (
                                                    <p className="text-[11px] text-muted-foreground">Till {formatDate(slot.expires_at)}</p>
                                                )}

                                                {clickable && (
                                                    <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                                        <KeyRound className="size-3" />
                                                        Allocate
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                                    {(Object.keys(STATUS_STYLES) as SlotStatus[]).map((statusKey) => (
                                        <span key={statusKey} className="inline-flex items-center gap-1.5">
                                            <span className={cn("size-2 rounded-full", STATUS_STYLES[statusKey].dot)} />
                                            {STATUS_STYLES[statusKey].label}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )
                    )}

                    {/* Table view */}
                    {view === "table" && (
                        <>
                            <DataTableFull<ParkingItem>
                            columns={columns}
                            data={pageRows}
                            rowKey={(slot) => slot.uuid}
                            sort={sort}
                            onSort={setSort}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            onExport={handleExport}
                            onRowClick={
                                can.allocate
                                    ? (slot) => {
                                          if (slot.status === "Available") openAllocation(slot);
                                      }
                                    : undefined
                            }
                            emptyState={
                                <EmptyState
                                    icon={CircleAlert}
                                    title="No slots match your filters"
                                    description="Try a different category, status, or search term."
                                />
                            }
                            className="rounded-xl border border-border/50"
                        />
                        {filtered.length > 0 && (
                            <div className="mt-4 border-t border-border/40 pt-4">
                                <Pagination
                                    page={page}
                                    perPage={perPage}
                                    total={filtered.length}
                                    onPageChange={setPage}
                                    onPerPageChange={(value) => {
                                        setPerPage(value);
                                        setPage(1);
                                    }}
                                    noun="slots"
                                />
                            </div>
                        )}
                            </>
                    )}
                </CardContent>
            </Card>

            {/* Bulk action bar */}
            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun="slots"
                actions={[
                    {
                        label: "Deallocate",
                        icon: <KeyRound />,
                        disabled: !selectedIds.some(
                            (id) => slots.find((s) => s.uuid === id || s.id === id)?.status === "Allocated",
                        ),
                        onClick: bulkDeallocate,
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 />,
                        destructive: true,
                        disabled: !can.delete,
                        onClick: bulkDelete,
                    },
                ]}
            />

            {/* Allocation drawer */}
            <FormDrawer
                open={!!allocating}
                onOpenChange={(open) => !open && setAllocating(null)}
                title={allocating ? `Allocate ${allocating.slot_number}` : "Allocate slot"}
                description="Assign this slot to a flat. The slot becomes Allocated on confirm."
                icon={<KeyRound className="size-5" />}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setAllocating(null)} disabled={allocSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={submitAllocation} loading={allocSubmitting} disabled={allocForm.flat_id === ""}>
                            <KeyRound />
                            Allocate slot
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-flat">Flat *</Label>
                            <Combobox
                                id="alloc-flat"
                                items={flatOptions}
                                value={allocForm.flat_id}
                                onValueChange={(value) => setAllocForm((prev) => ({ ...prev, flat_id: value }))}
                                placeholder="Select flat…"
                                emptyText="No flats found"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-vehicle">Vehicle Registration No</Label>
                            <Input
                                id="alloc-vehicle"
                                value={allocForm.vehicle_number}
                                onChange={(e) => setAllocForm((prev) => ({ ...prev, vehicle_number: e.target.value }))}
                                placeholder="e.g. MH-12-AB-1234"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-model">Vehicle Make / Model</Label>
                            <Input
                                id="alloc-model"
                                value={allocForm.vehicle_model}
                                onChange={(e) => setAllocForm((prev) => ({ ...prev, vehicle_model: e.target.value }))}
                                placeholder="e.g. Honda City (White)"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-rfid">RFID Tag</Label>
                            <Input
                                id="alloc-rfid"
                                value={allocForm.rfid_tag}
                                onChange={(e) => setAllocForm((prev) => ({ ...prev, rfid_tag: e.target.value }))}
                                placeholder="e.g. 0452-8871-9930"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-expires">Valid Till (optional)</Label>
                            <DatePicker
                                id="alloc-expires"
                                value={allocForm.expires_at}
                                onValueChange={(value) => setAllocForm((prev) => ({ ...prev, expires_at: value }))}
                                min={todayISO}
                                placeholder="Permanent unless set"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-notes">Notes</Label>
                            <Input
                                id="alloc-notes"
                                value={allocForm.notes}
                                onChange={(e) => setAllocForm((prev) => ({ ...prev, notes: e.target.value }))}
                                placeholder="Optional remarks"
                            />
                        </div>
                </div>
            </FormDrawer>

            {/* Deallocate confirm */}
            <ConfirmDialog
                open={!!deallocating}
                onOpenChange={(open) => !open && setDeallocating(null)}
                title={`Deallocate ${deallocating?.slot_number ?? ""}?`}
                description="This releases the slot and clears the allocated flat, vehicle, and expiry. The slot returns to Available."
                confirmLabel="Deallocate"
                destructive
                onConfirm={() => deallocating && deallocateOne(deallocating)}
            />

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Remove slot ${deleting?.slot_number ?? ""}?`}
                description="This permanently removes the parking slot record. This action cannot be undone."
                confirmLabel="Remove"
                destructive
                onConfirm={() => deleting && deleteOne(deleting)}
            />
        </AppLayout>
    );
}
