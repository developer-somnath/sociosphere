import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, MessageSquareWarning } from "lucide-react";
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
import type { PageProps } from "@/types";

type CategoryOption = { id: number; name: string };
type StaffUser = { id: number; name: string; email: string };

type ComplaintDetail = {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    category_id: number;
    assigned_to: number | null;
    flat?: { id: number; flat_no: string; tower?: { id: number; name: string } };
    resident?: { id: number; name: string };
    category?: CategoryOption;
    assignee?: StaffUser;
};

type EditProps = {
    complaint: ComplaintDetail;
    categories: CategoryOption[];
    staffUsers: StaffUser[];
};

export default function ComplaintEdit() {
    const { complaint, categories, staffUsers } =
        usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        title: complaint.title,
        description: complaint.description,
        priority: complaint.priority,
        status: complaint.status,
        category_id: String(complaint.category_id ?? complaint.category?.id ?? ""),
        assigned_to: complaint.assigned_to ? String(complaint.assigned_to) : "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("complaints.update", complaint.id));
    };

    return (
        <AppLayout>
            <Head title={t("complaintForm.editHeadTitle", { title: complaint.title })} />

            <PageHeader
                title={t("complaintForm.editTitle")}
                description={`#${complaint.id} · ${complaint.flat?.flat_no ?? ""} ${complaint.flat?.tower ? `(${complaint.flat.tower.name})` : ""}`}
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    <Button variant="outline" asChild>
                        <Link href={route("complaints.show", complaint.id)}>
                            <ArrowLeft className="size-4" />
                            {t("complaintForm.backToDetail")}
                        </Link>
                    </Button>
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>{t("complaintForm.updateTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>{t("common.status")}</Label>
                                    <Combobox
                                        items={[
                                            { value: "Open", label: t("complaints.status.open") },
                                            { value: "Assigned", label: t("complaints.status.assigned") },
                                            { value: "In Progress", label: t("complaints.status.inProgress") },
                                            { value: "Resolved", label: t("complaints.status.resolved") },
                                            { value: "Closed", label: t("complaints.status.closed") },
                                        ]}
                                        value={form.data.status}
                                        onValueChange={(value) =>
                                            form.setData("status", value)
                                        }
                                        placeholder={t("complaintForm.selectStatus")}
                                        emptyText={t("complaintForm.noMatch")}
                                    />
                                    {form.errors.status && (
                                        <p className="text-xs text-destructive">{form.errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>{t("common.assignedTo")}</Label>
                                    <Combobox
                                        items={staffUsers.map((u) => ({
                                            value: String(u.id),
                                            label: `${u.name} (${u.email})`,
                                        }))}
                                        value={form.data.assigned_to}
                                        onValueChange={(value) =>
                                            form.setData("assigned_to", value)
                                        }
                                        placeholder={t("complaintForm.selectStaff")}
                                        emptyText={t("complaintForm.noStaffFound")}
                                    />
                                    {form.errors.assigned_to && (
                                        <p className="text-xs text-destructive">{form.errors.assigned_to}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("complaintForm.title")} *</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    placeholder={t("complaintForm.editTitlePlaceholder")}
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
                                <Link href={route("complaints.show", complaint.id)}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-brand px-6 text-xs font-semibold shadow-md hover:bg-brand hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? t("complaintForm.saving") : t("common.saveChanges")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
