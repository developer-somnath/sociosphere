import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Pencil } from "lucide-react";
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
import type { FlatOption, Resident } from "@/features/residents/types";
import ResidentForm, {
    type ResidentFormValues,
} from "@/features/residents/components/resident-form";
import { FamilyMemberSection } from "@/features/residents/components/family-member-section";
import { VehicleSection } from "@/features/residents/components/vehicle-section";

type EditProps = {
    resident: Resident;
    flats: FlatOption[];
};

export default function ResidentsEdit() {
    const { resident, flats } = usePage<PageProps<EditProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, put, processing, errors } =
        useForm<ResidentFormValues>({
            flat_id: resident.flat_id,
            name: resident.name,
            email: resident.email ?? "",
            phone: resident.phone,
            date_of_birth: resident.date_of_birth ?? "",
            gender: resident.gender ?? "",
            occupation: resident.occupation ?? "",
            is_primary_contact: resident.is_primary_contact,
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
        put(route("residents.update", resident.uuid), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("residents.editTitle", { name: resident.name })} />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title={t("residents.edit")}
                    description={t("residents.editPageDescription", { name: resident.name })}
                    icon={<Pencil className="size-5" />}
                    breadcrumbs={[
                        { label: t("nav.properties") },
                        { label: t("nav.residents"), href: route("residents.index") },
                        { label: resident.name },
                    ]}
                    actions={
                        <BackButton routeName="residents.index" label={t("common.back")} />
                    }
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pencil className="size-5 text-brand" />
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
                            submitLabel={t("common.saveChanges")}
                        />
                    </CardContent>
                </Card>

                <FamilyMemberSection
                    residentUuid={resident.uuid}
                    members={resident.family_members ?? []}
                />

                <VehicleSection
                    residentUuid={resident.uuid}
                    vehicles={resident.vehicles ?? []}
                />
            </div>
        </AppLayout>
    );
}
