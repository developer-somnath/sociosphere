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
import type { TowerOption } from "@/features/flats/types";
import FlatForm, {
    type FlatFormValues,
} from "@/features/flats/components/flat-form";

type CreateProps = {
    towers: TowerOption[];
};

export default function FlatsCreate() {
    const { towers } = usePage<PageProps<CreateProps>>().props;

    const { data, setData, post, processing, errors } =
        useForm<FlatFormValues>({
            tower_id: "",
            flat_no: "",
            floor_no: "",
            flat_type: "",
            area_sqft: "",
            ownership_type: "",
            occupancy_status: "",
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("flats.store"));
    };

    return (
        <AppLayout>
            <Head title="Add Flat" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add Flat
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new property unit to a tower.
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
                                    Enter the details of the new property unit.
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
                            submitLabel="Add Flat"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
