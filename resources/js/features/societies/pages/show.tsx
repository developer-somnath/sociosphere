import { Head, Link, usePage } from "@inertiajs/react";
import { Building, Edit, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type SocietyDetail = {
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
    towers_count?: number;
    users_count?: number;
};

type ShowProps = {
    society: SocietyDetail;
    can: { update: boolean; delete: boolean };
};

export default function SocietyShow() {
    const { society, can } = usePage<PageProps<ShowProps>>().props;
    const { t } = useI18n();

    return (
        <AppLayout>
            <Head title={t("societies.showTitle", { name: society.name })} />

            <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/60 text-foreground shadow-inner">
                            <Building className="size-7 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{society.name}</h1>
                                {society.status ? (
                                    <Badge className="border-transparent bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand">
                                        {t("common.active")}
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        {t("common.inactive")}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm font-mono text-muted-foreground mt-0.5">
                                {t("societies.registrationNoLabel")}:{" "}
                                {society.registration_no ?? t("societies.na")}
                            </p>
                        </div>
                    </div>
                    {can.update && (
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href={route("societies.edit", society.uuid)}>
                                <Edit className="mr-1.5 size-4" />
                                {t("societies.editProfile")}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border/70 bg-card/80 shadow-xs md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {t("societies.attributesTitle")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    {t("societies.towersBlocks")}
                                </span>
                                <p className="text-lg font-bold">
                                    {society.towers_count ?? 0}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    {t("societies.registeredUsers")}
                                </span>
                                <p className="text-lg font-bold">
                                    {society.users_count ?? 0}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="mt-0.5 size-4 shrink-0" />
                                <span>
                                    {[society.address, society.city, society.state, society.country, society.postal_code]
                                        .filter(Boolean)
                                        .join(", ") || t("societies.noAddress")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="size-4 shrink-0" />
                                <span>
                                    {society.phone ?? t("societies.noPhone")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="size-4 shrink-0" />
                                <span>
                                    {society.email ?? t("societies.noEmail")}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/80 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {t("societies.quickShortcuts")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                            <Link href={route("towers.index")}>
                                <Building className="mr-2 size-4 text-muted-foreground" />
                                {t("societies.viewTowers")}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                            <Link href={route("flats.index")}>
                                <Users className="mr-2 size-4 text-muted-foreground" />
                                {t("societies.viewFlats")}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                            <Link href={route("users.index")}>
                                <ShieldCheck className="mr-2 size-4 text-muted-foreground" />
                                {t("societies.viewUsers")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
