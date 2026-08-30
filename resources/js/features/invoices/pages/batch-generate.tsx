import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    AlertTriangle,
    CalendarCog,
    CheckCircle2,
    History,
    Play,
    Settings2,
    ShieldCheck,
    Square,
    SquareCheck,
    Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";
import type { PageProps } from "@/types";
import { useI18n } from "@/lib/i18n";

type PlanFlat = {
    id: number;
    uuid: string;
    flat_no: string;
    tower: string | null;
    area_sqft: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    already_billed: boolean;
    excluded: boolean;
};

type PlanTotals = {
    total_flats: number;
    excluded_flats: number;
    skipped_flats: number;
    billed_flats: number;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
};

type Plan = {
    billing_period: string;
    issue_date: string;
    due_date: string;
    config: {
        billing_mode: "per_sqft" | "fixed";
        base_rate: number;
        tax_rate: number;
        due_day: number;
        grace_days: number;
        penalty_rate: number;
        penalty_cap: number | null;
        is_active: boolean;
    } | null;
    is_configured: boolean;
    flats: PlanFlat[];
    totals: PlanTotals;
};

type RecentRun = {
    billing_period: string;
    invoices_generated: number;
    total_amount: number;
    status: string;
    created_at: string;
};

type BatchGenerateProps = {
    plan: Plan;
    period: string;
    recent_runs: RecentRun[];
    can: { run: boolean; configure: boolean };
};

