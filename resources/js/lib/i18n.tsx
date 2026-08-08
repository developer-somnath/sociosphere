/**
 * Enterprise i18n & l10n Engine for SocioSphere
 * ---------------------------------------------------------------
 * 42-locale translation engine with:
 *  - Eager-loaded per-locale JSON catalogs (resources/js/locales/*.json)
 *  - English fallback + key fallback (graceful degradation)
 *  - LTR / RTL script direction engine
 *  - Intl-based date, currency & number formatting
 *  - React context provider synced to the Inertia `auth.locale` prop
 */

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";

/* ─── Catalog loading ─────────────────────────────────────────────────────── */

const catalogs = import.meta.glob<Record<string, string>>("../locales/*.json", {
    eager: true,
    import: "default",
}) as Record<string, Record<string, string> | { default: Record<string, string> }>;

/**
 * Normalise "…/locales/ar.json" → "ar", "…/locales/zh-CN.json" → "zh-CN".
 */
function localeCodeFromPath(path: string): string {
    const fileName = path.split("/").pop() ?? "";
    return fileName.replace(/\.json$/, "");
}

function extractCatalog(content: unknown): Record<string, string> {
    if (!content || typeof content !== "object") return {};
    if ("default" in content && typeof (content as { default: unknown }).default === "object") {
        return ((content as { default: Record<string, string> }).default ?? {}) as Record<string, string>;
    }
    return content as Record<string, string>;
}

const CATALOGS: Record<string, Record<string, string>> = Object.fromEntries(
    Object.entries(catalogs).map(([path, content]) => [localeCodeFromPath(path), extractCatalog(content)]),
);

/** Right-to-left script locales supported by the engine. */
export const RTL_CODES = new Set(["ar", "ur", "fa", "he"]);

/* ─── Module-level locale state ───────────────────────────────────────────── */

let currentLocale = "en";

export function setLocale(locale: string): void {
    const baseCode = locale ? locale.split("-")[0] : "en";
    currentLocale = CATALOGS[locale] ? locale : CATALOGS[baseCode] ? baseCode : "en";
}

export function getLocale(): string {
    return currentLocale;
}

export function getDir(locale: string = currentLocale): "ltr" | "rtl" {
    return RTL_CODES.has(locale) || RTL_CODES.has(locale.split("-")[0]) ? "rtl" : "ltr";
}

export function isRtl(locale: string = currentLocale): boolean {
    return getDir(locale) === "rtl";
}

/* ─── Translation lookup ──────────────────────────────────────────────────── */

type TranslationParams = Record<string, string | number>;

function resolveCatalog(locale: string): Record<string, string> {
    const baseCode = locale ? locale.split("-")[0] : "en";
    return CATALOGS[locale] ?? CATALOGS[baseCode] ?? CATALOGS["en"] ?? {};
}

/**
 * Translate a dot-namespaced key for the active locale.
 * Falls back to English, then to the raw key itself.
 * Supports `:param` and `{param}` interpolation.
 */
export function t(key: string, params?: TranslationParams, locale: string = currentLocale): string {
    const catalog = resolveCatalog(locale);
    const enCatalog = resolveCatalog("en");

    let text = catalog[key] ?? enCatalog[key] ?? key;

    if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
            text = text.replace(new RegExp(`:${paramKey}`, "g"), String(value));
            text = text.replace(new RegExp(`\\{\\s*${paramKey}\\s*\\}`, "g"), String(value));
        });
    }

    return text;
}

/* ─── Locale-aware formatting ─────────────────────────────────────────────── */

export function formatDate(date: string | Date, locale: string = currentLocale): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return String(date);

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(d);
}

export function formatDateTime(date: string | Date, locale: string = currentLocale): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return String(date);

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

export function formatCurrency(
    amount: number | string,
    currency: string = "INR",
    locale: string = currentLocale,
): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(num)) return String(amount);

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(num);
}

export function formatNumber(number: number | string, locale: string = currentLocale): string {
    const num = typeof number === "string" ? parseFloat(number) : number;
    if (Number.isNaN(num)) return String(number);

    return new Intl.NumberFormat(locale).format(num);
}

/* ─── React integration ───────────────────────────────────────────────────── */

type I18nContextValue = {
    locale: string;
    dir: "ltr" | "rtl";
    isRtl: boolean;
    t: (key: string, params?: TranslationParams) => string;
    formatDate: (date: string | Date) => string;
    formatDateTime: (date: string | Date) => string;
    formatCurrency: (amount: number | string, currency?: string) => string;
    formatNumber: (number: number | string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Syncs the i18n engine to the locale shared by the server (`auth.locale`),
 * applies the document `dir` / `lang` attributes for the LTR–RTL engine, and
 * exposes the full i18n API through context.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;
    const locale = auth?.locale ?? auth?.user?.locale ?? "en";
    setLocale(locale);
    const dir = getDir(locale);

    useEffect(() => {
        setLocale(locale);
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
        // Allow CSS to react to script direction.
        document.documentElement.dataset.dir = dir;
    }, [locale, dir]);

    const value = useMemo<I18nContextValue>(
        () => ({
            locale,
            dir,
            isRtl: dir === "rtl",
            t: (key: string, params?: TranslationParams) => t(key, params, locale),
            formatDate: (date: string | Date) => formatDate(date, locale),
            formatDateTime: (date: string | Date) => formatDateTime(date, locale),
            formatCurrency: (amount: number | string, currency?: string) => formatCurrency(amount, currency, locale),
            formatNumber: (number: number | string) => formatNumber(number, locale),
        }),
        [locale, dir],
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        // Outside the provider (e.g. tests) — fall back to module-level engine.
        return {
            locale: currentLocale,
            dir: getDir(),
            isRtl: isRtl(),
            t,
            formatDate,
            formatDateTime,
            formatCurrency,
            formatNumber,
        };
    }
    return ctx;
}

export default t;
