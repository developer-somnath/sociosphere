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

    return (
        <AppLayout>
            <Head title="Add Amenity" />

            <PageHeader
                title="Add New Amenity"
                description="Configure a new society facility available for resident booking."
                icon={<Sparkles className="size-5" />}
                actions={
                    <Button variant="outline" asChild>
                        <Link href={route("amenities.index")}>
                            <ArrowLeft className="size-4" />
                            Back to Amenities
                        </Link>
                    </Button>
                }
            />

            <Card className="mx-auto max-w-2xl border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardHeader>
                    <CardTitle>Amenity Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <FormSection title="General Information">
                            <div className="space-y-1.5">
                                <Label>Amenity Name *</Label>
                                <Input
                                    value={form.data.name}
                                    onChange={(e) => form.setData("name", e.target.value)}
                                    placeholder="e.g. Swimming Pool, Community Hall"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-destructive">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label>Booking Type *</Label>
                                    <Combobox
                                        items={[
                                            { value: "Slot", label: "Slot-Based" },
                                            { value: "Hourly", label: "Hourly" },
                                            { value: "Daily", label: "Daily / Full Day" },
                                        ]}
                                        value={form.data.booking_type}
                                        onValueChange={(value) =>
                                            form.setData("booking_type", value as "Slot" | "Hourly" | "Daily")
                                        }
                                        placeholder="Select type…"
                                        emptyText="No match"
                                    />
                                    {form.errors.booking_type && (
                                        <p className="text-xs text-destructive">{form.errors.booking_type}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Capacity (People) *</Label>
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
                                    <Label>Fee Per Slot (৳) *</Label>
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
                                <Label>Description</Label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    className="min-h-[80px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder="Brief description of the facility..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Usage Rules & Guidelines</Label>
                                <textarea
                                    value={form.data.rules}
                                    onChange={(e) => form.setData("rules", e.target.value)}
                                    className="min-h-[100px] w-full rounded-lg border border-input bg-transparent p-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder="e.g. Proper swimwear required. No loud music after 10 PM."
                                />
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t pt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route("amenities.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Creating…" : "Create Amenity"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
