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
        <div className={cn("flex flex-col gap-2 mb-6", className)}>
            {/* Breadcrumbs Navigation */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1 hover:text-primary transition-colors font-medium hover:underline underline-offset-4"
                >
                    <Home className="size-3.5" />
                    <span>{t("common.home")}</span>
                </Link>
                {items.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                        <ChevronRight className="size-3 text-slate-400" />
                        {item.href ? (
                            <Link href={item.href} className="hover:text-primary transition-colors font-medium hover:underline underline-offset-4">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-semibold text-slate-700 dark:text-slate-300" aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Header Content Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-1">
                <div className="flex items-center gap-3.5">
                    {icon && (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && <div className="flex flex-wrap gap-2.5 items-center">{actions}</div>}
            </div>
        </div>
    );
}
