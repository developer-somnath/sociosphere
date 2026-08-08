import { CornerDownLeft, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type CommandItem = {
    id: string;
    label: string;
    hint?: string;
    icon?: LucideIcon;
    keywords?: string[];
    onSelect: () => void;
};

export type CommandGroup = { label: string; items: CommandItem[] };

/** Opens the palette programmatically (e.g. from the topbar search pill). */
export function openCommandPalette(): void {
    window.dispatchEvent(new CustomEvent("sociosphere:open-palette"));
}

type FlatItem = CommandItem & { group: string };

/**
 * Global ⌘K command palette (blueprint §3). Self-contained: listens for
 * Ctrl/Cmd+K and the `sociosphere:open-palette` event, filters groups by
 * label + keywords, full keyboard navigation.
 */
export function CommandPalette({ groups }: { groups: CommandGroup[] }) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen((current) => !current);
            }
        };
        const onOpen = () => setOpen(true);

        window.addEventListener("keydown", onKey);
        window.addEventListener("sociosphere:open-palette", onOpen);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("sociosphere:open-palette", onOpen);
        };
    }, []);

    useEffect(() => {
        if (open) {
            setQuery("");
            setActive(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    const flatItems = useMemo<FlatItem[]>(
        () => groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label }))),
        [groups],
    );

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return groups;
        return groups
            .map((group) => ({
                ...group,
                items: group.items.filter(
                    (item) =>
                        item.label.toLowerCase().includes(q) ||
                        item.keywords?.some((keyword) => keyword.toLowerCase().includes(q)),
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [groups, query]);

    const flatResults = useMemo<FlatItem[]>(
        () => results.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label }))),
        [results],
    );

    const run = (item: CommandItem) => {
        setOpen(false);
        item.onSelect();
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((current) => Math.min(current + 1, flatResults.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) => Math.max(current - 1, 0));
        } else if (event.key === "Enter") {
            const item = flatResults[active];
            if (item) run(item);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    aria-describedby={undefined}
                    onKeyDown={onKeyDown}
                    className="fixed left-1/2 top-[12vh] z-50 w-[min(640px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover shadow-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                >
                    <Dialog.Title className="sr-only">{t("menu.commandPalette")}</Dialog.Title>
                    <div className="flex items-center gap-2 border-b px-4">
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setActive(0);
                            }}
                            placeholder={t("menu.commandPalette")}
                            aria-label={t("menu.commandPalette")}
                            className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto p-2">
                        {flatResults.length === 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                {t("menu.noResults", { query })}
                            </div>
                        ) : (
                            results.map((group) => (
                                <div key={group.label} className="mb-1">
                                    <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {group.label}
                                    </p>
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const index = flatResults.indexOf({ ...item, group: group.label });
                                        const selected = index === active;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => run(item)}
                                                onMouseEnter={() => setActive(index)}
                                                className={cn(
                                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                                                    selected
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-foreground",
                                                )}
                                            >
                                                {Icon ? (
                                                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                                                ) : null}
                                                <span className="flex-1 truncate">{item.label}</span>
                                                {item.hint ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.hint}
                                                    </span>
                                                ) : null}
                                                {selected ? (
                                                    <CornerDownLeft className="size-3.5 text-muted-foreground" />
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex items-center gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
                        <span>
                            <kbd className="rounded border bg-muted px-1">↑↓</kbd> {t("menu.navigate")}
                        </span>
                        <span>
                            <kbd className="rounded border bg-muted px-1">↵</kbd> {t("menu.select")}
                        </span>
                        <span>
                            <kbd className="rounded border bg-muted px-1">esc</kbd> {t("common.close")}
                        </span>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
