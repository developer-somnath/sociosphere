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
import type { FlatOption } from "@/features/visitors/types";
import VisitorForm, {
    type VisitorFormValues,
} from "@/features/visitors/components/visitor-form";

type CreateProps = {
    flats: FlatOption[];
};

export default function VisitorsCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;

    const { data, setData: rawSetData, post, processing, errors } =
        useForm<VisitorFormValues>({
            name: "",
            phone: "",
            email: "",
            notes: "",
            flat_id: "",
            purpose: "",
            vehicle_number: "",
            scheduled_for: "",
        });

    // All VisitorFormValues are plain primitives, so narrowing the
    // Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof VisitorFormValues>(
        key: K,
        value: VisitorFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("visitors.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="New Visitor Pass" />

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600">
                                <DoorOpen className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    New Visitor Pass
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Register a visitor and raise a gate pass for
                                    approval.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl">
                            <Link href={route("visitors.index")}>
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-border/60 bg-background/70 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-violet-600/10 text-violet-600">
                                <DoorOpen className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    Visitor & Pass Details
                                </CardTitle>
                                <CardDescription>
                                    The pass is created as pending and needs
                                    approval before check-in.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <VisitorForm
                            flats={flats}
                            data={data}
                            setData={updateData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel="Create Pass"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
