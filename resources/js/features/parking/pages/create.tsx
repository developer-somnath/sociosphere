import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PageProps } from "@/types";

type CreateProps = {
    towers: { id: number; name: string }[];
    flats: { id: number; flat_no: string; tower_id: number }[];
};

export default function ParkingCreate() {
    const { towers, flats } = usePage<PageProps<CreateProps>>().props;

    const form = useForm({
        slot_number: "",
        type: "Four Wheeler",
        status: "Available",
        tower_id: "",
        flat_id: "",
        vehicle_number: "",
        vehicle_model: "",
        rfid_tag: "",
        notes: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("parking-slots.store"));
    };

    return (
        <AppLayout>
            <Head title="Add Parking Slot" />

            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild className="rounded-xl">
                    <Link href={route("parking-slots.index")}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Add Parking Slot</h1>
                    <p className="text-xs text-muted-foreground">Define a new Four Wheeler, Two Wheeler, or Visitor parking bay.</p>
                </div>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">Slot Configuration Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title="Slot Specifications" description="Basic location and type identifiers.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="slot_number">Slot Number *</Label>
                                    <Input
                                        id="slot_number"
                                        value={form.data.slot_number}
                                        onChange={(e) => form.setData("slot_number", e.target.value)}
                                        placeholder="e.g. B1-P12"
                                        required
                                    />
                                    {form.errors.slot_number && (
                                        <p className="text-xs text-destructive">{form.errors.slot_number}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="type">Vehicle Type *</Label>
                                    <select
                                        id="type"
                                        value={form.data.type}
                                        onChange={(e) => form.setData("type", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Four Wheeler">Four Wheeler</option>
                                        <option value="Two Wheeler">Two Wheeler</option>
                                        <option value="Visitor">Visitor</option>
                                    </select>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Allocation Details (Optional)" description="Assign this slot to a flat/resident right away.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tower_id">Tower / Block</Label>
                                    <select
                                        id="tower_id"
                                        value={form.data.tower_id}
                                        onChange={(e) => form.setData("tower_id", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Unassigned</option>
                                        {towers.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="flat_id">Flat</Label>
                                    <select
                                        id="flat_id"
                                        value={form.data.flat_id}
                                        onChange={(e) => {
                                            const flatId = e.target.value;
                                            form.setData({
                                                ...form.data,
                                                flat_id: flatId,
                                                status: flatId ? "Allocated" : "Available",
                                            });
                                        }}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Unassigned</option>
                                        {flats.map((f) => (
                                            <option key={f.id} value={f.id}>Flat {f.flat_no}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle_number">Vehicle Registration No</Label>
                                    <Input
                                        id="vehicle_number"
                                        value={form.data.vehicle_number}
                                        onChange={(e) => form.setData("vehicle_number", e.target.value)}
                                        placeholder="e.g. MH-12-AB-1234"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle_model">Vehicle Make / Model</Label>
                                    <Input
                                        id="vehicle_model"
                                        value={form.data.vehicle_model}
                                        onChange={(e) => form.setData("vehicle_model", e.target.value)}
                                        placeholder="e.g. Honda City (White)"
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route("parking-slots.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Saving…" : "Add Parking Slot"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
