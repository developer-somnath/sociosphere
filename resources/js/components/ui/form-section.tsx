import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
};

export function FormSection({ title, description, children, className }: FormSectionProps) {
    return (
        <section className={cn("space-y-4", className)}>
            <div className="border-b border-border/80 pb-2">
                <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
                {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="space-y-4 pt-1">{children}</div>
        </section>
    );
}
