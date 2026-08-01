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
import type { FlatOption, Resident } from "@/features/residents/types";
import ResidentForm, {
    type ResidentFormValues,
} from "@/features/residents/components/resident-form";

type EditProps = {
    resident: Resident;
    flats: FlatOption[];
};

export default function ResidentsEdit() {
    const { resident, flats } = usePage<PageProps<EditProps>>().props;

    const { data, setData, put, processing, errors } =
        useForm<ResidentFormValues>({
            flat_id: resident.flat_id,
            name: resident.name,
            email: resident.email ?? "",
            phone: resident.phone,
            date_of_birth: resident.date_of_birth ?? "",
            gender: resident.gender ?? "",
            occupation: resident.occupation ?? "",
            is_primary_contact: resident.is_primary_contact,
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("residents.update", resident.uuid));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${resident.name}`} />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Resident
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update the details for {resident.name}.
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
                            <Pencil className="size-5 text-emerald-600" />
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
                            submitLabel="Save Changes"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
