import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowDownToLine, CheckCircle2, PauseCircle, PlayCircle, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type PlanOption = {
    uuid: string;
    name: string;
    code: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
};

type SocietyRow = {
    id: number;
    uuid: string;
    name: string;
    city: string | null;
    subscription: {
        uuid: string;
        status: string;
        billing_cycle: string;
        plan: { uuid: string; name: string; code: string } | null;
    } | null;
    usage_summary: {
        flats: { used: number; limit: number | null };
        users: { used: number; limit: number | null };
        towers: { used: number; limit: number | null };
    };
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type AdminProps = {
    societies: Paginated<SocietyRow>;
    plans: PlanOption[];
    filters: { search: string };
    can: { assign: boolean };
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
            return <Badge variant="success">Active</Badge>;
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

function usageCell(used: number, limit: number | null) {
    if (limit === null) return `${used.toLocaleString()} / ∞`;
    const atLimit = used >= limit;
    return (
        <span className={atLimit ? "font-semibold text-warning" : ""}>
            {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
    );
}

export default function SubscriptionAdmin() {
    const { societies, plans, filters, can } = usePage<PageProps<AdminProps>>().props;
    const { t, formatCurrency } = useI18n();
    const [search, setSearch] = useState(filters.search);
    const isFirstRender = useRef(true);

    const [assigning, setAssigning] = useState<SocietyRow | null>(null);
    const [cancelling, setCancelling] = useState<SocietyRow | null>(null);
    const [resuming, setResuming] = useState<SocietyRow | null>(null);

    const assignForm = useForm({
        plan_uuid: "",
        billing_cycle: "monthly",
        trial_days: "",
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timeout = window.setTimeout(() => {
            router.get(
                route("subscriptions.index"),
                { ...(search.trim() ? { search: search.trim() } : {}), page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => window.clearTimeout(timeout);
    }, [search]);

    const openAssign = (society: SocietyRow) => {
        setAssigning(society);
        assignForm.reset();
        assignForm.setData("plan_uuid", plans[0]?.uuid ?? "");
    };

    const submitAssign = () => {
        if (!assigning) return;
        assignForm.post(route("subscriptions.assign", assigning.uuid), {
            preserveScroll: true,
            onSuccess: () => setAssigning(null),
        });
    };

    const submitCancel = () => {
        if (!cancelling?.subscription) return;
        router.post(route("subscriptions.cancel", cancelling.subscription.uuid), {}, {
            preserveScroll: true,
            onSuccess: () => setCancelling(null),
        });
    };

    const submitResume = () => {
        if (!resuming?.subscription) return;
        router.post(route("subscriptions.resume", resuming.subscription.uuid), {}, {
            preserveScroll: true,
            onSuccess: () => setResuming(null),
        });
    };

    return (
        <AppLayout>
            <Head title={t("subscription.adminTitle")} />

            <PageHeader
                title={t("subscription.adminTitle")}
                description="Assign and manage subscription plans across all societies."
                icon={<Settings2 className="size-5" />}
                breadcrumbs={[{ label: t("nav.subscription") }, { label: "Admin" }]}
            />

            <Card>
                <CardContent className="pt-6">
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search societies…"
                        searchLabel="Search"
                    />

                    {societies.data.length === 0 ? (
                        <EmptyState
                            icon={Settings2}
                            title={t("subscription.emptySocieties")}
                            description="Try a different search term."
                        />
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-3 py-2 font-medium">Society</th>
                                        <th className="px-3 py-2 font-medium">Plan</th>
                                        <th className="px-3 py-2 font-medium">Status</th>
                                        <th className="px-3 py-2 font-medium">Cycle</th>
                                        <th className="px-3 py-2 font-medium">Towers</th>
                                        <th className="px-3 py-2 font-medium">Flats</th>
                                        <th className="px-3 py-2 font-medium">Users</th>
                                        <th className="px-3 py-2 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {societies.data.map((society) => (
                                        <tr key={society.id} className="border-b last:border-0">
                                            <td className="px-3 py-2.5">
                                                <p className="font-medium">{society.name}</p>
                                                {society.city && (
                                                    <p className="text-xs text-muted-foreground">{society.city}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {society.subscription?.plan?.name ?? (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {society.subscription ? statusBadge(society.subscription.status) : <Badge variant="outline">None</Badge>}
                                            </td>
                                            <td className="px-3 py-2.5 capitalize">
                                                {society.subscription?.billing_cycle ?? "—"}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {usageCell(society.usage_summary.towers.used, society.usage_summary.towers.limit)}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {usageCell(society.usage_summary.flats.used, society.usage_summary.flats.limit)}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {usageCell(society.usage_summary.users.used, society.usage_summary.users.limit)}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {can.assign && (
                                                        <>
                                                            <Button variant="outline" size="sm" onClick={() => openAssign(society)}>
                                                                <ArrowDownToLine className="size-3.5" />
                                                                Assign
                                                            </Button>
                                                            {society.subscription?.status === "cancelled" ? (
                                                                <Button variant="outline" size="sm" onClick={() => setResuming(society)}>
                                                                    <PlayCircle className="size-3.5" />
                                                                    Resume
                                                                </Button>
                                                            ) : (
                                                                society.subscription && ["trialing", "active", "past_due"].includes(society.subscription.status) && (
                                                                    <Button variant="ghost" size="sm" onClick={() => setCancelling(society)}>
                                                                        <PauseCircle className="size-3.5" />
                                                                        Cancel
                                                                    </Button>
                                                                )
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-4">
                        <Pagination
                            page={societies.current_page}
                            perPage={societies.per_page}
                            total={societies.total}
                            noun="societies"
                            onPageChange={(page) =>
                                router.get(route("subscriptions.index"), { ...(search.trim() ? { search: search.trim() } : {}), page }, { preserveState: true })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ── Assign modal ──────────────────────────────────────────── */}
            {assigning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
                        <h2 className="text-base font-semibold">Assign Plan</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">{assigning.name}</p>

                        <div className="mt-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="assign-plan">Plan *</Label>
                                <select
                                    id="assign-plan"
                                    value={assignForm.data.plan_uuid}
                                    onChange={(e) => assignForm.setData("plan_uuid", e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    {plans.map((plan) => (
                                        <option key={plan.uuid} value={plan.uuid}>
                                            {plan.name} — {formatCurrency(plan.price_monthly, plan.currency)}/mo
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="assign-cycle">Billing Cycle *</Label>
                                <select
                                    id="assign-cycle"
                                    value={assignForm.data.billing_cycle}
                                    onChange={(e) => assignForm.setData("billing_cycle", e.target.value as "monthly" | "yearly")}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="assign-trial">Trial Days (optional)</Label>
                                <Input
                                    id="assign-trial"
                                    type="number"
                                    min={0}
                                    max={90}
                                    placeholder="14"
                                    value={assignForm.data.trial_days}
                                    onChange={(e) => assignForm.setData("trial_days", e.target.value)}
                                />
                            </div>

                            {assignForm.errors.plan_uuid && (
                                <p className="text-xs text-destructive">{assignForm.errors.plan_uuid}</p>
                            )}
                            {(assignForm.errors as Record<string, string | undefined>).entitlement && (
                                <p className="text-xs text-destructive">{(assignForm.errors as Record<string, string | undefined>).entitlement}</p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setAssigning(null)}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={submitAssign} disabled={assignForm.processing}>
                                <CheckCircle2 className="size-4" />
                                Assign Plan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Cancel confirm ────────────────────────────────────────── */}
            <ConfirmDialog
                open={cancelling !== null}
                onOpenChange={(open) => !open && setCancelling(null)}
                title="Cancel subscription?"
                description={`End the subscription for ${cancelling?.name ?? "this society"}. Access continues until the current period ends.`}
                confirmLabel="Cancel Subscription"
                cancelLabel="Keep Subscription"
                destructive
                onConfirm={submitCancel}
            />

            {/* ── Resume confirm ────────────────────────────────────────── */}
            <ConfirmDialog
                open={resuming !== null}
                onOpenChange={(open) => !open && setResuming(null)}
                title="Resume subscription?"
                description={`Reactivate the subscription for ${resuming?.name ?? "this society"} for another billing cycle.`}
                confirmLabel="Resume Subscription"
                cancelLabel="Keep Cancelled"
                onConfirm={submitResume}
            />
        </AppLayout>
    );
}
