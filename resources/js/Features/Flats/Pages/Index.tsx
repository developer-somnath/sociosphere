import { useState } from "react";

import DashboardLayout from "@/Layouts/DashboardLayout";

import ResidentStats from "@/Features/Residents/Components/ResidentStats";
import ResidentToolbar from "@/Features/Residents/Components/ResidentToolbar";
import ResidentTable from "@/Features/Residents/Components/ResidentTable";
import OccupancyTrends from "@/Features/Residents/Components/OccupancyTrends";
import QuickFilters from "@/Features/Residents/Components/QuickFilters";

import { PaginatedResponse } from "@/types/pagination";
import { Flat } from "@/types/flat";
import FlatsToolbar from "../Components/FlatsToolbar";
import FlatTable from "../Components/FlatTable";
import { Button } from "@/Components/ui";
import { Tower } from "@/types/tower";
import FlatStats from "../Components/FlatStats";
import { router } from "@inertiajs/react";
interface FlatsPageProps {
    flats: PaginatedResponse<Flat>;
    filters: {
        search?: string;
        tower_id?: string;
        status?: string;
    };
    stats: {
        total_units: number;
        occupied_units: number;
        vacant_units: number;
        occupancy_rate: number;
    };
    towers: Tower[];
}

export default function Flats({ flats, filters, towers, stats }: FlatsPageProps) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Property Units
                        </h1>

                        <div className="flex items-center gap-3 mt-3">
                            <span className="bg-slate-800 text-white text-xs px-3 py-1 rounded-md tracking-wide uppercase">
                                Property: {flats.data[0]?.society?.name || "N/A"}
                            </span>

                            <span className="text-emerald-700 font-bold">
                                {stats.total_units} Total Units
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="warning"
                            className="
                            border
                            border-slate-300
                            rounded-lg
                            px-4
                            py-2
                        "
                        >
                            Import
                        </Button>

                        <Button
                            variant="outline"
                            className="
                            border
                            border-slate-300
                            rounded-lg
                            px-4
                            py-2
                        "
                        >
                            Export
                        </Button>

                        <Button
                            onClick={() => router.visit("/property-units/create")}
                            className="
                                    bg-emerald-600
                                    text-white
                                    rounded-lg
                                    px-4
                                    py-2
                                "
                        >
                            + Add New Property Unit
                        </Button>
                    </div>
                </div>
                {/* Toolbar */}
                <FlatsToolbar

                filters={filters}
                towers={towers}
                />

                {/* Table */}
                <FlatTable flats={flats.data} pagination={flats} />

                {/* Bottom Section */}
                <FlatStats stats={stats} />
            </div>
        </DashboardLayout>
    );
}
