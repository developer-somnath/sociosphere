import { ChevronDown, Search } from "lucide-react";

import { router } from "@inertiajs/react";
import { Tower } from "@/types/tower";
import { Select } from "@/Components/ui";
import { useDebounce } from "@/Hooks/useDebounce";
import { useState } from "react";
interface Props {
    filters: {
        search?: string;
        tower_id?: string;
        status?: string;
    };

    towers: Tower[];
}

export default function FlatsToolbar({ filters, towers }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    const debouncedSearch = useDebounce(search, 500);
    const updateFilters = (key: string, value: string) => {
        router.get(
            "/flats",
            {
                ...filters,
                search: debouncedSearch,
                [key]: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <div className="border rounded-2xl p-4 bg-white">
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                    <input
                        type="text"
                        defaultValue={filters.search}
                        onChange={(e) =>
                            updateFilters("search", e.target.value)
                        }
                        placeholder="Search by Flat No., Owner, or Tower..."
                        className="
                            w-full
                            h-14
                            rounded-xl
                            border
                            pl-12
                            pr-4
                            text-sm
                            outline-none
                            focus:ring-2
                            focus:ring-emerald-500
                        "
                    />
                </div>

                {/* Tower Filter */}

                <div className="relative">
                    <Select
                        options={[
                            {
                                value: "",
                                label: "All Towers",
                            },
                            ...towers.map((tower) => ({
                                value: tower.uuid,
                                label: tower.name,
                            })),
                        ]}
                        value={filters.tower_id || ""}
                        onChange={(e) =>
                            updateFilters("tower_id", e.target.value)
                        }
                        className="
                            h-14
                            min-w-[200px]
                            rounded-xl
                            border
                            px-4
                            pr-10
                            appearance-none
                            bg-white
                            text-sm
                            font-medium
                            outline-none
                            cursor-pointer
                        "
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex h-14 rounded-xl border overflow-hidden">
                    {[
                        {
                            label: "All",
                            value: "All",
                        },
                        {
                            label: "Occupied",
                            value: "Occupied",
                        },
                        {
                            label: "Vacant",
                            value: "Vacant",
                        },
                        {
                            label: "Self-Occupied",
                            value: "Self-Occupied",
                        },
                    ].map((item) => {
                        const active = filters.status === item.value;

                        return (
                            <button
                                key={item.value}
                                onClick={() =>
                                    updateFilters("status", item.value)
                                }
                                className={`
                                    px-6
                                    text-sm
                                    border-r
                                    transition-colors

                                    ${
                                        active
                                            ? "bg-emerald-100 text-emerald-700 font-medium"
                                            : "hover:bg-muted/40"
                                    }
                                `}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
