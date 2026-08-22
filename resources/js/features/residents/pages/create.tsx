import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, UserPlus } from "lucide-react";
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
import type { FlatOption } from "@/features/residents/types";
import ResidentForm, {
    type ResidentFormValues,
} from "@/features/residents/components/resident-form";

type CreateProps = {
    flats: FlatOption[];
};

export default function ResidentsCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;

    const { data, setData: rawSetData, post, processing, errors } =
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

    // All ResidentFormValues are plain primitives, so narrowing the
    // Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof ResidentFormValues>(
        key: K,
        value: ResidentFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("residents.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Add Resident" />

            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Add Resident"
                    description="Register a new resident in your society."
                    icon={<UserPlus className="size-5" />}
                    breadcrumbs={[
                        { label: "Management" },
                        { label: "Residents", href: route("residents.index") },
                        { label: "Add Resident" },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
                            <Link href={route("residents.index")}>
                                <ArrowLeft className="size-3.5" />
                                Back
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="size-5 text-brand" />
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
                            setData={updateData}
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
