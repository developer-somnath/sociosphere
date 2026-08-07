import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Building } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SocietyCreate() {
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
            <Head title="Register Society" />

            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild className="rounded-xl">
                    <Link href={route("societies.index")}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Register Society</h1>
                    <p className="text-xs text-muted-foreground">Add a new residential complex or apartment building tenant.</p>
                </div>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">Society Registration Form</CardTitle>
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
                                        placeholder="e.g. Green Palms Residency"
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
                                        placeholder="e.g. REG-2026-88192"
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
                                        placeholder="123 Palm Avenue, Sector 4"
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
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Office Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData("email", e.target.value)}
                                        placeholder="office@greenpalms.org"
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route("societies.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Saving…" : "Register Society"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
