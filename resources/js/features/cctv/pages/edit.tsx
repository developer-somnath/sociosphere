import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Video } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { BackButton } from "@/components/app/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
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
    const { t } = useI18n();

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
            <Head title={t("cctvForm.editHeadTitle", { name: camera.name })} />

            <PageHeader
                title={t("cctvForm.editTitle")}
                description={t("cctvForm.editDescription", { name: camera.name })}
                icon={<Video className="size-5" />}
                breadcrumbs={[
                    { label: t("cctvForm.breadcrumbSurveillance") },
                    { label: t("nav.cctv"), href: route("cctv-cameras.index") },
                    { label: camera.name },
                ]}
                actions={
                    <BackButton routeName="cctv-cameras.index" label={t("common.back")} />
                }
            />

            <Card className="border-border/70 bg-card/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">{t("cctvForm.configurationTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title={t("cctvForm.streamEndpoint")} description={t("cctvForm.streamEndpointDescription")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="name">{t("cctvForm.cameraName")} *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData("name", e.target.value)}
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="camera_group">{t("cctvForm.cameraGroup")} *</Label>
                                    <select
                                        id="camera_group"
                                        value={form.data.camera_group}
                                        onChange={(e) => form.setData("camera_group", e.target.value as any)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Main Gate">{t("cctv.group.mainGate")}</option>
                                        <option value="Basement Parking">{t("cctv.group.basementParking")}</option>
                                        <option value="Tower Lobby">{t("cctv.group.towerLobby")}</option>
                                        <option value="Perimeter">{t("cctv.group.perimeter")}</option>
                                        <option value="Amenities">{t("cctv.group.amenities")}</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="status">{t("cctvForm.cameraStatus")} *</Label>
                                    <select
                                        id="status"
                                        value={form.data.status}
                                        onChange={(e) => form.setData("status", e.target.value as any)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Online">{t("cctv.online")}</option>
                                        <option value="Offline">{t("cctv.offline")}</option>
                                        <option value="Maintenance">{t("cctv.maintenance")}</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="stream_url">{t("cctvForm.streamUrl")} *</Label>
                                    <Input
                                        id="stream_url"
                                        value={form.data.stream_url}
                                        onChange={(e) => form.setData("stream_url", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                <Link href={route("cctv-cameras.index")}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-brand px-6 text-xs font-semibold shadow-md hover:bg-brand hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? t("cctvForm.saving") : t("common.saveChanges")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
