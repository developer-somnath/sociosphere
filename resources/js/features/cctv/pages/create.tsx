import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Video } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PageProps } from "@/types";

type CreateProps = {
    towers: { id: number; name: string }[];
};

export default function CctvCreate() {
    const { towers } = usePage<PageProps<CreateProps>>().props;

    const form = useForm({
        name: "",
        camera_group: "Main Gate",
        stream_url: "",
        tower_id: "",
        ip_address: "",
        location_details: "",
        status: "Online",
        is_recording: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("cctv-cameras.store"));
    };

    return (
        <AppLayout>
            <Head title="Add CCTV Camera Feed" />

            <PageHeader
                title="Add CCTV Camera Feed"
                description="Configure an RTSP, HLS, or HTTP stream for surveillance."
                icon={<Video className="size-5" />}
                breadcrumbs={[
                    { label: "Surveillance" },
                    { label: "CCTV Feeds", href: route("cctv-cameras.index") },
                    { label: "Add Camera" },
                ]}
                actions={
                    <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                        <Link href={route("cctv-cameras.index")}>
                            <ArrowLeft className="size-3.5" />
                            Back
                        </Link>
                    </Button>
                }
            />

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">Camera Configuration Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title="Stream Endpoint" description="Specify feed identifiers and RTSP URL.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="name">Camera Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData("name", e.target.value)}
                                        placeholder="e.g. Main Gate Entry Cam 01"
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="camera_group">Camera Group *</Label>
                                    <select
                                        id="camera_group"
                                        value={form.data.camera_group}
                                        onChange={(e) => form.setData("camera_group", e.target.value as any)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Main Gate">Main Gate</option>
                                        <option value="Basement Parking">Basement Parking</option>
                                        <option value="Tower Lobby">Tower Lobby</option>
                                        <option value="Perimeter">Perimeter</option>
                                        <option value="Amenities">Amenities</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="status">Camera Status *</Label>
                                    <select
                                        id="status"
                                        value={form.data.status}
                                        onChange={(e) => form.setData("status", e.target.value as any)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Online">Online</option>
                                        <option value="Offline">Offline</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="stream_url">Stream RTSP / HLS URL *</Label>
                                    <Input
                                        id="stream_url"
                                        value={form.data.stream_url}
                                        onChange={(e) => form.setData("stream_url", e.target.value)}
                                        placeholder="rtsp://admin:pass@192.168.1.100:554/stream1"
                                        required
                                    />
                                    {form.errors.stream_url && <p className="text-xs text-destructive">{form.errors.stream_url}</p>}
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Physical Location (Optional)" description="Tower and IP details.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tower_id">Tower / Block</Label>
                                    <select
                                        id="tower_id"
                                        value={form.data.tower_id}
                                        onChange={(e) => form.setData("tower_id", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Perimeter / Gate (No Tower)</option>
                                        {towers.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ip_address">IP Address</Label>
                                    <Input
                                        id="ip_address"
                                        value={form.data.ip_address}
                                        onChange={(e) => form.setData("ip_address", e.target.value)}
                                        placeholder="e.g. 192.168.1.105"
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="location_details">Location Description</Label>
                                    <Input
                                        id="location_details"
                                        value={form.data.location_details}
                                        onChange={(e) => form.setData("location_details", e.target.value)}
                                        placeholder="e.g. Mounted above North Gate Boom Barrier"
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                 <Link href={route("cctv-cameras.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-emerald-600 px-6 text-xs font-semibold shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? "Saving..." : "Add Camera"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
