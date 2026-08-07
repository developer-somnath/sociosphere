import { Head, useForm, usePage } from "@inertiajs/react";
import { UserCog } from "lucide-react";
import { FormEvent } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
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

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-sky-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-600/10 text-sky-600">
                                <UserCog className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Edit {user.name}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update account details, role, or password.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="border-border/60 bg-background/70 shadow-sm">
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
            </div>
        </AppLayout>
    );
}
