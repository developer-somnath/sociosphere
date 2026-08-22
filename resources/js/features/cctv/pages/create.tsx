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

type CreateProps = {
    towers: { id: number; name: string }[];
};

export default function CctvCreate() {
    const { towers } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

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
            <Head title={t("cctvForm.addTitle")} />

            <PageHeader
                title={t("cctvForm.addTitle")}
                description={t("cctvForm.addDescription")}
                icon={<Video className="size-5" />}
                breadcrumbs={[
                    { label: t("cctvForm.breadcrumbSurveillance") },
                    { label: t("nav.cctv"), href: route("cctv-cameras.index") },
                    { label: t("cctvForm.addCamera") },
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
                                        placeholder={t("cctvForm.namePlaceholder")}
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
                                        placeholder="rtsp://admin:pass@192.168.1.100:554/stream1"
                                        required
                                    />
                                    {form.errors.stream_url && <p className="text-xs text-destructive">{form.errors.stream_url}</p>}
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title={t("cctvForm.physicalLocation")} description={t("cctvForm.physicalLocationDescription")}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tower_id">{t("cctvForm.towerBlock")}</Label>
                                    <select
                                        id="tower_id"
                                        value={form.data.tower_id}
                                        onChange={(e) => form.setData("tower_id", e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">{t("cctvForm.noTower")}</option>
                                        {towers.map((tower) => (
                                            <option key={tower.id} value={tower.id}>{tower.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ip_address">{t("cctvForm.ipAddress")}</Label>
                                    <Input
                                        id="ip_address"
                                        value={form.data.ip_address}
                                        onChange={(e) => form.setData("ip_address", e.target.value)}
                                        placeholder="e.g. 192.168.1.105"
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="location_details">{t("cctvForm.locationDescription")}</Label>
                                    <Input
                                        id="location_details"
                                        value={form.data.location_details}
                                        onChange={(e) => form.setData("location_details", e.target.value)}
                                        placeholder={t("cctvForm.locationPlaceholder")}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                            <Button variant="outline" type="button" className="rounded-full px-5 text-xs font-semibold hover:bg-muted" asChild>
                                 <Link href={route("cctv-cameras.index")}>{t("common.cancel")}</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="rounded-full bg-brand px-6 text-xs font-semibold shadow-md hover:bg-brand hover:-translate-y-0.5 transition-all duration-200 text-white">
                                {form.processing ? t("cctvForm.saving") : t("cctvForm.addCamera")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
