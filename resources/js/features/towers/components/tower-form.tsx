import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SocietyOption } from "@/features/towers/types";

export type TowerFormValues = {
    name: string;
    society_id: number | "";
};

type Props = {
    societies: SocietyOption[];
    data: TowerFormValues;
    setData: <K extends keyof TowerFormValues>(
        key: K,
        value: TowerFormValues[K],
    ) => void;
    errors: Partial<Record<keyof TowerFormValues, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
};

const selectClasses =
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export default function TowerForm({
    societies,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">
                    Tower Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="e.g. Tower A"
                    autoFocus
                />
                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                )}
            </div>

            {societies.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="society_id">
                        Society <span className="text-destructive">*</span>
                    </Label>
                    <select
                        id="society_id"
                        className={selectClasses}
                        value={data.society_id}
                        onChange={(e) =>
                            setData(
                                "society_id",
                                e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                            )
                        }
                    >
                        <option value="">Select a society</option>
                        {societies.map((society) => (
                            <option key={society.id} value={society.id}>
                                {society.label}
                            </option>
                        ))}
                    </select>
                    {errors.society_id && (
                        <p className="text-sm text-destructive">
                            {errors.society_id}
                        </p>
                    )}
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    {processing && <Loader2 className="animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
