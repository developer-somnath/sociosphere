import { Head, Link } from "@inertiajs/react";
import { Building2, LogIn } from "lucide-react";
import { route } from "ziggy-js";

import AuthPageShell from "@/features/auth/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Register() {
    return (
        <AuthPageShell>
            <Head title="Account access" />
            <Card>
                <CardContent className="space-y-6 p-7 sm:p-8 lg:p-10">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Building2 className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Account access is invitation-only
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Your society administrator creates accounts with
                                the correct role and society access.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                        Contact your society administrator to receive an
                        invitation. If you already have an account, sign in
                        below.
                    </div>

                    <Button className="h-11 w-full" asChild>
                        <Link href={route("login")}>
                            <LogIn />
                            Go to sign in
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </AuthPageShell>
    );
}
