import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
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

const inputClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

const selectClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

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
            <FormSection
                title="Tower details"
                description="Fields marked with an asterisk are required."
            >
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Tower Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        className={inputClasses}
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
                    <div className="mt-5 space-y-2">
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
            </FormSection>

            <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="rounded-full px-5 text-xs font-semibold hover:bg-muted"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="rounded-full bg-emerald-600 px-6 text-xs font-semibold shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200 text-white"
                >
                    {processing && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
