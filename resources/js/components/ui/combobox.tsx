import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover } from "radix-ui";
import { useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ComboboxItem = {
    value: string;
    label: string;
    description?: string;
};

type ComboboxProps = {
    items: ComboboxItem[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    id?: string;
    className?: string;
};

/**
 * Searchable select (blueprint §4.10). Dependency-free combobox built on
 * Radix Popover — used for towers/flats/residents/societies pickers.
 * Keyboard: type to search, ArrowUp/ArrowDown to move, Enter to select,
 * Esc to close. Selected item shows a check mark.
 */
export function Combobox({
    items,
    value,
    onValueChange,
    placeholder,
    emptyText,
    searchPlaceholder,
    disabled,
    id,
    className,
}: ComboboxProps) {
    const { t } = useI18n();
    const effectivePlaceholder = placeholder ?? t("common.select", undefined) ?? "Select…";
    const effectiveEmptyText = emptyText ?? t("ui.noRecordsMatch", undefined) ?? "No options found";
    const effectiveSearchPlaceholder = searchPlaceholder ?? t("common.search", undefined) ?? "Search…";

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(0);


    const selected = items.find((item) => item.value === value);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (item) =>
                item.label.toLowerCase().includes(q) ||
                item.value.toLowerCase().includes(q),
        );
    }, [items, query]);

    const handleSelect = (item: ComboboxItem) => {
        onValueChange(item.value);
        setOpen(false);
        setQuery("");
        setHighlight(0);
    };

    return (
        <Popover.Root
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (next) {
                    setQuery("");
                    setHighlight(0);
                }
            }}
        >
            <Popover.Trigger asChild>
                <button
                    type="button"
                    id={id}
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    disabled={disabled}
                    className={cn(
                        "inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        "hover:bg-accent/50",
                        open && "border-primary ring-2 ring-ring/30",
                        className,
                    )}
                >
                    <span className={cn("truncate", !selected && "text-muted-foreground")}>
                        {selected?.label ?? effectivePlaceholder}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={6}
                    className="z-50 w-[var(--radix-popover-trigger-width)] rounded-xl border border-border/70 bg-popover p-1.5 shadow-lg outline-none"
                >
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setHighlight(0);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setHighlight((h) =>
                                        Math.min(h + 1, filtered.length - 1),
                                    );
                                }
                                if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setHighlight((h) => Math.max(h - 1, 0));
                                }
                                if (e.key === "Enter") {
                                    const item = filtered[highlight];
                                    if (item) handleSelect(item);
                                }
                            }}
                            placeholder={effectiveSearchPlaceholder}
                            aria-label={effectiveSearchPlaceholder}
                            autoFocus
                            className="h-9 w-full rounded-lg border border-border/60 bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                    <ul role="listbox" className="mt-1 max-h-56 overflow-auto">
                        {filtered.length === 0 && (
                            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {effectiveEmptyText}
                            </li>
                        )}
                        {filtered.map((item, index) => {
                            const isSelected = item.value === value;
                            const isHighlighted = index === highlight;
                            return (
                                <li key={item.value}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setHighlight(index)}
                                        className={cn(
                                            "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none",
                                            isHighlighted ? "bg-accent" : "bg-transparent",
                                        )}
                                    >
                                        <span className="flex min-w-0 flex-col">
                                            <span className="truncate text-foreground">
                                                {item.label}
                                            </span>
                                            {item.description && (
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {item.description}
                                                </span>
                                            )}
                                        </span>
                                        {isSelected && (
                                            <Check className="size-4 shrink-0 text-primary" />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
