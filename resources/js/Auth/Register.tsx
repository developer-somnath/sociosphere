import { Head, Link } from "@inertiajs/react";
import { Building2, LogIn } from "lucide-react";
import { route } from "ziggy-js";

import AuthPageShell from "@/features/auth/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function Register() {
    const { t } = useI18n();
    return (
        <AuthPageShell>
            <Head title={t("auth.invitationOnly")} />
            <Card>
                <CardContent className="space-y-6 p-7 sm:p-8 lg:p-10">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Building2 className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {t("auth.invitationOnly")}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t("auth.invitationSubtitle")}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                        {t("auth.invitationContact")}
                    </div>

                    <Button className="h-11 w-full" asChild>
                        <Link href={route("login")}>
                            <LogIn />
                            {t("auth.goToSignIn")}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </AuthPageShell>
    );
}
