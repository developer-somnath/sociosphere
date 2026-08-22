import { Link, useForm, usePage } from "@inertiajs/react";
import {
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
    Verified,
    Sparkles,
    UserCheck,
    ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

type DemoAccount = {
    roleKey: string;
    label: string;
    email: string;
    badge: string;
    color: string;
};

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
    const pageProps = usePage<{ status?: string; environment?: string }>().props;
    const status = pageProps.status;
    const environment = pageProps.environment ?? (import.meta.env.DEV ? "local" : "production");
    
    // Show demo account chips in non-production environments (local, dev, staging) OR when ?demo=1 query parameter is passed
    const isDemoQuery = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1";
    const showDemoAccounts = environment !== "production" || import.meta.env.DEV || isDemoQuery;

    const { t } = useI18n();

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const demoAccounts: DemoAccount[] = [
        {
            roleKey: "superAdmin",
            label: t("roles.superAdmin", undefined) || "Super Admin",
            email: "admin@sociosphere.com",
            badge: "Global",
            color: "border-info/30 bg-info/10 text-info dark:text-info hover:bg-info/20",
        },
        {
            roleKey: "societyAdmin",
            label: t("roles.societyAdmin", undefined) || "Society Admin",
            email: "societyadmin@gvr.com",
            badge: "Admin",
            color: "border-brand/30 bg-brand/10 text-brand dark:text-brand hover:bg-brand/20",
        },
        {
            roleKey: "treasurer",
            label: t("roles.treasurer", undefined) || "Treasurer",
            email: "treasurer@gvr.com",
            badge: "Finance",
            color: "border-warning/30 bg-warning/10 text-warning dark:text-warning hover:bg-warning/20",
        },
        {
            roleKey: "securityGuard",
            label: t("roles.securityGuard", undefined) || "Security Guard",
            email: "security@gvr.com",
            badge: "Gate",
            color: "border-info/30 bg-info/10 text-info dark:text-info hover:bg-info/20",
        },
    ];

    const fillDemoCredentials = (account: DemoAccount) => {
        setData((prev) => ({
            ...prev,
            email: account.email,
            password: "password",
        }));
        setActiveDemoRole(account.roleKey);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card/85 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all">
            <CardContent className="p-6 sm:p-9 lg:p-10">
                {/* Header Title */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand/20 to-info/20 text-brand dark:text-brand border border-brand/30 shadow-inner">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                {t("auth.welcomeBack")}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {t("auth.loginPortalSubtitle")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1-Click Quick Demo Account Switcher (only shown in non-production, dev mode, or when ?demo=1 is passed) */}
                {showDemoAccounts && (
                    <div className="mb-6 rounded-2xl border border-brand/25 bg-brand/5 p-3.5 dark:bg-brand/10">
                        <div className="mb-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand dark:text-brand">
                                <Sparkles className="size-3.5 text-brand" />
                                <span>1-Click Demo Quick Fill</span>
                            </div>
                            {activeDemoRole && (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-brand dark:text-brand">
                                    <UserCheck className="size-3" /> Credentials Applied!
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {demoAccounts.map((account) => {
                                const isSelected = activeDemoRole === account.roleKey;
                                return (
                                    <button
                                        key={account.roleKey}
                                        type="button"
                                        onClick={() => fillDemoCredentials(account)}
                                        className={`group flex items-center justify-between gap-1 rounded-xl border px-2 py-1.5 sm:px-2.5 sm:py-2 text-left transition-all duration-200 cursor-pointer ${
                                            isSelected
                                                ? "border-brand bg-brand/20 text-brand dark:text-brand font-semibold ring-2 ring-brand/40"
                                                : account.color
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 truncate text-[11px] sm:text-xs font-medium">
                                            {account.label}
                                        </div>
                                        <span className="shrink-0 rounded bg-background/80 px-1 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                            {account.badge}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <form onSubmit={submit} className="space-y-5">
                    {status && (
                        <div className="rounded-xl border border-brand/30 bg-brand/10 p-3 text-xs font-medium text-brand dark:text-brand">
                            {status}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium text-foreground">
                            {t("auth.email")}
                        </Label>

                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="email"
                                type="email"
                                placeholder={t("auth.emailPlaceholder")}
                                className="h-11 rounded-xl border-border/80 bg-background/70 pl-10 text-sm shadow-xs outline-none transition focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20"
                                value={data.email}
                                onChange={(e) => {
                                    setData("email", e.target.value);
                                    setActiveDemoRole(null);
                                }}
                                required
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-medium text-foreground">
                                {t("auth.password")}
                            </Label>
                            <Link
                                href={route("password.request")}
                                className="text-xs font-medium text-brand hover:text-brand dark:text-brand dark:hover:text-brand transition-colors"
                            >
                                {t("auth.forgotPassword")}
                            </Link>
                        </div>

                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth.passwordPlaceholder")}
                                className="h-11 rounded-xl border-border/80 bg-background/70 pl-10 pr-10 text-sm shadow-xs outline-none transition focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20"
                                value={data.password}
                                onChange={(e) => {
                                    setData("password", e.target.value);
                                    setActiveDemoRole(null);
                                }}
                                required
                            />

                            <button
                                type="button"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label="Toggle Password Visibility"
                            >
                                {showPassword ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-destructive">{errors.password}</p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between pt-1">
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
                                className="cursor-pointer text-xs font-medium text-muted-foreground select-none"
                            >
                                {t("auth.keepSignedIn")}
                            </Label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-gradient-to-r from-brand via-info to-brand hover:from-brand hover:to-info text-white font-semibold shadow-lg shadow-brand/25 active:scale-[0.99] transition-all cursor-pointer"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                <span>{t("common.loading")}</span>
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>{t("auth.signInSecurely")}</span>
                                <ArrowRight className="size-4" />
                            </div>
                        )}
                    </Button>

                    {/* Encrypted Communication Notice */}
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-center">
                        <p className="flex items-center justify-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                            <Verified className="size-3.5 text-brand shrink-0" />
                            <span>{t("auth.dataProtected")}</span>
                        </p>
                    </div>

                    {/* Legal Links */}
                    <p className="text-center text-[11px] leading-relaxed text-muted-foreground pt-1">
                        {t("auth.termsIntro")}{" "}
                        <a href="/terms" className="font-semibold text-foreground hover:underline">
                            {t("auth.termsOfService")}
                        </a>{" "}
                        {t("auth.and")}{" "}
                        <a href="/privacy" className="font-semibold text-foreground hover:underline">
                            {t("auth.privacyPolicy")}
                        </a>
                        .
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
