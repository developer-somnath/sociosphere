import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, History, ReceiptText } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import type { PageProps } from "@/types";

type Run = {
    id: number;
    uuid: string;
    billing_period: string;
    total_flats: number;
    billed_flats: number;
    excluded_flats: number;
    skipped_flats: number;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    invoices_generated: number;
    status: string;
    notes: string | null;
    created_at: string;
    run_by: { id: number; name: string } | null;
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

type BillingRunsProps = {
    runs: Paginated<Run>;
    can: { run: boolean; configure: boolean };
};

function money(value: number | null | undefined) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function runStatusBadge(status: string) {
    if (status === "Completed") {
        return (
            <Badge className="border-transparent bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                Completed
            </Badge>
        );
    }
    if (status === "Failed") {
        return <Badge variant="destructive">Failed</Badge>;
    }
    if (status === "Running") {
        return (
            <Badge className="border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                Running
            </Badge>
        );
    }
    return <Badge variant="secondary">{status}</Badge>;
}

export default function BillingRuns() {
    const { runs, can } = usePage<PageProps<BillingRunsProps>>().props;

    return (
        <AppLayout>
            <Head title="Billing Run History" />

            <PageHeader
                title="Billing Run History"
                description="Every auto-billing run executed for this society."
                icon={<History className="size-5" />}
                breadcrumbs={[{ label: "Finance" }, { label: "Run History" }]}
                actions={
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("billing.preview")}>
                            <ArrowLeft className="size-4" />
                            Back to Engine
                        </Link>
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    {runs.data.length === 0 ? (
                        <EmptyState
                            icon={ReceiptText}
                            title="No billing runs yet"
                            description="Run the auto-billing engine from the Batch Generate page to see history here."
                        />
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-border/60">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-3 py-2 font-medium">Period</th>
                                        <th className="px-3 py-2 font-medium text-right">Invoices</th>
                                        <th className="px-3 py-2 font-medium text-right">Flats</th>
                                        <th className="px-3 py-2 font-medium text-right">Excluded</th>
                                        <th className="px-3 py-2 font-medium text-right">Skipped</th>
                                        <th className="px-3 py-2 font-medium text-right">Total</th>
                                        <th className="px-3 py-2 font-medium">Run By</th>
                                        <th className="px-3 py-2 font-medium">Status</th>
                                        <th className="px-3 py-2 font-medium">When</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.data.map((run) => (
                                        <tr key={run.id} className="border-b last:border-0">
                                            <td className="px-3 py-2.5 font-medium">{run.billing_period}</td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">{run.invoices_generated}</td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">{run.billed_flats}</td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">{run.excluded_flats}</td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">{run.skipped_flats}</td>
                                            <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{money(run.total_amount)}</td>
                                            <td className="px-3 py-2.5 text-muted-foreground">{run.run_by?.name ?? "—"}</td>
                                            <td className="px-3 py-2.5">{runStatusBadge(run.status)}</td>
                                            <td className="px-3 py-2.5 text-muted-foreground">
                                                {new Date(run.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {runs.last_page > 1 && (
                        <div className="mt-4">
                            <Pagination
                                page={runs.current_page}
                                perPage={runs.per_page}
                                total={runs.total}
                                onPageChange={(next) =>
                                    router.get(
                                        route("billing.runs"),
                                        { page: next },
                                        { preserveState: true, replace: true },
                                    )
                                }
                                noun="runs"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
