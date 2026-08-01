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
import type { FlatOption, VisitorPass } from "@/features/visitors/types";
import VisitorForm, {
    type VisitorFormValues,
} from "@/features/visitors/components/visitor-form";

type EditProps = {
    pass: VisitorPass;
    flats: FlatOption[];
};

export default function VisitorsEdit() {
    const { pass, flats } = usePage<PageProps<EditProps>>().props;

    const { data, setData, put, processing, errors } =
        useForm<VisitorFormValues>({
            name: pass.visitor.name,
            phone: pass.visitor.phone,
            email: pass.visitor.email ?? "",
            notes: pass.visitor.notes ?? "",
            flat_id: pass.flat?.id ?? "",
            purpose: pass.purpose,
            vehicle_number: pass.vehicle_number ?? "",
            scheduled_for: pass.scheduled_for
                ? pass.scheduled_for.slice(0, 10)
                : "",
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("visitors.update", pass.uuid));
    };

    return (
        <AppLayout>
            <Head title="Edit Visitor Pass" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Visitor Pass
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update visitor and pass details.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("visitors.index")}>
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
                                    Visitor & Pass Details
                                </CardTitle>
                                <CardDescription>
                                    Status cannot be changed here — use the
                                    register actions.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <VisitorForm
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
