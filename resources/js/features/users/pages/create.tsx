import { Head, useForm, usePage } from "@inertiajs/react";
import { UserPlus } from "lucide-react";
import { FormEvent } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    const { data, setData, post, errors, processing } =
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

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route("users.store"));
    };

    return (
        <AppLayout>
            <Head title="Add User" />

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-sky-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-600/10 text-sky-600">
                                <UserPlus className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Add User</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create a staff or resident account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="max-w-4xl border-border/60 bg-background/70 shadow-sm">
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
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel="Add User"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
