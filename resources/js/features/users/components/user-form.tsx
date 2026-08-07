import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoleOption, SocietyOption } from "@/features/users/types";

export type UserFormValues = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role: string;
    society_id: number | "";
    is_active: boolean;
};

type Props = {
    roles: RoleOption[];
    societies: SocietyOption[];
    data: UserFormValues;
    setData: <K extends keyof UserFormValues>(
        key: K,
        value: UserFormValues[K],
    ) => void;
    errors: Partial<Record<keyof UserFormValues, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    isEdit?: boolean;
};

const inputClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

const selectClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

const isSuperAdminRole = (role: string) => role === "SuperAdmin";

export default function UserForm({
    roles,
    societies,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    isEdit = false,
}: Props) {
    const showSocietySelect =
        societies.length > 0 && !isSuperAdminRole(data.role);

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
                            placeholder="e.g. Priya Sharma"
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            className={inputClasses}
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="user@example.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            className={inputClasses}
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            placeholder="e.g. 9876543210"
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">
                            Role <span className="text-destructive">*</span>
                        </Label>
                        <select
                            id="role"
                            className={selectClasses}
                            value={data.role}
                            onChange={(e) => {
                                const nextRole = e.target.value;
                                setData("role", nextRole);
                                if (isSuperAdminRole(nextRole)) {
                                    setData("society_id", "");
                                }
                            }}
                        >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role.name} value={role.name}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-sm text-destructive">{errors.role}</p>
                        )}
                    </div>

                    {showSocietySelect && (
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

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password{" "}
                            {!isEdit && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className={inputClasses}
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            placeholder={isEdit ? "Leave blank to keep current" : "Min. 8 characters"}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Confirm Password{" "}
                            {!isEdit && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            className={inputClasses}
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            placeholder="Repeat password"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2 rounded-xl border border-border/60 bg-background/70 p-3">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData("is_active", checked === true)
                            }
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Account is active (can sign in)
                        </Label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border/60 pt-5">
                <Button type="submit" className="rounded-xl bg-emerald-600 px-5 shadow-sm hover:bg-emerald-700" disabled={processing}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
