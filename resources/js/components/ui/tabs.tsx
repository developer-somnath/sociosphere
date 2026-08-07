import { cva } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import {
    createContext,
    forwardRef,
    useContext,
    type ComponentPropsWithoutRef,
    type ElementRef,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Tabs (blueprint §4.12).
 * Variants: `underline` (default — 2px brand underline on active),
 * `pills` (filter bars), `segmented` (view toggles: Table / Grid / Map).
 * Keyboard: arrow keys cycle tabs, `aria-selected` + `role="tab"` (Radix).
 */
const tabsVariants = ["underline", "pills", "segmented"] as const;
export type TabsVariant = (typeof tabsVariants)[number];

const TabsVariantContext = createContext<TabsVariant>("underline");

const listVariants = cva("inline-flex items-center", {
    variants: {
        variant: {
            underline: "w-full border-b border-border/70",
            pills: "gap-1 rounded-xl bg-muted/60 p-1",
            segmented: "rounded-full bg-muted/60 p-1",
        },
    },
    defaultVariants: { variant: "underline" },
});

const triggerVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
    {
        variants: {
            variant: {
                underline:
                    "-mb-px border-b-2 border-transparent px-3 py-2.5 text-muted-foreground hover:text-foreground data-[state=active]:border-primary",
                pills: "rounded-lg px-3.5 py-1.5 text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm",
                segmented:
                    "flex-1 rounded-full px-4 py-1.5 text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm",
            },
        },
        defaultVariants: { variant: "underline" },
    },
);

type TabsRootProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    variant?: TabsVariant;
};

function Tabs({ className, variant = "underline", ...props }: TabsRootProps) {
    return (
        <TabsVariantContext.Provider value={variant}>
            <TabsPrimitive.Root className={cn("w-full", className)} {...props} />
        </TabsVariantContext.Provider>
    );
}

type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
};

const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
    ({ className, variant, ...props }, ref) => {
        const contextVariant = useContext(TabsVariantContext);
        return (
            <TabsPrimitive.List
                ref={ref}
                className={cn(
                    listVariants({ variant: variant ?? contextVariant }),
                    className,
                )}
                {...props}
            />
        );
    },
);
TabsList.displayName = "TabsList";

type TabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant;
};

const TabsTrigger = forwardRef<
    ElementRef<typeof TabsPrimitive.Trigger>,
    TabsTriggerProps
>(({ className, variant, ...props }, ref) => {
    const contextVariant = useContext(TabsVariantContext);
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(
                triggerVariants({ variant: variant ?? contextVariant }),
                className,
            )}
            {...props}
        />
    );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef<
    ElementRef<typeof TabsPrimitive.Content>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            className,
        )}
        {...props}
    />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
