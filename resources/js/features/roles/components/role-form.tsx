import { CheckSquare2, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
    PermissionGroup,
    RoleFormValues,
} from "@/features/roles/types";

type Props = {
    groups: PermissionGroup[];
    data: RoleFormValues;
    setData: <K extends keyof RoleFormValues>(
        key: K,
        value: RoleFormValues[K],
    ) => void;
    errors: Partial<Record<keyof RoleFormValues, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    disabled?: boolean;
};

const inputClasses =
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50";

export default function RoleForm({
    groups,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    disabled = false,
}: Props) {
    const togglePermission = (id: number) => {
        if (disabled) return;

        const next = data.permissions.includes(id)
            ? data.permissions.filter((pid) => pid !== id)
            : [...data.permissions, id];

        setData("permissions", next);
    };

    const toggleGroup = (group: PermissionGroup) => {
        if (disabled) return;

        const ids = group.permissions.map((p) => p.id);
        const allSelected = ids.every((id) => data.permissions.includes(id));

        const next = allSelected
            ? data.permissions.filter((id) => !ids.includes(id))
            : Array.from(new Set([...data.permissions, ...ids]));

        setData("permissions", next);
    };

    const groupState = (group: PermissionGroup) => {
        const ids = group.permissions.map((p) => p.id);
        const selected = ids.filter((id) => data.permissions.includes(id)).length;

        if (selected === 0) return "none";
        if (selected === ids.length) return "all";

        return "partial";
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Role Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            className={inputClasses}
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. Gate Manager"
                            disabled={disabled}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            className={inputClasses}
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="What is this role responsible for?"
                            disabled={disabled}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <h2 className="text-sm font-semibold">
                        Feature Permissions
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Grant feature-wise access. Select the permissions this
                        role should have.
                    </p>
                </div>

                {groups.map((group) => {
                    const state = groupState(group);

                    return (
                        <div
                            key={group.feature}
                            className="overflow-hidden rounded-2xl border border-border/60 bg-background/70"
                        >
                            <button
                                type="button"
                                onClick={() => toggleGroup(group)}
                                disabled={disabled}
                                className="flex w-full items-center justify-between gap-3 bg-muted/40 px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    {state === "all" ? (
                                        <CheckSquare2 className="size-4 text-emerald-600" />
                                    ) : (
                                        <Square className="size-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {group.label}
                                    </span>
                                    {state === "partial" && (
                                        <span className="text-xs text-muted-foreground">
                                            partial
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Select all
                                </span>
                            </button>

                            <div className="grid gap-2 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.permissions.map((permission) => {
                                    const checked = data.permissions.includes(
                                        permission.id,
                                    );

                                    return (
                                        <label
                                            key={permission.id}
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                                                checked
                                                    ? "border-emerald-600/40 bg-emerald-600/5"
                                                    : "border-border/60 hover:bg-muted/40"
                                            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    togglePermission(
                                                        permission.id,
                                                    )
                                                }
                                                disabled={disabled}
                                                className="size-4 accent-emerald-600"
                                            />
                                            <span className="font-medium">
                                                {permission.action}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {permission.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {errors.permissions && (
                    <p className="text-sm text-destructive">
                        {errors.permissions}
                    </p>
                )}
            </div>

            <div className="flex justify-end border-t border-border/60 pt-4">
                <Button
                    type="submit"
                    disabled={processing || disabled}
                    className="rounded-xl bg-emerald-600 px-5 shadow-sm hover:bg-emerald-700"
                >
                    {processing ? "Saving…" : submitLabel}
                </Button>
            </div>
        </form>
    );
}
