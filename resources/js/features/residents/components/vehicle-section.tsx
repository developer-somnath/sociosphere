import { router, useForm } from "@inertiajs/react";
import { Car, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import type { Vehicle } from "@/features/residents/types";

type VehicleForm = {
    vehicle_number: string;
    vehicle_model: string;
    vehicle_type: "Car" | "Bike" | "SUV" | "Other";
    parking_slot: string;
    is_active: boolean;
};

const emptyForm: VehicleForm = {
    vehicle_number: "",
    vehicle_model: "",
    vehicle_type: "Car",
    parking_slot: "",
    is_active: true,
};

const vehicleTypes = ["Car", "Bike", "SUV", "Other"] as const;

type Props = {
    residentUuid: string;
    vehicles: Vehicle[];
};

export function VehicleSection({ residentUuid, vehicles }: Props) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Vehicle | null>(null);
    const [deleting, setDeleting] = useState<Vehicle | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<VehicleForm>(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        clearErrors();
        setOpen(true);
    };

    const openEdit = (vehicle: Vehicle) => {
        setEditing(vehicle);
        setData("vehicle_number", vehicle.vehicle_number ?? "");
        setData("vehicle_model", vehicle.vehicle_model ?? "");
        setData("vehicle_type", vehicle.vehicle_type);
        setData("parking_slot", vehicle.parking_slot ?? "");
        setData("is_active", vehicle.is_active);
        clearErrors();
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(
                route("residents.vehicles.update", [residentUuid, editing.uuid]),
                {
                    onSuccess: () => setOpen(false),
                },
            );
        } else {
            post(route("residents.vehicles.store", residentUuid), {
                onSuccess: () => setOpen(false),
            });
        }
    };

    const confirmDelete = () => {
        if (!deleting) return;
        setDeleteBusy(true);
        router.delete(
            route("residents.vehicles.destroy", [residentUuid, deleting.uuid]),
            {
                preserveScroll: true,
                onFinish: () => setDeleteBusy(false),
                onSuccess: () => setDeleting(null),
            },
        );
    };

    return (
        <Card className="border-border/60 bg-background/70 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="size-5 text-brand" />
                        {t("residents.vehicles")}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        {t("residents.vehiclesDescription")}
                    </CardDescription>
                </div>
                <Button
                    variant="emerald"
                    size="sm"
                    className="rounded-full px-4 text-xs font-semibold"
                    onClick={openCreate}
                >
                    <Plus className="size-3.5" />
                    {t("residents.addVehicle")}
                </Button>
            </CardHeader>
            <CardContent>
                {vehicles.length === 0 ? (
                    <EmptyState
                        icon={Car}
                        title={t("residents.vehicles")}
                        description={t("residents.vehiclesEmpty")}
                    />
                ) : (
                    <ul className="divide-y divide-border/60">
                        {vehicles.map((vehicle) => (
                            <li
                                key={vehicle.id}
                                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {vehicle.vehicle_number ||
                                            t("residents.vehicleModel")}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {t(
                                            `residents.vehicleType.${vehicle.vehicle_type}`,
                                        )}
                                        {vehicle.vehicle_model &&
                                            ` · ${vehicle.vehicle_model}`}
                                        {vehicle.parking_slot &&
                                            ` · ${vehicle.parking_slot}`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-full"
                                        onClick={() => openEdit(vehicle)}
                                        aria-label={t("residents.editVehicle")}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleting(vehicle)}
                                        aria-label={t("residents.editVehicle")}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>

            <FormDrawer
                open={open}
                onOpenChange={setOpen}
                title={
                    editing
                        ? t("residents.editVehicle")
                        : t("residents.addVehicle")
                }
                description={t("residents.vehiclesDescription")}
                icon={<Car className="size-5" />}
                isDirty={
                    JSON.stringify(data) !==
                    JSON.stringify(
                        editing
                            ? {
                                  vehicle_number: editing.vehicle_number ?? "",
                                  vehicle_model: editing.vehicle_model ?? "",
                                  vehicle_type: editing.vehicle_type,
                                  parking_slot: editing.parking_slot ?? "",
                                  is_active: editing.is_active,
                              }
                            : emptyForm,
                    )
                }
                footer={
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="emerald"
                            type="submit"
                            form="vehicle-form"
                            disabled={processing}
                        >
                            {t("common.save")}
                        </Button>
                    </>
                }
            >
                <form id="vehicle-form" onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="v-number">
                            {t("residents.vehicleNumber")}
                        </Label>
                        <Input
                            id="v-number"
                            value={data.vehicle_number}
                            onChange={(e) =>
                                setData("vehicle_number", e.target.value)
                            }
                            placeholder={t("residents.vehicleNumber")}
                        />
                        {errors.vehicle_number && (
                            <p className="text-sm text-destructive">
                                {errors.vehicle_number}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="v-type">
                                {t("residents.vehicleType")}
                            </Label>
                            <Select
                                value={data.vehicle_type}
                                onValueChange={(v) =>
                                    setData(
                                        "vehicle_type",
                                        v as VehicleForm["vehicle_type"],
                                    )
                                }
                            >
                                <SelectTrigger id="v-type">
                                    <SelectValue
                                        placeholder={t("residents.vehicleType")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicleTypes.map((vt) => (
                                        <SelectItem key={vt} value={vt}>
                                            {t(`residents.vehicleType.${vt}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.vehicle_type && (
                                <p className="text-sm text-destructive">
                                    {errors.vehicle_type}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="v-model">
                                {t("residents.vehicleModel")}
                            </Label>
                            <Input
                                id="v-model"
                                value={data.vehicle_model}
                                onChange={(e) =>
                                    setData("vehicle_model", e.target.value)
                                }
                                placeholder={t("residents.vehicleModel")}
                            />
                            {errors.vehicle_model && (
                                <p className="text-sm text-destructive">
                                    {errors.vehicle_model}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="v-slot">
                            {t("residents.vehicleParkingSlot")}
                        </Label>
                        <Input
                            id="v-slot"
                            value={data.parking_slot}
                            onChange={(e) =>
                                setData("parking_slot", e.target.value)
                            }
                            placeholder={t("residents.vehicleParkingSlot")}
                        />
                        {errors.parking_slot && (
                            <p className="text-sm text-destructive">
                                {errors.parking_slot}
                            </p>
                        )}
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/25 p-3">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(c) =>
                                setData("is_active", Boolean(c))
                            }
                            className="mt-0.5"
                        />
                        <span className="text-sm">
                            <span className="font-medium">
                                {t("residents.vehicleIsActive")}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                {t("residents.vehicleActiveHint")}
                            </span>
                        </span>
                    </label>
                </form>
            </FormDrawer>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(o) => !o && setDeleting(null)}
                title={t("residents.editVehicle")}
                description={t("residents.confirmRemoveDescription")}
                confirmLabel={t("common.delete")}
                cancelLabel={t("common.cancel")}
                destructive
                loading={deleteBusy}
                onConfirm={confirmDelete}
            />
        </Card>
    );
}
