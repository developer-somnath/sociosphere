import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    Eye,
    Pencil,
    Plus,
    Receipt,
    Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableFull, type Selection } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExportFormat } from "@/components/ui/export-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { QuickActionPill } from "@/components/ui/quick-action-pill";
import { RowActions } from "@/components/ui/row-actions";
import { exportCsv } from "@/lib/export-csv";
import { toast } from "@/lib/toast";
import type { PageProps } from "@/types";

type InvoiceItem = {
    id: number;
    uuid: string;
    invoice_number: string;
    billing_period: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    status: "Unpaid" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
    flat?: { id: number; flat_no: string; tower?: { id: number; name: string } };
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
    total_billed: number;
    total_collected: number;
    overdue_amount: number;
    unpaid_count: number;
};

type IndexProps = {
    invoices: Paginated<InvoiceItem>;
    stats: Stats;
    filters: {
        search: string;
        status: string | null;
        period: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

function invoiceStatusBadge(status: InvoiceItem["status"]) {
    switch (status) {
        case "Paid":
            return (
                <Badge className="border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Paid
                </Badge>
            );
        case "Partially Paid":
            return (
                <Badge className="border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                    Partially Paid
                </Badge>
            );
        case "Unpaid":
            return (
                <Badge className="border-transparent bg-amber-600/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    Unpaid
                </Badge>
            );
        case "Overdue":
            return <Badge variant="destructive">Overdue</Badge>;
        default:
            return <Badge variant="secondary">Cancelled</Badge>;
    }
}

export default function InvoicesIndex() {
    const { invoices, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState<string>(filters.status ?? "");
    const [period, setPeriod] = useState<string>(filters.period ?? "");
    const [selectedIds, setSelectedIds] = useState<Selection>([]);
    const [confirming, setConfirming] = useState<InvoiceItem | null>(null);
    const isFirstRender = useRef(true);

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
        status: status !== "" ? status : undefined,
        period: period !== "" ? period : undefined,
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
                route("invoices.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, status, period]);

    const handleSort = (next: { key: string; direction: "asc" | "desc" }) => {
        router.get(
            route("invoices.index"),
            { ...buildParams(), sort_by: next.key, sort_dir: next.direction },
            { preserveState: true, replace: true },
        );
    };

    const handleDestroy = () => {
        if (!confirming) return;
        const invoice = confirming;
        setConfirming(null);
        router.delete(route("invoices.destroy", invoice.uuid));
    };

    const bulkDelete = () => {
        selectedIds.forEach((id, index) => {
            const invoice = invoices.data.find(
                (candidate) => candidate.id === id || candidate.uuid === id,
            );
            if (!invoice) return;
            setTimeout(
                () =>
                    router.delete(route("invoices.destroy", invoice.uuid), {
                        preserveScroll: true,
                    }),
                index * 80,
            );
        });
        setSelectedIds([]);
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
        exportCsv<InvoiceItem>({
            filename: "invoices.csv",
            columns: [
                {
                    header: "Invoice No",
                    accessor: (inv) => inv.invoice_number,
                },
                {
                    header: "Flat",
                    accessor: (inv) =>
                        inv.flat
                            ? `Flat ${inv.flat.flat_no} ${inv.flat.tower ? `(${inv.flat.tower.name})` : ""}`
                            : "",
                },
                { header: "Billing Period", accessor: (inv) => inv.billing_period },
                { header: "Total Amount", accessor: (inv) => inv.total_amount },
                { header: "Paid Amount", accessor: (inv) => inv.paid_amount },
                { header: "Status", accessor: (inv) => inv.status },
            ],
            rows: invoices.data,
        });
    };

    const columns: ColumnDef<InvoiceItem>[] = useMemo(
        () => [
            {
                id: "invoice",
                header: "Invoice No",
                sortable: true,
                sortKey: "invoice_number",
                cell: (inv) => (
                    <span className="font-mono font-semibold text-foreground">
                        {inv.invoice_number}
                    </span>
                ),
            },
            {
                id: "flat",
                header: "Flat",
                cell: (inv) => (
                    <span className="font-medium">
                        {inv.flat
                            ? `Flat ${inv.flat.flat_no} ${inv.flat.tower ? `(${inv.flat.tower.name})` : ""}`
                            : "—"}
                    </span>
                ),
            },
            {
                id: "period",
                header: "Billing Period",
                sortable: true,
                sortKey: "billing_period",
                cell: (inv) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {inv.billing_period}
                    </span>
                ),
            },
            {
                id: "total",
                header: "Total Amount",
                sortable: true,
                sortKey: "total_amount",
                align: "right",
                cell: (inv) => (
                    <span className="font-mono font-medium text-foreground">
                        ₹{Number(inv.total_amount).toLocaleString()}
                    </span>
                ),
            },
            {
                id: "paid",
                header: "Paid Amount",
                align: "right",
                cell: (inv) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        ₹{Number(inv.paid_amount).toLocaleString()}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Status",
                sortable: true,
                sortKey: "status",
                cell: (inv) => invoiceStatusBadge(inv.status),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (inv) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: "View",
                                    icon: Eye,
                                    onClick: () =>
                                        router.visit(route("invoices.show", inv.uuid)),
                                },
                                {
                                    label: "Edit",
                                    icon: Pencil,
                                    disabled: !can.update,
                                    onClick: () =>
                                        router.visit(route("invoices.edit", inv.uuid)),
                                },
                                {
                                    label: "Delete",
                                    icon: Trash2,
                                    destructive: true,
                                    separatorBefore: true,
                                    disabled: !can.delete,
                                    onClick: () => setConfirming(inv),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [can],
    );

    return (
        <AppLayout>
            <Head title="Maintenance & Invoices" />

            <PageHeader
                title="Maintenance & Billing Management"
                description="Generate maintenance dues, track flat billing ledgers, and manage payment receipts."
                icon={<Receipt className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("invoices.create")}
                            icon={Plus}
                            label="Issue Invoice"
                            variant="rose"
                        />
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Billed Dues" value={`₹${Number(stats.total_billed).toLocaleString()}`} icon={Receipt} accent="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                <MetricCard label="Collected Revenue" value={`₹${Number(stats.total_collected).toLocaleString()}`} icon={CheckCircle2} accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
                <MetricCard label="Overdue Dues" value={`₹${Number(stats.overdue_amount).toLocaleString()}`} icon={AlertTriangle} accent="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400" />
                <MetricCard label="Pending Invoices" value={stats.unpaid_count} icon={DollarSign} accent="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search invoice no, flat no..."
                searchLabel="Search invoices"
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setStatus("");
                    setPeriod("");
                    router.get(route("invoices.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-10 rounded-full border border-border/70 bg-background/80 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                </select>

                <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </FilterBar>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    <DataTableFull<InvoiceItem>
                        columns={columns}
                        data={invoices.data}
                        rowKey={(inv) => inv.id}
                        sort={sort}
                        onSort={handleSort}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onExport={handleExport}
                        emptyState={
                            <EmptyState
                                icon={Receipt}
                                title="No invoices found"
                                description="Generate your first maintenance invoice to get started."
                            />
                        }
                    />
                    {invoices.last_page > 1 && (
                        <Pagination
                            page={invoices.current_page}
                            perPage={invoices.per_page}
                            total={invoices.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("invoices.index"),
                                    { ...buildParams(), page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun="invoices"
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun="invoices"
                actions={[
                    {
                        label: "Delete",
                        icon: <Trash2 />,
                        destructive: true,
                        disabled: !can.delete,
                        onClick: bulkDelete,
                    },
                ]}
            />

            <ConfirmDialog
                open={confirming !== null}
                onOpenChange={(open) => !open && setConfirming(null)}
                title="Delete invoice?"
                description={`This will permanently cancel and delete invoice ${confirming?.invoice_number ?? ""}. This action cannot be undone.`}
                confirmLabel="Delete invoice"
                destructive
                onConfirm={handleDestroy}
            />
        </AppLayout>
    );
}
