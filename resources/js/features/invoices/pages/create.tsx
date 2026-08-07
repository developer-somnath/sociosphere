import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function InvoiceCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;

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

    const addItem = () => {
        form.setData("items", [
            ...form.data.items,
            { title: "Utility / Charge", calculation_type: "Fixed", unit_price: 0, quantity: 1 },
        ]);
    };

    const removeItem = (index: number) => {
        if (form.data.items.length <= 1) return;
        const newItems = [...form.data.items];
        newItems.splice(index, 1);
        form.setData("items", newItems);
    };

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
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
        form.post(route("invoices.store"));
    };

    return (
        <AppLayout>
            <Head title="Generate Maintenance Invoice" />

            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild className="rounded-xl">
                    <Link href={route("invoices.index")}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Generate Maintenance Invoice</h1>
                    <p className="text-xs text-muted-foreground">Create itemized billing dues for a residential flat.</p>
                </div>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">Billing Dues Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title="Flat & Period Selection" description="Select target flat and billing cycle.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="flat_id">Target Flat *</Label>
                                    <select
                                        id="flat_id"
                                        value={form.data.flat_id}
                                        onChange={(e) => form.setData("flat_id", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        required
                                    >
                                        <option value="">Select Flat...</option>
                                        {flats.map((f) => (
                                            <option key={f.id} value={f.id}>{f.label}</option>
                                        ))}
                                    </select>
                                    {form.errors.flat_id && <p className="text-xs text-destructive">{form.errors.flat_id}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="billing_period">Billing Period (YYYY-MM) *</Label>
                                    <Input
                                        id="billing_period"
                                        type="month"
                                        value={form.data.billing_period}
                                        onChange={(e) => form.setData("billing_period", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="issue_date">Issue Date *</Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        value={form.data.issue_date}
                                        onChange={(e) => form.setData("issue_date", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="due_date">Due Date *</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={form.data.due_date}
                                        onChange={(e) => form.setData("due_date", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Line Items & Charges" description="Itemize maintenance, sinking fund, and utilities.">
                            <div className="space-y-3">
                                {form.data.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-end border border-border/50 rounded-xl p-3 bg-muted/20">
                                        <div className="flex-1 space-y-1 w-full">
                                            <Label className="text-xs">Charge Title</Label>
                                            <Input
                                                value={item.title}
                                                onChange={(e) => updateItem(idx, "title", e.target.value)}
                                                placeholder="Charge Name"
                                                required
                                            />
                                        </div>
                                        <div className="w-full sm:w-32 space-y-1">
                                            <Label className="text-xs">Calc Type</Label>
                                            <select
                                                value={item.calculation_type}
                                                onChange={(e) => updateItem(idx, "calculation_type", e.target.value as any)}
                                                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                <option value="Fixed">Fixed</option>
                                                <option value="Per Sq Ft">Per Sq Ft</option>
                                                <option value="Utility Consumption">Utility</option>
                                            </select>
                                        </div>
                                        <div className="w-full sm:w-28 space-y-1">
                                            <Label className="text-xs">Unit Price (₹)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        <div className="w-full sm:w-20 space-y-1">
                                            <Label className="text-xs">Qty</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 1)}
                                                required
                                            />
                                        </div>
                                        <div className="w-full sm:w-28 text-right font-mono font-semibold py-2">
                                            ₹{(item.unit_price * item.quantity).toFixed(2)}
                                        </div>
                                        {form.data.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(idx)}
                                                className="text-destructive hover:text-destructive shrink-0"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-xl">
                                    <Plus className="mr-1.5 size-4" />
                                    Add Line Item
                                </Button>
                            </div>
                        </FormSection>

                        <div className="border-t border-border/60 pt-4 space-y-2 text-right">
                            <div className="flex justify-end gap-6 text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-mono font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end gap-6 text-sm">
                                <span className="text-muted-foreground">Total Dues Payable:</span>
                                <span className="font-mono font-bold text-lg text-primary">₹{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route("invoices.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Generating…" : "Generate Invoice"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
