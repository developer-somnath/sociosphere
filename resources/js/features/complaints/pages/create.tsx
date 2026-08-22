import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, MessageSquareWarning } from "lucide-react";
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

type CategoryOption = { id: number; name: string };
type FlatOption = { id: number; flat_no: string; tower?: { id: number; name: string } };
type ResidentOption = { id: number; name: string; flat_id: number };

type CreateProps = {
    categories: CategoryOption[];
    flats: FlatOption[];
    residents: ResidentOption[];
};

export default function ComplaintCreate() {
    const { categories, flats, residents } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        flat_id: "",
        resident_id: "",
        category_id: "",
        title: "",
        description: "",
        priority: "Low",
    });

    const filteredResidents = form.data.flat_id
        ? residents.filter((r) => String(r.flat_id) === form.data.flat_id)
        : residents;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("complaints.store"));
    };

    return (
        <AppLayout>
            <Head title={t("complaints.raiseComplaint")} />

            <PageHeader
                title={t("complaintForm.createTitle")}
                description={t("complaintForm.createDescription")}
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    <BackButton routeName="complaints.index" label={t("complaintForm.backToComplaints")} />
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>{t("complaintForm.details")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <FormSection title={t("complaintForm.locationResident")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>{t("complaintForm.flat")} *</Label>
                                    <Combobox
                                        items={flats.map((f) => ({
                                            value: String(f.id),
                                            label: `${f.flat_no}${f.tower ? ` — ${f.tower.name}` : ""}`,
                                        }))}
                                        value={form.data.flat_id}
                                        onValueChange={(value) => {
                                            form.setData("flat_id", value);
                                            form.setData("resident_id", "");
                                        }}
                                        placeholder={t("complaintForm.selectFlat")}
                                        emptyText={t("complaintForm.noFlats")}
                                    />
                                    {form.errors.flat_id && (
                                        <p className="text-xs text-destructive">{form.errors.flat_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>{t("complaintForm.reportingResident")} *</Label>
                                    <Combobox
                                        items={filteredResidents.map((r) => ({
                                            value: String(r.id),
                                            label: r.name,
                                        }))}
                                        value={form.data.resident_id}
                                        onValueChange={(value) =>
                                            form.setData("resident_id", value)
                                        }
                                        placeholder={t("complaintForm.selectResident")}
                                        emptyText={t("complaintForm.noResidentsInFlat")}
                                    />
                                    {form.errors.resident_id && (
                                        <p className="text-xs text-destructive">{form.errors.resident_id}</p>
                                    )}
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title={t("complaintForm.information")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>{t("complaintForm.category")} *</Label>
                                    <Combobox
                                        items={categories.map((c) => ({
                                            value: String(c.id),
                                            label: c.name,
                                        }))}
                                        value={form.data.category_id}
                                        onValueChange={(value) =>
                                            form.setData("category_id", value)
                                        }
                                        placeholder={t("complaintForm.selectCategory")}
                                        emptyText={t("complaintForm.noCategories")}
                                    />
                                    {form.errors.category_id && (
                                        <p className="text-xs text-destructive">{form.errors.category_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>{t("complaintForm.priority")} *</Label>
                                    <Combobox
                                        items={[
                                            { value: "Low", label: t("complaints.priority.low") },
                                            { value: "Medium", label: t("complaints.priority.medium") },
                                            { value: "High", label: t("complaints.priority.high") },
                                            { value: "Critical", label: t("complaints.priority.critical") },
                                        ]}
                                        value={form.data.priority}
                                        onValueChange={(value) =>
                                            form.setData("priority", value)
                                        }
                                        placeholder={t("complaintForm.selectPriority")}
                                        emptyText={t("complaintForm.noMatch")}
                                    />
                                    {form.errors.priority && (
                                        <p className="text-xs text-destructive">{form.errors.priority}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("complaintForm.title")} *</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    placeholder={t("complaintForm.titlePlaceholder")}
                                    required
                                />
                                {form.errors.title && (
                                    <p className="text-xs text-destructive">{form.errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("complaintForm.description")} *</Label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData("description", e.target.value)
                                    }
                                    className="min-h-[120px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder={t("complaintForm.descriptionPlaceholder")}
                                    required
                                />
                                {form.errors.description && (
                                    <p className="text-xs text-destructive">{form.errors.description}</p>
                                )}
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("complaints.index")}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-brand px-6 text-xs font-semibold shadow-md hover:bg-brand hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? t("complaintForm.lodging") : t("complaintForm.submitComplaint")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
