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
            className={className ?? "rounded-full px-4 text-xs font-semibold hover:bg-muted"}
        >
            <Link href={destination} aria-label={label ?? t("common.back")}>
                <ArrowLeft className="size-4" />
                {label ?? t("common.back")}
            </Link>
        </Button>
    );
}
