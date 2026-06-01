import { useState } from "react";

import DashboardLayout from "@/Layouts/DashboardLayout";

import ResidentStats from "@/Features/Residents/Components/ResidentStats";
import ResidentToolbar from "@/Features/Residents/Components/ResidentToolbar";
import ResidentTable from "@/Features/Residents/Components/ResidentTable";
import OccupancyTrends from "@/Features/Residents/Components/OccupancyTrends";
import QuickFilters from "@/Features/Residents/Components/QuickFilters";

import { Resident } from "@/types/resident";
import { PaginatedResponse } from "@/types/pagination";

interface ResidentsPageProps {
    residents: PaginatedResponse<Resident>;
}

export default function Residents({
    residents,
}: ResidentsPageProps) {

    const [tower, setTower] = useState("A1");

    const towers = [
        "A1",
        "A2",
        "B1",
        "B2",
        "C1",
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">

                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Residents Directory
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Manage and view details of all apartment residents.
                        </p>
                    </div>

                    <ResidentStats />
                </div>

                {/* Toolbar */}
                <ResidentToolbar
                    towers={towers}
                    activeTower={tower}
                    onTowerChange={setTower}
                />

                {/* Table */}
                <ResidentTable
                    residents={residents.data}
                    pagination={residents}
                />

                {/* Bottom Section */}
                <div className="grid grid-cols-12 gap-6">

                    <div className="col-span-9">
                        <OccupancyTrends />
                    </div>

                    <div className="col-span-3">
                        <QuickFilters />
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
