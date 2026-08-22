import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Building } from "lucide-react";
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

export default function SocietyCreate() {
    const { t } = useI18n();
    const form = useForm({
        name: "",
        registration_no: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        postal_code: "",
        phone: "",
        email: "",
        status: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("societies.store"));
    };

    return (
        <AppLayout>
            <Head title={t("societies.register")} />

            <PageHeader
                title={t("societies.register")}
                description={t("societies.registerPageDescription")}
                icon={<Building className="size-5" />}
                breadcrumbs={[
                    { label: t("nav.properties") },
                    { label: t("nav.societies"), href: route("societies.index") },
                    { label: t("societies.register") },
                ]}
                actions={
                    <BackButton routeName="societies.index" label={t("common.back")} />
                }
            />

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">
                        {t("societyForm.registrationForm")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection
                            title={t("societyForm.basicDetails")}
                            description={t("societyForm.basicDetailsDescription")}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="name">
                                        {t("societyForm.name")}{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData("name", e.target.value)}
                                        placeholder={t("societyForm.namePlaceholder")}
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="registration_no">
                                        {t("societyForm.registrationNo")}
                                    </Label>
                                    <Input
                                        id="registration_no"
                                        value={form.data.registration_no}
                                        onChange={(e) => form.setData("registration_no", e.target.value)}
                                        placeholder={t("societyForm.registrationNoPlaceholder")}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection
                            title={t("societyForm.addressLocation")}
                            description={t("societyForm.addressLocationDescription")}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="address">
                                        {t("common.address")}
                                    </Label>
                                    <Input
                                        id="address"
                                        value={form.data.address}
                                        onChange={(e) => form.setData("address", e.target.value)}
                                        placeholder={t("societyForm.addressPlaceholder")}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="city">
                                        {t("societyForm.city")}
                                    </Label>
                                    <Input
                                        id="city"
                                        value={form.data.city}
                                        onChange={(e) => form.setData("city", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="state">
                                        {t("societyForm.state")}
                                    </Label>
                                    <Input
                                        id="state"
                                        value={form.data.state}
                                        onChange={(e) => form.setData("state", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="country">
                                        {t("societyForm.country")}
                                    </Label>
                                    <Input
                                        id="country"
                                        value={form.data.country}
                                        onChange={(e) => form.setData("country", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="postal_code">
                                        {t("societyForm.postalCode")}
                                    </Label>
                                    <Input
                                        id="postal_code"
                                        value={form.data.postal_code}
                                        onChange={(e) => form.setData("postal_code", e.target.value)}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection
                            title={t("societyForm.contactInformation")}
                            description={t("societyForm.contactInformationDescription")}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">
                                        {t("common.phone")}
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData("phone", e.target.value)}
                                        placeholder={t("societyForm.phonePlaceholder")}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">
                                        {t("societyForm.officeEmail")}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData("email", e.target.value)}
                                        placeholder={t("societyForm.emailPlaceholder")}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("societies.index")}>
                                    {t("common.cancel")}
                                </Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-brand px-6 text-xs font-semibold shadow-md hover:bg-brand hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? t("societies.registering") : t("societies.register")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
