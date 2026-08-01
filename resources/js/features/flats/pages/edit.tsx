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

    const { data, setData, put, processing, errors } =
        useForm<FlatFormValues>({
            tower_id: flat.tower_id,
            flat_no: flat.flat_no,
            floor_no: flat.floor_no === null ? "" : String(flat.floor_no),
            flat_type: flat.flat_type ?? "",
            area_sqft: flat.area_sqft === null ? "" : String(flat.area_sqft),
            ownership_type: flat.ownership_type,
            occupancy_status: flat.occupancy_status,
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("flats.update", flat.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${flat.flat_no}`} />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Flat
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update the details of flat {flat.flat_no}.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("flats.index")}>
                            <ArrowLeft />
                            Back
                        </Link>
                    </Button>
                </div>

                <Card className="border-border/60 shadow-sm">
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
                            setData={setData}
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
