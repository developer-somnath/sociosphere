import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
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

            <PageHeader
                title={t("amenities.addPageTitle")}
                description={t("amenities.addPageDescription")}
                icon={<Sparkles className="size-5" />}
                breadcrumbs={[
                    { label: t("amenities.breadcrumb.section"), href: "/dashboard" },
                    { label: t("nav.amenities"), href: route("amenities.index") },
                    { label: t("amenities.add") },
                ]}
                actions={
                    <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                        <Link href={route("amenities.index")}>
                            <ArrowLeft className="size-3.5" />
                            {t("common.back")}
                        </Link>
                    </Button>
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>{t("amenities.configuration")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <FormSection title={t("amenityForm.generalInformation")}>
                            <div className="space-y-1.5">
                                <Label>{t("amenityForm.amenityName")} *</Label>
                                <Input
                                    value={form.data.name}
                                    onChange={(e) => form.setData("name", e.target.value)}
                                    placeholder={t("amenityForm.amenityNamePlaceholder")}
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
                                <Label>{t("amenityForm.description")}</Label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    className="min-h-[80px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder={t("amenityForm.descriptionPlaceholder")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("amenityForm.usageRules")}</Label>
                                <textarea
                                    value={form.data.rules}
                                    onChange={(e) => form.setData("rules", e.target.value)}
                                    className="min-h-[100px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder={t("amenityForm.usageRulesPlaceholder")}
                                />
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("amenities.index")}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full px-6 text-xs font-semibold shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                {form.processing ? t("amenityForm.creating") : t("amenities.createSubmit")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
