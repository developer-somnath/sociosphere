import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FlatOption } from "@/features/visitors/types";

export type VisitorFormValues = {
    name: string;
    phone: string;
    email: string;
    notes: string;
    flat_id: number | "";
    purpose: string;
    vehicle_number: string;
    scheduled_for: string;
};

type Props = {
    flats: FlatOption[];
    data: VisitorFormValues;
    setData: <K extends keyof VisitorFormValues>(
        key: K,
        value: VisitorFormValues[K],
    ) => void;
    errors: Partial<Record<keyof VisitorFormValues, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
};

const selectClasses =
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export default function VisitorForm({
    flats,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Visitor Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        autoFocus
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">
                        Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        placeholder="e.g. 9876543210"
                    />
                    {errors.phone && (
                        <p className="text-sm text-destructive">
                            {errors.phone}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="optional"
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="vehicle_number">Vehicle Number</Label>
                    <Input
                        id="vehicle_number"
                        value={data.vehicle_number}
                        onChange={(e) =>
                            setData("vehicle_number", e.target.value)
                        }
                        placeholder="e.g. MH-01-AB-1234"
                    />
                    {errors.vehicle_number && (
                        <p className="text-sm text-destructive">
                            {errors.vehicle_number}
                        </p>
                    )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="flat_id">
                        Flat Being Visited{" "}
                        <span className="text-destructive">*</span>
                    </Label>
                    <select
                        id="flat_id"
                        className={selectClasses}
                        value={data.flat_id}
                        onChange={(e) =>
                            setData(
                                "flat_id",
                                e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                            )
                        }
                    >
                        <option value="">Select a flat</option>
                        {flats.map((flat) => (
                            <option key={flat.id} value={flat.id}>
                                {flat.label}
                            </option>
                        ))}
                    </select>
                    {errors.flat_id && (
                        <p className="text-sm text-destructive">
                            {errors.flat_id}
                        </p>
                    )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="purpose">
                        Purpose of Visit{" "}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="purpose"
                        value={data.purpose}
                        onChange={(e) => setData("purpose", e.target.value)}
                        placeholder="e.g. Meeting resident, delivery, service"
                    />
                    {errors.purpose && (
                        <p className="text-sm text-destructive">
                            {errors.purpose}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="scheduled_for">Scheduled For</Label>
                    <Input
                        id="scheduled_for"
                        type="date"
                        value={data.scheduled_for}
                        onChange={(e) =>
                            setData("scheduled_for", e.target.value)
                        }
                    />
                    {errors.scheduled_for && (
                        <p className="text-sm text-destructive">
                            {errors.scheduled_for}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="optional"
                    />
                    {errors.notes && (
                        <p className="text-sm text-destructive">
                            {errors.notes}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {processing && <Loader2 className="animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
