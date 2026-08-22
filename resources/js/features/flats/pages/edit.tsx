import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, DoorOpen } from "lucide-react";
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
import type { Flat, TowerOption } from "@/features/flats/types";
import FlatForm, {
    type FlatFormValues,
} from "@/features/flats/components/flat-form";

type EditProps = {
    flat: Flat;
    towers: TowerOption[];
};

export default function FlatsEdit() {
    const { flat, towers } = usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, put, processing, errors } =
        useForm<FlatFormValues>({
            tower_id: flat.tower_id,
            flat_no: flat.flat_no,
            floor_no: flat.floor_no === null ? "" : String(flat.floor_no),
            flat_type: flat.flat_type ?? "",
            area_sqft: flat.area_sqft === null ? "" : String(flat.area_sqft),
            ownership_type: flat.ownership_type,
            occupancy_status: flat.occupancy_status,
        });

    // All FlatFormValues are plain primitives, so narrowing the
    // Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof FlatFormValues>(
        key: K,
        value: FlatFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("flats.update", flat.uuid), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("flats.editTitle", { flatNo: flat.flat_no })} />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title={t("flats.edit")}
                    description={t("flats.editPageDescription", { flatNo: flat.flat_no })}
                    icon={<DoorOpen className="size-5" />}
                    breadcrumbs={[
                        { label: t("nav.properties") },
                        { label: t("nav.flats"), href: route("flats.index") },
                        { label: t("flats.flatLabel", { flatNo: flat.flat_no }) },
                    ]}
                    actions={
                        <BackButton routeName="flats.index" label={t("common.back")} />
                    }
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                                <DoorOpen className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    {t("flats.details")}
                                </CardTitle>
                                <CardDescription>
                                    {t("flats.editDetailsDescription")}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <FlatForm
                            towers={towers}
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
