import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { PageProps } from "@/types";
import type { PermissionGroup } from "@/features/roles/types";
import RoleForm from "@/features/roles/components/role-form";

type CreateProps = {
    permissionGroups: PermissionGroup[];
};

export default function RolesCreate() {
    const { permissionGroups } = usePage<PageProps<CreateProps>>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        permissions: [] as number[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("roles.store"));
    };

    return (
        <AppLayout>
            <Head title="New Role" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            New Role
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create a custom role with feature-wise permissions.
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
                                    Role Details
                                </CardTitle>
                                <CardDescription>
                                    Name the role, describe it, and choose
                                    which features it can access.
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
                            submitLabel="Create Role"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
