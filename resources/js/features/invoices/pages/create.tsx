import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    IndianRupee,
    Plus,
    Receipt,
    Sparkles,
    Trash2,
    Zap,
} from "lucide-react";
import { useMemo } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type CreateProps = {
    flats: { id: number; label: string; area_sqft: number }[];
};

type LineItem = {
    title: string;
    calculation_type: "Fixed" | "Per Sq Ft" | "Utility Consumption";
    unit_price: number;
    quantity: number;
};

const CALC_TYPES: LineItem["calculation_type"][] = [
    "Fixed",
    "Per Sq Ft",
    "Utility Consumption",
];

function money(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(value);
}

export default function InvoiceCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        flat_id: "",
        billing_period: new Date().toISOString().slice(0, 7),
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        tax_amount: 0,
        discount_amount: 0,
        notes: "",
        items: [
            {
                title: "Society Base Maintenance",
                calculation_type: "Fixed" as const,
                unit_price: 2500,
                quantity: 1,
            },
            {
                title: "Sinking & Development Fund",
                calculation_type: "Fixed" as const,
                unit_price: 500,
                quantity: 1,
            },
        ],
    });

    const { markDirty, reset } = useUnsavedChanges();

    // Inertia's setData is typed as FormDataValues<T,K>; narrow it to the
    // plain (key, value) signature so updateData can wrap it with markDirty.
    const rawSetData = form.setData as <K extends keyof typeof form.data>(
        key: K,
        value: (typeof form.data)[K],
    ) => void;

    const updateData: typeof rawSetData = (key, value) => {
        markDirty();
        rawSetData(key, value);
    };

    const flatOptions: ComboboxItem[] = useMemo(
        () =>
            flats.map((f) => ({
                value: String(f.id),
                label: f.label,
                description: `${f.area_sqft.toLocaleString("en-IN")} sq.ft.`,
            })),
        [flats],
    );

    const selectedFlat = flats.find(
        (f) => String(f.id) === form.data.flat_id,
    );

    const addItem = () => {
        markDirty();
        form.setData("items", [
            ...form.data.items,
            { title: "Utility / Charge", calculation_type: "Fixed", unit_price: 0, quantity: 1 },
        ]);
    };

    const removeItem = (index: number) => {
        if (form.data.items.length <= 1) return;
        markDirty();
        const newItems = [...form.data.items];
        newItems.splice(index, 1);
        form.setData("items", newItems);
    };

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
        markDirty();
        const newItems = [...form.data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        form.setData("items", newItems);
    };

    const calculateSubtotal = () => {
        return form.data.items.reduce((sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = Number(form.data.tax_amount) || 0;
        const discount = Number(form.data.discount_amount) || 0;
        return Math.max(0, subtotal + tax - discount);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("invoices.store"), {
            onSuccess: () => reset(),
        });
    };

    const subtotal = calculateSubtotal();
    const tax = Number(form.data.tax_amount) || 0;
    const discount = Number(form.data.discount_amount) || 0;
    const total = calculateTotal();

    return (
        <AppLayout>
            <Head title={t("invoiceForm.title")} />

            <PageHeader
                title={t("invoiceForm.title")}
                description={t("invoiceForm.pageDescription")}
                icon={<Receipt className="size-5" />}
                breadcrumbs={[
                    { label: t("nav.finance"), href: "/dashboard" },
                    { label: t("nav.invoices"), href: route("invoices.index") },
                    { label: t("invoiceForm.title") },
                ]}
                actions={
                    <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                        <Link href={route("invoices.index")}>
                            <ArrowLeft className="size-3.5" />
                            {t("common.back")}
                        </Link>
                    </Button>
                }
            />

            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-2xl border border-info/20 bg-gradient-to-br from-info via-info to-info p-6 text-white shadow-[0_20px_50px_-32px_rgba(79,70,229,0.6)] sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-info/20 blur-2xl" />
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
                            <Receipt className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">
                                {t("invoiceForm.newInvoice")}
                            </h2>
                            <p className="text-sm text-info">
                                {t("invoiceForm.heroDescription")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                        <Sparkles className="size-3.5" />
                        {form.data.items.length}{" "}
                        {form.data.items.length === 1 ? t("invoiceForm.lineItem") : t("invoiceForm.lineItems")}
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
                {/* Left column — form fields */}
                <div className="flex flex-col gap-5">
                    {/* Flat & period */}
                    <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                        <CardContent className="p-5 sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl border border-info/20 bg-info/10 text-info dark:text-info">
                                    <Building2 className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">{t("invoiceForm.flatAndBillingCycle")}</h3>
                                    <p className="text-xs text-muted-foreground">{t("invoiceForm.flatAndBillingCycleDescription")}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="flat_id">{t("invoiceForm.targetFlat")} *</Label>
                                    <Combobox
                                        id="flat_id"
                                        items={flatOptions}
                                        value={form.data.flat_id}
                                        onValueChange={(value) => updateData("flat_id", value)}
                                        placeholder={t("invoiceForm.flatSearchPlaceholder")}
                                        emptyText={t("invoiceForm.noFlatsFound")}
                                        searchPlaceholder={t("invoiceForm.flatsSearchPlaceholder")}
                                    />
                                    {form.errors.flat_id && (
                                        <p className="text-xs text-destructive">{form.errors.flat_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="billing_period">{t("invoiceForm.billingPeriod")} (YYYY-MM) *</Label>
                                    <Input
                                        id="billing_period"
                                        type="month"
                                        value={form.data.billing_period}
                                        onChange={(e) => updateData("billing_period", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="issue_date">{t("common.issueDate")} *</Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        value={form.data.issue_date}
                                        onChange={(e) => updateData("issue_date", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="due_date">{t("common.dueDate")} *</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={form.data.due_date}
                                        onChange={(e) => updateData("due_date", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="notes">{t("invoiceForm.notesOptional")}</Label>
                                    <Input
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) => updateData("notes", e.target.value)}
                                        placeholder={t("invoiceForm.notesPlaceholder")}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line items */}
                    <Card className="border-border/70 bg-card/60 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                        <CardContent className="p-5 sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl border border-info/20 bg-info/10 text-info dark:text-info">
                                    <Zap className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">{t("invoiceForm.lineItemsAndCharges")}</h3>
                                    <p className="text-xs text-muted-foreground">{t("invoiceForm.lineItemsDescription")}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {form.data.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors focus-within:border-primary/40 sm:flex-row sm:items-end"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">{t("invoiceForm.chargeTitle")}</Label>
                                            <Input
                                                value={item.title}
                                                onChange={(e) => updateItem(idx, "title", e.target.value)}
                                                placeholder={t("invoiceForm.chargeNamePlaceholder")}
                                                required
                                            />
                                        </div>
                                        <div className="w-full space-y-1 sm:w-36">
                                            <Label className="text-xs">{t("invoiceForm.calcType")}</Label>
                                            <select
                                                value={item.calculation_type}
                                                onChange={(e) => updateItem(idx, "calculation_type", e.target.value as any)}
                                                className="h-9 w-full rounded-xl border border-border/70 bg-background px-3 text-xs font-medium outline-none transition-all hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            >
                                                {CALC_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-full space-y-1 sm:w-28">
                                            <Label className="text-xs">{t("common.unitPrice")} (₹)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        <div className="w-full space-y-1 sm:w-20">
                                            <Label className="text-xs">{t("invoiceForm.qty")}</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 1)}
                                                required
                                            />
                                        </div>
                                        <div className="w-full text-right font-mono font-semibold text-foreground sm:w-28 sm:py-2">
                                            {money(item.unit_price * item.quantity)}
                                        </div>
                                        {form.data.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(idx)}
                                                className="shrink-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-xl">
                                    <Plus className="mr-1.5 size-4" />
                                    {t("invoiceForm.addLineItem")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column — summary */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <Card className="overflow-hidden border-border/70 bg-card/60 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                        <div className="border-b border-border/60 bg-gradient-to-br from-info/10 via-transparent to-info/10 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <IndianRupee className="size-4 text-info dark:text-info" />
                                <h3 className="text-sm font-semibold">{t("invoiceForm.invoiceSummary")}</h3>
                            </div>
                        </div>
                        <CardContent className="space-y-4 p-5">
                            {/* Selected flat chip */}
                            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-info/20 bg-info/10 text-info dark:text-info">
                                    <Building2 className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        {selectedFlat?.label ?? t("invoiceForm.noFlatSelected")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedFlat
                                            ? `${selectedFlat.area_sqft.toLocaleString("en-IN")} sq.ft.`
                                            : t("invoiceForm.pickFlatToContinue")}
                                    </p>
                                </div>
                            </div>

                            {/* Tax & discount */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tax_amount" className="text-xs">{t("common.tax")} (₹)</Label>
                                    <Input
                                        id="tax_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.tax_amount}
                                        onChange={(e) => updateData("tax_amount", parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="discount_amount" className="text-xs">{t("common.discount")} (₹)</Label>
                                    <Input
                                        id="discount_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.discount_amount}
                                        onChange={(e) => updateData("discount_amount", parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t("common.subtotal")}</span>
                                    <span className="font-mono font-medium tabular-nums">{money(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t("common.tax")}</span>
                                    <span className="font-mono font-medium tabular-nums text-info dark:text-info">
                                        +{money(tax)}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{t("common.discount")}</span>
                                        <span className="font-mono font-medium tabular-nums text-brand dark:text-brand">
                                            −{money(discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                                    <span className="text-sm font-semibold">{t("invoiceForm.totalDuesPayable")}</span>
                                    <span className="font-mono text-lg font-bold tabular-nums text-primary">
                                        {money(total)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={form.processing || !form.data.flat_id}
                                className="w-full rounded-full bg-brand px-6 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand"
                            >
                                {form.processing ? t("invoiceForm.generating") : t("invoiceForm.generateInvoice")}
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                {form.data.flat_id
                                    ? t("invoiceForm.issuedImmediately")
                                    : t("invoiceForm.selectFlatToEnable")}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
