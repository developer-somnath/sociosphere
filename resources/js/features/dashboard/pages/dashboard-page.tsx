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
    Video,
    Wrench,
    FileText,
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
import { OccupancyCompositionCard, PortfolioSnapshotCard } from "@/features/dashboard/config/dashboard-charts";
import { t, useI18n } from "@/lib/i18n";
import type { DashboardStats, PageProps } from "@/types";

function safeRoute(name: string): string {
    try { return route(name); } catch { return "#"; }
}

function roleKey(role: string): string {
    const map: Record<string, string> = {
        superadmin: "roles.superAdmin",
        societyadmin: "roles.societyAdmin",
        societymanager: "roles.societyManager",
        treasurer: "roles.treasurer",
        resident: "roles.resident",
        securityguard: "roles.securityGuard",
        securitymanager: "roles.securityManager",
        accountant: "roles.accountant",
        helpdesk: "roles.helpdesk",
        member: "roles.member",
    };
    return map[role.toLowerCase().replace(/[^a-z]/g, "")] ?? "roles.member";
}

function greeting(translateFn: (key: string) => string): string {
    const h = new Date().getHours();
    if (h < 12) return translateFn("dashboard.goodMorning");
    if (h < 17) return translateFn("dashboard.goodAfternoon");
    return translateFn("dashboard.goodEvening");
}

function quickActionKey(id: string): string {
    const map: Record<string, string> = {
        "add-tower": "quickActions.addTower",
        "add-flat": "quickActions.addFlat",
        "add-resident": "quickActions.addResident",
        "issue-invoice": "quickActions.issueInvoice",
        "allocate-parking": "quickActions.allocateParking",
        "raise-complaint": "quickActions.raiseComplaint",
        "book-facility": "quickActions.bookFacility",
        "log-visitor": "quickActions.logVisitor",
        "emergency-sos": "quickActions.emergency",
    };
    return map[id] ?? "common.create";
}

