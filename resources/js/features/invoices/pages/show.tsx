import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Printer, Receipt, ShieldCheck } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type ShowProps = {
    invoice: {
        id: number;
        invoice_number: string;
        billing_period: string;
        issue_date: string;
        due_date: string;
        subtotal: number;
        tax_amount: number;
        discount_amount: number;
        total_amount: number;
        paid_amount: number;
        status: string;
        notes: string | null;
        society?: { name: string; address: string };
        flat?: { flat_no: string; tower?: { name: string } };
        items: { id: number; title: string; calculation_type: string; unit_price: number; quantity: number; amount: number }[];
        payments: { id: number; payment_number: string; amount: number; payment_method: string; paid_at: string; status: string }[];
    };
};

export default function InvoiceShow() {
    const { invoice } = usePage<PageProps<ShowProps>>().props;
    const { t } = useI18n();

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout>
            <Head title={t("invoices.showTitle", { number: invoice.invoice_number })} />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="rounded-xl">
                        <Link href={route("invoices.index")}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t("invoices.showTitle", { number: invoice.invoice_number })}</h1>
                        <p className="text-xs text-muted-foreground">{t("invoices.showBillingPeriod", { period: invoice.billing_period })}</p>
                    </div>
                </div>
                <Button onClick={handlePrint} variant="outline" className="rounded-xl">
                    <Printer className="mr-1.5 size-4" />
                    {t("invoices.printReceipt")}
                </Button>
            </div>

            <Card className="border-border/70 bg-card p-8 shadow-xl print:mx-auto print:max-w-4xl print:shadow-none print:border-none">
                <CardContent className="p-0 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border/60 pb-6">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-primary">{invoice.society?.name ?? "SocioSphere Society"}</h2>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">{invoice.society?.address ?? "Central Residential Complex, Phase II"}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="font-mono text-sm font-bold text-foreground">{t("invoices.stamp")}</span>
                            <p className="font-mono text-lg font-bold text-primary">{invoice.invoice_number}</p>
                            <div className="mt-2">
                                {invoice.status === "Paid" && <Badge className="bg-success">{t("invoices.badgePaid")}</Badge>}
                                {invoice.status === "Unpaid" && <Badge variant="outline" className="text-warning border-warning">{t("invoices.badgeUnpaid")}</Badge>}
                                {invoice.status === "Overdue" && <Badge variant="destructive">{t("invoices.badgeOverdue")}</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid sm:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-2xl border border-border/50">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t("invoices.billedTo")}</span>
                            <p className="font-bold text-base mt-1">
                                {t("invoices.flat")} {invoice.flat?.flat_no} {invoice.flat?.tower ? `(${invoice.flat.tower.name})` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">{t("invoices.residentMaintenanceDues")}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>
                                <span className="text-muted-foreground">{t("common.issueDate")}:</span>
                                <p className="font-medium text-foreground">{invoice.issue_date}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t("common.dueDate")}:</span>
                                <p className="font-medium text-foreground">{invoice.due_date}</p>
                            </div>
                        </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="py-3 font-medium">{t("invoices.colDescription")}</th>
                                    <th className="py-3 font-medium">{t("invoices.colCalculation")}</th>
                                    <th className="py-3 font-medium text-right">{t("common.unitPrice")}</th>
                                    <th className="py-3 font-medium text-right">{t("invoices.colQty")}</th>
                                    <th className="py-3 font-medium text-right">{t("common.amount")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr key={item.id} className="border-b border-border/40">
                                        <td className="py-3 font-medium text-foreground">{item.title}</td>
                                        <td className="py-3 text-xs text-muted-foreground">{item.calculation_type}</td>
                                        <td className="py-3 font-mono text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="py-3 font-mono text-right">{item.quantity}</td>
                                        <td className="py-3 font-mono font-semibold text-right">₹{Number(item.amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col items-end gap-1.5 border-t border-border/60 pt-4 text-right">
                        <div className="flex justify-between w-64 text-sm">
                            <span className="text-muted-foreground">{t("common.subtotal")}:</span>
                            <span className="font-mono">₹{Number(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        {Number(invoice.tax_amount) > 0 && (
                            <div className="flex justify-between w-64 text-sm">
                                <span className="text-muted-foreground">{t("common.tax")}:</span>
                                <span className="font-mono">₹{Number(invoice.tax_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between w-64 text-base font-bold pt-2 border-t border-border/60">
                            <span>{t("invoices.totalDues")}:</span>
                            <span className="font-mono text-primary">₹{Number(invoice.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm text-brand font-semibold">
                            <span>{t("invoices.amountPaid")}:</span>
                            <span className="font-mono">₹{Number(invoice.paid_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
