import { Head, Link, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CalendarDays,
    Car,
    CheckCircle2,
    Clock,
    CreditCard,
    DoorOpen,
    Megaphone,
    Plus,
    ReceiptText,
    ShieldAlert,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { ActionLink } from "@/components/ui/action-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Progress } from "@/components/ui/progress";
import { QuickActionPill } from "@/components/ui/quick-action-pill";
import { Separator } from "@/components/ui/separator";
import { getFilteredQuickActions } from "@/features/dashboard/config/widget-registry";
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
    const user = auth.user;
    const userRoles = user?.roles ?? ["Resident"];
    const userPermissions = user?.permissions ?? [];
    const firstName = user?.name.split(" ")[0] ?? "there";
    const primaryRoleLabel = userRoles[0] ?? "Member";

    const filteredActions = getFilteredQuickActions(userRoles, userPermissions);
    const occupancyRate =
        stats.flats > 0 ? Math.round((stats.occupied_flats / stats.flats) * 100) : 0;
    const vacantFlats = Math.max(0, stats.flats - stats.occupied_flats);

    // Role flags
    const isSecurity = userRoles.includes("SecurityGuard") || userRoles.includes("SecurityManager");
    const isResidentOnly = userRoles.includes("Resident") && !user?.is_super_admin && !userRoles.includes("SocietyAdmin");

    return (
        <AppLayout>
            <Head title="Overview" />

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {greeting()}, {firstName}
                        </h1>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                            {primaryRoleLabel}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Adaptive Enterprise Portal for{" "}
                        <span className="font-semibold text-foreground">
                            {auth.society?.name ?? "All Societies (Portfolio Context)"}
                        </span>
                    </p>
                </div>

                {/* Header Dynamic Quick Actions Strip */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {filteredActions.slice(0, 4).map((act) => (
                        <QuickActionPill
                            key={act.id}
                            href={safeRoute(act.href.replace("/", ""))}
                            icon={act.icon}
                            label={act.label}
                            variant={act.variant}
                        />
                    ))}
                </div>
            </div>

            {/* ── Role-Driven KPI Grid ────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Total Residents"
                    value={stats.residents}
                    hint="Registered property owners & tenants"
                    icon={Users}
                    accentColor="bg-teal-500"
                    iconColor="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                    trend="+4.2% MoM"
                    trendDir="up"
                />
                <MetricCard
                    label="Property Units"
                    value={stats.flats}
                    hint={`${stats.occupied_flats.toLocaleString()} occupied · ${occupancyRate}% occupancy`}
                    icon={DoorOpen}
                    accentColor="bg-indigo-500"
                    iconColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                    trend={`${occupancyRate}% Full`}
                    trendDir={occupancyRate >= 75 ? "up" : "neutral"}
                />
                <MetricCard
                    label="Open Helpdesk Tickets"
                    value={stats.open_complaints}
                    hint="Active resident issues awaiting resolution"
                    icon={AlertCircle}
                    accentColor="bg-amber-500"
                    iconColor="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    trend={stats.open_complaints > 0 ? "Requires Action" : "All Clear"}
                    trendDir={stats.open_complaints > 0 ? "down" : "up"}
                />
                <MetricCard
                    label="Pending Financial Dues"
                    value={stats.pending_payments}
                    hint="Uncollected maintenance invoices"
                    icon={CreditCard}
                    accentColor="bg-rose-500"
                    iconColor="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    trend={stats.pending_payments > 0 ? "Outstanding Dues" : "Paid Up"}
                    trendDir={stats.pending_payments === 0 ? "up" : "neutral"}
                />
            </div>

            {/* ── Mid Section: Occupancy + Task Panel ─────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Occupancy Card */}
                <Card className="col-span-2 border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-foreground">
                                    Property Occupancy & Capacity Analysis
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Real-time breakdown across registered towers and units
                                </p>
                            </div>
                            <ActionLink href={safeRoute("flats.index")} variant="blue">
                                View Flat Registry
                            </ActionLink>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Visual Progress */}
                        <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5">
                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                                    Occupied Capacity Ratio
                                </span>
                                <span className="font-bold tabular-nums text-foreground">{occupancyRate}%</span>
                            </div>
                            <Progress value={occupancyRate} className="h-2.5 bg-muted" />
                        </div>

                        {/* Breakdown Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground">Total Units</p>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{stats.flats.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Occupied</p>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.occupied_flats.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground">Vacant Units</p>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-muted-foreground">{vacantFlats.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                                <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Active Towers</p>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{stats.towers.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Bottom Info Bar */}
                        <div className="flex items-center justify-between rounded-xl bg-accent/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-indigo-500" />
                                <span>Active Notices Broadcast: <strong className="text-foreground">{stats.active_notices}</strong></span>
                            </div>
                            <span className="font-medium text-foreground">Updated live</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Col: Enterprise Task Panel */}
                <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-foreground">
                                Action Items Task Queue
                            </CardTitle>
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Priority Matrix
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2.5">
                            <TaskQueueItem
                                icon={AlertCircle}
                                iconClass="text-amber-500"
                                label="Review Open Helpdesk Tickets"
                                count={stats.open_complaints}
                                priority="High"
                                priorityColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                href={safeRoute("complaints.index")}
                            />
                            <TaskQueueItem
                                icon={CreditCard}
                                iconClass="text-rose-500"
                                label="Collect Outstanding Invoices"
                                count={stats.pending_payments}
                                priority="Urgent"
                                priorityColor="bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                href={safeRoute("invoices.index")}
                            />
                            <TaskQueueItem
                                icon={Megaphone}
                                iconClass="text-blue-500"
                                label="Active Society Notices"
                                count={stats.active_notices}
                                priority="Normal"
                                priorityColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                href={safeRoute("visitors.index")}
                            />
                            <TaskQueueItem
                                icon={DoorOpen}
                                iconClass="text-indigo-500"
                                label="Visitor Pass Verification"
                                count={null}
                                priority="Normal"
                                priorityColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                href={safeRoute("visitors.index")}
                            />
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* ── Bottom: Grouped Enterprise Quick Operations Grid ─────── */}
            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Grouped Quick Operations Hub
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <QuickOpCard
                            title="Property Setup"
                            description="Register new residential towers & unit flats"
                            icon={Building2}
                            accentColor="border-indigo-500/20 bg-indigo-500/5 text-indigo-600"
                            actions={[
                                { label: "New Tower", href: safeRoute("towers.create") },
                                { label: "New Flat", href: safeRoute("flats.create") },
                            ]}
                        />
                        <QuickOpCard
                            title="Resident Services"
                            description="Add residents & allocate parking slots"
                            icon={Users}
                            accentColor="border-teal-500/20 bg-teal-500/5 text-teal-600"
                            actions={[
                                { label: "Add Resident", href: safeRoute("residents.create") },
                                { label: "Allocate Parking", href: safeRoute("parking-slots.create") },
                            ]}
                        />
                        <QuickOpCard
                            title="Financial & Helpdesk"
                            description="Issue invoices & lodge maintenance requests"
                            icon={ReceiptText}
                            accentColor="border-rose-500/20 bg-rose-500/5 text-rose-600"
                            actions={[
                                { label: "Issue Invoice", href: safeRoute("invoices.create") },
                                { label: "Raise Complaint", href: safeRoute("complaints.create") },
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

/* ─── TaskQueueItem Helper ──────────────────────────────────────────────── */

function TaskQueueItem({
    icon: Icon,
    iconClass,
    label,
    count,
    priority,
    priorityColor,
    href,
}: {
    icon: typeof AlertCircle;
    iconClass: string;
    label: string;
    count: number | null;
    priority: string;
    priorityColor: string;
    href: string;
}) {
    return (
        <li>
            <Link
                href={href}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/60 p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/50 shadow-2xs"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/50">
                        <Icon className={`size-3.5 ${iconClass}`} />
                    </div>
                    <span className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {label}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${priorityColor}`}>
                        {priority}
                    </span>
                    {count !== null && (
                        <span className="font-mono text-xs font-bold text-foreground">
                            {count}
                        </span>
                    )}
                    <ArrowRight className="size-3 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
            </Link>
        </li>
    );
}

/* ─── QuickOpCard Helper ────────────────────────────────────────────────── */

function QuickOpCard({
    title,
    description,
    icon: Icon,
    accentColor,
    actions,
}: {
    title: string;
    description: string;
    icon: typeof Building2;
    accentColor: string;
    actions: { label: string; href: string }[];
}) {
    return (
        <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-background/70 p-3.5 transition-all duration-200 hover:border-primary/30 shadow-2xs">
            <div className="flex items-start gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${accentColor}`}>
                    <Icon className="size-4" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-foreground">{title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/40">
                {actions.map((act, idx) => {
                    const variants: ("indigo" | "teal" | "rose" | "amber" | "purple")[] = ["indigo", "teal", "rose", "amber", "purple"];
                    const variant = variants[idx % variants.length];
                    return (
                        <QuickActionPill
                            key={act.label}
                            href={act.href}
                            icon={Plus}
                            label={act.label}
                            variant={variant}
                        />
                    );
                })}
            </div>
        </div>
    );
}
