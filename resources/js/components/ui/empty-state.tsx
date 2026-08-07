import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return <div className={cn("flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center", className)}><div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Icon className="size-6" /></div><h2 className="mt-4 text-sm font-semibold">{title}</h2><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
