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
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                                <DoorOpen className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Add Flat
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add a new property unit to a tower.
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

                <Card className="max-w-4xl border-border/60 bg-background/70 shadow-sm">
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
