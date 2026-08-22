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
import { t, useI18n } from "@/lib/i18n";
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
                <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                    {t("common.paid")}
                </Badge>
            );
        case "Partially Paid":
            return (
                <Badge className="border-transparent bg-info/10 text-info dark:bg-info/10 dark:text-info">
                    {t("common.partiallyPaid")}
                </Badge>
            );
        case "Unpaid":
            return (
                <Badge className="border-transparent bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning">
                    {t("common.unpaid")}
                </Badge>
            );
        case "Overdue":
            return <Badge variant="destructive">{t("common.overdue")}</Badge>;
        default:
            return <Badge variant="secondary">{t("common.cancelled")}</Badge>;
    }
}

export default function InvoicesIndex() {
    const { invoices, stats, filters, can } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();
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
                title: t("invoices.exportComingSoon"),
                variant: "info",
                description: t("invoices.exportFormatComingSoon", {
                    format: format.toUpperCase(),
                }),
            });
            return;
        }
        exportCsv<InvoiceItem>({
            filename: "invoices.csv",
            columns: [
                {
                    header: t("invoices.colInvoiceNo"),
                    accessor: (inv) => inv.invoice_number,
                },
                {
                    header: t("invoices.colFlat"),
                    accessor: (inv) =>
                        inv.flat
                            ? `${t("invoices.colFlat")} ${inv.flat.flat_no} ${inv.flat.tower ? `(${inv.flat.tower.name})` : ""}`
                            : "",
                },
                { header: t("invoices.colBillingPeriod"), accessor: (inv) => inv.billing_period },
                { header: t("invoices.colTotalAmount"), accessor: (inv) => inv.total_amount },
                { header: t("invoices.colPaidAmount"), accessor: (inv) => inv.paid_amount },
                { header: t("common.status"), accessor: (inv) => inv.status },
            ],
            rows: invoices.data,
        });
    };

    const columns: ColumnDef<InvoiceItem>[] = useMemo(
        () => [
            {
                id: "invoice",
                header: t("invoices.colInvoiceNo"),
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
                header: t("invoices.colFlat"),
                cell: (inv) => (
                    <span className="font-medium">
                        {inv.flat
                            ? `${t("invoices.colFlat")} ${inv.flat.flat_no} ${inv.flat.tower ? `(${inv.flat.tower.name})` : ""}`
                            : "—"}
                    </span>
                ),
            },
            {
                id: "period",
                header: t("invoices.colBillingPeriod"),
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
                header: t("invoices.colTotalAmount"),
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
                header: t("invoices.colPaidAmount"),
                align: "right",
                cell: (inv) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        ₹{Number(inv.paid_amount).toLocaleString()}
                    </span>
                ),
            },
            {
                id: "status",
                header: t("common.status"),
                sortable: true,
                sortKey: "status",
                cell: (inv) => invoiceStatusBadge(inv.status),
            },
            {
                id: "actions",
                header: t("common.actions"),
                align: "right",
                cell: (inv) => (
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <RowActions
                            actions={[
                                {
                                    label: t("common.view"),
                                    icon: Eye,
                                    onClick: () =>
                                        router.visit(route("invoices.show", inv.uuid)),
                                },
                                {
                                    label: t("common.edit"),
                                    icon: Pencil,
                                    disabled: !can.update,
                                    onClick: () =>
                                        router.visit(route("invoices.edit", inv.uuid)),
                                },
                                {
                                    label: t("common.delete"),
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
        [can, t],
    );

    return (
        <AppLayout>
            <Head title={t("invoices.title")} />

            <PageHeader
                title={t("invoices.pageTitle")}
                description={t("invoices.pageDescription")}
                icon={<Receipt className="size-5" />}
                actions={
                    can.create && (
                        <QuickActionPill
                            href={route("invoices.create")}
                            icon={Plus}
                            label={t("invoices.issueInvoice")}
                            variant="rose"
                        />
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label={t("invoices.totalBilledDues")} value={`₹${Number(stats.total_billed).toLocaleString()}`} icon={Receipt} accent="border-info/20 bg-info/10 text-info dark:text-info" />
                <MetricCard label={t("invoices.collectedRevenue")} value={`₹${Number(stats.total_collected).toLocaleString()}`} icon={CheckCircle2} accent="border-success/20 bg-success/10 text-success dark:text-success" />
                <MetricCard label={t("invoices.overdueDues")} value={`₹${Number(stats.overdue_amount).toLocaleString()}`} icon={AlertTriangle} accent="border-destructive/20 bg-destructive/10 text-destructive dark:text-destructive" />
                <MetricCard label={t("invoices.pendingInvoices")} value={stats.unpaid_count} icon={DollarSign} accent="border-warning/20 bg-warning/10 text-warning dark:text-warning" />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t("invoices.searchPlaceholder")}
                searchLabel={t("invoices.searchLabel")}
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
                    <option value="">{t("invoices.allStatuses")}</option>
                    <option value="Unpaid">{t("common.unpaid")}</option>
                    <option value="Partially Paid">{t("common.partiallyPaid")}</option>
                    <option value="Paid">{t("common.paid")}</option>
                    <option value="Overdue">{t("common.overdue")}</option>
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
                                title={t("invoices.emptyTitle")}
                                description={t("invoices.emptyDescription")}
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
                            noun={t("invoices.nounPlural")}
                        />
                    )}
                </CardContent>
            </Card>

            <BulkActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                noun={t("invoices.nounPlural")}
                actions={[
                    {
                        label: t("common.delete"),
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
                title={t("invoices.confirmDeleteTitle")}
                description={t("invoices.confirmDeleteDescription", {
                    invoiceNumber: confirming?.invoice_number ?? "",
                })}
                confirmLabel={t("invoices.confirmDeleteLabel")}
                destructive
                onConfirm={handleDestroy}
            />
        </AppLayout>
    );
}
