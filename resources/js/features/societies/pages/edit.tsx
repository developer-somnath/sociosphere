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

type EditProps = {
    society: {
        id: number;
        uuid: string;
        name: string;
        registration_no: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        postal_code: string | null;
        phone: string | null;
        email: string | null;
        status: boolean;
    };
};

export default function SocietyEdit() {
    const { society } = usePage<PageProps<EditProps>>().props;

    const form = useForm({
        name: society.name,
        registration_no: society.registration_no ?? "",
        address: society.address ?? "",
        city: society.city ?? "",
        state: society.state ?? "",
        country: society.country ?? "India",
        postal_code: society.postal_code ?? "",
        phone: society.phone ?? "",
        email: society.email ?? "",
        status: society.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("societies.update", society.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${society.name}`} />

            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild className="rounded-xl">
                    <Link href={route("societies.show", society.uuid)}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Edit Society Profile</h1>
                    <p className="text-xs text-muted-foreground">Update profile details for {society.name}.</p>
                </div>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">Edit Profile Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title="Basic Details" description="Core identity information of the residential society.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="name">Society Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData("name", e.target.value)}
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="registration_no">Registration Number</Label>
                                    <Input
                                        id="registration_no"
                                        value={form.data.registration_no}
                                        onChange={(e) => form.setData("registration_no", e.target.value)}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Address & Location" description="Physical address parameters.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Input
                                        id="address"
                                        value={form.data.address}
                                        onChange={(e) => form.setData("address", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={form.data.city}
                                        onChange={(e) => form.setData("city", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={form.data.state}
                                        onChange={(e) => form.setData("state", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={form.data.country}
                                        onChange={(e) => form.setData("country", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        value={form.data.postal_code}
                                        onChange={(e) => form.setData("postal_code", e.target.value)}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Contact Information" description="Primary society office contact credentials.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData("phone", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Office Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData("email", e.target.value)}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route("societies.show", society.uuid)}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Saving…" : "Update Profile"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
