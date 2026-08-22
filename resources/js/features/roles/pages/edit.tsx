import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { BackButton } from "@/components/app/back-button";
import { Badge } from "@/components/ui/badge";
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

type EditProps = {
    role: {
        uuid: string;
        name: string;
        description: string | null;
        is_system: boolean;
        permissions: number[];
    };
    permissionGroups: PermissionGroup[];
};

export default function RolesEdit() {
    const { role, permissionGroups } = usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, put, processing, errors } =
        useForm<RoleFormValues>({
            name: role.name,
            description: role.description ?? "",
            permissions: role.permissions,
        });

    // RoleFormValues are primitives plus a permissions array, so
    // narrowing the Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof RoleFormValues>(
        key: K,
        value: RoleFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("roles.update", role.uuid), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("roles.editTitle", { name: role.name })} />

            <PageHeader
                title={t("roles.editPageTitle")}
                description={t("roles.editPageDescription")}
                icon={<ShieldCheck className="size-5" />}
                breadcrumbs={[
                    { label: t("nav.admin"), href: "/dashboard" },
                    { label: t("nav.roles"), href: route("roles.index") },
                    { label: role.name },
                ]}
                actions={
                    <>
                        {role.is_system && (
                            <Badge variant="secondary">
                                {t("roles.system")}
                            </Badge>
                        )}
                        <BackButton routeName="roles.index" label={t("common.back")} />
                    </>
                }
            />

                <Card className="border-border/60 bg-card/80 shadow-xs">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-info/10 text-info dark:bg-info/10 dark:text-info">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    {role.name}
                                </CardTitle>
                                <CardDescription>
                                    {role.name === "SuperAdmin"
                                        ? t("roles.superAdminLocked")
                                        : t("roles.changesApplyToHolders")}
                                </CardDescription>
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
                            submitLabel={t("common.saveChanges")}
                            disabled={role.name === "SuperAdmin"}
                        />
                    </CardContent>
                </Card>
        </AppLayout>
    );
}
