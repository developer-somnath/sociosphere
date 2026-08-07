import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

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
    return (
        <section className={cn("rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur", className)}>
            {breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    {breadcrumbs.map((item, index) => (
                        <span key={`${item.label}-${index}`} className="flex items-center gap-1">
                            {index > 0 && <ChevronRight className="size-3" />}
                            {item.href ? <Link href={item.href} className="hover:text-foreground">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-start gap-3">
                    {icon && <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>}
                    <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
        </section>
    );
}
