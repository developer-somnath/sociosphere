import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
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
            <Head title={`Edit ${role.name}`} />

            <PageHeader
                title="Edit Role"
                description={`Update the role name, description, and feature-wise permissions.`}
                icon={<ShieldCheck className="size-5" />}
                breadcrumbs={[
                    { label: "Admin", href: "/dashboard" },
                    { label: "Roles", href: route("roles.index") },
                    { label: role.name },
                ]}
                actions={
                    <>
                        {role.is_system && <Badge variant="secondary">System</Badge>}
                        <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                            <Link href={route("roles.index")}>
                                <ArrowLeft className="size-3.5" />
                                Back
                            </Link>
                        </Button>
                    </>
                }
            />

                <Card className="border-border/60 bg-card/80 shadow-xs">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    {role.name}
                                </CardTitle>
                                <CardDescription>
                                    {role.name === "SuperAdmin"
                                        ? "The SuperAdmin role is locked and cannot be changed."
                                        : "Changes apply to all users holding this role."}
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
                            submitLabel="Save Changes"
                            disabled={role.name === "SuperAdmin"}
                        />
                    </CardContent>
                </Card>
        </AppLayout>
    );
}
