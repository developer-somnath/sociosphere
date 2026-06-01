
import { router } from "@inertiajs/react";
interface Props {
    towers: string[];
    activeTower: string;
    onTowerChange: (tower: string) => void;
}

export default function ResidentToolbar({
    towers,
    activeTower,
    onTowerChange,
}: Props) {
    return (
        <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-4
            mb-6
        ">
            <div className="flex items-center justify-between">

                {/* Left Side */}
                <div className="flex items-center gap-4">

                    {/* Tower Tabs */}
                    <div className="flex gap-2">

                        {towers.map((tower) => (
                            <button
                                key={tower}
                                onClick={() => onTowerChange(tower)}
                                className={`
                                    px-4 py-2
                                    rounded-lg
                                    text-sm
                                    border
                                    transition

                                    ${
                                        activeTower === tower
                                                            ? `
                                                                bg-slate-900
                                                                text-white
                                                                shadow-sm
                                                            `
                                                            : `
                                                                bg-white
                                                                text-slate-600
                                                                border-slate-200
                                                            `
                                    }
                                `}
                            >
                                {tower}
                            </button>
                        ))}

                    </div>

                    {/* Occupancy Filter */}
                    <select
                        className="
                            border
                            border-slate-300
                            rounded-lg
                            px-4
                            py-2
                            text-sm
                        "
                    >
                        <option>All Occupancy</option>
                        <option>Occupied</option>
                        <option>Vacant</option>
                    </select>

                </div>

                {/* Right Side */}
                <div className="flex gap-3">

                    <button
                        className="
                            border
                            border-slate-300
                            rounded-lg
                            px-4
                            py-2
                        "
                    >
                        Export
                    </button>

                    <button
                        onClick={() => router.visit("/residents/create")}
                        className="
                        bg-emerald-600
                        text-white
                        rounded-lg
                        px-4
                        py-2
                        "
                    >
                        + Add Resident
                    </button>

                </div>

            </div>
        </div>
    );
}
