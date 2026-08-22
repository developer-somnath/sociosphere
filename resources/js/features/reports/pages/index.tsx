import { Head, usePage } from "@inertiajs/react";
import { BarChart3, Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type ReportType = { key: string; label: string };

type IndexProps = {
    types: ReportType[];
    role: "superadmin" | "society";
    societyName: string | null;
};

const FORMATS = [
    { key: "csv", label: "CSV", icon: FileType },
    { key: "excel", label: "Excel", icon: FileSpreadsheet },
    { key: "pdf", label: "PDF", icon: FileText },
] as const;

export default function ReportsIndex() {
    const { types, role, societyName } = usePage<PageProps<IndexProps>>().props;
    const { t } = useI18n();

    const [selected, setSelected] = useState<string>(types[0]?.key ?? "collections");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const buildParams = () => {
        const p: Record<string, string> = { type: selected };
        if (from) p.from = from;
        if (to) p.to = to;
        return p;
    };

    const exportUrl = (format: string) => {
        const params = new URLSearchParams(buildParams());
        params.set("format", format);
        return `${route("reports.export")}?${params.toString()}`;
    };

    return (
        <AppLayout>
            <Head title={t("reports.pageTitle")} />

            <PageHeader
                title={t("reports.pageTitle")}
                description={
                    role === "superadmin"
                        ? t("reports.superAdminDescription")
                        : t("reports.societyDescription", { society: societyName ?? "" })
                }
                icon={<BarChart3 className="size-5" />}
            />

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>{t("reports.configureTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1.5">
                            <Label>{t("reports.reportType")}</Label>
                            <select
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                {types.map((type) => (
                                    <option key={type.key} value={type.key}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>{t("reports.fromDate")}</Label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>{t("reports.toDate")}</Label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {FORMATS.map(({ key, label, icon: Icon }) => (
                            <a
                                key={key}
                                href={exportUrl(key)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="emerald" className="gap-2">
                                    <Icon className="size-4" />
                                    {t("reports.exportAs", { format: label })}
                                </Button>
                            </a>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Download className="size-4" />
                        {t("reports.exportHint")}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
