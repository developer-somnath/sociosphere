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
    blue: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold",
    teal: "text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold",
    indigo: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold",
    rose: "text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold",
    amber: "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold",
    purple: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold",
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
