import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TowerOption } from "@/features/flats/types";

export type FlatFormValues = {
    tower_id: number | "";
    flat_no: string;
    floor_no: string;
    flat_type: string;
    area_sqft: string;
    ownership_type: "" | "Owner" | "Tenant";
    occupancy_status: "" | "Occupied" | "Vacant" | "Self-Occupied";
};

type Props = {
    towers: TowerOption[];
    data: FlatFormValues;
    setData: <K extends keyof FlatFormValues>(
        key: K,
        value: FlatFormValues[K],
    ) => void;
    errors: Partial<Record<keyof FlatFormValues, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
};

const inputClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

const selectClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

export default function FlatForm({
    towers,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="tower_id">
                            Tower <span className="text-destructive">*</span>
                        </Label>
                        <Combobox
                            id="tower_id"
                            items={towers.map((t) => ({
                                value: String(t.id),
                                label: t.label,
                            }))}
                            value={String(data.tower_id)}
                            onValueChange={(val) =>
                                setData("tower_id", val === "" ? "" : Number(val))
                            }
                            placeholder="Select tower…"
                            searchPlaceholder="Search towers…"
                            emptyText="No towers found"
                        />
                        {errors.tower_id && (
                            <p className="text-sm text-destructive">
                                {errors.tower_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="flat_no">
                            Flat Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="flat_no"
                            className={inputClasses}
                            value={data.flat_no}
                            onChange={(e) => setData("flat_no", e.target.value)}
                            placeholder="e.g. A-101"
                            autoFocus
                        />
                        {errors.flat_no && (
                            <p className="text-sm text-destructive">
                                {errors.flat_no}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="floor_no">Floor</Label>
                        <Input
                            id="floor_no"
                            type="number"
                            min={0}
                            max={100}
                            className={inputClasses}
                            value={data.floor_no}
                            onChange={(e) => setData("floor_no", e.target.value)}
                            placeholder="e.g. 1"
                        />
                        {errors.floor_no && (
                            <p className="text-sm text-destructive">
                                {errors.floor_no}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="flat_type">Flat Type</Label>
                        <Input
                            id="flat_type"
                            className={inputClasses}
                            value={data.flat_type}
                            onChange={(e) => setData("flat_type", e.target.value)}
                            placeholder="e.g. 2BHK"
                        />
                        {errors.flat_type && (
                            <p className="text-sm text-destructive">
                                {errors.flat_type}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="area_sqft">Area (sq. ft.)</Label>
                        <Input
                            id="area_sqft"
                            type="number"
                            min={1}
                            max={100000}
                            className={inputClasses}
                            value={data.area_sqft}
                            onChange={(e) => setData("area_sqft", e.target.value)}
                            placeholder="e.g. 850"
                        />
                        {errors.area_sqft && (
                            <p className="text-sm text-destructive">
                                {errors.area_sqft}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ownership_type">
                            Ownership <span className="text-destructive">*</span>
                        </Label>
                        <select
                            id="ownership_type"
                            className={selectClasses}
                            value={data.ownership_type}
                            onChange={(e) =>
                                setData(
                                    "ownership_type",
                                    e.target.value as FlatFormValues["ownership_type"],
                                )
                            }
                        >
                            <option value="">Select ownership</option>
                            <option value="Owner">Owner</option>
                            <option value="Tenant">Tenant</option>
                        </select>
                        {errors.ownership_type && (
                            <p className="text-sm text-destructive">
                                {errors.ownership_type}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="occupancy_status">
                            Occupancy Status{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <select
                            id="occupancy_status"
                            className={selectClasses}
                            value={data.occupancy_status}
                            onChange={(e) =>
                                setData(
                                    "occupancy_status",
                                    e.target.value as FlatFormValues["occupancy_status"],
                                )
                            }
                        >
                            <option value="">Select status</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Vacant">Vacant</option>
                            <option value="Self-Occupied">Self-Occupied</option>
                        </select>
                        {errors.occupancy_status && (
                            <p className="text-sm text-destructive">
                                {errors.occupancy_status}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end border-t border-border/60 pt-4">
                <Button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-emerald-600 px-5 shadow-sm hover:bg-emerald-700"
                >
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
