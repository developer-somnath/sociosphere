import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ParkingMeter } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type EditProps = {
    slot: {
        id: number;
        uuid: string;
        slot_number: string;
        type: string;
        status: string;
        tower_id: number | null;
        flat_id: number | null;
        vehicle_number: string | null;
        vehicle_model: string | null;
        rfid_tag: string | null;
        notes: string | null;
    };
    towers: { id: number; name: string }[];
    flats: { id: number; flat_no: string; tower_id: number }[];
};

export default function ParkingEdit() {
    const { slot, towers, flats } = usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        slot_number: slot.slot_number,
        type: slot.type,
        status: slot.status,
        tower_id: slot.tower_id ? String(slot.tower_id) : "",
        flat_id: slot.flat_id ? String(slot.flat_id) : "",
        vehicle_number: slot.vehicle_number ?? "",
        vehicle_model: slot.vehicle_model ?? "",
        rfid_tag: slot.rfid_tag ?? "",
        notes: slot.notes ?? "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("parking-slots.update", slot.uuid));
    };

    return (
        <AppLayout>
            <Head title={t("parking.editTitle", { slotNumber: slot.slot_number })} />

            <PageHeader
                title={t("parking.edit")}
                description={t("parking.editPageDescription", { slotNumber: slot.slot_number })}
                icon={<ParkingMeter className="size-5" />}
                breadcrumbs={[
                    { label: t("parking.breadcrumb.section"), href: "/dashboard" },
                    { label: t("nav.parking"), href: route("parking-slots.index") },
                    { label: t("parking.breadcrumbSlot", { slotNumber: slot.slot_number }) },
                ]}
                actions={
                    <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                        <Link href={route("parking-slots.index")}>
                            <ArrowLeft className="size-3.5" />
                            {t("common.back")}
                        </Link>
                    </Button>
                }
            />

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">{t("parking.configFormTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title={t("parking.slotSpecifications")} description={t("parking.slotSpecificationsDesc")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="slot_number">{t("parking.slotNumber")} *</Label>
                                    <Input
                                        id="slot_number"
                                        value={form.data.slot_number}
                                        onChange={(e) => form.setData("slot_number", e.target.value)}
                                        required
                                    />
                                    {form.errors.slot_number && (
                                        <p className="text-xs text-destructive">{form.errors.slot_number}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="type">{t("parking.vehicleType")} *</Label>
                                    <select
                                        id="type"
                                        value={form.data.type}
                                        onChange={(e) => form.setData("type", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Four Wheeler">{t("parking.type.fourWheeler")}</option>
                                        <option value="Two Wheeler">{t("parking.type.twoWheeler")}</option>
                                        <option value="Visitor">{t("parking.type.visitor")}</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="status">{t("parking.slotStatus")} *</Label>
                                    <select
                                        id="status"
                                        value={form.data.status}
                                        onChange={(e) => form.setData("status", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Available">{t("parking.status.available")}</option>
                                        <option value="Allocated">{t("parking.status.allocated")}</option>
                                        <option value="Reserved">{t("parking.status.reserved")}</option>
                                        <option value="Maintenance">{t("parking.status.maintenance")}</option>
                                    </select>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title={t("parking.allocationDetails")} description={t("parking.allocationDetailsDesc")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tower_id">{t("parking.towerBlock")}</Label>
                                    <select
                                        id="tower_id"
                                        value={form.data.tower_id}
                                        onChange={(e) => form.setData("tower_id", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">{t("parking.unassigned")}</option>
                                        {towers.map((tower) => (
                                            <option key={tower.id} value={tower.id}>{tower.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="flat_id">{t("parking.flat")}</Label>
                                    <select
                                        id="flat_id"
                                        value={form.data.flat_id}
                                        onChange={(e) => form.setData("flat_id", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">{t("parking.unassigned")}</option>
                                        {flats.map((f) => (
                                            <option key={f.id} value={f.id}>{t("parking.flatLabel", { flatNo: f.flat_no })}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle_number">{t("parking.vehicleNumber")}</Label>
                                    <Input
                                        id="vehicle_number"
                                        value={form.data.vehicle_number}
                                        onChange={(e) => form.setData("vehicle_number", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle_model">{t("parking.vehicleModel")}</Label>
                                    <Input
                                        id="vehicle_model"
                                        value={form.data.vehicle_model}
                                        onChange={(e) => form.setData("vehicle_model", e.target.value)}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("parking-slots.index")}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-brand px-6 text-xs font-semibold shadow-md hover:bg-brand hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? t("parking.saving") : t("common.saveChanges")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
