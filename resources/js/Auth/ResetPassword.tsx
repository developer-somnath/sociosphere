import { Head, useForm, usePage } from "@inertiajs/react";
import { KeyRound, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { route } from "ziggy-js";

import AuthPageShell from "@/features/auth/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

type ResetPasswordProps = { email: string; token: string };

export default function ResetPassword() {
    const { email, token } = usePage<ResetPasswordProps>().props;
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: "",
        password_confirmation: "",
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route("password.store"));
    };

    return (
        <AuthPageShell>
            <Head title={t("auth.chooseNewPassword")} />
            <Card><CardContent className="p-7 sm:p-8 lg:p-10">
                <h1 className="text-2xl font-semibold tracking-tight">{t("auth.chooseNewPassword")}</h1>
                <form onSubmit={submit} className="mt-6 space-y-5">
                    <div className="space-y-2"><Label htmlFor="email">{t("auth.email")}</Label><Input id="email" type="email" value={data.email} onChange={(event) => setData("email", event.target.value)} autoComplete="email" required />{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}</div>
                    <div className="space-y-2"><Label htmlFor="password">{t("auth.newPassword")}</Label><Input id="password" type="password" value={data.password} onChange={(event) => setData("password", event.target.value)} autoComplete="new-password" required />{errors.password && <p className="text-sm text-destructive">{errors.password}</p>}</div>
                    <div className="space-y-2"><Label htmlFor="password_confirmation">{t("auth.confirmNewPassword")}</Label><Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(event) => setData("password_confirmation", event.target.value)} autoComplete="new-password" required /></div>
                    <Button className="h-11 w-full" disabled={processing}>{processing ? <Loader2 className="animate-spin" /> : <KeyRound />}{t("auth.resetPasswordBtn")}</Button>
                </form>
            </CardContent></Card>
        </AuthPageShell>
    );
}
