import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { BackButton } from "@/components/app/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type AmenityDetail = {
    id: number;
    name: string;
    description: string | null;
    booking_type: "Slot" | "Hourly" | "Daily";
    capacity: number;
    fee_per_slot: string;
    rules: string | null;
    is_active: boolean;
};

type EditProps = {
    amenity: AmenityDetail;
};

export default function AmenityEdit() {
    const { amenity } = usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        name: amenity.name,
        description: amenity.description ?? "",
        booking_type: amenity.booking_type,
        capacity: amenity.capacity,
        fee_per_slot: amenity.fee_per_slot,
        rules: amenity.rules ?? "",
        is_active: amenity.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("amenities.update", amenity.id));
    };

    return (
        <AppLayout>
            <Head title={t("amenities.editTitle", { name: amenity.name })} />

            <PageHeader
                title={t("amenities.edit")}
                description={t("amenities.editPageDescription", { name: amenity.name })}
                icon={<Sparkles className="size-5" />}
                breadcrumbs={[
                    { label: t("nav.operations"), href: "/dashboard" },
                    { label: t("nav.amenities"), href: route("amenities.index") },
                    { label: amenity.name },
                ]}
                actions={
                    <BackButton routeName="amenities.index" label={t("common.back")} />
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>{t("amenities.editConfiguration")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <FormSection title={t("amenityForm.generalInformation")}>
                            <div className="space-y-1.5">
                                <Label>{t("amenityForm.amenityName")} *</Label>
                                <Input
                                    value={form.data.name}
                                    onChange={(e) => form.setData("name", e.target.value)}
                                    placeholder={t("amenityForm.amenityNameEditPlaceholder")}
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-destructive">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label>{t("amenityForm.bookingType")} *</Label>
                                    <Combobox
                                        items={[
                                            { value: "Slot", label: t("amenityForm.typeSlot") },
                                            { value: "Hourly", label: t("amenityForm.typeHourly") },
                                            { value: "Daily", label: t("amenityForm.typeDaily") },
                                        ]}
                                        value={form.data.booking_type}
                                        onValueChange={(value) =>
                                            form.setData("booking_type", value as "Slot" | "Hourly" | "Daily")
                                        }
                                        placeholder={t("amenityForm.selectType")}
                                        emptyText={t("amenityForm.noMatch")}
                                    />
                                    {form.errors.booking_type && (
                                        <p className="text-xs text-destructive">{form.errors.booking_type}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>{t("amenityForm.capacity")} *</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={form.data.capacity}
                                        onChange={(e) => form.setData("capacity", Number(e.target.value))}
                                        required
                                    />
                                    {form.errors.capacity && (
                                        <p className="text-xs text-destructive">{form.errors.capacity}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>{t("amenityForm.feePerSlot")} *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={form.data.fee_per_slot}
                                        onChange={(e) => form.setData("fee_per_slot", e.target.value)}
                                        required
                                    />
                                    {form.errors.fee_per_slot && (
                                        <p className="text-xs text-destructive">{form.errors.fee_per_slot}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("common.status")}</Label>
                                <select
                                    value={form.data.is_active ? "active" : "inactive"}
                                    onChange={(e) => form.setData("is_active", e.target.value === "active")}
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="active">{t("amenityForm.activeAvailable")}</option>
                                    <option value="inactive">{t("amenityForm.inactiveMaintenance")}</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("amenityForm.description")}</Label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    className="min-h-[80px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder={t("amenityForm.descriptionEditPlaceholder")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("amenityForm.usageRules")}</Label>
                                <textarea
                                    value={form.data.rules}
                                    onChange={(e) => form.setData("rules", e.target.value)}
                                    className="min-h-[100px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder={t("amenityForm.usageRulesEditPlaceholder")}
                                />
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("amenities.index")}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full px-6 text-xs font-semibold shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                {form.processing ? t("amenityForm.saving") : t("common.saveChanges")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
