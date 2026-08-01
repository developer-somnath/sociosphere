import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, UserPlus } from "lucide-react";
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
import type { FlatOption } from "@/features/residents/types";
import ResidentForm, {
    type ResidentFormValues,
} from "@/features/residents/components/resident-form";

type CreateProps = {
    flats: FlatOption[];
};

export default function ResidentsCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;

    const { data, setData, post, processing, errors } =
        useForm<ResidentFormValues>({
            flat_id: "",
            name: "",
            email: "",
            phone: "",
            date_of_birth: "",
            gender: "",
            occupation: "",
            is_primary_contact: false,
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("residents.store"));
    };

    return (
        <AppLayout>
            <Head title="Add Resident" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add Resident
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Register a new resident in your society.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("residents.index")}>
                            <ArrowLeft />
                            Back
                        </Link>
                    </Button>
                </div>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="size-5 text-emerald-600" />
                            Resident Details
                        </CardTitle>
                        <CardDescription>
                            Fields marked with * are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResidentForm
                            flats={flats}
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel="Add Resident"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
