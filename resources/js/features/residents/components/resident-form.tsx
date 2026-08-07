import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FlatOption } from "@/features/residents/types";

export type ResidentFormValues = {
    flat_id: number | "";
    name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: "" | "Male" | "Female" | "Other";
    occupation: string;
    is_primary_contact: boolean;
};

type Props = {
    flats: FlatOption[];
    data: ResidentFormValues;
    setData: <K extends keyof ResidentFormValues>(
        key: K,
        value: ResidentFormValues[K],
    ) => void;
    errors: Partial<Record<keyof ResidentFormValues, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
};

const inputClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

const selectClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

export default function ResidentForm({
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
            <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 sm:p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="name">
                            Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            className={inputClasses}
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="flat_id">
                            Flat <span className="text-destructive">*</span>
                        </Label>
                        <Combobox
                            id="flat_id"
                            items={flats.map((f) => ({
                                value: String(f.id),
                                label: f.label,
                            }))}
                            value={String(data.flat_id)}
                            onValueChange={(val) =>
                                setData("flat_id", val === "" ? "" : Number(val))
                            }
                            placeholder="Select flat…"
                            searchPlaceholder="Search flats…"
                            emptyText="No flats found"
                        />
                        {errors.flat_id && (
                            <p className="text-sm text-destructive">
                                {errors.flat_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            className={inputClasses}
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
                            className={inputClasses}
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="resident@example.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            className={inputClasses}
                            value={data.date_of_birth}
                            onChange={(e) =>
                                setData("date_of_birth", e.target.value)
                            }
                        />
                        {errors.date_of_birth && (
                            <p className="text-sm text-destructive">
                                {errors.date_of_birth}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                            id="gender"
                            className={selectClasses}
                            value={data.gender}
                            onChange={(e) =>
                                setData(
                                    "gender",
                                    e.target.value as ResidentFormValues["gender"],
                                )
                            }
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                            <p className="text-sm text-destructive">
                                {errors.gender}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                            id="occupation"
                            className={inputClasses}
                            value={data.occupation}
                            onChange={(e) => setData("occupation", e.target.value)}
                            placeholder="e.g. Software Engineer"
                        />
                        {errors.occupation && (
                            <p className="text-sm text-destructive">
                                {errors.occupation}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_primary_contact"
                        checked={data.is_primary_contact}
                        onCheckedChange={(checked) =>
                            setData("is_primary_contact", Boolean(checked))
                        }
                    />
                    <Label
                        htmlFor="is_primary_contact"
                        className="cursor-pointer text-sm font-normal"
                    >
                        Primary contact for this flat
                    </Label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-32 rounded-xl bg-emerald-600 px-5 shadow-sm hover:bg-emerald-700"
                >
                    {processing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
