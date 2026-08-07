import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Pencil } from "lucide-react";
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

    const { data, setData, put, processing, errors } =
        useForm<TowerFormValues>({
            name: tower.name,
            society_id: tower.society_id,
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("towers.update", tower.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${tower.name}`} />

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                                <Pencil className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Edit Tower
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update the details for {tower.name}.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl">
                            <Link href={route("towers.index")}>
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="max-w-4xl border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pencil className="size-5 text-emerald-600" />
                            Tower Details
                        </CardTitle>
                        <CardDescription>
                            Fields marked with * are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TowerForm
                            societies={societies}
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
