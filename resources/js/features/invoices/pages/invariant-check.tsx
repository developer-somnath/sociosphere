import { Head, Link, router, usePage } from "@inertiajs/react";
import { CheckCircle2, ClipboardCheck, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import type { PageProps } from "@/types";
import { useI18n } from "@/lib/i18n";

type InvariantCheckProps = {
    healthy: boolean;
    violations: string[];
    checked_at: string;
    stats: {
        invoices: number;
        total_billed: number;
        total_collected: number;
    };
    can: { configure: boolean };
};

function money(value: number | null | undefined) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

export default function InvariantCheck() {
    const { t } = useI18n();
    const { healthy, violations, checked_at, stats, can } = usePage<PageProps<InvariantCheckProps>>().props;

    const recheck = () => {
        router.reload({ only: ["healthy", "violations", "checked_at", "stats"] });
    };

    return (
        <AppLayout>
            <Head title={t("invoices.invariantHeadTitle")} />

            <PageHeader
                title={t("invoices.invariantTitle")}
                description="Validate that invoices and payments are always consistent."
                icon={<ClipboardCheck className="size-5" />}
                breadcrumbs={[{ label: t("nav.finance") }, { label: t("invoices.invariantCrumb") }]}
                actions={
                    <Button variant="outline" size="sm" onClick={recheck}>
                        <RefreshCw className="size-4" />
                        Re-check
                    </Button>
                }
            />

            <div className="flex items-start gap-3 rounded-xl border p-4 text-sm"
                style={
                    healthy
                        ? { borderColor: "rgb(16 185 129 / 0.3)", background: "rgb(16 185 129 / 0.05)" }
                        : { borderColor: "rgb(245 158 11 / 0.3)", background: "rgb(245 158 11 / 0.05)" }
                }
            >
                {healthy ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand dark:text-brand" />
                ) : (
                    <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning dark:text-warning" />
                )}
                <div>
                    <p className="font-semibold">
                        {healthy ? "All financial invariants hold." : "Financial invariant violations detected."}
                    </p>
                    <p className="text-muted-foreground">
                        Checked at {new Date(checked_at).toLocaleString()} —{" "}
                        {violations.length === 0
                            ? "Invoices match payments, statuses are consistent, and no orphan payments exist."
                            : `${violations.length} issue(s) require attention.`}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                    label="Invoices"
                    value={stats.invoices}
                    hint="In society scope"
                    icon={ClipboardCheck}
                    accentColor="bg-primary"
                />
                <MetricCard
                    label="Total Billed"
                    value={money(stats.total_billed)}
                    hint="Sum of invoice totals"
                    icon={ShieldCheck}
                    accentColor="bg-info"
                    iconColor="bg-info/10 text-info border-info/20"
                />
                <MetricCard
                    label="Total Collected"
                    value={money(stats.total_collected)}
                    hint="Sum of paid amounts"
                    icon={ShieldCheck}
                    accentColor="bg-brand"
                    iconColor="bg-brand/10 text-brand border-brand/20"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="size-4" />
                        Violation Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {violations.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                                Healthy
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                No violations found. Financial records are consistent.
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {violations.map((violation, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm"
                                >
                                    <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning dark:text-warning" />
                                    <span>{violation}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {!healthy && can.configure && (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 p-4 text-sm">
                    <div>
                        <p className="font-semibold">Need to fix an invoice?</p>
                        <p className="text-xs text-muted-foreground">
                            Correct invoices from the Invoices module, or record missing payments from Payments.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route("invoices.index")}>Invoices</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route("payments.index")}>Payments</Link>
                        </Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
