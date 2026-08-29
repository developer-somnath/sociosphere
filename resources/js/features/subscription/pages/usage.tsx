import { Head, Link, usePage } from "@inertiajs/react";
import { Gauge, Infinity as InfinityIcon, Sparkles } from "lucide-react";
import { BackButton } from "@/components/app/back-button";
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

type UsageProps = {
    subscription: {
        uuid: string;
        status: string;
        billing_cycle: string;
        price: number;
        currency: string;
        plan: { uuid: string; name: string; code: string } | null;
    } | null;
    usage: UsageRow[];
    can: { manage: boolean };
};

function progressVariant(status: UsageRow["status"]): "brand" | "success" | "warning" | "destructive" {
    if (status === "over") return "destructive";
    if (status === "at" || status === "warn") return "warning";
    return "success";
}

export default function SubscriptionUsage() {
    const { subscription, usage, can } = usePage<PageProps<UsageProps>>().props;
    const { t } = useI18n();

    const overCount = usage.filter((row) => row.status === "over").length;
    const nearCount = usage.filter((row) => row.status === "warn" || row.status === "at").length;

    return (
        <AppLayout>
            <Head title={t("subscription.usageTitle")} />

            <PageHeader
                title={t("subscription.usageTitle")}
                description="Detailed breakdown of resource consumption against your plan limits."
                icon={<Gauge className="size-5" />}
                breadcrumbs={[{ label: t("nav.subscription") }, { label: t("subscription.usageCrumb") }]}
                actions={
                    <BackButton routeName="subscription.show" label={t("subscription.backToOverview")} />
                }
            />

            <div className="space-y-6">
                {/* ── Summary strip ─────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
                            <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                                <Sparkles className="size-4 text-primary" />
                                {subscription?.plan?.name ?? "No plan"}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {subscription ? `${subscription.billing_cycle} · ${subscription.status}` : "No active subscription"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">At / Over Limit</p>
                            <p className="mt-1 text-lg font-bold tabular-nums text-warning">{nearCount + overCount}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {overCount > 0 ? `${overCount} over the limit` : "within plan limits"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Unlimited Resources</p>
                            <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                                <InfinityIcon className="size-4 text-brand" />
                                {usage.filter((row) => row.limit === null).length}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">resources with no cap</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Full usage table ──────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Usage by Resource</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {usage.length === 0 ? (
                            <EmptyState
                                icon={Gauge}
                                title={t("subscription.emptyUsage")}
                                description="Entitlement usage will appear here once the plan is configured."
                            />
                        ) : (
                            <div className="space-y-5">
                                {usage.map((row) => (
                                    <div key={row.key} className="rounded-2xl border border-border/60 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{t(row.label)}</span>
                                                {row.status === "over" && <Badge variant="destructive">Over Limit</Badge>}
                                                {row.status === "at" && <Badge variant="warning">At Limit</Badge>}
                                                {row.status === "warn" && <Badge variant="warning">Near Limit</Badge>}
                                            </div>
                                            <span className="text-sm tabular-nums text-muted-foreground">
                                                {row.limit === null ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <InfinityIcon className="size-3.5 text-brand" />
                                                        Unlimited
                                                    </span>
                                                ) : (
                                                    `${row.used.toLocaleString()} of ${row.limit.toLocaleString()}`
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <Progress
                                                value={row.pct ?? 0}
                                                variant={progressVariant(row.status)}
                                                className="h-2.5 flex-1"
                                            />
                                            <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                                                {row.pct === null ? "—" : `${row.pct}%`}
                                            </span>
                                        </div>
                                        {row.limit !== null && (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {row.remaining !== null && row.remaining > 0
                                                    ? `${row.remaining.toLocaleString()} remaining before the plan limit`
                                                    : "No remaining capacity on this plan"}
                                            </p>
                                        )}
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
