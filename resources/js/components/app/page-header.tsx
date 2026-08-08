import { Link } from "@inertiajs/react";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href?: string };

type PageHeaderProps = {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
};

export function PageHeader({
    title,
    description,
    icon,
    actions,
    breadcrumbs = [],
    className,
}: PageHeaderProps) {
    const { t } = useI18n();
    const items = breadcrumbs.length > 0
        ? breadcrumbs
        : [
            { label: t("dashboard.overview"), href: "/dashboard" },
            { label: title },
          ];

    return (
        <div className="flex flex-col gap-2.5">
            {/* Breadcrumbs Navigation Outside & Above the Card */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 px-1 text-xs text-muted-foreground">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1 hover:text-primary transition-colors font-medium text-muted-foreground/80 hover:underline underline-offset-4"
                >
                    <Home className="size-3.5" />
                    <span>{t("common.home")}</span>
                </Link>
                {items.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                        <ChevronRight className="size-3 text-muted-foreground/50" />
                        {item.href ? (
                            <Link href={item.href} className="hover:text-primary transition-colors font-medium text-muted-foreground/80 underline-offset-4 hover:underline">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-semibold text-foreground" aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Main Header Card Container */}
            <section className={cn("rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur", className)}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        {icon && (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
                        </div>
                    </div>
                    {actions && <div className="flex flex-wrap gap-2.5 items-center">{actions}</div>}
                </div>
            </section>
        </div>
    );
}
