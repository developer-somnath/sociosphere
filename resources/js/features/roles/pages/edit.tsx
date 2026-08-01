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

    const { data, setData, put, processing, errors } = useForm<RoleFormValues>({
        name: role.name,
        description: role.description ?? "",
        permissions: role.permissions,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("roles.update", role.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${role.name}`} />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Edit Role
                            </h1>
                            {role.is_system && (
                                <Badge variant="secondary">System</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Update the role name, description, and feature-wise
                            permissions.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("roles.index")}>
                            <ArrowLeft />
                            Back
                        </Link>
                    </Button>
                </div>

                <Card className="border-border/60 shadow-sm">
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
                            setData={setData}
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