function money(value: number | null | undefined) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function runStatusBadge(status: string) {
    if (status === "Completed") {
        return (
            <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                Completed
            </Badge>
        );
    }
    if (status === "Failed") {
        return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
}

export default function BatchGenerate() {
    const { t } = useI18n();
    const { plan, period, recent_runs, can } = usePage<PageProps<BatchGenerateProps>>().props;

    const [excluded, setExcluded] = useState<Set<number>>(
        () => new Set(plan.flats.filter((f) => f.excluded).map((f) => f.id))
    );
    const form = useForm({ billing_period: period, excluded_flat_ids: [] as number[] });

    const toggleFlat = (id: number) => {
        setExcluded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const run = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData("excluded_flat_ids", Array.from(excluded));
        form.post(route("billing.run"), {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ["plan", "recent_runs"] }),
        });
    };

    const changePeriod = (value: string) => {
        if (!/^\d{4}-\d{2}$/.test(value)) return;
        form.setData("billing_period", value);
        router.get(route("billing.preview"), { period: value }, { preserveState: true, replace: true });
    };

    const billedFlats = useMemo(
        () => plan.flats.filter((f) => !f.excluded && !f.already_billed),
        [plan.flats, excluded]
    );

    return (
        <AppLayout>
            <Head title={t("invoices.batchGenerateTitle")} />

            <PageHeader
                title={t("invoices.batchGenerateTitle")}
                description={t("invoices.batchGenerateDesc")}
                icon={<CalendarCog className="size-5" />}
                breadcrumbs={[{ label: t("nav.finance") }, { label: t("invoices.batchGenerateCrumb") }]}
                actions={
                    can.configure ? (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route("billing.settings")}>
                                <Settings2 className="size-4" />
                                {t("common.settings")}
                            </Link>
                        </Button>
                    ) : null
                }
            />

            {!plan.is_configured && (
                <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning dark:text-warning">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div>
                        <p className="font-semibold">Billing is not configured yet.</p>
                        <p className="text-muted-foreground">
                            No active billing configuration exists for this society. Configure rates,
                            due day and penalty policy before running a batch.
                        </p>
                        {can.configure && (
                            <Button variant="outline" size="sm" className="mt-3" asChild>
                                <Link href={route("billing.settings")}>
                                    <Settings2 className="size-4" />
                                    Configure Billing
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Billed Flats"
                    value={plan.totals.billed_flats}
                    hint={`of ${plan.totals.total_flats} total`}
                    icon={Zap}
                    accentColor="bg-primary"
                />
                <MetricCard
                    label="Subtotal"
                    value={money(plan.totals.subtotal)}
                    hint="Before tax"
                    icon={CalendarCog}
                    accentColor="bg-info"
                    iconColor="bg-info/10 text-info border-info/20"
                />
                <MetricCard
                    label="Tax"
                    value={money(plan.totals.tax_amount)}
                    hint={`${plan.config?.tax_rate ?? 0}% GST`}
                    icon={ShieldCheck}
                    accentColor="bg-info"
                    iconColor="bg-info/10 text-info border-info/20"
                />
                <MetricCard
                    label="Total"
                    value={money(plan.totals.total_amount)}
                    hint={plan.config?.billing_mode === "fixed" ? "Fixed rate" : "Per sq.ft."}
                    icon={CheckCircle2}
                    accentColor="bg-brand"
                    iconColor="bg-brand/10 text-brand border-brand/20"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Run Preview — {plan.billing_period}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="billing_period" className="text-xs font-medium text-muted-foreground">
                                Billing Period (YYYY-MM)
                            </label>
                            <input
                                id="billing_period"
                                type="month"
                                value={form.data.billing_period}
                                onChange={(e) => changePeriod(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Issue: <span className="font-medium text-foreground">{plan.issue_date}</span>
                            {" · "}Due: <span className="font-medium text-foreground">{plan.due_date}</span>
                            {" · "}Grace: <span className="font-medium text-foreground">{plan.config?.grace_days ?? 0} days</span>
                            {" · "}Penalty: <span className="font-medium text-foreground">{plan.config?.penalty_rate ?? 0}%</span>
                        </div>
                    </div>

                    {plan.flats.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-border/60">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-3 py-2 font-medium w-10">Excl.</th>
                                        <th className="px-3 py-2 font-medium">Flat</th>
                                        <th className="px-3 py-2 font-medium">Tower</th>
                                        <th className="px-3 py-2 font-medium text-right">Qty</th>
                                        <th className="px-3 py-2 font-medium text-right">Rate</th>
                                        <th className="px-3 py-2 font-medium text-right">Subtotal</th>
                                        <th className="px-3 py-2 font-medium text-right">Tax</th>
                                        <th className="px-3 py-2 font-medium text-right">Total</th>
                                        <th className="px-3 py-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.flats.map((flat) => {
                                        const isExcluded = excluded.has(flat.id);
                                        return (
                                            <tr
                                                key={flat.id}
                                                className={cn(
                                                    "border-b last:border-0",
                                                    isExcluded && "bg-muted/30 opacity-60"
                                                )}
                                            >
                                                <td className="px-3 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleFlat(flat.id)}
                                                        disabled={flat.already_billed}
                                                        className="text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                                                        aria-label={`Toggle exclude flat ${flat.flat_no}`}
                                                    >
                                                        {isExcluded ? (
                                                            <SquareCheck className="size-4 text-primary" />
                                                        ) : (
                                                            <Square className="size-4" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2 font-medium">{flat.flat_no}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{flat.tower ?? "—"}</td>
                                                <td className="px-3 py-2 text-right tabular-nums">{flat.quantity}</td>
                                                <td className="px-3 py-2 text-right tabular-nums">{money(flat.unit_price)}</td>
                                                <td className="px-3 py-2 text-right tabular-nums">{money(flat.subtotal)}</td>
                                                <td className="px-3 py-2 text-right tabular-nums">{money(flat.tax_amount)}</td>
                                                <td className="px-3 py-2 text-right font-semibold tabular-nums">{money(flat.total_amount)}</td>
                                                <td className="px-3 py-2">
                                                    {flat.already_billed ? (
                                                        <Badge variant="secondary">Already Billed</Badge>
                                                    ) : isExcluded ? (
                                                        <Badge variant="outline">Excluded</Badge>
                                                    ) : (
                                                        <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                                                            Ready
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-muted/40 font-semibold">
                                        <td colSpan={5} className="px-3 py-2.5">
                                            Totals ({billedFlats.length} flats to bill
                                            {plan.totals.skipped_flats > 0
                                                ? `, ${plan.totals.skipped_flats} skipped`
                                                : ""}
                                            {plan.totals.excluded_flats > 0
                                                ? `, ${plan.totals.excluded_flats} excluded`
                                                : ""}
                                            )
                                        </td>
                                        <td className="px-3 py-2.5 text-right tabular-nums">{money(plan.totals.subtotal)}</td>
                                        <td className="px-3 py-2.5 text-right tabular-nums">{money(plan.totals.tax_amount)}</td>
                                        <td className="px-3 py-2.5 text-right tabular-nums">{money(plan.totals.total_amount)}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No flats found for this society.
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                            {excluded.size > 0
                                ? `${excluded.size} flat(s) excluded from this run.`
                                : "No exclusions selected."}
                        </p>
                        <Button type="submit" disabled={!can.run || plan.flats.length === 0} onClick={run}>
                            <Play className="size-4" />
                            Run Billing for {form.data.billing_period}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {recent_runs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <History className="size-4" />
                            Recent Runs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-border/60">
                            {recent_runs.map((run) => (
                                <div key={`${run.billing_period}-${run.created_at}`} className="flex items-center justify-between py-2.5 text-sm">
                                    <div>
                                        <p className="font-medium">{run.billing_period}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {run.invoices_generated} invoice(s) · {money(run.total_amount)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(run.created_at).toLocaleString()}
                                        </span>
                                        {runStatusBadge(run.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </AppLayout>
    );
}
