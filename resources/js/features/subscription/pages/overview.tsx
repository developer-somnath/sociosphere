import { Head, usePage } from "@inertiajs/react";
import { ArrowUpRight, CheckCircle2, CreditCard, Gauge, Sparkles, TriangleAlert } from "lucide-react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type UsageRow = {
    key: string;
    label: string;
    used: number;
    limit: number | null;
    remaining: number | null;
    pct: number | null;
    status: "ok" | "warn" | "at" | "over";
};

type SubscriptionPayload = {
    uuid: string;
    status: string;
    billing_cycle: string;
    price: number;
    currency: string;
    starts_at: string | null;
    trial_ends_at: string | null;
    ends_at: string | null;
    cancelled_at: string | null;
    plan: {
        uuid: string;
        name: string;
        code: string;
        description: string | null;
        price_monthly: number;
        price_yearly: number;
        currency: string;
        is_default: boolean;
        features: { feature_key: string; limit_value: number | null }[];
    } | null;
};

type OverviewProps = {
    subscription: SubscriptionPayload | null;
    usage: UsageRow[];
    can: { manage: boolean };
};

function statusBadge(status: string) {
    switch (status) {
        case "trialing":
            return (
                <Badge className="border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info">
                    Trialing
                </Badge>
            );
        case "active":
            return (
                <Badge variant="success">Active</Badge>
            );
        case "past_due":
            return <Badge variant="warning">Past Due</Badge>;
        case "cancelled":
            return <Badge variant="secondary">Cancelled</Badge>;
        case "expired":
            return <Badge variant="destructive">Expired</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function money(value: number, currency: string) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function progressVariant(status: UsageRow["status"]): "brand" | "success" | "warning" | "destructive" {
    if (status === "over") return "destructive";
    if (status === "at") return "warning";
    if (status === "warn") return "warning";
    return "success";
}

export default function SubscriptionOverview() {
    const { subscription, usage, can } = usePage<PageProps<OverviewProps>>().props;
    const { t, formatDate } = useI18n();

    return (
        <AppLayout>
            <Head title={t("subscription.overviewTitle")} />

            <PageHeader
                title={t("subscription.overviewTitle")}
                description="Your society plan, billing cycle and resource entitlements."
                icon={<Sparkles className="size-5" />}
                breadcrumbs={[{ label: t("nav.subscription") }, { label: t("subscription.overviewCrumb") }]}
                actions={
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("subscription.usage")}>
                            <Gauge className="size-4" />
                            Usage Details
                        </Link>
                    </Button>
                }
            />

            <div className="space-y-6">
                {/* ── Plan card ─────────────────────────────────────────── */}
                {subscription === null ? (
                    <Card>
                        <CardContent className="pt-6">
                            <EmptyState
                                icon={CreditCard}
                                title={t("subscription.emptySubscription")}
                                description="This society does not have an active plan yet. Contact the platform administrator to assign a subscription."
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card className="sm:col-span-2">
                            <CardHeader className="flex flex-row items-start justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">{subscription.plan?.name ?? "—"}</CardTitle>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {subscription.plan?.description ?? "No description"}
                                    </p>
                                </div>
                                {statusBadge(subscription.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                                        <p className="mt-1 text-xl font-bold tabular-nums">
                                            {money(subscription.price, subscription.currency)}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {" "}/ {subscription.billing_cycle}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Started</p>
                                        <p className="mt-1 text-sm font-medium">
                                            {subscription.starts_at ? formatDate(subscription.starts_at) : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {subscription.status === "cancelled" ? "Cancelled" : "Renews"}
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {subscription.ends_at ? formatDate(subscription.ends_at) : "—"}
                                        </p>
                                    </div>
                                </div>
                                {subscription.trial_ends_at && subscription.status === "trialing" && (
                                    <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <CheckCircle2 className="size-3.5 text-info" />
                                        Trial ends {formatDate(subscription.trial_ends_at)} — then converts to the paid plan.
                                    </p>
                                )}
                                {subscription.cancelled_at && (
                                    <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <TriangleAlert className="size-3.5 text-warning" />
                                        Cancelled on {formatDate(subscription.cancelled_at)} — access continues until the period ends.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Plan Limits</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2.5">
                                {subscription.plan?.features.map((feature) => (
                                    <div key={feature.feature_key} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t(`feature.${feature.feature_key}`)}</span>
                                        <span className="font-medium tabular-nums">
                                            {feature.limit_value === null ? "∞ Unlimited" : feature.limit_value}
                                        </span>
                                    </div>
                                ))}
                                {(!subscription.plan?.features || subscription.plan.features.length === 0) && (
                                    <p className="text-sm text-muted-foreground">No per-resource limits configured.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ── Usage snapshot ─────────────────────────────────────── */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="text-base">Resource Usage</CardTitle>
                        {can.manage && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route("subscriptions.index")}>
                                    <ArrowUpRight className="size-4" />
                                    Manage Subscriptions
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {usage.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No usage data available.</p>
                        ) : (
                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                                {usage.map((row) => (
                                    <div key={row.key}>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium">{t(row.label)}</span>
                                            <span className="tabular-nums text-muted-foreground">
                                                {row.limit === null
                                                    ? `${row.used.toLocaleString()} / ∞`
                                                    : `${row.used.toLocaleString()} / ${row.limit.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-3">
                                            <Progress
                                                value={row.pct ?? 0}
                                                variant={progressVariant(row.status)}
                                                className="flex-1"
                                            />
                                            {row.status === "over" && (
                                                <Badge variant="destructive">Over</Badge>
                                            )}
                                            {row.status === "at" && <Badge variant="warning">At Limit</Badge>}
                                            {row.status === "warn" && <Badge variant="warning">Near Limit</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
