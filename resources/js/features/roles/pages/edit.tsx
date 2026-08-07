import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
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

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-indigo-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Edit Role
                                    </h1>
                                    {role.is_system && (
                                        <Badge variant="secondary">System</Badge>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update the role name, description, and feature-wise
                                    permissions.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl">
                            <Link href={route("roles.index")}>
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-border/60 bg-background/70 shadow-sm">
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
            </div>
        </AppLayout>
    );
}
