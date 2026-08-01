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
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Tower
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update the details for {tower.name}.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("towers.index")}>
                            <ArrowLeft />
                            Back
                        </Link>
                    </Button>
                </div>

                <Card className="border-border/60 shadow-sm">
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
