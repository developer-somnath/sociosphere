import { Head, Link, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    CreditCard,
    DoorOpen,
    Megaphone,
    Plus,
    ReceiptText,
    TrendingUp,
    Users,
} from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { DashboardStats, PageProps } from "@/types";

function safeRoute(name: string): string {
    try { return route(name); } catch { return "#"; }
}

function greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

export default function DashboardPage() {
    const { auth, stats } = usePage<PageProps<{ stats: DashboardStats }>>().props;
    const firstName = auth.user?.name.split(" ")[0] ?? "there";
    const occupancyRate =
        stats.flats > 0 ? Math.round((stats.occupied_flats / stats.flats) * 100) : 0;
    const vacantFlats = stats.flats - stats.occupied_flats;

    return (
        <AppLayout>
            <Head title="Overview" />

            {/* ── Page header ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        {greeting()}, {firstName}
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Here's what's happening at{" "}
                        <span className="font-medium text-foreground">
                            {auth.society?.name ?? "your society"}
                        </span>{" "}
                        today.
                    </p>
                </div>

                {/* Quick actions row */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="emerald" size="sm" asChild>
                        <Link href={safeRoute("residents.create")}>
                            <Plus className="size-3.5" />
                            Add Resident
                        </Link>
                    </Button>
                    <Button variant="blue" size="sm" asChild>
                        <Link href={safeRoute("invoices.create")}>
                            <ReceiptText className="size-3.5" />
                            New Invoice
                        </Link>
                    </Button>
                    <Button variant="purple" size="sm" asChild>
                        <Link href={safeRoute("complaints.create")}>
                            <AlertCircle className="size-3.5" />
                            Raise Complaint
                        </Link>
                    </Button>
                </div>
            </div>

            {/* ── KPI grid ────────────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Total residents"
                    value={stats.residents}
                    hint="Registered owners & tenants"
                    icon={Users}
                    accentColor="bg-blue-500"
                    iconColor="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    trend="+4.2%"
                    trendDir="up"
                />
                <MetricCard
                    label="Property units"
                    value={stats.flats}
                    hint={`${stats.occupied_flats.toLocaleString()} occupied · ${occupancyRate}% rate`}
                    icon={DoorOpen}
                    accentColor="bg-violet-500"
                    iconColor="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                    trend={`${occupancyRate}% full`}
                    trendDir={occupancyRate >= 75 ? "up" : "neutral"}
                />
                <MetricCard
                    label="Open complaints"
                    value={stats.open_complaints}
                    hint="Awaiting resolution"
                    icon={AlertCircle}
                    accentColor="bg-amber-500"
                    iconColor="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    trend={stats.open_complaints > 0 ? "Needs attention" : "All clear"}
                    trendDir={stats.open_complaints > 0 ? "down" : "up"}
                />
                <MetricCard
                    label="Pending payments"
                    value={stats.pending_payments}
                    hint="Outstanding invoices"
                    icon={CreditCard}
                    accentColor="bg-rose-500"
                    iconColor="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                    trend={stats.pending_payments > 0 ? "Due soon" : "Up to date"}
                    trendDir={stats.pending_payments === 0 ? "up" : "neutral"}
                />
            </div>

            {/* ── Mid section: Occupancy + quick stats ──────────────────── */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Occupancy card */}
                <Card className="col-span-2 border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Occupancy overview
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground" asChild>
                                <Link href={safeRoute("flats.index")}>
                                    View all <ArrowRight className="size-3" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Occupancy progress */}
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Overall occupancy</span>
                                <span className="font-semibold tabular-nums text-foreground">{occupancyRate}%</span>
                            </div>
                            <Progress value={occupancyRate} className="h-2" />
                        </div>

                        <Separator />

                        {/* Stat breakdown grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Total flats</p>
                                <p className="text-xl font-semibold tabular-nums text-foreground">{stats.flats.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Occupied</p>
                                <p className="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.occupied_flats.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Vacant</p>
                                <p className="text-xl font-semibold tabular-nums text-muted-foreground">{vacantFlats.toLocaleString()}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Bottom row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Total towers</p>
                                <p className="text-lg font-semibold tabular-nums text-foreground">{stats.towers.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Active notices</p>
                                <p className="text-lg font-semibold tabular-nums text-foreground">{stats.active_notices.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right col: action items */}
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-foreground">
                            Action items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <ActionItem
                                icon={AlertCircle}
                                iconClass="text-amber-500"
                                label="Review open complaints"
                                count={stats.open_complaints}
                                href={safeRoute("visitors.index")}
                            />
                            <ActionItem
                                icon={CreditCard}
                                iconClass="text-rose-500"
                                label="Collect pending dues"
                                count={stats.pending_payments}
                                href={safeRoute("payments.index")}
                            />
                            <ActionItem
                                icon={Megaphone}
                                iconClass="text-blue-500"
                                label="Active notices"
                                count={stats.active_notices}
                                href={safeRoute("visitors.index")}
                            />
                            <ActionItem
                                icon={DoorOpen}
                                iconClass="text-violet-500"
                                label="Visitor passes today"
                                count={null}
                                href={safeRoute("visitors.index")}
                            />
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* ── Bottom: quick-create strip ─────────────────────────────── */}
            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Quick Operations:
                        </span>
                        <Button variant="blue" size="sm" asChild>
                            <Link href={safeRoute("towers.create")}>
                                <Building2 className="size-3.5" /> New Tower
                            </Link>
                        </Button>
                        <Button variant="purple" size="sm" asChild>
                            <Link href={safeRoute("flats.create")}>
                                <Plus className="size-3.5" /> New Flat
                            </Link>
                        </Button>
                        <Button variant="emerald" size="sm" asChild>
                            <Link href={safeRoute("residents.create")}>
                                <Users className="size-3.5" /> Add Resident
                            </Link>
                        </Button>
                        <Button variant="amber" size="sm" asChild>
                            <Link href={safeRoute("parking-slots.create")}>
                                <Plus className="size-3.5" /> Allocate Parking
                            </Link>
                        </Button>
                        <Button variant="rose" size="sm" asChild>
                            <Link href={safeRoute("invoices.create")}>
                                <ReceiptText className="size-3.5" /> Issue Invoice
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

/* ─── Helper sub-component ──────────────────────────────────────────────── */

function ActionItem({
    icon: Icon,
    iconClass,
    label,
    count,
    href,
}: {
    icon: LucideIcon;
    iconClass: string;
    label: string;
    count: number | null;
    href: string;
}) {
    return (
        <li>
            <Link
                href={href}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
            >
                <Icon className={`size-4 shrink-0 ${iconClass}`} />
                <span className="flex-1 text-foreground">{label}</span>
                {count !== null && (
                    <span className="tabular-nums text-xs font-semibold text-muted-foreground">
                        {count}
                    </span>
                )}
                <ArrowRight className="size-3.5 text-muted-foreground/50" />
            </Link>
        </li>
    );
}

// Re-export type for TypeScript
type LucideIcon = typeof AlertCircle;
