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
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
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

    const { data, setData: rawSetData, post, processing, errors } =
        useForm<TowerFormValues>({
            name: "",
            society_id: "",
        });

    // All TowerFormValues are plain primitives, so narrowing the
    // Inertia setData signature to (key, value) is safe.
    const setData = rawSetData as <K extends keyof TowerFormValues>(
        key: K,
        value: TowerFormValues[K],
    ) => void;

    const { markDirty, reset } = useUnsavedChanges();

    // Mark the guard dirty on every field change (blueprint §10)
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("towers.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Add Tower" />

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                                <Building2 className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Add Tower
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add a new tower to your society.
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

                <Card className="border-border/60 bg-background/70 shadow-sm">
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
                            setData={updateData}
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
