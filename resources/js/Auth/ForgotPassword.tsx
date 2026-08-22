import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Loader2, Mail, Send } from "lucide-react";
import type { FormEvent } from "react";
import { route } from "ziggy-js";

import AuthPageShell from "@/features/auth/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

export default function ForgotPassword() {
    const { status } = usePage<{ status?: string }>().props;
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({ email: "" });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route("password.email"));
    };

    return (
        <AuthPageShell>
            <Head title={t("auth.resetPasswordTitle")} />
            <Card>
                <CardContent className="p-7 sm:p-8 lg:p-10">
                    <h1 className="text-2xl font-semibold tracking-tight">{t("auth.resetPasswordTitle")}</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {t("auth.resetPasswordSubtitle")}
                    </p>
                    {status && <p className="mt-5 rounded-xl bg-brand/10 p-3 text-sm text-brand dark:text-brand">{status}</p>}
                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("auth.email")}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="email" type="email" value={data.email} onChange={(event) => setData("email", event.target.value)} className="h-11 pl-9" autoComplete="email" required />
                            </div>
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>
                        <Button className="h-11 w-full" disabled={processing}>
                            {processing ? <Loader2 className="animate-spin" /> : <Send />}
                            {t("auth.sendResetLinkShort")}
                        </Button>
                    </form>
                    <Link className="mt-5 inline-block text-sm font-medium text-primary hover:underline" href={route("login")}>{t("auth.backToSignIn")}</Link>
                </CardContent>
            </Card>
        </AuthPageShell>
    );
}
