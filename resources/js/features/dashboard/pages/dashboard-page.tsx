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
    const isSecurity = userRoles.includes("SecurityGuard") || userRoles.includes("SecurityManager");
    const isResidentOnly = userRoles.includes("Resident") && !user?.is_super_admin && !userRoles.includes("SocietyAdmin");

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
                        {t("dashboard.adaptivePortal")}{" "}
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

            {/* ── Role-Driven KPI Grid ────────────────────────────────────── */}
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

            {/* ── Mid Section: Occupancy + Task Panel ─────────────────────── */}
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
                        {/* Visual Progress */}
                        <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5">
                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t("dashboard.occupiedCapacityRatio")}
                                </span>
                                <span className="font-bold tabular-nums text-foreground">{occupancyRate}%</span>
                            </div>
                            <Progress value={occupancyRate} className="h-2.5 bg-muted" />
                        </div>

                        {/* Breakdown Metrics Grid */}
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

                        {/* Bottom Info Bar */}
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
                                href={safeRoute("visitors.index")}
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

            {/* ── Analytics: Occupancy + Portfolio ──────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
                <OccupancyCompositionCard stats={stats} />
                <PortfolioSnapshotCard stats={stats} />
            </div>

            {/* ── Bottom: Grouped Enterprise Quick Operations Grid ─────── */}
            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("dashboard.groupedQuickOps")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <QuickOpCard
                            title={t("dashboard.propertySetup")}
                            description={t("dashboard.propertySetupDesc")}
                            icon={Building2}
                            accentColor="border-info/20 bg-info/5 text-info"
                            actions={[
                                { label: t("quickActions.addTower"), href: safeRoute("towers.create") },
                                { label: t("quickActions.addFlat"), href: safeRoute("flats.create") },
                            ]}
                        />
                        <QuickOpCard
                            title={t("dashboard.residentServices")}
                            description={t("dashboard.residentServicesDesc")}
                            icon={Users}
                            accentColor="border-info/20 bg-info/5 text-info"
                            actions={[
                                { label: t("quickActions.addResident"), href: safeRoute("residents.create") },
                                { label: t("quickActions.allocateParking"), href: safeRoute("parking-slots.create") },
                            ]}
                        />
                        <QuickOpCard
                            title={t("dashboard.financialHelpdesk")}
                            description={t("dashboard.financialHelpdeskDesc")}
                            icon={ReceiptText}
                            accentColor="border-destructive/20 bg-destructive/5 text-destructive"
                            actions={[
                                { label: t("quickActions.issueInvoice"), href: safeRoute("invoices.create") },
                                { label: t("quickActions.raiseComplaint"), href: safeRoute("complaints.create") },
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
