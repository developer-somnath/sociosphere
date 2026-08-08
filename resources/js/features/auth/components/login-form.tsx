import { Link, useForm, usePage } from "@inertiajs/react";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Verified } from "lucide-react";
import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { route } from "ziggy-js";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { status } = usePage<{ status?: string }>().props;
    const { t } = useI18n();

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <Card className="border-border/60 bg-background/80 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <CardContent className="p-7 sm:p-8 lg:p-10">
                <div className="mb-8 flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t("auth.welcomeBack")}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {t("auth.loginPortalSubtitle")}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {status && (
                        <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                            {status}
                        </p>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">{t("auth.email")}</Label>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="email"
                                type="email"
                                placeholder={t("auth.emailPlaceholder")}
                                className="h-12 pl-11"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{t("auth.password")}</Label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth.passwordPlaceholder")}
                                className="h-12 pl-11 pr-11"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {!showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData("remember", Boolean(checked))
                                }
                            />

                            <Label
                                htmlFor="remember"
                                className="cursor-pointer text-sm font-normal"
                            >
                                {t("auth.keepSignedIn")}
                            </Label>
                        </div>

                        <Link
                            href={route("password.request")}
                            className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                        >
                            {t("auth.forgotPassword")}
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                        disabled={processing}
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t("auth.signInSecurely")}
                    </Button>

                    <div className="rounded-2xl border border-border/60 bg-muted/50 p-4">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            <Verified className="mr-1 inline h-4 w-4 text-emerald-500" />
                            {t("auth.dataProtected")}
                        </p>
                    </div>

                    <p className="text-center text-xs leading-relaxed text-muted-foreground">
                        {t("auth.termsIntro")}{" "}
                        <a href="/terms" className="font-medium text-foreground">
                            {t("auth.termsOfService")}
                        </a>{" "}
                        {t("auth.and")}{" "}
                        <a href="/privacy" className="font-medium text-foreground">
                            {t("auth.privacyPolicy")}
                        </a>
                        .
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
