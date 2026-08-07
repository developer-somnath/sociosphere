import { Head, router, useForm, usePage } from "@inertiajs/react";
import { CheckCircle2, CreditCard, DollarSign, Receipt } from "lucide-react";
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
            <Badge className="border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                {method}
            </Badge>
        );
    }
    if (method === "Cash") {
        return (
            <Badge className="border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                {method}
            </Badge>
        );
    }
    return (
        <Badge className="border-transparent bg-amber-600/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            {method}
        </Badge>
    );
}

export default function PaymentsIndex() {
    const { payments, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
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
                title: "Export coming soon",
                variant: "info",
                description: `${format.toUpperCase()} export will be available soon.`,
            });
            return;
        }
        exportCsv<PaymentItem>({
            filename: "payments.csv",
            columns: [
                { header: "Receipt No", accessor: (pay) => pay.payment_number },
                {
                    header: "Invoice No",
                    accessor: (pay) => pay.invoice?.invoice_number ?? "",
                },
                {
                    header: "Flat",
                    accessor: (pay) => (pay.flat ? `Flat ${pay.flat.flat_no}` : ""),
                },
                { header: "Amount", accessor: (pay) => pay.amount },
                { header: "Method", accessor: (pay) => pay.payment_method },
                {
                    header: "Reference",
                    accessor: (pay) => pay.transaction_reference ?? "",
                },
                { header: "Date", accessor: (pay) => pay.paid_at },
            ],
            rows: payments.data,
        });
    };

    const columns: ColumnDef<PaymentItem>[] = useMemo(
        () => [
            {
                id: "receipt",
                header: "Receipt No",
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
                header: "Invoice No",
                cell: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {pay.invoice ? pay.invoice.invoice_number : "—"}
                    </span>
                ),
            },
            {
                id: "flat",
                header: "Flat",
                cell: (pay) => (
                    <span className="font-medium">
                        {pay.flat ? `Flat ${pay.flat.flat_no}` : "—"}
                    </span>
                ),
            },
            {
                id: "amount",
                header: "Amount",
                sortable: true,
                sortKey: "amount",
                align: "right",
                cell: (pay) => (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(pay.amount).toLocaleString()}
                    </span>
                ),
            },
            {
                id: "method",
                header: "Method",
                sortable: true,
                sortKey: "payment_method",
                cell: (pay) => methodBadge(pay.payment_method),
            },
            {
                id: "reference",
                header: "Ref / Trx ID",
                cell: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {pay.transaction_reference || "—"}
                    </span>
                ),
            },
            {
                id: "date",
                header: "Date",
                sortable: true,
                sortKey: "paid_at",
                align: "right",
                cell: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {new Date(pay.paid_at).toLocaleDateString()}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <AppLayout>
            <Head title="Payment Collections Ledger" />

            <PageHeader
                title="Payment Collections Ledger"
                description="Record and track maintenance payments across UPI, NetBanking, Cheques, and Cash."
                icon={<CreditCard className="size-5" />}
                actions={
                    can.create && (
                        <Button onClick={() => setShowNewModal(true)}>
                            <CreditCard />
                            Record Collection
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Collection" value={`₹${Number(stats.total_collected).toLocaleString()}`} icon={CheckCircle2} accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
                <MetricCard label="Online Payments" value={`₹${Number(stats.online_collected).toLocaleString()}`} icon={CreditCard} accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                <MetricCard label="Cash Collected" value={`₹${Number(stats.cash_collected).toLocaleString()}`} icon={DollarSign} accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400" />
                <MetricCard label="Cheque Clearing" value={`₹${Number(stats.cheque_collected).toLocaleString()}`} icon={Receipt} accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search payment no, ref..."
                searchLabel="Search payments"
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
                    <option value="">All Payment Methods</option>
                    <option value="UPI">UPI</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
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
                                title="No payments recorded yet"
                                description="Recorded collections will be logged here."
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
                            noun="payments"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Record Payment Drawer */}
            <FormDrawer
                open={showNewModal}
                onOpenChange={(open) => !open && setShowNewModal(false)}
                title="Record Payment Collection"
                description="Log a maintenance payment against an invoice."
                icon={<CreditCard className="size-5" />}
                footer={
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setShowNewModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="record-payment-form"
                            disabled={form.processing}
                        >
                            Record Payment
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
                        <Label>Invoice ID *</Label>
                        <Input
                            value={form.data.invoice_id}
                            onChange={(e) =>
                                form.setData("invoice_id", e.target.value)
                            }
                            placeholder="Invoice ID (e.g. 1)"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Amount Paid (₹) *</Label>
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
                        <Label>Payment Method *</Label>
                        <Combobox
                            items={[
                                { value: "UPI", label: "UPI" },
                                { value: "NetBanking", label: "NetBanking" },
                                { value: "Credit Card", label: "Credit Card" },
                                { value: "Cheque", label: "Cheque" },
                                { value: "Cash", label: "Cash" },
                            ]}
                            value={form.data.payment_method}
                            onValueChange={(value) =>
                                form.setData(
                                    "payment_method",
                                    value as PaymentItem["payment_method"],
                                )
                            }
                            placeholder="Select payment method…"
                            emptyText="No matching method"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Transaction Reference / Cheque No</Label>
                        <Input
                            value={form.data.transaction_reference}
                            onChange={(e) =>
                                form.setData(
                                    "transaction_reference",
                                    e.target.value,
                                )
                            }
                            placeholder="e.g. UPI/123456789"
                        />
                    </div>
                </form>
            </FormDrawer>
        </AppLayout>
    );
}
