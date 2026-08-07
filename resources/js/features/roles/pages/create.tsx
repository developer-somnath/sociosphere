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
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-indigo-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    New Role
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create a custom role with feature-wise permissions.
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

                <Card className="max-w-4xl border-border/60 bg-background/70 shadow-sm">
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
