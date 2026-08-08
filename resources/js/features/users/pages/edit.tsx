import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, UserCog } from "lucide-react";
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
import type { RoleOption, SocietyOption, User } from "@/features/users/types";

type EditProps = {
    user: Pick<
        User,
        "id" | "uuid" | "name" | "email" | "phone" | "is_active"
    > & {
        role?: string;
        society_id: number | null;
    };
    roleOptions: RoleOption[];
    societies: SocietyOption[];
};

export default function UsersEdit() {
    const { user, roleOptions, societies } = usePage<PageProps<EditProps>>().props;

    const { data, setData: rawSetData, put, errors, processing } =
        useForm<UserFormValues>({
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            password: "",
            password_confirmation: "",
            role: user.role ?? "",
            society_id: user.society_id ?? "",
            is_active: user.is_active,
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
        put(route("users.update", user.uuid), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit ${user.name}`} />

            <PageHeader
                title={`Edit ${user.name}`}
                description="Update account details, role, or password."
                icon={<UserCog className="size-5" />}
                breadcrumbs={[
                    { label: "Admin", href: "/dashboard" },
                    { label: "Users", href: route("users.index") },
                    { label: user.name },
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
                            <UserCog className="size-5 text-sky-600" />
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
                            submitLabel="Save Changes"
                            isEdit
                        />
                    </CardContent>
                </Card>
        </AppLayout>
    );
}
