import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building2 } from "lucide-react";
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
import type { SocietyOption } from "@/features/towers/types";
import TowerForm, {
    type TowerFormValues,
} from "@/features/towers/components/tower-form";

type CreateProps = {
    societies: SocietyOption[];
};

export default function TowersCreate() {
    const { societies } = usePage<PageProps<CreateProps>>().props;

    const { data, setData, post, processing, errors } =
        useForm<TowerFormValues>({
            name: "",
            society_id: "",
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("towers.store"));
    };

    return (
        <AppLayout>
            <Head title="Add Tower" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add Tower
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new tower to your society.
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
                            <Building2 className="size-5 text-emerald-600" />
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
                            submitLabel="Add Tower"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
