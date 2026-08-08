import { Head, Link, router, usePage } from "@inertiajs/react";
import { Crown, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type PlanRow = {
    uuid: string;
    name: string;
    code: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    is_active: boolean;
    is_default: boolean;
    sort_order: number;
    features: { feature_key: string; limit_value: number | null }[];
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

type PlansIndexProps = {
    plans: Paginated<PlanRow>;
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function PlansIndex() {
    const { plans, can } = usePage<PageProps<PlansIndexProps>>().props;
    const { formatCurrency } = useI18n();
    const [deleting, setDeleting] = useState<PlanRow | null>(null);

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(route("plans.destroy", deleting.uuid), {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Subscription Plans" />

            <PageHeader
                title="Subscription Plans"
                description="Manage the SaaS plan catalog offered to societies."
                icon={<Receipt className="size-5" />}
                breadcrumbs={[{ label: "Subscription" }, { label: "Plans" }]}
                actions={
                    can.create && (
                        <Button size="sm" asChild>
                            <Link href={route("plans.create")}>
                                <Plus className="size-4" />
                                New Plan
                            </Link>
                        </Button>
                    )
                }
            />

            {plans.data.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <EmptyState
                            icon={Receipt}
                            title="No plans yet"
                            description="Create your first subscription plan to start offering tiers to societies."
                            action={
                                can.create && (
                                    <Button size="sm" asChild>
                                        <Link href={route("plans.create")}>
                                            <Plus className="size-4" />
                                            Create Plan
                                        </Link>
                                    </Button>
                                )
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {plans.data.map((plan) => {
                        const unlimited = plan.features.filter((f) => f.limit_value === null).length;
                        return (
                            <Card key={plan.uuid} className="flex flex-col">
                                <CardContent className="flex flex-1 flex-col pt-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Crown className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold">{plan.name}</h3>
                                                <p className="text-xs text-muted-foreground">{plan.code}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {plan.is_default && <Badge variant="brand">Default</Badge>}
                                            {!plan.is_active && <Badge variant="secondary">Inactive</Badge>}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold tabular-nums">
                                            {formatCurrency(plan.price_monthly, plan.currency)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">/ month</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {formatCurrency(plan.price_yearly, plan.currency)} / year
                                    </p>

                                    {plan.description && (
                                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{plan.description}</p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {unlimited > 0 && <Badge variant="success">{unlimited} unlimited</Badge>}
                                        <Badge variant="secondary">{plan.features.length} resources</Badge>
                                    </div>

                                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                                        {can.update && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route("plans.edit", plan.uuid)}>
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        {can.delete && !plan.is_default && (
                                            <Button variant="ghost" size="sm" onClick={() => setDeleting(plan)}>
                                                <Trash2 className="size-3.5" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete plan?"
                description={`Delete "${deleting?.name ?? ""}"? Societies currently on this plan will fall back to the default plan.`}
                confirmLabel="Delete Plan"
                cancelLabel="Keep Plan"
                destructive
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
