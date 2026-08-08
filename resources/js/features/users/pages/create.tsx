import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { FormEvent } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import UserForm, {
    type UserFormValues,
} from "@/features/users/components/user-form";
import type { PageProps } from "@/types";
import type { RoleOption, SocietyOption } from "@/features/users/types";

type CreateProps = {
    roleOptions: RoleOption[];
    societies: SocietyOption[];
};

export default function UsersCreate() {
    const { roleOptions, societies } = usePage<PageProps<CreateProps>>().props;

    const { data, setData: rawSetData, post, errors, processing } =
        useForm<UserFormValues>({
            name: "",
            email: "",
            phone: "",
            password: "",
            password_confirmation: "",
            role: "",
            society_id: "",
            is_active: true,
        });

    // UserFormValues are all primitives, so narrowing the Inertia
    // setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof UserFormValues>(
        key: K,
        value: UserFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route("users.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Add User" />

            <PageHeader
                title="Add User"
                description="Create a staff or resident account."
                icon={<UserPlus className="size-5" />}
                breadcrumbs={[
                    { label: "Admin", href: "/dashboard" },
                    { label: "Users", href: route("users.index") },
                    { label: "Add User" },
                ]}
                actions={
                    <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                        <Link href={route("users.index")}>
                            <ArrowLeft className="size-3.5" />
                            Back
                        </Link>
                    </Button>
                }
            />

            <Card className="border-border/60 bg-card/80 shadow-xs">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserPlus className="size-5 text-sky-600" />
                            Account details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserForm
                            roles={roleOptions}
                            societies={societies}
                            data={data}
                            setData={updateData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel="Add User"
                        />
                    </CardContent>
                </Card>
        </AppLayout>
    );
}
