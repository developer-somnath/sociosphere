import { Head, useForm } from "@inertiajs/react";
import { Loader2, LockKeyhole } from "lucide-react";
import type { FormEvent } from "react";
import { route } from "ziggy-js";

import AuthPageShell from "@/features/auth/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({ password: "" });
    const { t } = useI18n();
    const submit = (event: FormEvent) => { event.preventDefault(); post(route("password.confirm")); };

    return <AuthPageShell><Head title={t("auth.confirmPassword")} /><Card><CardContent className="p-7 sm:p-8 lg:p-10"><h1 className="text-2xl font-semibold tracking-tight">{t("auth.confirmPassword")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("auth.confirmPasswordSubtitle")}</p><form onSubmit={submit} className="mt-6 space-y-5"><div className="space-y-2"><Label htmlFor="password">{t("auth.password")}</Label><Input id="password" type="password" value={data.password} onChange={(event) => setData("password", event.target.value)} autoComplete="current-password" required />{errors.password && <p className="text-sm text-destructive">{errors.password}</p>}</div><Button className="h-11 w-full" disabled={processing}>{processing ? <Loader2 className="animate-spin" /> : <LockKeyhole />}{t("common.continue")}</Button></form></CardContent></Card></AuthPageShell>;
}
