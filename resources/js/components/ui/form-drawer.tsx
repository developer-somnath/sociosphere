import type { ReactNode } from "react";

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type FormDrawerProps = { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; icon?: ReactNode; children: ReactNode; footer: ReactNode; isDirty?: boolean };

export function FormDrawer({ open, onOpenChange, title, description, icon, children, footer, isDirty = false }: FormDrawerProps) {
    const requestChange = (nextOpen: boolean) => {
        if (!nextOpen && isDirty && !window.confirm("Discard your unsaved changes?")) return;
        onOpenChange(nextOpen);
    };

    return <Sheet open={open} onOpenChange={requestChange}><SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl"><SheetHeader className="border-b border-border/60 px-6 py-5"><div className="flex items-start gap-3">{icon && <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>}<div><SheetTitle>{title}</SheetTitle><SheetDescription className="mt-1">{description}</SheetDescription></div></div></SheetHeader><div className="flex-1 overflow-y-auto px-6 py-5">{children}</div><SheetFooter className="sticky bottom-0 border-t border-border/60 bg-popover/95 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end">{footer}</SheetFooter></SheetContent></Sheet>;
}
