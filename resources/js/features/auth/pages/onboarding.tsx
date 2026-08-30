import { Head, Link, useForm } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    Crown,
    Lock,
    Mail,
    MapPin,
    Phone,
    Shield,
    Sparkles,
    User,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PlanFeature = {
    feature_key: string;
    limit_value: number | null;
};

type PricingPlan = {
    uuid: string;
    name: string;
    code: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    is_default: boolean;
    features: PlanFeature[];
};

type OnboardingProps = {
    plans: PricingPlan[];
    selectedPlanUuid: string;
    selectedCycle: "monthly" | "yearly";
};

export default function OnboardingPage({ plans, selectedPlanUuid, selectedCycle }: OnboardingProps) {
    const { t, formatCurrency } = useI18n();
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const form = useForm({
        society_name: "",
        society_code: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",

        admin_name: "",
        admin_email: "",
        admin_phone: "",
        password: "",
        password_confirmation: "",

        plan_uuid: selectedPlanUuid || plans[0]?.uuid || "",
        billing_cycle: selectedCycle || "monthly",
    });

    const activePlan = plans.find((p) => p.uuid === form.data.plan_uuid) ?? plans[0];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("onboarding.store"));
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-brand selection:text-white transition-colors duration-300">
            {/* Ambient background lighting */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 size-[500px] rounded-full bg-brand/15 blur-[120px] dark:bg-brand/10" />
                <div className="absolute right-0 top-1/4 size-[450px] rounded-full bg-info/10 blur-[140px] dark:bg-info/10" />
                <div className="absolute bottom-0 left-1/3 size-[600px] rounded-full bg-info/10 blur-[160px] dark:bg-info/10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:32px_32px] opacity-40 dark:opacity-20" />
            </div>

            {/* Navigation Bar */}
            <header className="relative z-20 border-b border-border/40 bg-card/60 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                            <Building2 className="size-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">SocioSphere</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card/60 p-1 shadow-xs backdrop-blur-md">
                            <LanguageSwitcher />
                            <ThemeSwitcher />
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("pricing")}>{t("onboarding.viewPricing")}</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Form Container */}
            <main className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
                <Head title={t("onboarding.title")} />

                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        <span>{t("onboarding.trialBadge")}</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        {t("onboarding.title")}
                    </h1>
                    <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                        {t("onboarding.subtitle")}
                    </p>
                </div>

                {/* Step Indicators */}
                <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition-all",
                            step === 1
                                ? "border-primary/50 bg-primary/10 text-primary shadow-xs"
                                : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Building2 className="size-4" />
                        <span>{t("onboarding.step1")}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition-all",
                            step === 2
                                ? "border-primary/50 bg-primary/10 text-primary shadow-xs"
                                : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <User className="size-4" />
                        <span>{t("onboarding.step2")}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep(3)}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition-all",
                            step === 3
                                ? "border-primary/50 bg-primary/10 text-primary shadow-xs"
                                : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Crown className="size-4" />
                        <span>{t("onboarding.step3")}</span>
                    </button>
                </div>

                {/* Form Card */}
                <Card className="mt-6 border-border/70 bg-card/80 shadow-xl backdrop-blur-md">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Society Information */}
                        {step === 1 && (
                            <CardContent className="space-y-4 pt-6">
                                <div className="border-b border-border/50 pb-3">
                                    <h3 className="font-bold text-base">{t("onboarding.societySection")}</h3>
                                    <p className="text-xs text-muted-foreground">Enter basic property and location details.</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="society_name">{t("onboarding.societyName")} *</Label>
                                        <Input
                                            id="society_name"
                                            value={form.data.society_name}
                                            onChange={(e) => form.setData("society_name", e.target.value)}
                                            placeholder="e.g. Grand Horizon Heights"
                                            required
                                        />
                                        {form.errors.society_name && (
                                            <p className="text-xs text-destructive">{form.errors.society_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="address">{t("onboarding.address")} *</Label>
                                        <Input
                                            id="address"
                                            value={form.data.address}
                                            onChange={(e) => form.setData("address", e.target.value)}
                                            placeholder="Plot 42, Sector 15, Golf Course Road"
                                            required
                                        />
                                        {form.errors.address && (
                                            <p className="text-xs text-destructive">{form.errors.address}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="city">{t("onboarding.city")} *</Label>
                                        <Input
                                            id="city"
                                            value={form.data.city}
                                            onChange={(e) => form.setData("city", e.target.value)}
                                            placeholder="e.g. Mumbai"
                                            required
                                        />
                                        {form.errors.city && (
                                            <p className="text-xs text-destructive">{form.errors.city}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="state">{t("onboarding.state")}</Label>
                                        <Input
                                            id="state"
                                            value={form.data.state}
                                            onChange={(e) => form.setData("state", e.target.value)}
                                            placeholder="e.g. Maharashtra"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="postal_code">{t("onboarding.postalCode")}</Label>
                                        <Input
                                            id="postal_code"
                                            value={form.data.postal_code}
                                            onChange={(e) => form.setData("postal_code", e.target.value)}
                                            placeholder="e.g. 400001"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="country">{t("onboarding.country")} *</Label>
                                        <Input
                                            id="country"
                                            value={form.data.country}
                                            onChange={(e) => form.setData("country", e.target.value)}
                                            placeholder="India"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="gap-2 rounded-xl"
                                    >
                                        Next: Admin Account
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        )}

                        {/* Step 2: Administrator Account */}
                        {step === 2 && (
                            <CardContent className="space-y-4 pt-6">
                                <div className="border-b border-border/50 pb-3">
                                    <h3 className="font-bold text-base">{t("onboarding.adminSection")}</h3>
                                    <p className="text-xs text-muted-foreground">You will use these credentials to log in as Society Admin.</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="admin_name">{t("onboarding.adminName")} *</Label>
                                        <Input
                                            id="admin_name"
                                            value={form.data.admin_name}
                                            onChange={(e) => form.setData("admin_name", e.target.value)}
                                            placeholder="e.g. Vikram Sharma"
                                            required
                                        />
                                        {form.errors.admin_name && (
                                            <p className="text-xs text-destructive">{form.errors.admin_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin_email">{t("onboarding.adminEmail")} *</Label>
                                        <Input
                                            id="admin_email"
                                            type="email"
                                            value={form.data.admin_email}
                                            onChange={(e) => form.setData("admin_email", e.target.value)}
                                            placeholder="admin@horizonheights.com"
                                            required
                                        />
                                        {form.errors.admin_email && (
                                            <p className="text-xs text-destructive">{form.errors.admin_email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin_phone">{t("onboarding.adminPhone")}</Label>
                                        <Input
                                            id="admin_phone"
                                            value={form.data.admin_phone}
                                            onChange={(e) => form.setData("admin_phone", e.target.value)}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="password">{t("onboarding.password")} *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={form.data.password}
                                            onChange={(e) => form.setData("password", e.target.value)}
                                            placeholder="At least 8 characters"
                                            required
                                        />
                                        {form.errors.password && (
                                            <p className="text-xs text-destructive">{form.errors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="password_confirmation">{t("onboarding.passwordConfirmation")} *</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={form.data.password_confirmation}
                                            onChange={(e) => form.setData("password_confirmation", e.target.value)}
                                            placeholder="Re-enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="gap-2 rounded-xl"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="gap-2 rounded-xl"
                                    >
                                        Next: Plan & Confirm
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        )}

                        {/* Step 3: Plan & Confirmation */}
                        {step === 3 && (
                            <CardContent className="space-y-5 pt-6">
                                <div className="border-b border-border/50 pb-3">
                                    <h3 className="font-bold text-base">{t("onboarding.planSection")}</h3>
                                    <p className="text-xs text-muted-foreground">{t("onboarding.trialDescription")}</p>
                                </div>

                                {/* Plan Selector */}
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {plans.map((p) => (
                                        <button
                                            key={p.uuid}
                                            type="button"
                                            onClick={() => form.setData("plan_uuid", p.uuid)}
                                            className={cn(
                                                "flex flex-col items-start rounded-2xl border p-4 text-left transition-all",
                                                form.data.plan_uuid === p.uuid
                                                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                                                    : "border-border/60 bg-card/60 hover:border-border"
                                            )}
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <span className="font-bold text-sm">{p.name}</span>
                                                {p.is_default && <Badge variant="brand" className="text-[10px]">Default</Badge>}
                                            </div>
                                            <span className="mt-2 text-lg font-extrabold tabular-nums">
                                                {formatCurrency(form.data.billing_cycle === "yearly" ? p.price_yearly : p.price_monthly, p.currency)}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {form.data.billing_cycle === "yearly" ? t("pricing.perYear") : t("pricing.perMonth")}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Billing Cycle Toggle */}
                                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 p-4">
                                    <div>
                                        <p className="font-semibold text-sm">{t("onboarding.billingCycle")}</p>
                                        <p className="text-xs text-muted-foreground">Choose monthly or annual billing after trial ends.</p>
                                    </div>
                                    <div className="flex rounded-full border border-border/70 bg-card p-1">
                                        <button
                                            type="button"
                                            onClick={() => form.setData("billing_cycle", "monthly")}
                                            className={cn(
                                                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                                                form.data.billing_cycle === "monthly"
                                                    ? "bg-primary text-primary-foreground shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {t("pricing.monthly")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => form.setData("billing_cycle", "yearly")}
                                            className={cn(
                                                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                                                form.data.billing_cycle === "yearly"
                                                    ? "bg-primary text-primary-foreground shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {t("pricing.yearly")} (-20%)
                                        </button>
                                    </div>
                                </div>

                                {/* Trial Banner Box */}
                                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm text-primary">{t("onboarding.trialBadge")}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">{t("onboarding.trialDescription")}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(2)}
                                        className="gap-2 rounded-xl"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="gap-2 rounded-xl shadow-lg"
                                    >
                                        {form.processing ? t("onboarding.submitting") : t("onboarding.submit")}
                                        <CheckCircle2 className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        )}
                    </form>
                </Card>

                {/* Footer link to sign in */}
                <div className="mt-6 text-center text-xs text-muted-foreground">
                    {t("onboarding.alreadyHaveAccount")}{" "}
                    <Link href={route("login")} className="font-semibold text-primary underline-offset-4 hover:underline">
                        {t("onboarding.login")}
                    </Link>
                </div>
            </main>
        </div>
    );
}
