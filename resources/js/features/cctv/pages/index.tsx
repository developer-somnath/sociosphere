import { Head, Link, router, usePage } from "@inertiajs/react";
import Hls from "hls.js";
import {
    Camera,
    CircleAlert,
    Expand,
    LayoutGrid,
    Maximize2,
    Minimize2,
    Pencil,
    Plus,
    Radio,
    RefreshCw,
    Table2,
    Trash2,
    Video,
    VideoOff,
    Volume2,
    VolumeX,
    Wrench,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
} from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableFull, type Selection } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportCsv } from "@/lib/export-csv";
import { t, useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { PageProps } from "@/types";

type CctvItem = {
    id: number;
    uuid: string;
    name: string;
    camera_group:
        | "Main Gate"
        | "Basement Parking"
        | "Tower Lobby"
        | "Perimeter"
        | "Amenities";
    stream_url: string;
    ip_address: string | null;
    location_details: string | null;
    status: "Online" | "Offline" | "Maintenance";
    is_recording: boolean;
    tower?: { id: number; name: string };
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
    online: number;
    offline: number;
    maintenance: number;
    groups: Record<string, number>;
};

type IndexProps = {
    cameras: Paginated<CctvItem>;
    stats: Stats;
    filters: {
        search: string;
        group: string | null;
        status: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    towers: { id: number; name: string }[];
    can: { create: boolean; update: boolean; delete: boolean };
};

type GridLayout = "1" | "2" | "3" | "4";

const CAMERA_GROUPS = [
    "Main Gate",
    "Basement Parking",
    "Tower Lobby",
    "Perimeter",
    "Amenities",
] as const;

const GRID_COLS: Record<GridLayout, string> = {
    "1": "grid-cols-1",
    "2": "sm:grid-cols-2",
    "3": "md:grid-cols-2 xl:grid-cols-3",
    "4": "md:grid-cols-2 xl:grid-cols-4",
};

export default function CctvIndex() {
    const { cameras, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search);
    const [group, setGroup] = useState<string>(filters.group ?? "");
    const [status, setStatus] = useState<string>(filters.status ?? "");
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<CctvItem | null>(null);
    const [view, setView] = useState<"grid" | "table">("grid");
    const [cols, setCols] = useState<GridLayout>("3");
    const [focusedId, setFocusedId] = useState<number | null>(null);
    const [now, setNow] = useState(() => new Date());
    const isFirstRender = useRef(true);

    /* Live clock for the wall timestamps. */
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    /* Escape collapses the zoomed camera. */
    useEffect(() => {
        if (focusedId === null) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setFocusedId(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [focusedId]);

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
        group: group !== "" ? group : undefined,
        status: status !== "" ? status : undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    const groupCounts = useMemo(() => {
        const counts: Record<string, number> = { all: stats.total };
        for (const [name, total] of Object.entries(stats.groups ?? {})) {
            counts[name] = total;
        }
        return counts;
    }, [stats.total, stats.groups]);

    const wallStats = useMemo(
        () => ({
            online: cameras.data.filter((cam) => cam.status === "Online").length,
            offline: cameras.data.filter((cam) => cam.status === "Offline").length,
            maintenance: cameras.data.filter(
                (cam) => cam.status === "Maintenance",
            ).length,
        }),
        [cameras.data],
    );

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                route("cctv-cameras.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, group, status]);

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("cctv-cameras.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const handleDestroy = () => {
        if (!confirming) return;
        const camera = confirming;
        setConfirming(null);
        router.delete(route("cctv-cameras.destroy", camera.uuid));
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const camera = cameras.data.find(
                (candidate) => candidate.id === id || candidate.uuid === id,
            );
            if (!camera) return;
            setTimeout(
                () =>
                    router.delete(route("cctv-cameras.destroy", camera.uuid), {
                        preserveScroll: true,
                    }),
                index * 80,
            );
        });
        setSelectedIds([]);
    };

    const handleExport = (format: ExportFormat) => {
        if (format !== "csv") {
            toast({
                title: t("cctv.exportComingSoon"),
                variant: "info",
                description: t("cctv.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<CctvItem>({
            filename: "cctv-cameras.csv",
            columns: [
                { header: t("cctv.colName"), accessor: (cam) => cam.name },
                { header: t("cctv.colGroup"), accessor: (cam) => cam.camera_group },
                {
                    header: t("cctv.colLocation"),
                    accessor: (cam) => cam.location_details ?? "",
                },
                { header: t("cctv.colTower"), accessor: (cam) => cam.tower?.name ?? "" },
                { header: t("cctv.colIp"), accessor: (cam) => cam.ip_address ?? "" },
                { header: t("cctv.colStreamUrl"), accessor: (cam) => cam.stream_url },
                { header: t("cctv.colStatus"), accessor: (cam) => cam.status },
                {
                    header: t("cctv.colRecording"),
                    accessor: (cam) => (cam.is_recording ? t("common.yes") : t("common.no")),
                },
            ],
            rows: cameras.data,
        });
    };

    const columns: ColumnDef<CctvItem>[] = useMemo(
        () => [
            {
                id: "name",
                header: t("cctv.colCamera"),
                sortable: true,
                sortKey: "name",
                cell: (cam) => (
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-info/10 text-info dark:bg-info/10 dark:text-info">
                            <Video className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                                {cam.name}
                            </span>
                            {cam.location_details && (
                                <span className="text-xs text-muted-foreground">
                                    {cam.location_details}
                                </span>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                id: "group",
                header: t("cctv.colGroup"),
                sortable: true,
                sortKey: "camera_group",
                cell: (cam) => (
                    <Badge variant="outline" className="font-mono text-xs">
                        {cam.camera_group}
                    </Badge>
                ),
            },
            {
                id: "tower",
                header: t("cctv.colLocationIp"),
                cell: (cam) => (
                    <div className="flex flex-col">
                        <span className="text-sm text-foreground">
                            {cam.tower ? cam.tower.name : t("cctv.surfaceBay")}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                            {cam.ip_address ?? "—"}
                        </span>
                    </div>
                ),
            },
            {
                id: "stream",
                header: t("cctv.colStreamUrl"),
                className: "hidden xl:table-cell",
                cell: (cam) => (
                    <span className="block max-w-[260px] truncate font-mono text-xs text-muted-foreground">
                        {cam.stream_url}
                    </span>
                ),
            },
            {
                id: "status",
                header: t("common.status"),
                sortable: true,
                sortKey: "status",
                cell: (cam) => (
                    <div className="flex items-center gap-1.5">
                        {cam.status === "Online" ? (
                            <Badge className="gap-1 border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                                <span className="size-1.5 animate-pulse rounded-full bg-brand" />
                                {t("cctv.live")}
                            </Badge>
                        ) : cam.status === "Offline" ? (
                            <Badge variant="destructive">{t("cctv.offline")}</Badge>
                        ) : (
                            <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                                {t("cctv.maintenance")}
                            </Badge>
                        )}
                        {cam.is_recording && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                                <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                                {t("cctv.rec")}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: "actions",
                header: t("common.actions"),
                align: "right",
                cell: (cam) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    disabled: !can.update,
                                    onClick: () =>
                                        router.visit(
                                            route("cctv-cameras.edit", cam.uuid),
                                        ),
                                },
                                {
                                    label: t("common.delete"),
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete,
                                    onClick: () => setConfirming(cam),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
        [can, t],
    );

    return (
        <AppLayout>
            <Head title={t("cctv.title")} />

            <PageHeader
                title={t("cctv.pageTitle")}
                description={t("cctv.pageDescription")}
                icon={<Video className="size-5" />}
                actions={
                    can.create && (
                        <Button asChild>
                            <Link href={route("cctv-cameras.create")}>
                                <Plus />
                                {t("cctv.addStream")}
                            </Link>
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label={t("cctv.statTotal")} value={stats.total} icon={Video} accent="border-info/20 bg-info/10 text-info dark:text-info" />
                <MetricCard label={t("cctv.statLive")} value={stats.online} icon={Radio} accent="border-brand/20 bg-brand/10 text-brand dark:text-brand" />
                <MetricCard label={t("cctv.statOffline")} value={stats.offline} icon={VideoOff} accent="border-destructive/20 bg-destructive/10 text-destructive dark:text-destructive" />
                <MetricCard label={t("cctv.statMaintenance")} value={stats.maintenance} icon={Wrench} accent="border-warning/20 bg-warning/10 text-warning dark:text-warning" />
            </div>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-5">
                    {/* Toolbar: group pills + layout + refresh + view toggle */}
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <Tabs
                            value={group === "" ? "all" : group}
                            onValueChange={(value) => {
                                setGroup(value === "all" ? "" : value);
                                setFocusedId(null);
                            }}
                            variant="pills"
                        >
                            <TabsList className="max-w-full overflow-x-auto">
                                <TabsTrigger value="all" className="gap-2">
                                    {t("common.all")}
                                    <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                                        {groupCounts.all}
                                    </span>
                                </TabsTrigger>
                                {CAMERA_GROUPS.map((name) => (
                                    <TabsTrigger
                                        key={name}
                                        value={name}
                                        className="gap-2"
                                    >
                                        {name}
                                        <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                                            {groupCounts[name] ?? 0}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <div className="flex flex-wrap items-center gap-3">
                            <Tabs
                                value={cols}
                                onValueChange={(value) =>
                                    setCols(value as GridLayout)
                                }
                                variant="segmented"
                                className="w-auto"
                            >
                                <TabsList>
                                    <TabsTrigger value="1" title={t("cctv.gridSingle")}>
                                        1×1
                                    </TabsTrigger>
                                    <TabsTrigger value="2" title={t("cctv.grid2x2")}>
                                        2×2
                                    </TabsTrigger>
                                    <TabsTrigger value="3" title={t("cctv.grid3x3")}>
                                        3×3
                                    </TabsTrigger>
                                    <TabsTrigger value="4" title={t("cctv.grid4x4")}>
                                        4×4
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.reload({
                                        only: ["cameras", "stats"],
                                    })
                                }
                            >
                                <RefreshCw />
                                {t("cctv.refresh")}
                            </Button>

                            <Tabs
                                value={view}
                                onValueChange={(value) => {
                                    setView(value as "grid" | "table");
                                    setFocusedId(null);
                                }}
                                variant="segmented"
                                className="w-full sm:w-auto"
                            >
                                <TabsList className="w-full sm:w-auto">
                                    <TabsTrigger value="grid" className="gap-1.5">
                                        <LayoutGrid />
                                        {t("cctv.wall")}
                                    </TabsTrigger>
                                    <TabsTrigger value="table" className="gap-1.5">
                                        <Table2 />
                                        {t("cctv.table")}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder={t("cctv.searchPlaceholder")}
                        searchLabel={t("cctv.searchLabel")}
                        className="mt-4 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                        onReset={() => {
                            setSearch("");
                            setGroup("");
                            setStatus("");
                            router.get(route("cctv-cameras.index"), {}, { preserveState: true, replace: true });
                        }}
                    >
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">{t("cctv.allStatuses")}</option>
                            <option value="Online">{t("cctv.online")}</option>
                            <option value="Offline">{t("cctv.offline")}</option>
                            <option value="Maintenance">{t("cctv.maintenance")}</option>
                        </select>
                        <span className="inline-flex h-9 items-center rounded-xl bg-muted/60 px-3 font-mono text-xs tabular-nums text-muted-foreground">
                            {t(
                                cameras.data.length === 1
                                    ? "cctv.cameraCount"
                                    : "cctv.cameraCountPlural",
                                { count: cameras.data.length },
                            )}
                        </span>
                    </FilterBar>

                    {/* Control room wall */}
                    {view === "grid" && (
                        stats.total === 0 ? (
                            <EmptyState
                                icon={Video}
                                title={t("cctv.emptyTitle")}
                                description={t("cctv.emptyDescription")}
                                action={
                                    can.create ? (
                                        <Button asChild>
                                            <Link
                                                href={route(
                                                    "cctv-cameras.create",
                                                )}
                                            >
                                                <Plus />
                                                {t("cctv.addFirstCamera")}
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : cameras.data.length === 0 ? (
                            <EmptyState
                                icon={CircleAlert}
                                title={t("cctv.noMatchTitle")}
                                description={t("cctv.noMatchDescription")}
                            />
                        ) : (
                            <>
                                <div
                                    className={cn(
                                        "mt-4 grid grid-cols-1 gap-3",
                                        GRID_COLS[cols],
                                    )}
                                >
                                    {cameras.data.map((cam) => (
                                        <CameraCard
                                            key={cam.id}
                                            cam={cam}
                                            focused={focusedId === cam.id}
                                            onToggleFocus={() =>
                                                setFocusedId((current) =>
                                                    current === cam.id
                                                        ? null
                                                        : cam.id,
                                                )
                                            }
                                            now={now}
                                        />
                                    ))}
                                </div>

                                {/* Wall status strip */}
                                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="size-2 animate-pulse rounded-full bg-brand" />
                                        {t("cctv.liveCount", { count: wallStats.online })}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-destructive" />
                                        {t("cctv.offlineCount", { count: wallStats.offline })}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-warning" />
                                        {t("cctv.maintenanceCount", { count: wallStats.maintenance })}
                                    </span>
                                    <span className="ml-auto inline-flex items-center gap-1.5 font-mono tabular-nums">
                                        <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                                        {now.toLocaleTimeString([], {
                                            hour12: false,
                                        })}
                                    </span>
                                </div>
                            </>
                        )
                    )}

                    {/* Table view */}
                    {view === "table" && (
                        <>
                            <DataTableFull<CctvItem>
                                columns={columns}
                                data={cameras.data}
                                rowKey={(cam) => cam.id}
                                sort={sort}
                                onSort={handleSort}
                                selectedIds={selectedIds}
                                onSelectionChange={setSelectedIds}
                                onExport={handleExport}
                                emptyState={
                                    <EmptyState
                                        icon={Video}
                                        title={t("cctv.emptyTitle")}
                                        description={t("cctv.tableEmptyDescription")}
                                    />
                                }
                                className="mt-4 rounded-xl border border-border/50"
                            />
                            {cameras.last_page > 1 && (
                                <div className="mt-4 border-t border-border/40 pt-4">
                                    <Pagination
                                        page={cameras.current_page}
                                        perPage={cameras.per_page}
                                        total={cameras.total}
                                        onPageChange={(next) =>
                                            router.get(
                                                route("cctv-cameras.index"),
                                                { ...buildParams(), page: next },
                                                { preserveState: true, replace: true },
                                            )
                                        }
                                        noun={t("cctv.nounPlural")}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("cctv.nounPlural")}
                actions={[
                    {
                        label: t("common.delete"),
                        icon: <Trash2 />,
                        destructive: true,
                        disabled: !can.delete,
                        onClick: bulkDelete,
                    },
                ]}
            />

            <ConfirmDialog
                open={confirming !== null}
                onOpenChange={(open) => !open && setConfirming(null)}
                title={t("cctv.confirmDeleteTitle")}
                description={t("cctv.confirmDeleteDescription", {
                    name: confirming?.name ?? "",
                })}
                confirmLabel={t("cctv.confirmDeleteLabel")}
                destructive
                onConfirm={handleDestroy}
            />
        </AppLayout>
    );
}

/* ─── Camera card (control-room tile) ──────────────────────────────────── */

function CameraCard({
    cam,
    focused,
    onToggleFocus,
    now,
}: {
    cam: CctvItem;
    focused: boolean;
    onToggleFocus: () => void;
    now: Date;
}) {
    const { t } = useI18n();
    const boxRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [muted, setMuted] = useState(true);
    const [playError, setPlayError] = useState(false);

    const isOnline = cam.status === "Online";
    const playable =
        isOnline && !!cam.stream_url && !cam.stream_url.startsWith("rtsp://");
    const isHls = playable && cam.stream_url.includes(".m3u8");

    /* Attach native / HLS playback. */
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !playable) return;

        let hls: Hls | null = null;

        if (isHls && Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(cam.stream_url);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) setPlayError(true);
            });
        } else if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = cam.stream_url; // native HLS (Safari / iOS)
        } else if (!isHls) {
            video.src = cam.stream_url;
        } else {
            setPlayError(true);
            return;
        }

        video.muted = true;
        const play = video.play();
        if (play) play.catch(() => setPlayError(true));

        return () => {
            if (hls) hls.destroy();
            video.removeAttribute("src");
            video.load();
        };
    }, [cam.stream_url, playable, isHls]);

    const stop = (event: ReactMouseEvent) => event.stopPropagation();

    const toggleMute = (event: ReactMouseEvent) => {
        stop(event);
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    const takeSnapshot = (event: ReactMouseEvent) => {
        stop(event);
        const video = videoRef.current;
        if (!video) return;
        try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${cam.name.replace(/\s+/g, "-").toLowerCase()}-snapshot.png`;
            link.click();
        } catch {
            toast({
                title: t("cctv.snapshotUnavailable"),
                variant: "info",
                description: t("cctv.snapshotError"),
            });
        }
    };

    const toggleFullscreen = (event: ReactMouseEvent) => {
        stop(event);
        const box = boxRef.current;
        if (!box) return;
        if (document.fullscreenElement === box) {
            void document.exitFullscreen();
        } else {
            void box.requestFullscreen().catch(() => undefined);
        }
    };

    const statusChip =
        cam.status === "Online" ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-brand/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                {t("cctv.live")}
            </span>
        ) : cam.status === "Offline" ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {t("cctv.offline")}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-warning/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Wrench className="size-2.5" />
                {t("cctv.maintenance")}
            </span>
        );

    return (
        <div
            ref={boxRef}
            onClick={onToggleFocus}
            title={focused ? t("cctv.clickToCollapse") : t("cctv.clickToZoom")}
            className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border bg-[#0a0a0c] shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] transition-all",
                focused
                    ? "col-span-full border-primary/40 ring-2 ring-primary/50"
                    : "border-border/60 hover:border-primary/40",
            )}
        >
            <div className="relative aspect-video w-full overflow-hidden">
                {playable && !playError ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <VideoOff className="size-8 opacity-70" />
                        <span className="max-w-[80%] text-center text-xs font-medium">
                            {!isOnline
                                ? cam.status === "Maintenance"
                                    ? t("cctv.underMaintenance")
                                    : t("cctv.reconnecting")
                                : playError
                                  ? t("cctv.feedUnavailable")
                                  : t("cctv.notPlayable")}
                        </span>
                    </div>
                )}

                {/* Top-left: camera name + group */}
                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <Video className="size-3 text-white/70" />
                        {cam.name}
                    </span>
                    <span className="hidden rounded-md bg-white/10 px-1.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm sm:inline">
                        {cam.camera_group}
                    </span>
                </div>

                {/* Top-right: status + REC */}
                <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
                    {statusChip}
                    {cam.is_recording && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-destructive/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <span className="size-1.5 animate-pulse rounded-full bg-white" />
                            {t("cctv.rec")}
                        </span>
                    )}
                </div>

                {/* Bottom: timestamp + controls */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-2 pt-8">
                    <span className="font-mono text-[11px] tabular-nums text-white/85">
                        {isOnline
                            ? now.toLocaleTimeString([], { hour12: false })
                            : "— — —"}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={toggleMute}
                            disabled={!playable || playError}
                            title={muted ? t("cctv.unmute") : t("cctv.mute")}
                            className="flex size-7 items-center justify-center rounded-md bg-black/50 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {muted ? (
                                <VolumeX className="size-3.5" />
                            ) : (
                                <Volume2 className="size-3.5" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={takeSnapshot}
                            disabled={!playable || playError}
                            title={t("cctv.snapshot")}
                            className="flex size-7 items-center justify-center rounded-md bg-black/50 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Camera className="size-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            title={t("cctv.fullscreen")}
                            className="flex size-7 items-center justify-center rounded-md bg-black/50 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
                        >
                            <Maximize2 className="size-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                stop(event);
                                onToggleFocus();
                            }}
                            title={focused ? t("cctv.collapse") : t("cctv.zoom")}
                            className="flex size-7 items-center justify-center rounded-md bg-black/50 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
                        >
                            {focused ? (
                                <Minimize2 className="size-3.5" />
                            ) : (
                                <Expand className="size-3.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
