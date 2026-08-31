import { ArrowLeft } from "lucide-react";
import { Link } from "@inertiajs/react";
import { route, type RouteParams } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type BackButtonProps = {
    /** Destination route name (resolved via ziggy). Defaults to the previous page. */
    routeName?: string;
    /** Parameters for the ziggy route (e.g. `[id]`). */
    routeParams?: RouteParams<string>;
    /** Explicit href. Used when `routeName` is not provided. */
    href?: string;
    /** Override the default label (defaults to `common.back`). */
    label?: string;
    className?: string;
};

/**
 * Standardized "Back" navigation button.
 *
 * Single source of truth for the back-action UI across the app:
 *  - outline variant, small size, fully rounded pill
 *  - ArrowLeft icon at a consistent size-4
 *  - canonical `common.back` label (translated)
 *
 * Usage: <BackButton routeName="flats.index" /> or <BackButton href="/flats" />
 */
export function BackButton({ routeName, routeParams, href, label, className }: BackButtonProps) {
    const { t } = useI18n();
    const destination: string = href ?? (routeName ? route(routeName, routeParams) : "#");

    return (
        <Button
            variant="outline"
            size="sm"
            asChild
            className={className ?? "h-9 rounded-xl px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border-border bg-card shadow-2xs hover:bg-muted/60"}
        >
            <Link href={destination} className="inline-flex items-center gap-2" aria-label={label ?? t("common.back")}>
                <ArrowLeft className="size-4 shrink-0" />
                <span>{label ?? t("common.back")}</span>
            </Link>
        </Button>
    );
}
