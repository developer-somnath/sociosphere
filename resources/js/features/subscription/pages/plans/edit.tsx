import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Plus, Receipt, Trash2 } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type FeatureKey = { [key: string]: string };
type FeatureRow = { feature_key: string; limit_value: string };

type EditProps = {
    plan: {
        uuid: string;
        name: string;
        code: string;
        description: string | null;
        price_monthly: number | string;
        price_yearly: number | string;
        currency: string;
        is_active: boolean;
        is_default: boolean;
        sort_order: number;
        features: { feature_key: string; limit_value: number | null }[];
    };
    feature_keys: FeatureKey;
};

export default function PlanEdit() {
    const { plan, feature_keys } = usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        name: plan.name,
        code: plan.code,
        description: plan.description ?? "",
        price_monthly: String(plan.price_monthly ?? ""),
        price_yearly: String(plan.price_yearly ?? ""),
        currency: plan.currency,
        is_active: plan.is_active,
        is_default: plan.is_default,
        sort_order: String(plan.sort_order ?? 0),
        features: plan.features.map((f) => ({
            feature_key: f.feature_key,
            limit_value: f.limit_value === null ? "" : String(f.limit_value),
        })) as FeatureRow[],
    });

    const availableKeys = Object.entries(feature_keys).filter(
        ([key]) => !form.data.features.some((f) => f.feature_key === key),
    );

    const addFeature = () => {
        const [key] = availableKeys[0] ?? [null];
        if (!key) return;
        form.setData("features", [...form.data.features, { feature_key: key, limit_value: "" }]);
    };

    const updateFeature = (index: number, patch: Partial<FeatureRow>) => {
        form.setData(
            "features",
            form.data.features.map((f, i) => (i === index ? { ...f, ...patch } : f)),
        );
    };

    const removeFeature = (index: number) => {
        form.setData(
            "features",
            form.data.features.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("plans.update", plan.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${plan.name}`} />

            <PageHeader
                title="Edit Subscription Plan"
                description={`Update pricing and entitlement limits for "${plan.name}".`}
                icon={<Receipt className="size-5" />}
                breadcrumbs={[
                    { label: "Subscription" },
                    { label: "Plans", href: route("plans.index") },
                    { label: "Edit Plan" },
                ]}
                actions={
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("plans.index")}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Plan Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormSection title="Pricing" description="Set the monthly and yearly list price for this tier.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">Plan Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData("name", e.target.value)}
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="code">Plan Code *</Label>
                                    <Input
                                        id="code"
                                        value={form.data.code}
                                        onChange={(e) => form.setData("code", e.target.value)}
                                        required
                                    />
                                    {form.errors.code && <p className="text-xs text-destructive">{form.errors.code}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="price_monthly">Monthly Price (₹) *</Label>
                                    <Input
                                        id="price_monthly"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.price_monthly}
                                        onChange={(e) => form.setData("price_monthly", e.target.value)}
                                        required
                                    />
                                    {form.errors.price_monthly && <p className="text-xs text-destructive">{form.errors.price_monthly}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="price_yearly">Yearly Price (₹) *</Label>
                                    <Input
                                        id="price_yearly"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.price_yearly}
                                        onChange={(e) => form.setData("price_yearly", e.target.value)}
                                        required
                                    />
                                    {form.errors.price_yearly && <p className="text-xs text-destructive">{form.errors.price_yearly}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="currency">Currency *</Label>
                                    <Input
                                        id="currency"
                                        value={form.data.currency}
                                        onChange={(e) => form.setData("currency", e.target.value)}
                                        maxLength={3}
                                        required
                                    />
                                    {form.errors.currency && <p className="text-xs text-destructive">{form.errors.currency}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData("sort_order", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 space-y-1.5">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={form.data.is_active}
                                        onCheckedChange={(v) => form.setData("is_active", Boolean(v))}
                                    />
                                    Active plan
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={form.data.is_default}
                                        onCheckedChange={(v) => form.setData("is_default", Boolean(v))}
                                    />
                                    Default plan (fallback when no subscription exists)
                                </label>
                            </div>
                        </FormSection>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="text-base">Resource Entitlements</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addFeature} disabled={availableKeys.length === 0}>
                            <Plus className="size-4" />
                            Add Resource
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {form.data.features.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No resource limits yet — add resources to define entitlement caps. Leave the limit blank for unlimited.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {form.data.features.map((feature, index) => (
                                    <div key={index} className="grid gap-3 rounded-xl border border-border/60 p-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                                        <div className="space-y-1.5">
                                            <Label>Resource</Label>
                                            <select
                                                value={feature.feature_key}
                                                onChange={(e) => updateFeature(index, { feature_key: e.target.value })}
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                {Object.entries(feature_keys).map(([key, label]) => (
                                                    <option key={key} value={key} disabled={form.data.features.some((f, i) => i !== index && f.feature_key === key)}>
                                                        {t(label)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Limit (blank = unlimited)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={feature.limit_value}
                                                placeholder="Unlimited"
                                                onChange={(e) => updateFeature(index, { limit_value: e.target.value })}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {form.errors.features && <p className="mt-2 text-xs text-destructive">{form.errors.features}</p>}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" asChild>
                        <Link href={route("plans.index")}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
