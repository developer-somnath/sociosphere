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
import type { FlatOption } from "@/features/visitors/types";
import VisitorForm, {
    type VisitorFormValues,
} from "@/features/visitors/components/visitor-form";

type CreateProps = {
    flats: FlatOption[];
};

export default function VisitorsCreate() {
    const { flats } = usePage<PageProps<CreateProps>>().props;

    const { data, setData, post, processing, errors } =
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("visitors.store"));
    };

    return (
        <AppLayout>
            <Head title="New Visitor Pass" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            New Visitor Pass
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Register a visitor and raise a gate pass for
                            approval.
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
                            setData={setData}
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
