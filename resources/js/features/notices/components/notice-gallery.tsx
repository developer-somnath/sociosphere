import { useState } from "react";
import { FileText, ImageIcon, X } from "lucide-react";

import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Attachment = string;

function isImage(src: string): boolean {
    return /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(src);
}

function fileName(src: string): string {
    try {
        const url = new URL(src, window.location.origin);
        const parts = url.pathname.split("/");
        return decodeURIComponent(parts[parts.length - 1] || src);
    } catch {
        const parts = src.split("/");
        return parts[parts.length - 1] || src;
    }
}

type NoticeGalleryProps = {
    attachments: Attachment[];
    className?: string;
};

/**
 * Renders a notice's attachment gallery: image thumbnails with a lightbox,
 * and non-image files as downloadable chips.
 */
export function NoticeGallery({ attachments, className }: NoticeGalleryProps) {
    const [preview, setPreview] = useState<string | null>(null);

    if (!attachments || attachments.length === 0) {
        return null;
    }

    return (
        <>
            <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", className)}>
                {attachments.map((src, i) => {
                    if (isImage(src)) {
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setPreview(src)}
                                className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted/40 transition-all hover:border-border"
                            >
                                <img
                                    src={src}
                                    alt={fileName(src)}
                                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </button>
                        );
                    }

                    return (
                        <a
                            key={i}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 p-2 text-center transition-all hover:border-border hover:bg-muted/70"
                        >
                            <FileText className="size-6 text-info" />
                            <span className="line-clamp-2 text-[10px] font-medium text-muted-foreground">
                                {fileName(src)}
                            </span>
                        </a>
                    );
                })}
            </div>

            <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
                <DialogPortal>
                    <DialogOverlay />
                    <DialogContent className="max-w-[min(900px,calc(100vw-32px))] border-0 bg-transparent p-0 shadow-none">
                        <button
                            type="button"
                            onClick={() => setPreview(null)}
                            className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                            aria-label="Close preview"
                        >
                            <X className="size-5" />
                        </button>
                        {preview && isImage(preview) ? (
                            <img
                                src={preview}
                                alt={fileName(preview)}
                                className="max-h-[85vh] w-full rounded-2xl object-contain"
                            />
                        ) : preview ? (
                            <div className="flex flex-col items-center gap-3 rounded-2xl bg-popover p-8 text-center">
                                <FileText className="size-10 text-info" />
                                <a
                                    href={preview}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                                >
                                    {fileName(preview)}
                                </a>
                            </div>
                        ) : null}
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </>
    );
}

export { ImageIcon };
