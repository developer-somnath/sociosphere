import { Head, Link, useForm } from "@inertiajs/react";
import { Megaphone } from "lucide-react";
import { BackButton } from "@/components/app/back-button";
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

export default function NoticeCreate() {
    const { t } = useI18n();
    const form = useForm({
        title: "",
        category: "",
        target_audience: "All",
        description: "",
        is_pinned: false,
        publish_from: "",
        publish_to: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("notices.store"));
    };

    return (
        <AppLayout>
            <Head title={t("notices.createHeadTitle")} />

            <PageHeader
                title={t("notices.createTitle")}
                description="Create an announcement for residents, owners, or tenants."
                icon={<Megaphone className="size-5" />}
                breadcrumbs={[
                    { label: "Communications", href: "/dashboard" },
                    { label: "Notices", href: route("notices.index") },
                    { label: "Publish Notice" },
                ]}
                actions={
                    <BackButton routeName="notices.index" />
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>Notice Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <FormSection title={t("notices.announcementTitle")}>
                            <div className="space-y-1.5">
                                <Label>Title *</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    placeholder="e.g. Water Supply Maintenance on Sunday"
                                    required
                                />
                                {form.errors.title && (
                                    <p className="text-xs text-destructive">{form.errors.title}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Category</Label>
                                    <Input
                                        value={form.data.category}
                                        onChange={(e) => form.setData("category", e.target.value)}
                                        placeholder="e.g. Maintenance, Events, Security"
                                    />
                                    {form.errors.category && (
                                        <p className="text-xs text-destructive">{form.errors.category}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Target Audience *</Label>
                                    <Combobox
                                        items={[
                                            { value: "All", label: "All Residents" },
                                            { value: "Owners", label: "Owners" },
                                            { value: "Tenants", label: "Tenants" },
                                        ]}
                                        value={form.data.target_audience}
                                        onValueChange={(value) =>
                                            form.setData("target_audience", value as "All" | "Owners" | "Tenants")
                                        }
                                        placeholder="Select audience…"
                                        emptyText="No match"
                                    />
                                    {form.errors.target_audience && (
                                        <p className="text-xs text-destructive">{form.errors.target_audience}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Description *</Label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    className="min-h-[140px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder="Write the full notice content here..."
                                    required
                                />
                                {form.errors.description && (
                                    <p className="text-xs text-destructive">{form.errors.description}</p>
                                )}
                            </div>
                        </FormSection>

                        <FormSection title={t("notices.publishingWindowTitle")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Publish From</Label>
                                    <Input
                                        type="date"
                                        value={form.data.publish_from}
                                        onChange={(e) => form.setData("publish_from", e.target.value)}
                                    />
                                    {form.errors.publish_from && (
                                        <p className="text-xs text-destructive">{form.errors.publish_from}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Publish To</Label>
                                    <Input
                                        type="date"
                                        value={form.data.publish_to}
                                        onChange={(e) => form.setData("publish_to", e.target.value)}
                                    />
                                    {form.errors.publish_to && (
                                        <p className="text-xs text-destructive">{form.errors.publish_to}</p>
                                    )}
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_pinned}
                                    onChange={(e) => form.setData("is_pinned", e.target.checked)}
                                    className="size-4 accent-primary"
                                />
                                <span className="text-sm font-medium">Pin this notice to the top of the board</span>
                            </label>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("notices.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full px-6 text-xs font-semibold shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                {form.processing ? "Publishing…" : "Publish Notice"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}