export default function DashboardPage() {
    const { auth, stats } = usePage<PageProps<{ stats: DashboardStats }>>().props;
    const { t } = useI18n();
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
    const isResident = stats.is_resident_dashboard || (userRoles.includes("Resident") && !user?.is_super_admin && !userRoles.includes("SocietyAdmin") && !userRoles.includes("Treasurer"));
    const isSecurity = stats.is_security_dashboard || userRoles.includes("SecurityGuard");

    return (
        <AppLayout>
            <Head title={t("dashboard.overview")} />

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {greeting(t)}, {firstName}
                        </h1>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                            {t(roleKey(primaryRoleLabel))}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {isResident ? "Resident Self-Service Hub • " : t("dashboard.adaptivePortal") + " "}
                        <span className="font-semibold text-foreground">
                            {auth.society?.name ?? t("dashboard.allSocieties")}
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
                            label={t(quickActionKey(act.id))}
                            variant={act.variant}
                        />
                    ))}
                </div>
            </div>

            {/* ── 1. RESIDENT ROLE DASHBOARD VIEW ─────────────────────────── */}
            {isResident ? (
                <div className="space-y-6">
                    {/* Resident Scoped KPI Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="My Residence"
                            value={stats.my_flat_no ? `Flat ${stats.my_flat_no}` : "Assigned Flat"}
                            hint={`${stats.my_tower_name || "Tower A"} • ${stats.my_flat_type || "Unit"} (${stats.my_ownership_type || "Owner"})`}
                            icon={DoorOpen}
                            accentColor="bg-primary"
                            iconColor="bg-primary/10 text-primary dark:text-primary border-primary/20"
                            trend={stats.my_ownership_type || "Primary Resident"}
                            trendDir="up"
                        />
                        <MetricCard
                            label="Maintenance Balance Due"
                            value={`₹ ${(stats.my_balance_due ?? 0).toLocaleString("en-IN")}`}
                            hint={(stats.my_balance_due ?? 0) > 0 ? "Pending payment due" : "All maintenance dues cleared"}
                            icon={CreditCard}
                            accentColor={(stats.my_balance_due ?? 0) > 0 ? "bg-destructive" : "bg-emerald-500"}
                            iconColor={(stats.my_balance_due ?? 0) > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}
                            trend={(stats.my_balance_due ?? 0) > 0 ? "Payment Due" : "All Clear"}
                            trendDir={(stats.my_balance_due ?? 0) > 0 ? "down" : "up"}
                        />
                        <MetricCard
                            label="My Active Complaints"
                            value={stats.my_open_complaints ?? 0}
                            hint="Open service & repair tickets"
                            icon={AlertCircle}
                            accentColor="bg-warning"
                            iconColor="bg-warning/10 text-warning dark:text-warning border-warning/20"
                            trend={(stats.my_open_complaints ?? 0) > 0 ? "In Progress" : "No Open Issues"}
                            trendDir={(stats.my_open_complaints ?? 0) > 0 ? "neutral" : "up"}
                        />
                        <MetricCard
                            label="Amenity Bookings"
                            value={stats.my_active_bookings ?? 0}
                            hint="Upcoming club & facility slots"
                            icon={Sparkles}
                            accentColor="bg-info"
                            iconColor="bg-info/10 text-info dark:text-info border-info/20"
                            trend={`${stats.active_notices} Active Notices`}
                            trendDir="up"
                        />
                    </div>

                    {/* Resident Portal Action Hub & Notice Board */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="col-span-2 border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-foreground">
                                            My Resident Services
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Quick access to your maintenance ledger, bookings, and helpdesk.
                                        </p>
                                    </div>
                                    <ActionLink href={safeRoute("invoices.index")} variant="teal">
                                        View My Invoices
                                    </ActionLink>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <Link
                                        href={safeRoute("invoices.index")}
                                        className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:border-primary/40 hover:shadow-sm"
                                    >
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                                            <ReceiptText className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Digital Invoices & Bills</p>
                                            <p className="text-xs text-muted-foreground">Download receipts & pay dues</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={safeRoute("amenities.index")}
                                        className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:border-info/40 hover:shadow-sm"
                                    >
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info border border-info/20">
                                            <Sparkles className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Book Amenities</p>
                                            <p className="text-xs text-muted-foreground">Pool, Clubhouse, Tennis & Gym</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={safeRoute("complaints.create")}
                                        className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:border-warning/40 hover:shadow-sm"
                                    >
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning border border-warning/20">
                                            <Wrench className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Raise Helpdesk Ticket</p>
                                            <p className="text-xs text-muted-foreground">Plumbing, electrical & repairs</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={safeRoute("notices.index")}
                                        className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:border-purple-500/40 hover:shadow-sm"
                                    >
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                            <Megaphone className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Society Circulars</p>
                                            <p className="text-xs text-muted-foreground">Official community notices</p>
                                        </div>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resident Quick Notification Board */}
                        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold text-foreground">
                                        Community Notices
                                    </CardTitle>
                                    <span className="rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-bold text-info border border-info/20">
                                        {stats.active_notices} Active
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                            <Megaphone className="size-4 text-info" />
                                            <span>Society Circulars & Updates</span>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                            Check the digital bulletin board for AGM announcements, maintenance schedules, and festive guidelines.
                                        </p>
                                        <div className="mt-3">
                                            <ActionLink href={safeRoute("notices.index")} variant="blue">
                                                Browse All Notices &rarr;
                                            </ActionLink>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : isSecurity ? (
                /* ── 2. SECURITY GUARD DASHBOARD VIEW ─────────────────────────── */
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Today's Visitor Passes"
                            value={stats.today_visitors ?? 0}
                            hint="Gate entries logged today"
                            icon={DoorOpen}
                            accentColor="bg-info"
                            iconColor="bg-info/10 text-info border-info/20"
                            trend="Gate Operations"
                            trendDir="up"
                        />
                        <MetricCard
                            label="Active CCTV Feeds"
                            value={stats.active_cctv ?? 0}
                            hint="Surveillance cameras online"
                            icon={Video}
                            accentColor="bg-emerald-500"
                            iconColor="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            trend="100% Operational"
                            trendDir="up"
                        />
                        <MetricCard
                            label="Emergency Logs (24h)"
                            value={stats.emergency_logs ?? 0}
                            hint="High priority SOS triggers"
                            icon={ShieldAlert}
                            accentColor="bg-destructive"
                            iconColor="bg-destructive/10 text-destructive border-destructive/20"
                            trend={(stats.emergency_logs ?? 0) > 0 ? "Review Required" : "All Clear"}
                            trendDir={(stats.emergency_logs ?? 0) > 0 ? "down" : "up"}
                        />
                        <MetricCard
                            label="Society Notices"
                            value={stats.active_notices}
                            hint="Active announcements"
                            icon={Megaphone}
                            accentColor="bg-purple-500"
                            iconColor="bg-purple-500/10 text-purple-500 border-purple-500/20"
                            trend="Broadcasts"
                            trendDir="neutral"
                        />
                    </div>
                </div>
            ) : (
                /* ── 3. SOCIETY ADMIN / TREASURER / MANAGEMENT VIEW ─────────── */
                <div className="space-y-6">
                    {/* Management KPI Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label={t("dashboard.totalResidents")}
                            value={stats.residents}
                            hint={t("dashboard.residentsHint")}
                            icon={Users}
                            accentColor="bg-info"
                            iconColor="bg-info/10 text-info dark:text-info border-info/20"
                            trend={t("dashboard.momTrend")}
                            trendDir="up"
                        />
                        <MetricCard
                            label={t("dashboard.propertyUnits")}
                            value={stats.flats}
                            hint={t("dashboard.occupiedSummary", {
                                occupied: stats.occupied_flats.toLocaleString(),
                                rate: occupancyRate,
                            })}
                            icon={DoorOpen}
                            accentColor="bg-info"
                            iconColor="bg-info/10 text-info dark:text-info border-info/20"
                            trend={t("dashboard.percentFull", { rate: occupancyRate })}
                            trendDir={occupancyRate >= 75 ? "up" : "neutral"}
                        />
                        <MetricCard
                            label={t("dashboard.openHelpdeskTickets")}
                            value={stats.open_complaints}
                            hint={t("dashboard.helpdeskHint")}
                            icon={AlertCircle}
                            accentColor="bg-warning"
                            iconColor="bg-warning/10 text-warning dark:text-warning border-warning/20"
                            trend={stats.open_complaints > 0 ? t("dashboard.requiresAction") : t("dashboard.allClear")}
                            trendDir={stats.open_complaints > 0 ? "down" : "up"}
                        />
                        <MetricCard
                            label={t("dashboard.pendingFinancialDues")}
                            value={stats.pending_payments}
                            hint={t("dashboard.financialHint")}
                            icon={CreditCard}
                            accentColor="bg-destructive"
                            iconColor="bg-destructive/10 text-destructive dark:text-destructive border-destructive/20"
                            trend={stats.pending_payments > 0 ? t("dashboard.outstandingDues") : t("dashboard.paidUp")}
                            trendDir={stats.pending_payments === 0 ? "up" : "neutral"}
                        />
                    </div>

                    {/* Mid Section: Occupancy + Task Panel */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Occupancy Card */}
                        <Card className="col-span-2 border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-foreground">
                                            {t("dashboard.occupancyAnalysis")}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {t("dashboard.occupancySubtitle")}
                                        </p>
                                    </div>
                                    <ActionLink href={safeRoute("flats.index")} variant="blue">
                                        {t("dashboard.viewFlatRegistry")}
                                    </ActionLink>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5">
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                                            {t("dashboard.occupiedCapacityRatio")}
                                        </span>
                                        <span className="font-bold tabular-nums text-foreground">{occupancyRate}%</span>
                                    </div>
                                    <Progress value={occupancyRate} className="h-2.5 bg-muted" />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                                        <p className="text-[11px] font-medium text-muted-foreground">{t("dashboard.totalUnits")}</p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{stats.flats.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
                                        <p className="text-[11px] font-medium text-brand dark:text-brand">{t("dashboard.occupied")}</p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-brand dark:text-brand">{stats.occupied_flats.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                                        <p className="text-[11px] font-medium text-muted-foreground">{t("dashboard.vacantUnits")}</p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-muted-foreground">{vacantFlats.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-xl border border-info/20 bg-info/5 p-3">
                                        <p className="text-[11px] font-medium text-info dark:text-info">{t("dashboard.activeTowers")}</p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-info dark:text-info">{stats.towers.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-accent/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="size-4 text-info" />
                                        <span>{t("dashboard.activeNoticesBroadcast")} <strong className="text-foreground">{stats.active_notices}</strong></span>
                                    </div>
                                    <span className="font-medium text-foreground">{t("dashboard.updatedLive")}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Col: Enterprise Task Panel */}
                        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold text-foreground">
                                        {t("dashboard.actionItemsQueue")}
                                    </CardTitle>
                                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning dark:text-warning border border-warning/20">
                                        {t("dashboard.priorityMatrix")}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2.5">
                                    <TaskQueueItem
                                        icon={AlertCircle}
                                        iconClass="text-warning"
                                        label={t("dashboard.reviewOpenTickets")}
                                        count={stats.open_complaints}
                                        priority={t("dashboard.priorityHigh")}
                                        priorityColor="bg-warning/10 text-warning dark:text-warning"
                                        href={safeRoute("complaints.index")}
                                    />
                                    <TaskQueueItem
                                        icon={CreditCard}
                                        iconClass="text-destructive"
                                        label={t("dashboard.collectOutstandingInvoices")}
                                        count={stats.pending_payments}
                                        priority={t("dashboard.priorityUrgent")}
                                        priorityColor="bg-destructive/10 text-destructive dark:text-destructive"
                                        href={safeRoute("invoices.index")}
                                    />
                                    <TaskQueueItem
                                        icon={Megaphone}
                                        iconClass="text-info"
                                        label={t("dashboard.activeSocietyNotices")}
                                        count={stats.active_notices}
                                        priority={t("dashboard.priorityNormal")}
                                        priorityColor="bg-info/10 text-info dark:text-info"
                                        href={safeRoute("notices.index")}
                                    />
                                    <TaskQueueItem
                                        icon={DoorOpen}
                                        iconClass="text-info"
                                        label={t("dashboard.visitorPassVerification")}
                                        count={null}
                                        priority={t("dashboard.priorityNormal")}
                                        priorityColor="bg-info/10 text-info dark:text-info"
                                        href={safeRoute("visitors.index")}
                                    />
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Analytics: Occupancy + Portfolio */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <OccupancyCompositionCard stats={stats} />
                        <PortfolioSnapshotCard stats={stats} />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function TaskQueueItem({
    icon: Icon,
    iconClass,
    label,
    count,
    priority,
    priorityColor,
    href,
}: {
    icon: React.ElementType;
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
                className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-2.5 text-xs transition-colors hover:bg-muted/50"
            >
                <div className="flex items-center gap-2.5">
                    <Icon className={`size-4 ${iconClass}`} />
                    <span className="font-medium text-foreground">{label}</span>
                    {count !== null && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-foreground">
                            {count}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColor}`}>
                        {priority}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                </div>
            </Link>
        </li>
    );
}
