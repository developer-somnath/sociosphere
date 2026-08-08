import { Head, Link, router, usePage } from "@inertiajs/react";
import { CheckCircle2, MailCheck, Send } from "lucide-react";
import { route } from "ziggy-js";

import AuthPageShell from "@/features/auth/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function VerifyEmail() {
    const { status } = usePage<{ status?: string }>().props;
    const { t } = useI18n();
    return <AuthPageShell><Head title={t("auth.verifyEmailTitle")} /><Card><CardContent className="space-y-6 p-7 sm:p-8 lg:p-10"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MailCheck /></div><div><h1 className="text-2xl font-semibold tracking-tight">{t("auth.verifyEmailTitle")}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("auth.verifyEmailSubtitle")}</p></div>{status && <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="mr-2 inline size-4" />{status}</p>}<Button className="h-11 w-full" onClick={() => router.post(route("verification.send"))}><Send />{t("auth.resendVerification")}</Button><Link className="inline-block text-sm font-medium text-primary hover:underline" href={route("login")}>{t("auth.backToSignIn")}</Link></CardContent></Card></AuthPageShell>;
}
