import { Head, Link, useForm } from "@inertiajs/react";
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

export default function AmenityCreate() {
    const form = useForm({
        name: "",
        description: "",
        booking_type: "Slot",
        capacity: 20,
        fee_per_slot: "0.00",
        rules: "",
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("amenities.store"));
    };

    const { t } = useI18n();

    return (
        <AppLayout>
            <Head title={t("amenities.add")} />

            <div className="mx-auto max-w-3xl space-y-6">
                <PageHeader
                    title={t("amenities.addPageTitle")}
                    description={t("amenities.addPageDescription")}
                    icon={<Sparkles className="size-5" />}
                    breadcrumbs={[
                        { label: t("nav.operations"), href: "/dashboard" },
                        { label: t("nav.amenities"), href: route("amenities.index") },
                        { label: t("amenities.add") },
                    ]}
                    actions={
                        <BackButton routeName="amenities.index" label={t("common.back")} />
                    }
                    className="mb-0"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>{t("amenities.configuration")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <FormSection title={t("amenityForm.generalInformation")}>
                                <div className="space-y-6">
                                    {/* Amenity Name — Single Column */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-foreground">
                                            {t("amenityForm.amenityName")} *
                                        </Label>
                                        <Input
                                            value={form.data.name}
                                            onChange={(e) => form.setData("name", e.target.value)}
                                            placeholder={t("amenityForm.amenityNamePlaceholder")}
                                            className="h-10 rounded-xl border border-input bg-background px-3.5 text-sm shadow-2xs focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                            required
                                        />
                                        {form.errors.name && (
                                            <p className="text-xs text-destructive">{form.errors.name}</p>
                                        )}
                                    </div>

                                    {/* Booking Configuration — 3 Columns */}
                                    <div className="grid gap-6 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-foreground">
                                                {t("amenityForm.bookingType")} *
                                            </Label>
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
                                                className="h-10 rounded-xl border border-input bg-background px-3.5 text-sm shadow-2xs"
                                            />
                                            {form.errors.booking_type && (
                                                <p className="text-xs text-destructive">{form.errors.booking_type}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-foreground">
                                                {t("amenityForm.capacity")} *
                                            </Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={form.data.capacity}
                                                onChange={(e) => form.setData("capacity", Number(e.target.value))}
                                                className="h-10 rounded-xl border border-input bg-background px-3.5 text-sm shadow-2xs focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                                required
                                            />
                                            {form.errors.capacity && (
                                                <p className="text-xs text-destructive">{form.errors.capacity}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-foreground">
                                                {t("amenityForm.feePerSlot")} *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                value={form.data.fee_per_slot}
                                                onChange={(e) => form.setData("fee_per_slot", e.target.value)}
                                                className="h-10 rounded-xl border border-input bg-background px-3.5 text-sm shadow-2xs focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                                required
                                            />
                                            {form.errors.fee_per_slot && (
                                                <p className="text-xs text-destructive">{form.errors.fee_per_slot}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-foreground">
                                            {t("amenityForm.description")}
                                        </Label>
                                        <textarea
                                            value={form.data.description}
                                            onChange={(e) => form.setData("description", e.target.value)}
                                            className="min-h-[85px] w-full rounded-xl border border-input bg-background p-3.5 text-sm shadow-2xs outline-none transition-[color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                            placeholder={t("amenityForm.descriptionPlaceholder")}
                                        />
                                    </div>

                                    {/* Usage Rules */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-foreground">
                                            {t("amenityForm.usageRules")}
                                        </Label>
                                        <textarea
                                            value={form.data.rules}
                                            onChange={(e) => form.setData("rules", e.target.value)}
                                            className="min-h-[105px] w-full rounded-xl border border-input bg-background p-3.5 text-sm shadow-2xs outline-none transition-[color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                            placeholder={t("amenityForm.usageRulesPlaceholder")}
                                        />
                                    </div>
                                </div>
                            </FormSection>

                            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                                <Button variant="outline" type="button" className="rounded-xl px-5" asChild>
                                    <Link href={route("amenities.index")}>{t("common.cancel")}</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing} className="rounded-xl px-6 font-semibold shadow-xs">
                                    {form.processing ? t("amenityForm.creating") : t("amenities.createSubmit")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
