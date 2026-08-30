import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/30 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-2xs font-bold",
        secondary:
          "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
        destructive:
          "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
        outline:
          "border border-slate-200 bg-white text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900",
        link: "text-primary underline-offset-4 hover:underline",
        brand: "bg-primary/10 text-primary border border-primary/20",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
        warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
        info: "bg-primary/10 text-primary border border-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
