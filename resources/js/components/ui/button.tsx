import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap shadow-sm transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border/80 bg-card/60 hover:bg-accent/80 hover:border-primary/40 hover:text-foreground hover:shadow-xs transition-all duration-200 backdrop-blur-xs text-foreground dark:border-border/60 dark:bg-card/40 dark:hover:bg-accent/50 dark:hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        "destructive-solid":
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        "destructive-ghost":
          "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/20 dark:hover:bg-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
        emerald:
          "rounded-full border-brand/40 bg-brand/10 text-brand hover:bg-brand hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/20 dark:bg-brand/20 dark:text-brand dark:hover:bg-brand dark:hover:text-white transition-all duration-200 shadow-2xs font-semibold",
        blue:
          "rounded-full border-info/40 bg-info/10 text-info hover:bg-info hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-info/20 dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white transition-all duration-200 shadow-2xs font-semibold",
        indigo:
          "rounded-full border-info/40 bg-info/10 text-info hover:bg-info hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-info/20 dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white transition-all duration-200 shadow-2xs font-semibold",
        teal:
          "rounded-full border-info/40 bg-info/10 text-info hover:bg-info hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-info/20 dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white transition-all duration-200 shadow-2xs font-semibold",
        purple:
          "rounded-full border-info/40 bg-info/10 text-info hover:bg-info hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-info/20 dark:bg-info/20 dark:text-info dark:hover:bg-info dark:hover:text-white transition-all duration-200 shadow-2xs font-semibold",
        amber:
          "rounded-full border-warning/40 bg-warning/10 text-warning hover:bg-warning hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-warning/20 dark:bg-warning/20 dark:text-warning dark:hover:bg-warning dark:hover:text-white transition-all duration-200 shadow-2xs font-semibold",
        rose:
          "rounded-full border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:hover:bg-destructive dark:hover:text-white transition-all duration-200 shadow-2xs font-semibold",
        gradient:
          "rounded-full bg-gradient-to-r from-info via-info to-info text-white border-transparent hover:opacity-95 hover:-translate-y-0.5 shadow-md shadow-info/20 active:scale-[0.98] transition-all duration-200 font-semibold",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
      loading?: boolean
    }
>(function Button(
  {
    className,
    variant = "default",
    size = "default",
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot.Root : "button"
  const isDisabled = disabled || loading

  // When asChild=true, Radix Slot.Root calls React.Children.only() on its
  // children. Rendering spinner + children as two siblings would crash with
  // "expected a single React element child". Wrap them in a Fragment so
  // Slot sees exactly one child regardless of asChild mode.
  const content = loading ? (
    <>
      <Loader2 className="animate-spin" aria-hidden />
      {children}
    </>
  ) : (
    <>{children}</>
  )

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }), loading && "pointer-events-none")}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </Comp>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
