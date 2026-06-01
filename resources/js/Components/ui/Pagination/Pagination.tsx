import { router } from "@inertiajs/react";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({
    links,
}: PaginationProps) {

    const previous = links[0];
    const next = links[links.length - 1];

    const pageLinks = links.slice(1, -1);

    return (
        <div className="flex items-center gap-2">

            {/* Prev */}

            {previous?.url && (
                <button
                    onClick={() => router.visit(previous.url!)}
                    className="
                        px-4
                        h-10

                        rounded-full

                        border
                        border-slate-200

                        text-sm

                        transition-all

                        hover:border-slate-900
                        hover:bg-slate-50
                    "
                >
                    Prev
                </button>
            )}

            {/* Pages */}

            {pageLinks.map((link, index) => {

                if (link.label === "...") {
                    return (
                        <span
                            key={index}
                            className="px-1 text-slate-400"
                        >
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={index}
                        disabled={!link.url}
                        onClick={() => {
                            if (link.url) {
                                router.visit(link.url);
                            }
                        }}
                        className={`
                            w-10
                            h-10

                            flex
                            items-center
                            justify-center

                            rounded-full

                            transition-all
                            duration-200

                            ${
                                link.active
                                    ? `
                                        border-2
                                        border-slate-900
                                        bg-slate-50
                                        font-semibold
                                        text-slate-900
                                      `
                                    : `
                                        border
                                        border-transparent
                                        text-slate-500

                                        hover:border-slate-300
                                        hover:bg-slate-50
                                        hover:text-slate-900
                                      `
                            }
                        `}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                );
            })}

            {/* Next */}

            {next?.url && (
                <button
                    onClick={() => router.visit(next.url!)}
                    className="
                        px-4
                        h-10

                        rounded-full

                        border
                        border-slate-200

                        text-sm

                        transition-all

                        hover:border-slate-900
                        hover:bg-slate-50
                    "
                >
                    Next
                </button>
            )}

        </div>
    );
}
