import { Head, useForm, usePage } from "@inertiajs/react";
import { UserCog } from "lucide-react";
import { FormEvent } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    const { data, setData, put, errors, processing } =
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

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(route("users.update", user.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${user.name}`} />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">
                    Edit {user.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Update account details, role, or password.
                </p>
            </div>

            <Card className="max-w-3xl border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <UserCog className="size-5 text-muted-foreground" />
                        Account details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <UserForm
                        roles={roleOptions}
                        societies={societies}
                        data={data}
                        setData={setData}
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
