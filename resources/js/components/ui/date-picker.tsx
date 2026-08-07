import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover } from "radix-ui";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (value: string): Date | null => {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
};

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

export type DatePreset = { label: string; from: string; to: string };

type DatePickerProps = {
    /** ISO `yyyy-mm-dd` */
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    className?: string;
    /** Inclusive bounds (ISO `yyyy-mm-dd`) */
    min?: string;
    max?: string;
    /** Preset ranges (reports §4.10) — shown above the calendar, sets `value` to the preset's `from` date */
    presets?: DatePreset[];
};

/**
 * Dependency-free calendar popover (blueprint §4.10). Single-date selection
 * with month navigation, today highlight, min/max bounds, and optional
 * preset ranges for report filters. Native date input stays the mobile
 * fallback where `input[type=date]` is preferred.
 */
export function DatePicker({
    value,
    onValueChange,
    placeholder = "Select date…",
    disabled,
    id,
    className,
    min,
    max,
    presets,
}: DatePickerProps) {
    const today = useMemo(() => new Date(), []);
    const initial = value ? (parseISO(value) ?? today) : today;

    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(initial.getFullYear());
    const [viewMonth, setViewMonth] = useState(initial.getMonth());
    const [focused, setFocused] = useState<Date | null>(
        value ? (parseISO(value) ?? null) : null,
    );

    const minDate = min ? parseISO(min) : null;
    const maxDate = max ? parseISO(max) : null;

    const cells = useMemo(() => {
        const first = new Date(viewYear, viewMonth, 1);
        const startOffset = first.getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const result: (Date | null)[] = [];
        for (let i = 0; i < startOffset; i++) result.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            result.push(new Date(viewYear, viewMonth, d));
        }
        while (result.length < 42) result.push(null);
        return result;
    }, [viewYear, viewMonth]);

    const selectedDate = value ? parseISO(value) : null;

    const shiftMonth = (delta: number) => {
        const next = new Date(viewYear, viewMonth + delta, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    const isDisabled = (date: Date) =>
        (minDate !== null && date < minDate) ||
        (maxDate !== null && date > maxDate);

    const selectDate = (date: Date) => {
        if (isDisabled(date)) return;
        onValueChange(toISO(date));
        setFocused(date);
    };

    const moveFocus = (dx: number, dy: number) => {
        const base = focused ?? selectedDate ?? new Date(viewYear, viewMonth, 1);
        const next = new Date(
            base.getFullYear(),
            base.getMonth() + dy,
            base.getDate() + dx,
        );
        setFocused(next);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault();
                moveFocus(-1, 0);
                break;
            case "ArrowRight":
                e.preventDefault();
                moveFocus(1, 0);
                break;
            case "ArrowUp":
                e.preventDefault();
                moveFocus(0, -1);
                break;
            case "ArrowDown":
                e.preventDefault();
                moveFocus(0, 1);
                break;
            case "Enter": {
                e.preventDefault();
                const base = focused ?? selectedDate;
                if (base) selectDate(base);
                break;
            }
        }
    };

    const display = selectedDate
        ? selectedDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "";

    return (
        <Popover.Root
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (next) {
                    const base = value ? (parseISO(value) ?? today) : today;
                    setViewYear(base.getFullYear());
                    setViewMonth(base.getMonth());
                    setFocused(value ? (parseISO(value) ?? null) : null);
                }
            }}
        >
            <Popover.Trigger asChild>
                <button
                    type="button"
                    id={id}
                    disabled={disabled}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className={cn(
                        "inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        "hover:bg-accent/50",
                        open && "border-primary ring-2 ring-ring/30",
                        className,
                    )}
                >
                    <span
                        className={cn(
                            "flex items-center gap-2",
                            !selectedDate && "text-muted-foreground",
                        )}
                    >
                        <CalendarDays className="size-4 shrink-0" />
                        <span className="tabular-nums">
                            {display || placeholder}
                        </span>
                    </span>
                    {value !== "" && (
                        <span
                            role="button"
                            aria-label="Clear date"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                onValueChange("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onValueChange("");
                                }
                            }}
                            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="size-3.5" />
                        </span>
                    )}
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={6}
                    className="z-50 rounded-2xl border border-border/70 bg-popover p-3 shadow-lg outline-none"
                    onKeyDown={handleKeyDown}
                >
                    {presets && presets.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 rounded-full px-2.5 text-xs"
                                    onClick={() => {
                                        onValueChange(preset.from);
                                        setOpen(false);
                                    }}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between px-1 pb-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => shiftMonth(-1)}
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <p className="text-sm font-semibold text-foreground">
                            {new Date(viewYear, viewMonth, 1).toLocaleDateString(
                                undefined,
                                { month: "long", year: "numeric" },
                            )}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => shiftMonth(1)}
                            aria-label="Next month"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>

                    <div role="grid" aria-label="Calendar" className="select-none">
                        <div className="grid grid-cols-7 gap-1 pb-1">
                            {WEEKDAYS.map((weekday) => (
                                <span
                                    key={weekday}
                                    className="text-center text-[11px] font-medium text-muted-foreground"
                                >
                                    {weekday}
                                </span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {cells.map((date, index) => {
                                if (!date) {
                                    return <span key={`blank-${index}`} />;
                                }
                                const isSelected = selectedDate
                                    ? isSameDay(date, selectedDate)
                                    : false;
                                const isToday = isSameDay(date, today);
                                const disabled = isDisabled(date);
                                const isFocused = focused
                                    ? isSameDay(date, focused)
                                    : false;
                                return (
                                    <button
                                        key={date.toISOString()}
                                        type="button"
                                        role="gridcell"
                                        aria-selected={isSelected}
                                        disabled={disabled}
                                        onClick={() => selectDate(date)}
                                        className={cn(
                                            "flex size-9 items-center justify-center rounded-full text-sm tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35",
                                            isSelected
                                                ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                                                : isToday
                                                  ? "font-semibold text-primary ring-1 ring-inset ring-primary/40 hover:bg-primary/10"
                                                  : "text-foreground hover:bg-accent",
                                            isFocused &&
                                                !isSelected &&
                                                "bg-accent",
                                        )}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
