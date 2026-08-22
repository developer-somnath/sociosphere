import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building2 } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { BackButton } from "@/components/app/back-button";
import { Button } from "@/components/ui/button";
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
import type { SocietyOption } from "@/features/towers/types";
import TowerForm, {
    type TowerFormValues,
} from "@/features/towers/components/tower-form";

type CreateProps = {
    societies: SocietyOption[];
};

export default function TowersCreate() {
    const { societies } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, post, processing, errors } =
        useForm<TowerFormValues>({
            name: "",
            society_id: "",
        });

    // All TowerFormValues are plain primitives, so narrowing the
    // Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof TowerFormValues>(
        key: K,
        value: TowerFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("towers.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("towers.add")} />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title={t("towers.add")}
                    description={t("towers.addPageDescription")}
                    icon={<Building2 className="size-5" />}
                    breadcrumbs={[
                        { label: t("nav.properties") },
                        { label: t("nav.towers"), href: route("towers.index") },
                        { label: t("towers.add") },
                    ]}
                    actions={
                        <BackButton routeName="towers.index" label={t("common.back")} />
                    }
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="size-5 text-brand" />
                            {t("towers.details")}
                        </CardTitle>
                        <CardDescription>
                            {t("form.requiredFields")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TowerForm
                            societies={societies}
                            data={data}
                            setData={updateData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel={t("towers.add")}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
