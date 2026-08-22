import { Head, router, usePage } from "@inertiajs/react";
import { BookOpenText, Wallet } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PageProps } from "@/types";
import { useI18n } from "@/lib/i18n";

type LedgerInvoice = {
    id: number;
    uuid: string;
    invoice_number: string;
    billing_period: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    penalty: number;
    total_amount: number;
    paid_amount: number;
    status: "Unpaid" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
    items: {
        id: number;
        title: string;
        description: string | null;
        unit_price: number;
        quantity: number;
        amount: number;
    }[];
    payments: {
        id: number;
        payment_number: string;
        amount: number;
        payment_method: string;
        paid_at: string;
    }[];
};

type Flat = {
    id: number;
    uuid: string;
    flat_no: string;
    tower_id: number | null;
    area_sqft: number;
    tower?: { id: number; name: string } | null;
};

type FlatLedgerProps = {
    flats: Flat[];
    selected_flat_id: number;
    invoices: LedgerInvoice[];
    balance: number;
    can: { view: boolean };
};

function money(value: number | null | undefined) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function invoiceStatusBadge(status: LedgerInvoice["status"]) {
    switch (status) {
        case "Paid":
            return (
                <Badge className="border-transparent bg-success/10 text-success dark:bg-success/10 dark:text-success">
                    Paid
                </Badge>
            );
        case "Partially Paid":
            return (
                <Badge className="border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info">
                    Partially Paid
                </Badge>
            );
        case "Unpaid":
            return (
                <Badge className="border-transparent bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning">
                    Unpaid
                </Badge>
            );
        case "Overdue":
            return <Badge variant="destructive">Overdue</Badge>;
        default:
            return <Badge variant="secondary">Cancelled</Badge>;
    }
}

export default function FlatLedger() {
    const { t } = useI18n();
    const { flats, selected_flat_id, invoices, balance, can } = usePage<PageProps<FlatLedgerProps>>().props;

    const flatItems: ComboboxItem[] = flats.map((flat) => ({
        value: String(flat.id),
        label: `${flat.flat_no}${flat.tower ? ` — ${flat.tower.name}` : ""}`,
        description: `${flat.area_sqft} sq.ft.`,
    }));

    const changeFlat = (value: string) => {
        router.get(route("billing.ledger"), { flat_id: value }, { preserveState: true, replace: true });
    };

    const totalBilled = invoices.reduce((sum, i) => sum + Number(i.total_amount), 0);
    const totalPaid = invoices.reduce((sum, i) => sum + Number(i.paid_amount), 0);
    const selectedFlat = flats.find((f) => f.id === selected_flat_id);

    return (
        <AppLayout>
            <Head title={t("invoices.flatLedgerTitle")} />

            <PageHeader
                title={t("invoices.flatLedgerTitle")}
                description="Financial statement — invoices, payments and outstanding balance per flat."
                icon={<BookOpenText className="size-5" />}
                breadcrumbs={[{ label: t("nav.finance") }, { label: "Flat Ledger" }]}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Select Flat</CardTitle>
                </CardHeader>
                <CardContent>
                    <Combobox
                        items={flatItems}
                        value={String(selected_flat_id ?? "")}
                        onValueChange={changeFlat}
                        placeholder="Search flat…"
                        searchPlaceholder="Search by flat no / tower…"
                        disabled={!can.view}
                    />
                </CardContent>
            </Card>

            {selectedFlat && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Flat"
                        value={selectedFlat.flat_no}
                        hint={selectedFlat.tower?.name ?? "No tower"}
                        icon={BookOpenText}
                        accentColor="bg-primary"
                    />
                    <MetricCard
                        label="Total Billed"
                        value={money(totalBilled)}
                        hint={`${invoices.length} invoice(s)`}
                        icon={Wallet}
                        accentColor="bg-info"
                        iconColor="bg-info/10 text-info border-info/20"
                    />
                    <MetricCard
                        label="Total Paid"
                        value={money(totalPaid)}
                        hint="Across all payments"
                        icon={Wallet}
                        accentColor="bg-success"
                        iconColor="bg-success/10 text-success border-success/20"
                    />
                    <MetricCard
                        label="Outstanding"
                        value={money(balance)}
                        hint={balance > 0 ? "Balance due" : "All settled"}
                        icon={Wallet}
                        accentColor={balance > 0 ? "bg-warning" : "bg-success"}
                        iconColor={
                            balance > 0
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-success/10 text-success border-success/20"
                        }
                    />
                </div>
            )}

            {invoices.length === 0 ? (
                <Card>
                    <CardContent className="pt-4">
                        <EmptyState
                            icon={BookOpenText}
                            title={t("invoices.flatLedgerEmpty")}
                            description="No invoices found for the selected flat."
                        />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Invoices & Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {invoices.map((invoice) => (
                            <div key={invoice.id} className="rounded-lg border border-border/60">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                                    <div>
                                        <p className="font-semibold">{invoice.invoice_number}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Period {invoice.billing_period} · Due {invoice.due_date}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right text-sm">
                                            <p className="text-xs text-muted-foreground">Total</p>
                                            <p className="font-semibold tabular-nums">{money(invoice.total_amount)}</p>
                                        </div>
                                        {invoiceStatusBadge(invoice.status)}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="space-y-1.5">
                                        {invoice.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-sm">
                                                <div>
                                                    <p className="font-medium">{item.title}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                                    )}
                                                </div>
                                                <p className="tabular-nums text-muted-foreground">
                                                    {item.quantity} × {money(item.unit_price)}
                                                    <span className="ml-2 font-semibold text-foreground">{money(item.amount)}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-sm">
                                        <p className="text-muted-foreground">
                                            Subtotal {money(invoice.subtotal)} · Tax {money(invoice.tax_amount)}
                                            {Number(invoice.penalty) > 0 && <> · Penalty {money(invoice.penalty)}</>}
                                        </p>
                                        <p>
                                            Paid <span className="font-semibold text-success dark:text-success">{money(invoice.paid_amount)}</span>
                                        </p>
                                    </div>
                                    {invoice.payments.length > 0 && (
                                        <div className="mt-3 space-y-1.5">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payments</p>
                                            {invoice.payments.map((payment) => (
                                                <div key={payment.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
                                                    <div>
                                                        <p className="font-medium">{payment.payment_number}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {payment.payment_method} · {new Date(payment.paid_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold tabular-nums text-success dark:text-success">
                                                        {money(payment.amount)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </AppLayout>
    );
}
