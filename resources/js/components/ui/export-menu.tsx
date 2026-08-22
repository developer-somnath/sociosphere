import { FileDown, FileSpreadsheet, FileText, FileType } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";

export type ExportFormat = "csv" | "excel" | "pdf";

type ExportMenuProps = {
    onExport: (format: ExportFormat) => void;
    disabled?: boolean;
};

export function ExportMenu({ onExport, disabled }: ExportMenuProps) {
    const { t } = useI18n();

    const options: { format: ExportFormat; labelKey: string; descriptionKey: string; icon: typeof FileText }[] = [
        {
            format: "csv",
            labelKey: "ui.exportCsv",
            descriptionKey: "ui.exportCsvDesc",
            icon: FileType,
        },
        {
            format: "excel",
            labelKey: "ui.exportExcel",
            descriptionKey: "ui.exportExcelDesc",
            icon: FileSpreadsheet,
        },
        {
            format: "pdf",
            labelKey: "ui.exportPdf",
            descriptionKey: "ui.exportPdfDesc",
            icon: FileText,
        },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
                    <FileDown className="size-4" />
                    <span>{t("ui.export")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("ui.exportAs")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map(({ format, labelKey, descriptionKey, icon: Icon }) => (
                    <DropdownMenuItem
                        key={format}
                        onClick={() => onExport(format)}
                        className="cursor-pointer gap-2.5 py-2"
                    >
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="flex flex-col">
                            <span className="font-medium text-foreground">{t(labelKey)}</span>
                            <span className="text-xs text-muted-foreground">{t(descriptionKey)}</span>
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
