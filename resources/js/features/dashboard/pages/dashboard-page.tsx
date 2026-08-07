import { Head, Link, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowRight,
    BadgeCheck,
    Building2,
    CreditCard,
    DoorOpen,
    Megaphone,
    Sparkles,
    Users,
    Wallet2,
} from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Separator } from "@/components/ui/separator";
import type { DashboardStats, PageProps } from "@/types";

function greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 17) {
        return "Good afternoon";
    }

    return "Good evening";
}

export default function DashboardPage() {
    const { auth, stats } = usePage<PageProps<{ stats: DashboardStats }>>()
        .props;

    const firstName = auth.user?.name.split(" ")[0] ?? "there";
    const occupancyRate =
        stats.flats > 0
            ? Math.round((stats.occupied_flats / stats.flats) * 100)
            : 0;

    return (
        <AppLayout>
            <Head title="Overview" />

            <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                                <Sparkles className="size-3" />
                                Premium operations hub
                            </Badge>
                            <Badge variant="outline" className="rounded-full">
                                <BadgeCheck className="size-3" />
                                Live overview
                            </Badge>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                {greeting()}, {firstName}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Here’s what’s happening at{" "}
                                <span className="font-medium text-foreground">
                                    {auth.society?.name ?? "your society"}
                                </span>{" "}
                                today.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route("residents.index")}>
                                Residents
                                <ArrowRight />
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route("flats.index")}>
                                Property units
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                    label="Residents"
                    value={stats.residents}
                    hint="Registered owners & tenants"
                    icon={Users}
                    accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    trend="+4.2%"
                />
                <MetricCard
                    label="Property units"
                    value={stats.flats}
                    hint={`${stats.occupied_flats.toLocaleString()} occupied (${occupancyRate}%)`}
                    icon={DoorOpen}
                    accent="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
                    trend="Stable"
                />
                <MetricCard
                    label="Open complaints"
                    value={stats.open_complaints}
                    hint="Awaiting resolution"
                    icon={AlertCircle}
                    accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    trend="Priority"
                />
                <MetricCard
                    label="Active notices"
                    value={stats.active_notices}
                    hint="Currently published"
                    icon={Megaphone}
                    accent="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                />
                <MetricCard
                    label="Pending payments"
                    value={stats.pending_payments}
                    hint="Outstanding invoices"
                    icon={CreditCard}
                    accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    trend="Due soon"
                />
                <MetricCard
                    label="Tower coverage"
                    value={stats.towers}
                    hint="Blocks under management"
                    icon={Building2}
                    accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
                <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet2 className="size-4 text-primary" />
                            Society snapshot
                        </CardTitle>
                        <CardDescription>
                            A premium view of financial and operational health for the community.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Occupancy performance</p>
                                    <p className="text-sm text-muted-foreground">{occupancyRate}% of units currently occupied</p>
                                </div>
                                <div className="text-2xl font-semibold text-foreground">{occupancyRate}%</div>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                                <p className="text-sm text-muted-foreground">Resident engagement</p>
                                <p className="mt-2 text-xl font-semibold text-foreground">High activity</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                                <p className="text-sm text-muted-foreground">Payment posture</p>
                                <p className="mt-2 text-xl font-semibold text-foreground">Healthy</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                    <CardHeader>
                        <CardTitle>Next best actions</CardTitle>
                        <CardDescription>Suggested follow-up for the management team.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                            <p className="text-sm font-medium text-foreground">Review pending payments</p>
                            <p className="text-sm text-muted-foreground">Keep billing momentum strong before dues pile up.</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                            <p className="text-sm font-medium text-foreground">Prioritize unresolved complaints</p>
                            <p className="text-sm text-muted-foreground">Improve satisfaction with faster follow-up.</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                            <p className="text-sm font-medium text-foreground">Publish a fresh notice</p>
                            <p className="text-sm text-muted-foreground">Keep residents informed about community updates.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
