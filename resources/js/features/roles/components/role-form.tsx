import { CheckSquare2, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
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
    "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus-visible:border-brand/60 focus-visible:ring-[3px] focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50";

// Maps server-provided permission feature slugs to i18n keys.
const GROUP_KEYS: Record<string, string> = {
    society: "roleForm.groups.society",
    dashboard: "roleForm.groups.dashboard",
    resident: "roleForm.groups.resident",
    tower: "roleForm.groups.tower",
    flat: "roleForm.groups.flat",
    parking: "roleForm.groups.parking",
    cctv: "roleForm.groups.cctv",
    security_log: "roleForm.groups.securityLog",
    user: "roleForm.groups.user",
    visitor: "roleForm.groups.visitor",
    maintenance: "roleForm.groups.maintenance",
    invoice: "roleForm.groups.invoice",
    collection: "roleForm.groups.collection",
    notice: "roleForm.groups.notice",
    complaint: "roleForm.groups.complaint",
    amenity: "roleForm.groups.amenity",
    document: "roleForm.groups.document",
    "activity-log": "roleForm.groups.activityLog",
    role: "roleForm.groups.role",
    permission: "roleForm.groups.permission",
    other: "roleForm.groups.other",
};

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
    const { t } = useI18n();

    const groupLabel = (group: PermissionGroup) =>
        t(GROUP_KEYS[group.feature] ?? "roleForm.groups.other");

    const togglePermission = (id: number) => {
        if (disabled) return;

        const next = data.permissions.includes(id)
            ? data.permissions.filter((pid) => pid !== id)
            : [...data.permissions, id];

        setData("permissions", next);
    };

    const groupState = (group: PermissionGroup) => {
        const ids = group.permissions.map((p) => p.id);
        const selected = ids.filter((id) => data.permissions.includes(id)).length;

        if (selected === 0) return "none";
        if (selected === ids.length) return "all";
        return "partial";
    };

    const toggleGroup = (group: PermissionGroup) => {
        if (disabled) return;

        const ids = group.permissions.map((p) => p.id);
        const state = groupState(group);

        const next =
            state === "all"
                ? data.permissions.filter((id) => !ids.includes(id))
                : Array.from(new Set([...data.permissions, ...ids]));

        setData("permissions", next);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {t("roleForm.name")}{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            className={inputClasses}
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder={t("roleForm.namePlaceholder")}
                            disabled={disabled}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            {t("roleForm.description")}
                        </Label>
                        <Input
                            id="description"
                            className={inputClasses}
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder={t("roleForm.descriptionPlaceholder")}
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

            <div className="space-y-4">
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
                                        <CheckSquare2 className="size-4 text-brand" />
                                    ) : (
                                        <Square className="size-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {groupLabel(group)}
                                    </span>
                                    {state === "partial" && (
                                        <span className="text-xs text-muted-foreground">
                                            ({t("roleForm.partial")})
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {t("roleForm.selectAll")}
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
                                                    ? "border-brand/40 bg-brand/5"
                                                    : "border-border/60 hover:bg-muted/40"
                                            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    togglePermission(permission.id)
                                                }
                                                disabled={disabled}
                                                className="size-4 accent-emerald-600"
                                            />
                                            <span className="truncate">
                                                {permission.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-3">
                <Button
                    type="submit"
                    disabled={processing || disabled}
                    className="rounded-xl px-6"
                >
                    {processing ? t("common.loading") : submitLabel}
                </Button>
            </div>
        </form>
    );
}
