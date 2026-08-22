import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, DoorOpen } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import type { PageProps } from "@/types";
import type { FlatOption } from "@/features/visitors/types";
import VisitorForm, {
    type VisitorFormValues,
} from "@/features/visitors/components/visitor-form";

type CreateProps = {
    flats: FlatOption[];
};

export default function VisitorsCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;
    const { t } = useI18n();

    const { data, setData: rawSetData, post, processing, errors } =
        useForm<VisitorFormValues>({
            name: "",
            phone: "",
            email: "",
            notes: "",
            flat_id: "",
            purpose: "",
            vehicle_number: "",
            scheduled_for: "",
        });

    // All VisitorFormValues are plain primitives, so narrowing the
    // Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof VisitorFormValues>(
        key: K,
        value: VisitorFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("visitors.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={t("visitors.add")} />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title={t("visitors.add")}
                    description={t("visitors.addPageDescription")}
                    icon={<DoorOpen className="size-5" />}
                    breadcrumbs={[
                        { label: t("visitors.breadcrumb.section") },
                        { label: t("nav.visitors"), href: route("visitors.index") },
                        { label: t("visitors.add") },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                            <Link href={route("visitors.index")}>
                                <ArrowLeft className="size-3.5" />
                                {t("common.back")}
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-info/10 text-info">
                                <DoorOpen className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    {t("visitors.details")}
                                </CardTitle>
                                <CardDescription>
                                    {t("visitors.createDetailsDescription")}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <VisitorForm
                            flats={flats}
                            data={data}
                            setData={updateData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel={t("visitors.createSubmit")}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
