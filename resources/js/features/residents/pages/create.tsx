import { Head, useForm, usePage } from "@inertiajs/react";
import { UserPlus } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { BackButton } from "@/components/app/back-button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";
import type { FlatOption } from "@/features/residents/types";
import ResidentForm, {
    type ResidentFormValues,
} from "@/features/residents/components/resident-form";

type CreateProps = {
    flats: FlatOption[];
};

export default function ResidentsCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, post, processing, errors } =
        useForm<ResidentFormValues>({
            flat_id: "",
            name: "",
            email: "",
            phone: "",
            date_of_birth: "",
            gender: "",
            occupation: "",
            is_primary_contact: false,
        });

    // All ResidentFormValues are plain primitives, so narrowing the
    // Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof ResidentFormValues>(
        key: K,
        value: ResidentFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("residents.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("residents.add")} />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title={t("residents.add")}
                    description={t("residents.createPageDescription")}
                    icon={<UserPlus className="size-5" />}
                    breadcrumbs={[
                        { label: t("nav.properties") },
                        { label: t("nav.residents"), href: route("residents.index") },
                        { label: t("residents.add") },
                    ]}
                    actions={<BackButton routeName="residents.index" />}
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="size-5 text-brand" />
                            {t("residents.details")}
                        </CardTitle>
                        <CardDescription>
                            {t("form.requiredFields")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResidentForm
                            flats={flats}
                            data={data}
                            setData={updateData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel={t("residents.add")}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
