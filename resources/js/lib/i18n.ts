/**
 * Enterprise i18n & l10n Utilities for SocioSphere
 */

type TranslationParams = Record<string, string | number>;

export function t(key: string, params?: TranslationParams): string {
    // Basic lookup key formatting & parameter interpolation
    let text = key;

    if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
            text = text.replace(new RegExp(`:${paramKey}`, "g"), String(value));
            text = text.replace(new RegExp(`{\\s*${paramKey}\\s*}`, "g"), String(value));
        });
    }

    return text;
}

export function formatDate(date: string | Date, locale: string = "en"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(d);
}

export function formatCurrency(amount: number | string, currency: string = "BDT", locale: string = "en"): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return String(amount);

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 2,
    }).format(num);
}

export function formatNumber(number: number | string, locale: string = "en"): string {
    const num = typeof number === "string" ? parseFloat(number) : number;
    if (isNaN(num)) return String(number);

    return new Intl.NumberFormat(locale).format(num);
}
