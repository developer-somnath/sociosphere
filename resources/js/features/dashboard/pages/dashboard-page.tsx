import { Head, Link, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CreditCard,
    DoorOpen,
    Megaphone,
    Users,
    type LucideIcon,
} from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { DashboardStats, PageProps } from "@/types";

type StatCardProps = {
    label: string;
    value: number;
    hint?: string;
    icon: LucideIcon;
    accent: string;
};

function StatCard({ label, value, hint, icon: Icon, accent }: StatCardProps) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">
                        {value.toLocaleString()}
                    </p>
                    {hint ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {hint}
                        </p>
                    ) : null}
                </div>
                <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
                >
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

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

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">
                    {greeting()}, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Here's what's happening at{" "}
                    <span className="font-medium text-foreground">
                        {auth.society?.name ?? "your society"}
                    </span>{" "}
                    today.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Residents"
                    value={stats.residents}
                    hint="Registered owners & tenants"
                    icon={Users}
                    accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                />
                <StatCard
                    label="Property Units"
                    value={stats.flats}
                    hint={`${stats.occupied_flats.toLocaleString()} occupied (${occupancyRate}%)`}
                    icon={DoorOpen}
                    accent="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
                />
                <StatCard
                    label="Towers"
                    value={stats.towers}
                    hint="Blocks under management"
                    icon={Building2}
                    accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                />
                <StatCard
                    label="Open Complaints"
                    value={stats.open_complaints}
                    hint="Awaiting resolution"
                    icon={AlertCircle}
                    accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                />
                <StatCard
                    label="Active Notices"
                    value={stats.active_notices}
                    hint="Currently published"
                    icon={Megaphone}
                    accent="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                />
                <StatCard
                    label="Pending Payments"
                    value={stats.pending_payments}
                    hint="Outstanding invoices"
                    icon={CreditCard}
                    accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                />
            </div>

            <Separator className="my-2" />

            <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                    Quick Actions
                </h2>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <Link href={route("residents.index")}>
                            View Residents
                            <ArrowRight />
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={route("flats.index")}>
                            View Property Units
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
