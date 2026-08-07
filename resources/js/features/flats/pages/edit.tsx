import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, DoorOpen } from "lucide-react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
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
            <Head title={`Edit ${flat.flat_no}`} />

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                                <DoorOpen className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Edit Flat
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update the details of flat {flat.flat_no}.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl">
                            <Link href={route("flats.index")}>
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>

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
                                    Update the details of this property unit.
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
                            submitLabel="Save Changes"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
