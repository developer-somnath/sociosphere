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
type FlatOption = { id: number; flat_number: string; tower?: { id: number; name: string } };
type ResidentOption = { id: number; name: string; flat_id: number };

type CreateProps = {
    categories: CategoryOption[];
    flats: FlatOption[];
    residents: ResidentOption[];
};

export default function ComplaintCreate() {
    const { categories, flats, residents } = usePage<PageProps<CreateProps>>().props;

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
            <Head title="Raise Complaint" />

            <PageHeader
                title="Raise New Complaint"
                description="Submit a complaint or service request on behalf of a resident."
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    <Button variant="outline" asChild>
                        <Link href={route("complaints.index")}>
                            <ArrowLeft className="size-4" />
                            Back to Complaints
                        </Link>
                    </Button>
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>Complaint Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <FormSection title="Location & Resident">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Flat *</Label>
                                    <Combobox
                                        items={flats.map((f) => ({
                                            value: String(f.id),
                                            label: `${f.flat_number}${f.tower ? ` — ${f.tower.name}` : ""}`,
                                        }))}
                                        value={form.data.flat_id}
                                        onValueChange={(value) => {
                                            form.setData("flat_id", value);
                                            form.setData("resident_id", "");
                                        }}
                                        placeholder="Select flat…"
                                        emptyText="No flats found"
                                    />
                                    {form.errors.flat_id && (
                                        <p className="text-xs text-destructive">{form.errors.flat_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Reporting Resident *</Label>
                                    <Combobox
                                        items={filteredResidents.map((r) => ({
                                            value: String(r.id),
                                            label: r.name,
                                        }))}
                                        value={form.data.resident_id}
                                        onValueChange={(value) =>
                                            form.setData("resident_id", value)
                                        }
                                        placeholder="Select resident…"
                                        emptyText="No residents in this flat"
                                    />
                                    {form.errors.resident_id && (
                                        <p className="text-xs text-destructive">{form.errors.resident_id}</p>
                                    )}
                                </div>
                            </div>
                        </FormSection>

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

                            <div className="space-y-1.5">
                                <Label>Title *</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    placeholder="e.g. Water leakage in bathroom"
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

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("complaints.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-emerald-600 px-6 text-xs font-semibold shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? "Lodging..." : "Submit Complaint"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
