import { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import {
    Calculator,
    Check,
    Coins,
    Globe,
    Plus,
    Receipt,
    Percent,
    ShieldCheck,
    Sparkles,
    Trash2,
} from "lucide-react";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

type TaxRate = {
    id: number;
    name: string;
    code: string;
    rate_percentage: number | string;
    is_compound: boolean;
    is_inclusive: boolean;
    sort_order: number;
    is_active: boolean;
};

type TaxProfile = {
    id: number;
    country: string;
    region: string;
    tax_scheme: "GST" | "VAT" | "Sales Tax" | "None";
    currency_code: string;
    currency_symbol: string;
    rounding_mode: "round" | "ceil" | "floor";
    rounding_precision: number;
    tax_registration_no: string;
    is_active: boolean;
    rates: TaxRate[];
};

type Props = {
    profile: TaxProfile;
    schemes: string[];
    roundingModes: string[];
};

export default function TaxSettingsPage({ profile, schemes, roundingModes }: Props) {
    const { t, formatCurrency } = useI18n();

    // Tax Profile Form
    const { data, setData, put, processing } = useForm({
        country: profile.country ?? "India",
        region: profile.region ?? "Delhi",
        tax_scheme: profile.tax_scheme ?? "GST",
        currency_code: profile.currency_code ?? "INR",
        currency_symbol: profile.currency_symbol ?? "₹",
        rounding_mode: profile.rounding_mode ?? "round",
        rounding_precision: profile.rounding_precision ?? 2,
        tax_registration_no: profile.tax_registration_no ?? "",
        is_active: profile.is_active ?? true,
    });

    // Tax Rate Form
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const rateForm = useForm({
        name: "",
        code: "",
        rate_percentage: "18",
        is_compound: false,
        is_inclusive: false,
        sort_order: 1,
        is_active: true,
    });

    // Sandbox Calculator State
    const [calcSubtotal, setCalcSubtotal] = useState<string>("10000");

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        put("/billing/tax-settings", { preserveScroll: true });
    };

    const submitRate = (e: React.FormEvent) => {
        e.preventDefault();
        rateForm.post("/billing/tax-settings/rates", {
            preserveScroll: true,
            onSuccess: () => {
                setRateModalOpen(false);
                rateForm.reset();
            },
        });
    };

    const confirmDeleteRate = () => {
        if (deleteTargetId === null) return;
        router.delete(`/billing/tax-settings/rates/${deleteTargetId}`, {
            preserveScroll: true,
            onFinish: () => setDeleteTargetId(null),
        });
    };

    // Calculate sandbox live tax
    const numSubtotal = parseFloat(calcSubtotal) || 0;
    const activeRates = profile.rates.filter((r) => r.is_active);

    const calcResults = activeRates.map((rate) => {
        const pct = parseFloat(String(rate.rate_percentage)) || 0;
        const taxAmt = (numSubtotal * pct) / 100;
        return {
            name: rate.name,
            code: rate.code,
            pct,
            amount: taxAmt,
            isInclusive: rate.is_inclusive,
        };
    });

    const totalTax = calcResults.reduce((acc, curr) => acc + curr.amount, 0);
    const grandTotal = numSubtotal + totalTax;

    return (
        <AppLayout>
            <Head title="Tax Settings — SocioSphere" />

            <div className="space-y-6">
                {/* Header Title */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                Global Tax & Regional Compliance
                            </h2>
                            <Badge className="bg-brand/10 text-brand dark:text-brand border-brand/20 font-mono text-[10px]">
                                Orca v2.2.0 Engine
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Configure regional tax schemes (GST, VAT, Sales Tax), rounding rules, and automated invoice tax breakdowns.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => setRateModalOpen(true)}
                            className="rounded-xl gap-1.5 bg-brand hover:bg-brand text-white font-semibold text-xs shadow-xs"
                        >
                            <Plus className="size-3.5" />
                            <span>Add Tax Rate</span>
                        </Button>
                    </div>
                </div>

                {/* Upper Metrics / Status Bar */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:text-brand">
                                <Receipt className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Active Tax Scheme</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-lg font-bold text-foreground">{profile.tax_scheme}</span>
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                        {profile.country}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Registration / GSTIN</p>
                                <p className="text-sm font-mono font-bold text-foreground mt-0.5 truncate max-w-[180px]">
                                    {profile.tax_registration_no || "Unregistered"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                                <Coins className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Configured Rates</p>
                                <p className="text-lg font-bold text-foreground mt-0.5">
                                    {profile.rates.length} Active Rule{profile.rates.length === 1 ? "" : "s"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left Column: Tax Profile Config */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-xs">
                            <CardHeader className="border-b border-border/60 pb-4">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Globe className="size-4 text-brand" />
                                    <span>Regional Tax Configuration</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Define tax rules, currency symbols, and rounding algorithms for billing calculations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={submitProfile} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Tax Scheme</Label>
                                            <select
                                                value={data.tax_scheme}
                                                onChange={(e) => setData("tax_scheme", e.target.value as any)}
                                                className="h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                {schemes.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Tax Reg. Number / GSTIN / VAT ID</Label>
                                            <Input
                                                value={data.tax_registration_no}
                                                onChange={(e) => setData("tax_registration_no", e.target.value)}
                                                placeholder="e.g. 07AAAAA0000A1Z5"
                                                className="rounded-xl text-xs h-9 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Country</Label>
                                            <Input
                                                value={data.country}
                                                onChange={(e) => setData("country", e.target.value)}
                                                placeholder="e.g. India"
                                                className="rounded-xl text-xs h-9"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">State / Region</Label>
                                            <Input
                                                value={data.region}
                                                onChange={(e) => setData("region", e.target.value)}
                                                placeholder="e.g. Delhi"
                                                className="rounded-xl text-xs h-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Rounding Mode</Label>
                                            <select
                                                value={data.rounding_mode}
                                                onChange={(e) => setData("rounding_mode", e.target.value as any)}
                                                className="h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary capitalize"
                                            >
                                                {roundingModes.map((m) => (
                                                    <option key={m} value={m}>
                                                        {m === "round" ? "Round Half-Up" : m}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Decimal Precision</Label>
                                            <select
                                                value={String(data.rounding_precision)}
                                                onChange={(e) => setData("rounding_precision", parseInt(e.target.value))}
                                                className="h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="0">0 (Whole Number)</option>
                                                <option value="2">2 Decimals (Standard)</option>
                                                <option value="4">4 Decimals (Precision)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3 mt-2">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-semibold">Enable Tax Calculation</Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Automatically apply tax rates to maintenance invoice generation.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData("is_active", !data.is_active)}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                                data.is_active ? "bg-success" : "bg-muted-foreground/30"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                    data.is_active ? "translate-x-4" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl gap-1.5 bg-brand hover:bg-brand text-white font-semibold text-xs"
                                        >
                                            <Check className="size-3.5" />
                                            <span>Save Tax Profile</span>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Tax Rates Management List */}
                        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-xs">
                            <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Percent className="size-4 text-brand" />
                                        <span>Active Tax Rates & Surcharges</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Manage tax rates applied to maintenance billing calculations.
                                    </CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRateModalOpen(true)}
                                    className="rounded-xl gap-1 text-xs"
                                >
                                    <Plus className="size-3.5" /> Rate
                                </Button>
                            </CardHeader>

                            <CardContent className="p-4 space-y-2">
                                {profile.rates.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                        No tax rates configured. Click "Add Tax Rate" to define your first tax rule.
                                    </div>
                                ) : (
                                    profile.rates.map((rate) => (
                                        <div
                                            key={rate.id}
                                            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 hover:bg-muted/40 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand dark:text-brand font-bold text-xs">
                                                    {rate.rate_percentage}%
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-semibold text-foreground">{rate.name}</h4>
                                                        <Badge variant="outline" className="text-[9px] font-mono uppercase">
                                                            {rate.code}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                                        <span>{rate.is_inclusive ? "Tax Inclusive" : "Tax Exclusive"}</span>
                                                        {rate.is_compound && <span>• Compound</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setDeleteTargetId(rate.id)}
                                                    className="size-7 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Live Tax Sandbox Calculator */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="rounded-2xl border-brand/30 bg-brand/5 backdrop-blur-md shadow-xs">
                            <CardHeader className="border-b border-brand/20 pb-4">
                                <CardTitle className="text-base font-bold text-brand dark:text-brand flex items-center gap-2">
                                    <Calculator className="size-4 text-brand" />
                                    <span>Live Tax Sandbox Calculator</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-brand dark:text-brand">
                                    Simulate invoice subtotal calculations against active tax rules in real-time.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">Sample Subtotal Amount ({data.currency_symbol})</Label>
                                    <Input
                                        type="number"
                                        value={calcSubtotal}
                                        onChange={(e) => setCalcSubtotal(e.target.value)}
                                        placeholder="10000"
                                        className="rounded-xl text-sm font-bold font-mono h-10"
                                    />
                                </div>

                                <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
                                    <div className="flex justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
                                        <span>Invoice Subtotal:</span>
                                        <span className="font-mono font-semibold text-foreground">{formatCurrency(numSubtotal)}</span>
                                    </div>

                                    {calcResults.length === 0 ? (
                                        <div className="text-xs text-muted-foreground text-center py-2">
                                            No active tax rules applied.
                                        </div>
                                    ) : (
                                        calcResults.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs font-medium border-b border-border/40 pb-1.5">
                                                <span className="text-foreground">{item.name} ({item.pct}%):</span>
                                                <span className="font-mono text-brand dark:text-brand">+{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))
                                    )}

                                    <div className="flex justify-between items-center text-sm font-extrabold text-foreground pt-1">
                                        <span>Estimated Total:</span>
                                        <span className="text-base font-mono text-brand dark:text-brand">
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
                                    <Sparkles className="size-3.5 inline mr-1 text-brand" />
                                    Calculations reflect selected rounding mode (<strong className="capitalize">{data.rounding_mode}</strong>) and {data.rounding_precision} decimal precision.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add Rate Dialog */}
            <Dialog open={rateModalOpen} onOpenChange={setRateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Tax Rate Rule</DialogTitle>
                        <DialogDescription>
                            Define a new tax rate applied to maintenance billing calculations.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitRate} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Rate Name</Label>
                            <Input
                                value={rateForm.data.name}
                                onChange={(e) => rateForm.setData("name", e.target.value)}
                                placeholder="e.g. GST Standard Rate"
                                className="rounded-xl text-xs h-9"
                                required
                            />
                        </div>

                        <div className="grid gap-3 grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Code / Identifier</Label>
                                <Input
                                    value={rateForm.data.code}
                                    onChange={(e) => rateForm.setData("code", e.target.value)}
                                    placeholder="e.g. GST"
                                    className="rounded-xl text-xs h-9 font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Rate Percentage (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={rateForm.data.rate_percentage}
                                    onChange={(e) => rateForm.setData("rate_percentage", e.target.value)}
                                    placeholder="18"
                                    className="rounded-xl text-xs h-9 font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                            <Label className="text-xs font-semibold">Tax Inclusive</Label>
                            <button
                                type="button"
                                onClick={() => rateForm.setData("is_inclusive", !rateForm.data.is_inclusive)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                    rateForm.data.is_inclusive ? "bg-brand" : "bg-muted-foreground/30"
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        rateForm.data.is_inclusive ? "translate-x-4" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRateModalOpen(false)} className="rounded-xl text-xs">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={rateForm.processing} className="rounded-xl bg-brand text-white hover:bg-brand text-xs font-semibold">
                                Save Rate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Rate Confirmation */}
            <ConfirmDialog
                open={deleteTargetId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTargetId(null);
                }}
                title={t("taxSettings.deleteTitle")}
                description="This action cannot be undone. The tax rate will be removed from all future billing calculations."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                destructive
                onConfirm={confirmDeleteRate}
            />
        </AppLayout>
    );
}
