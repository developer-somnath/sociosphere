import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { PageProps } from "@/types";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useI18n } from "@/lib/i18n";
import type {
    PermissionGroup,
    RoleFormValues,
} from "@/features/roles/types";
import RoleForm from "@/features/roles/components/role-form";

type CreateProps = {
    permissionGroups: PermissionGroup[];
};

export default function RolesCreate() {
    const { permissionGroups } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, post, processing, errors } =
        useForm<RoleFormValues>({
            name: "",
            description: "",
            permissions: [] as number[],
        });

    const setData = rawSetData as <K extends keyof RoleFormValues>(
        key: K,
        value: RoleFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("roles.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("roles.create")} />
            <PageHeader
                title={t("roles.create")}
                description={t("roles.createDescription", undefined) || "Define a custom access control role and assign specific permissions."}
                breadcrumbs={[
                    { label: t("dashboard.overview"), href: "/dashboard" },
                    { label: t("nav.roles"), href: route("roles.index") },
                    { label: t("common.create") },
                ]}
                actions={
                    <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                        <Link href={route("roles.index")}>
                            <ArrowLeft className="size-3.5" />
                            {t("common.back")}
                        </Link>
                    </Button>
                }
            />

            <Card className="border-border/60 bg-card/80 shadow-xs">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-info/10 text-info dark:bg-info/10 dark:text-info">
                            <ShieldCheck className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">{t("roleForm.roleDetails")}</CardTitle>
                            <CardDescription className="text-xs">{t("roleForm.roleDetailsDescription")}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <RoleForm
                        groups={permissionGroups}
                        data={data}
                        setData={updateData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        submitLabel={t("common.create")}
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
