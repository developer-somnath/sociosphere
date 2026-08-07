import { FileDown, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ExportFormat = "csv" | "xlsx" | "pdf";

type ExportMenuItem = {
    format: ExportFormat;
    label: string;
    description: string;
    icon: typeof FileSpreadsheet;
};

const EXPORT_ITEMS: ExportMenuItem[] = [
    { format: "csv", label: "CSV", description: "Plain-text, spreadsheet-ready", icon: FileSpreadsheet },
    { format: "xlsx", label: "Excel", description: "Formatted workbook (.xlsx)", icon: FileType },
    { format: "pdf", label: "PDF", description: "Printable document", icon: FileText },
];

type ExportMenuProps = {
    onExport: (format: ExportFormat) => void;
    disabled?: boolean;
    className?: string;
};

/**
 * Export dropdown (blueprint §8 — table export). Wire `onExport` to a
 * server route; large exports should be queued and delivered via
 * notification with a signed download link rather than blocking the request.
 */
export function ExportMenu({ onExport, disabled, className }: ExportMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    aria-label="Export data"
                    data-slot="export-menu-trigger"
                >
                    <FileDown />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn("min-w-56", className)}>
                <DropdownMenuLabel>Export as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {EXPORT_ITEMS.map(({ format, label, description, icon: Icon }) => (
                    <DropdownMenuItem
                        key={format}
                        onSelect={() => {
                            setOpen(false);
                            onExport(format);
                        }}
                    >
                        <Icon className="text-muted-foreground" />
                        <span className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-xs font-normal text-muted-foreground">{description}</span>
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
