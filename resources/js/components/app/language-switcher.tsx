import { router, usePage } from "@inertiajs/react";
import { Check, Globe, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PageProps } from "@/types";

type LanguageItem = {
    code: string;
    name: string;
    native_name: string;
    script_dir: "ltr" | "rtl";
};

export function LanguageSwitcher() {
    const { auth } = usePage<PageProps>().props;
    const currentLocale = auth.locale ?? "en";
    const languages: LanguageItem[] = auth.languages ?? [
        { code: "en", name: "English", native_name: "English", script_dir: "ltr" },
        { code: "ar", name: "Arabic", native_name: "العربية", script_dir: "rtl" },
        { code: "bn", name: "Bengali", native_name: "বাংলা", script_dir: "ltr" },
        { code: "hi", name: "Hindi", native_name: "हिन्दी", script_dir: "ltr" },
        { code: "ur", name: "Urdu", native_name: "اردو", script_dir: "rtl" },
        { code: "es", name: "Spanish", native_name: "Español", script_dir: "ltr" },
        { code: "fr", name: "French", native_name: "Français", script_dir: "ltr" },
        { code: "de", name: "German", native_name: "Deutsch", script_dir: "ltr" },
    ];

    const [query, setQuery] = useState("");

    const currentLang = useMemo(
        () => languages.find((l) => l.code === currentLocale) ?? languages[0],
        [languages, currentLocale],
    );

    const filteredLanguages = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return languages;
        return languages.filter(
            (l) =>
                l.name.toLowerCase().includes(q) ||
                l.native_name.toLowerCase().includes(q) ||
                l.code.toLowerCase().includes(q),
        );
    }, [languages, query]);

    // Dynamic document direction setting (LTR / RTL)
    useEffect(() => {
        const isRtl = currentLang?.script_dir === "rtl" || auth.is_rtl;
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
        document.documentElement.lang = currentLocale;
    }, [currentLang, currentLocale, auth.is_rtl]);

    const handleSwitchLanguage = (code: string) => {
        try {
            router.post(route("language.switch"), { locale: code }, { preserveScroll: true });
        } catch {
            router.post("/language/switch", { locale: code }, { preserveScroll: true });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs font-medium hover:bg-muted"
                    aria-label="Switch Language"
                >
                    <Globe className="size-3.5 text-muted-foreground" />
                    <span className="max-w-[80px] truncate font-semibold">
                        {currentLang?.native_name ?? "English"}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl">
                <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Language / اللغة / ভাষা
                </DropdownMenuLabel>

                <div className="relative my-1 px-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search language..."
                        className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>

                <DropdownMenuSeparator className="my-1" />

                <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {filteredLanguages.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                            No languages found.
                        </div>
                    ) : (
                        filteredLanguages.map((lang) => {
                            const isSelected = lang.code === currentLocale;
                            return (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => handleSwitchLanguage(lang.code)}
                                    className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer ${
                                        isSelected ? "bg-primary/10 text-primary font-semibold" : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="font-semibold text-foreground truncate">
                                            {lang.native_name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            ({lang.name})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {lang.script_dir === "rtl" && (
                                            <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                                RTL
                                            </span>
                                        )}
                                        {isSelected && <Check className="size-3.5 text-primary" />}
                                    </div>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
