import type { ReactNode } from "react";

type FormSectionProps = { title: string; description?: string; children: ReactNode };

export function FormSection({ title, description, children }: FormSectionProps) {
    return <section className="rounded-2xl border border-border/60 bg-muted/25 p-4 sm:p-5"><div className="mb-5"><h2 className="text-sm font-semibold">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>{children}</section>;
}
