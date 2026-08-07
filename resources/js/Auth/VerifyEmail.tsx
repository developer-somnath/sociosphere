import { Head, Link, router, usePage } from "@inertiajs/react";
import { CheckCircle2, MailCheck, Send } from "lucide-react";
import { route } from "ziggy-js";

import AuthPageShell from "@/features/auth/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VerifyEmail() {
    const { status } = usePage<{ status?: string }>().props;
    return <AuthPageShell><Head title="Verify email" /><Card><CardContent className="space-y-6 p-7 sm:p-8 lg:p-10"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MailCheck /></div><div><h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">We sent a verification link to your email address. Open it to confirm your account.</p></div>{status && <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="mr-2 inline size-4" />{status}</p>}<Button className="h-11 w-full" onClick={() => router.post(route("verification.send"))}><Send />Resend verification email</Button><Link className="inline-block text-sm font-medium text-primary hover:underline" href={route("login")}>Back to sign in</Link></CardContent></Card></AuthPageShell>;
}
