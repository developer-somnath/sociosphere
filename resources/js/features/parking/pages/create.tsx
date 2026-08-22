import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ParkingMeter } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { BackButton } from "@/components/app/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type CreateProps = {
    towers: { id: number; name: string }[];
    flats: { id: number; flat_no: string; tower_id: number }[];
};

export default function ParkingCreate() {
    const { towers, flats } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        slot_number: "",
        type: "Four Wheeler",
        status: "Available",
        tower_id: "",
        flat_id: "",
        vehicle_number: "",
        vehicle_model: "",
        rfid_tag: "",
        notes: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("parking-slots.store"));
    };

    return (
        <AppLayout>
            <Head title={t("parking.add")} />

            <PageHeader
                title={t("parking.add")}
                description={t("parking.addPageDescription")}
                icon={<ParkingMeter className="size-5" />}
                breadcrumbs={[
                    { label: t("nav.properties"), href: "/dashboard" },
                    { label: t("nav.parking"), href: route("parking-slots.index") },
                    { label: t("parking.add") },
                ]}
                actions={
                    <BackButton routeName="parking-slots.index" label={t("common.back")} />
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
                                        placeholder={t("parking.slotNumberPlaceholder")}
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
                            </div>
                        </FormSection>

                        <FormSection title={t("parking.allocationOptional")} description={t("parking.allocationOptionalDesc")}>
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
                                        onChange={(e) => {
                                            const flatId = e.target.value;
                                            form.setData({
                                                ...form.data,
                                                flat_id: flatId,
                                                status: flatId ? "Allocated" : "Available",
                                            });
                                        }}
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
                                        placeholder={t("parking.vehicleNumberPlaceholder")}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle_model">{t("parking.vehicleModel")}</Label>
                                    <Input
                                        id="vehicle_model"
                                        value={form.data.vehicle_model}
                                        onChange={(e) => form.setData("vehicle_model", e.target.value)}
                                        placeholder={t("parking.vehicleModelPlaceholder")}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("parking-slots.index")}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-brand px-6 text-xs font-semibold shadow-md hover:bg-brand hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? t("parking.saving") : t("parking.add")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
