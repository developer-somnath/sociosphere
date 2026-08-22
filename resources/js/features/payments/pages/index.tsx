import { Head, router, useForm, usePage } from "@inertiajs/react";
import { CheckCircle2, CreditCard, DollarSign, Download, Receipt } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { DataTableFull } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { exportCsv } from "@/lib/export-csv";
import { t, useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import type { PageProps } from "@/types";

type PaymentItem = {
    id: number;
    uuid: string;
    payment_number: string;
    amount: number;
    payment_method: "UPI" | "NetBanking" | "Credit Card" | "Cheque" | "Cash";
    transaction_reference: string | null;
    paid_at: string;
    status: string;
    flat?: { flat_no: string; tower?: { name: string } };
    invoice?: { invoice_number: string };
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

type Stats = {
    total_collected: number;
    online_collected: number;
    cash_collected: number;
    cheque_collected: number;
};

type IndexProps = {
    payments: Paginated<PaymentItem>;
    stats: Stats;
    filters: {
        search: string;
        method: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean };
};

function methodBadge(method: PaymentItem["payment_method"]) {
    const online = ["UPI", "NetBanking", "Credit Card"].includes(method);
    if (online) {
        return (
            <Badge className="border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info">
                {method}
            </Badge>
        );
    }
    if (method === "Cash") {
        return (
            <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                {method}
            </Badge>
        );
    }
    return (
        <Badge className="border-transparent bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning">
            {method}
        </Badge>
    );
}

export default function PaymentsIndex() {
    const { payments, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search);
    const [method, setMethod] = useState<string>(filters.method ?? "");
    const [showNewModal, setShowNewModal] = useState(false);
    const isFirstRender = useRef(true);

    const form = useForm({
        invoice_id: "",
        amount: "",
        payment_method: "UPI",
        transaction_reference: "",
        remarks: "",
    });

    const sort = filters.sort_by
        ? {
              key: filters.sort_by,
              direction: (filters.sort_dir === "asc" ? "asc" : "desc") as
                  | "asc"
                  | "desc",
          }
        : null;

    const buildParams = () => ({
        search: search.trim() || undefined,
        method: method !== "" ? method : undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                route("payments.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, method]);

    const handleCreatePayment = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("payments.store"), {
            onSuccess: () => {
                setShowNewModal(false);
                form.reset();
            },
        });
    };

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("payments.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const handleExport = (format: ExportFormat) => {
        if (format !== "csv") {
            toast({
                title: t("payments.exportComingSoon"),
                variant: "info",
                description: t("payments.exportFormatComingSoon", { format: format.toUpperCase() }),
            });
            return;
        }
        exportCsv<PaymentItem>({
            filename: "payments.csv",
            columns: [
                { header: t("payments.colReceiptNo"), accessor: (pay) => pay.payment_number },
                {
                    header: t("payments.colInvoiceNo"),
                    accessor: (pay) => pay.invoice?.invoice_number ?? "",
                },
                {
                    header: t("payments.colFlat"),
                    accessor: (pay) => (pay.flat ? `${t("payments.colFlat")} ${pay.flat.flat_no}` : ""),
                },
                { header: t("payments.colAmount"), accessor: (pay) => pay.amount },
                { header: t("payments.colMethod"), accessor: (pay) => pay.payment_method },
                {
                    header: t("payments.colReference"),
                    accessor: (pay) => pay.transaction_reference ?? "",
                },
                { header: t("payments.colDate"), accessor: (pay) => pay.paid_at },
            ],
            rows: payments.data,
        });
    };

    const columns: ColumnDef<PaymentItem>[] = useMemo(
        () => [
            {
                id: "receipt",
                header: t("payments.colReceiptNo"),
                sortable: true,
                sortKey: "payment_number",
                cell: (pay) => (
                    <span className="font-mono font-semibold text-foreground">
                        {pay.payment_number}
                    </span>
                ),
            },
            {
                id: "invoice",
                header: t("payments.colInvoiceNo"),
                cell: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {pay.invoice ? pay.invoice.invoice_number : "—"}
                    </span>
                ),
            },
            {
                id: "flat",
                header: t("payments.colFlat"),
                cell: (pay) => (
                    <span className="font-medium">
                        {pay.flat ? `${t("payments.colFlat")} ${pay.flat.flat_no}` : "—"}
                    </span>
                ),
            },
            {
                id: "amount",
                header: t("payments.colAmount"),
                sortable: true,
                sortKey: "amount",
                align: "right",
                cell: (pay) => (
                    <span className="font-mono font-bold text-brand dark:text-brand">
                        ₹{Number(pay.amount).toLocaleString()}
                    </span>
                ),
            },
            {
                id: "method",
                header: t("payments.colMethod"),
                sortable: true,
                sortKey: "payment_method",
                cell: (pay) => methodBadge(pay.payment_method),
            },
            {
                id: "reference",
                header: t("payments.colRefTrxId"),
                cell: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {pay.transaction_reference || "—"}
                    </span>
                ),
            },
            {
                id: "date",
                header: t("payments.colDate"),
                sortable: true,
                sortKey: "paid_at",
                align: "right",
                cell: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {new Date(pay.paid_at).toLocaleDateString()}
                    </span>
                ),
            },
            {
                id: "receipt",
                header: t("payments.receiptTitle"),
                align: "right",
                cell: (pay) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            window.open(
                                route("payments.receipt", pay.uuid),
                                "_blank",
                            )
                        }
                    >
                        <Download />
                        {t("payments.downloadReceipt")}
                    </Button>
                ),
            },
        ],
        [t],
    );

    return (
        <AppLayout>
            <Head title={t("payments.pageTitle")} />

            <PageHeader
                title={t("payments.pageTitle")}
                description={t("payments.pageDescription")}
                icon={<CreditCard className="size-5" />}
                actions={
                    can.create && (
                        <Button onClick={() => setShowNewModal(true)}>
                            <CreditCard />
                            {t("payments.recordCollection")}
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label={t("payments.totalCollection")} value={`₹${Number(stats.total_collected).toLocaleString()}`} icon={CheckCircle2} accent="border-success/20 bg-success/10 text-success dark:text-success" />
                <MetricCard label={t("payments.onlinePayments")} value={`₹${Number(stats.online_collected).toLocaleString()}`} icon={CreditCard} accent="border-info/20 bg-info/10 text-info dark:text-info" />
                <MetricCard label={t("payments.cashCollected")} value={`₹${Number(stats.cash_collected).toLocaleString()}`} icon={DollarSign} accent="border-info/20 bg-info/10 text-info dark:text-info" />
                <MetricCard label={t("payments.chequeClearing")} value={`₹${Number(stats.cheque_collected).toLocaleString()}`} icon={Receipt} accent="border-warning/20 bg-warning/10 text-warning dark:text-warning" />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("payments.searchPlaceholder")}
                searchLabel={t("payments.searchLabel")}
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setMethod("");
                    router.get(route("payments.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">{t("payments.allMethods")}</option>
                    <option value="UPI">{t("payments.method.upi")}</option>
                    <option value="NetBanking">{t("payments.method.netBanking")}</option>
                    <option value="Credit Card">{t("payments.method.creditCard")}</option>
                    <option value="Cheque">{t("payments.method.cheque")}</option>
                    <option value="Cash">{t("payments.method.cash")}</option>
                </select>
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<PaymentItem>
                        columns={columns}
                        data={payments.data}
                        rowKey={(pay) => pay.id}
                        sort={sort}
                        onSort={handleSort}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={CreditCard}
                                title={t("payments.emptyTitle")}
                                description={t("payments.emptyDescription")}
                            />
                        }
                    />
                    {payments.last_page > 1 && (
                        <Pagination
                            page={payments.current_page}
                            perPage={payments.per_page}
                            total={payments.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("payments.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun={t("payments.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Record Payment Drawer */}
            <FormDrawer
                open={showNewModal}
                onOpenChange={(open) => !open && setShowNewModal(false)}
                title={t("payments.drawerTitle")}
                description={t("payments.drawerDescription")}
                icon={<CreditCard className="size-5" />}
                footer={
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setShowNewModal(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            form="record-payment-form"
                            disabled={form.processing}
                        >
                            {t("payments.recordPayment")}
                        </Button>
                    </>
                }
            >
                <form
                    id="record-payment-form"
                    onSubmit={handleCreatePayment}
                    className="flex flex-col gap-5"
                >
                    <div className="space-y-1.5">
                        <Label>{t("payments.invoiceId")} *</Label>
                        <Input
                            value={form.data.invoice_id}
                            onChange={(e) =>
                                form.setData("invoice_id", e.target.value)
                            }
                            placeholder={t("payments.invoiceIdPlaceholder")}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("payments.amountPaid")} *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={form.data.amount}
                            onChange={(e) =>
                                form.setData("amount", e.target.value)
                            }
                            placeholder="2500.00"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("payments.paymentMethod")} *</Label>
                        <Combobox
                            items={[
                                { value: "UPI", label: t("payments.method.upi") },
                                { value: "NetBanking", label: t("payments.method.netBanking") },
                                { value: "Credit Card", label: t("payments.method.creditCard") },
                                { value: "Cheque", label: t("payments.method.cheque") },
                                { value: "Cash", label: t("payments.method.cash") },
                            ]}
                            value={form.data.payment_method}
                            onValueChange={(value) =>
                                form.setData(
                                    "payment_method",
                                    value as PaymentItem["payment_method"],
                                )
                            }
                            placeholder={t("payments.selectMethod")}
                            emptyText={t("payments.noMatchingMethod")}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("payments.transactionRef")}</Label>
                        <Input
                            value={form.data.transaction_reference}
                            onChange={(e) =>
                                form.setData(
                                    "transaction_reference",
                                    e.target.value,
                                )
                            }
                            placeholder={t("payments.refPlaceholder")}
                        />
                    </div>
                </form>
            </FormDrawer>
        </AppLayout>
    );
}
