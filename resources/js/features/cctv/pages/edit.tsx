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
    camera: {
        id: number;
        uuid: string;
        name: string;
        camera_group: string;
        stream_url: string;
        tower_id: number | null;
        ip_address: string | null;
        location_details: string | null;
        status: string;
        is_recording: boolean;
    };
    towers: { id: number; name: string }[];
};

export default function CctvEdit() {
    const { camera, towers } = usePage<PageProps<EditProps>>().props;

    const form = useForm({
        name: camera.name,
        camera_group: camera.camera_group,
        stream_url: camera.stream_url,
        tower_id: camera.tower_id ? String(camera.tower_id) : "",
        ip_address: camera.ip_address ?? "",
        location_details: camera.location_details ?? "",
        status: camera.status,
        is_recording: camera.is_recording,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("cctv-cameras.update", camera.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${camera.name}`} />

            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild className="rounded-xl">
                    <Link href={route("cctv-cameras.index")}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Edit Camera {camera.name}</h1>
                    <p className="text-xs text-muted-foreground">Update RTSP stream parameters and location information.</p>
                </div>
            </div>

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
                                        required
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route("cctv-cameras.index")}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Saving…" : "Update Camera"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
