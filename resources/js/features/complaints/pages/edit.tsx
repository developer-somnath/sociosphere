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
    flat?: { id: number; flat_number: string; tower?: { id: number; name: string } };
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
            <Head title={`Edit: ${complaint.title}`} />

            <PageHeader
                title="Edit Complaint"
                description={`#${complaint.id} · ${complaint.flat?.flat_number ?? ""} ${complaint.flat?.tower ? `(${complaint.flat.tower.name})` : ""}`}
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    <Button variant="outline" asChild>
                        <Link href={route("complaints.show", complaint.id)}>
                            <ArrowLeft className="size-4" />
                            Back to Detail
                        </Link>
                    </Button>
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>Update Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <FormSection title="Complaint Information">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Category *</Label>
                                    <Combobox
                                        items={categories.map((c) => ({
                                            value: String(c.id),
                                            label: c.name,
                                        }))}
                                        value={form.data.category_id}
                                        onValueChange={(value) =>
                                            form.setData("category_id", value)
                                        }
                                        placeholder="Select category…"
                                        emptyText="No categories"
                                    />
                                    {form.errors.category_id && (
                                        <p className="text-xs text-destructive">{form.errors.category_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Priority *</Label>
                                    <Combobox
                                        items={[
                                            { value: "Low", label: "Low" },
                                            { value: "Medium", label: "Medium" },
                                            { value: "High", label: "High" },
                                            { value: "Critical", label: "Critical" },
                                        ]}
                                        value={form.data.priority}
                                        onValueChange={(value) =>
                                            form.setData("priority", value)
                                        }
                                        placeholder="Select priority…"
                                        emptyText="No match"
                                    />
                                    {form.errors.priority && (
                                        <p className="text-xs text-destructive">{form.errors.priority}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Status</Label>
                                    <Combobox
                                        items={[
                                            { value: "Open", label: "Open" },
                                            { value: "Assigned", label: "Assigned" },
                                            { value: "In Progress", label: "In Progress" },
                                            { value: "Resolved", label: "Resolved" },
                                            { value: "Closed", label: "Closed" },
                                        ]}
                                        value={form.data.status}
                                        onValueChange={(value) =>
                                            form.setData("status", value)
                                        }
                                        placeholder="Select status…"
                                        emptyText="No match"
                                    />
                                    {form.errors.status && (
                                        <p className="text-xs text-destructive">{form.errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Assigned To</Label>
                                    <Combobox
                                        items={staffUsers.map((u) => ({
                                            value: String(u.id),
                                            label: `${u.name} (${u.email})`,
                                        }))}
                                        value={form.data.assigned_to}
                                        onValueChange={(value) =>
                                            form.setData("assigned_to", value)
                                        }
                                        placeholder="Select staff…"
                                        emptyText="No staff found"
                                    />
                                    {form.errors.assigned_to && (
                                        <p className="text-xs text-destructive">{form.errors.assigned_to}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Title *</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    placeholder="Complaint title"
                                    required
                                />
                                {form.errors.title && (
                                    <p className="text-xs text-destructive">{form.errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Description *</Label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData("description", e.target.value)
                                    }
                                    className="min-h-[120px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe the issue in detail..."
                                    required
                                />
                                {form.errors.description && (
                                    <p className="text-xs text-destructive">{form.errors.description}</p>
                                )}
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t pt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route("complaints.show", complaint.id)}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Saving…" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
