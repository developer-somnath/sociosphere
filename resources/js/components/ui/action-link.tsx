import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ActionLinkProps = ComponentPropsWithoutRef<typeof Link> & {
    children: ReactNode;
    variant?: "blue" | "teal" | "indigo" | "rose" | "amber" | "purple" | "neutral";
    showArrow?: boolean;
};

const variantClasses = {
    blue: "text-primary hover:text-primary/80 font-semibold",
    teal: "text-primary hover:text-primary/80 font-semibold",
    indigo: "text-brand hover:text-brand/80 font-semibold",
    rose: "text-destructive hover:text-destructive/80 font-semibold",
    amber: "text-warning hover:text-warning/80 font-semibold",
    purple: "text-primary hover:text-primary/80 font-semibold",
    neutral: "text-muted-foreground hover:text-foreground font-medium",
};

export function ActionLink({
    children,
    variant = "blue",
    showArrow = true,
    className,
    ...props
}: ActionLinkProps) {
    return (
        <Link
            className={cn(
                "group inline-flex items-center gap-1.5 text-xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                variantClasses[variant],
                className,
            )}
            {...props}
        >
            <span>{children}</span>
            {showArrow && (
                <ArrowRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            )}
        </Link>
    );
}
