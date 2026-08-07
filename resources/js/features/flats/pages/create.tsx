import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, DoorOpen } from "lucide-react";
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
import type { PageProps } from "@/types";
import type { TowerOption } from "@/features/flats/types";
import FlatForm, {
    type FlatFormValues,
} from "@/features/flats/components/flat-form";

type CreateProps = {
    towers: TowerOption[];
};

export default function FlatsCreate() {
    const { towers } = usePage<PageProps<CreateProps>>().props;

    const { data, setData: rawSetData, post, processing, errors } =
        useForm<FlatFormValues>({
            tower_id: "",
            flat_no: "",
            floor_no: "",
            flat_type: "",
            area_sqft: "",
            ownership_type: "",
            occupancy_status: "",
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
        post(route("flats.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Add Flat" />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Add Flat"
                    description="Add a new property unit to a tower."
                    icon={<DoorOpen className="size-5" />}
                    breadcrumbs={[
                        { label: "Management" },
                        { label: "Flats", href: route("flats.index") },
                        { label: "Add Flat" },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                            <Link href={route("flats.index")}>
                                <ArrowLeft className="size-3.5" />
                                Back
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600">
                                <DoorOpen className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    Flat Details
                                </CardTitle>
                                <CardDescription>
                                    Enter the details of the new property unit.
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
                            submitLabel="Add Flat"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
