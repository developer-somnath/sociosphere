import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Pencil } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
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
import type { SocietyOption, Tower } from "@/features/towers/types";
import TowerForm, {
    type TowerFormValues,
} from "@/features/towers/components/tower-form";

type EditProps = {
    tower: Tower;
    societies: SocietyOption[];
};

export default function TowersEdit() {
    const { tower, societies } = usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, put, processing, errors } =
        useForm<TowerFormValues>({
            name: tower.name,
            society_id: tower.society_id,
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
        put(route("towers.update", tower.uuid), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("towers.editTitle", { name: tower.name })} />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title={t("towers.edit")}
                    description={t("towers.editPageDescription", { name: tower.name })}
                    icon={<Pencil className="size-5" />}
                    breadcrumbs={[
                        { label: t("towers.breadcrumb.section") },
                        { label: t("nav.towers"), href: route("towers.index") },
                        { label: tower.name },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                            <Link href={route("towers.index")}>
                                <ArrowLeft className="size-3.5" />
                                {t("common.back")}
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pencil className="size-5 text-brand" />
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
                            submitLabel={t("common.saveChanges")}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
