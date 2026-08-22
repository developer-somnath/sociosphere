import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Save, Settings2 } from "lucide-react";
import { BackButton } from "@/components/app/back-button";
import { useI18n } from "@/lib/i18n";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PageProps } from "@/types";

type BillingSettingsProps = {
    config: {
        uuid: string;
        billing_mode: "per_sqft" | "fixed";
        base_rate: number;
        tax_rate: number;
        due_day: number;
        grace_days: number;
        penalty_rate: number;
        penalty_cap: number | null;
        is_active: boolean;
    } | null;
    modes: string[];
    can: { configure: boolean };
};

export default function BillingSettings() {
    const { t } = useI18n();
    const { config, modes, can } = usePage<PageProps<BillingSettingsProps>>().props;

    const form = useForm({
        billing_mode: config?.billing_mode ?? "per_sqft",
        base_rate: String(config?.base_rate ?? ""),
        tax_rate: String(config?.tax_rate ?? ""),
        due_day: String(config?.due_day ?? 10),
        grace_days: String(config?.grace_days ?? 7),
        penalty_rate: String(config?.penalty_rate ?? 2),
        penalty_cap: config?.penalty_cap != null ? String(config.penalty_cap) : "",
        is_active: config?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("billing.settings.update"), { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title={t("billing.settingsTitle")} />

            <PageHeader
                title={t("billing.settingsTitle")}
                description="Configure maintenance rates, due dates and penalty policy."
                icon={<Settings2 className="size-5" />}
                breadcrumbs={[{ label: t("nav.finance") }, { label: "Billing Settings" }]}
                actions={
                    <BackButton routeName="billing.preview" label={t("billing.backToEngine")} />
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Society Billing Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title={t("billing.modeTitle")} description={t("billing.modeDescription")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="billing_mode">Calculation Mode *</Label>
                                    <select
                                        id="billing_mode"
                                        value={form.data.billing_mode}
                                        onChange={(e) => form.setData("billing_mode", e.target.value as "per_sqft" | "fixed")}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        {modes.map((mode) => (
                                            <option key={mode} value={mode}>
                                                {mode === "per_sqft" ? "Per Square Foot" : "Fixed Flat Rate"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="base_rate">
                                        {form.data.billing_mode === "per_sqft" ? "Rate / sq.ft. (₹) *" : "Fixed Rate / Flat (₹) *"}
                                    </Label>
                                    <Input
                                        id="base_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.base_rate}
                                        onChange={(e) => form.setData("base_rate", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="tax_rate">GST / Tax Rate (%)</Label>
                                    <Input
                                        id="tax_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={form.data.tax_rate}
                                        onChange={(e) => form.setData("tax_rate", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="due_day">Due Day of Month *</Label>
                                    <Input
                                        id="due_day"
                                        type="number"
                                        min="1"
                                        max="28"
                                        value={form.data.due_day}
                                        onChange={(e) => form.setData("due_day", e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">1–28 (invoices due on this day of the period month).</p>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title={t("billing.penaltyTitle")} description={t("billing.penaltyDescription")}>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="grace_days">Grace Days *</Label>
                                    <Input
                                        id="grace_days"
                                        type="number"
                                        min="0"
                                        max="90"
                                        value={form.data.grace_days}
                                        onChange={(e) => form.setData("grace_days", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="penalty_rate">Penalty Rate (% / month) *</Label>
                                    <Input
                                        id="penalty_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={form.data.penalty_rate}
                                        onChange={(e) => form.setData("penalty_rate", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="penalty_cap">Penalty Cap (₹, optional)</Label>
                                    <Input
                                        id="penalty_cap"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.penalty_cap}
                                        onChange={(e) => form.setData("penalty_cap", e.target.value)}
                                        placeholder="No cap"
                                    />
                                    <p className="text-xs text-muted-foreground">Maximum penalty amount per invoice per period.</p>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title={t("billing.statusTitle")} description={t("billing.statusDescription")}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={form.data.is_active}
                                    onCheckedChange={(v) => form.setData("is_active", Boolean(v))}
                                />
                                <div>
                                    <p className="text-sm font-medium">Active</p>
                                    <p className="text-xs text-muted-foreground">
                                        {form.data.is_active ? "Auto-billing is enabled for this society." : "Auto-billing is paused."}
                                    </p>
                                </div>
                            </label>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3">
                            <Button type="submit" disabled={!can.configure || form.processing}>
                                <Save className="size-4" />
                                Save Settings
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
