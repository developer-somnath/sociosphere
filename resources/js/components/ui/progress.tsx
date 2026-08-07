import { cva, type VariantProps } from "class-variance-authority";
import { Progress as ProgressPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Progress bar (blueprint §4.16 / occupancy meters). Brand by default,
 * semantic `success` / `warning` / `destructive` variants available.
 */
const indicatorVariants = cva("size-full rounded-full transition-transform duration-300", {
    variants: {
        variant: {
            brand: "bg-primary",
            success: "bg-success",
            warning: "bg-warning",
            destructive: "bg-destructive",
        },
    },
    defaultVariants: { variant: "brand" },
});

type ProgressProps = ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    VariantProps<typeof indicatorVariants>;

export function Progress({
    value,
    variant = "brand",
    className,
    ...props
}: ProgressProps) {
    return (
        <ProgressPrimitive.Root
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-muted",
                className,
            )}
            value={value}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className={cn(indicatorVariants({ variant }))}
                style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    );
}
