import { Head, Link } from "@inertiajs/react";
import {
    ArrowRight,
    Building2,
    Check,
    Crown,
    HelpCircle,
    Layers,
    Shield,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

type PricingProps = {
    plans: PricingPlan[];
};

export default function PricingPage({ plans }: PricingProps) {
    const { t, formatCurrency } = useI18n();
    const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");

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
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
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
                        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                            <Link href={route("login")}>{t("auth.login")}</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <Head title={t("pricing.title")} />

                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        <span>{t("onboarding.trialBadge")}</span>
                    </div>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        {t("pricing.title")}
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        {t("pricing.subtitle")}
                    </p>

                    {/* Billing Cycle Switch */}
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <div className="inline-flex rounded-full border border-border/70 bg-card/80 p-1 shadow-xs backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setCycle("monthly")}
                                className={cn(
                                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                                    cycle === "monthly"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {t("pricing.monthly")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setCycle("yearly")}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                                    cycle === "yearly"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {t("pricing.yearly")}
                                <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-bold text-brand dark:text-brand">
                                    {t("pricing.saveYearly")}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plan Cards Grid */}
                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                    {plans.map((plan, idx) => {
                        const price = cycle === "yearly" ? plan.price_yearly : plan.price_monthly;
                        const isPopular = plan.is_default || idx === 1;

                        return (
                            <Card
                                key={plan.uuid}
                                className={cn(
                                    "relative flex flex-col justify-between overflow-hidden border-border/70 bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-xl",
                                    isPopular ? "border-primary/50 ring-2 ring-primary/40 shadow-lg" : ""
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute right-4 top-4">
                                        <Badge variant="brand" className="text-[10px] font-bold tracking-wider uppercase">
                                            {t("pricing.popular")}
                                        </Badge>
                                    </div>
                                )}

                                <div>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Crown className="size-4" />
                                            </div>
                                            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                        </div>
                                        <CardDescription className="mt-2 text-xs min-h-[36px]">
                                            {plan.description ?? t("pricing.allFeatures")}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-4xl font-extrabold tracking-tight tabular-nums">
                                                {formatCurrency(price, plan.currency)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {cycle === "yearly" ? t("pricing.perYear") : t("pricing.perMonth")}
                                            </span>
                                        </div>

                                        <div className="space-y-3 border-t border-border/50 pt-4 text-xs">
                                            {plan.features.map((feature) => (
                                                <div key={feature.feature_key} className="flex items-center gap-2.5">
                                                    <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                                                        <Check className="size-2.5" />
                                                    </div>
                                                    <span className="font-medium text-foreground">
                                                        {t(`feature.${feature.feature_key}`)}:{" "}
                                                        <span className="text-muted-foreground">
                                                            {feature.limit_value === null ? t("subscription.unlimited") : feature.limit_value}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}

                                            <div className="flex items-center gap-2.5">
                                                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                                                    <Check className="size-2.5" />
                                                </div>
                                                <span className="text-muted-foreground">GST / VAT Global Tax Engine</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                                                    <Check className="size-2.5" />
                                                </div>
                                                <span className="text-muted-foreground">42-Locale i18n & RTL Engine</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                                                    <Check className="size-2.5" />
                                                </div>
                                                <span className="text-muted-foreground">PWA & Real-Time Push Engine</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>

                                <CardFooter className="pt-4 border-t border-border/40">
                                    <Button
                                        asChild
                                        className="w-full rounded-xl shadow-md font-semibold"
                                        variant={isPopular ? "default" : "outline"}
                                    >
                                        <Link href={`${route("onboarding.show")}?plan=${plan.uuid}&cycle=${cycle}`}>
                                            {t("pricing.startTrial")}
                                            <ArrowRight className="ml-1.5 size-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="mx-auto mt-20 max-w-3xl border-t border-border/50 pt-16">
                    <div className="flex items-center justify-center gap-2">
                        <HelpCircle className="size-5 text-primary" />
                        <h2 className="text-2xl font-bold">{t("pricing.faqTitle")}</h2>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xs">
                            <h3 className="font-semibold text-sm">{t("pricing.faq1Q")}</h3>
                            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t("pricing.faq1A")}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xs">
                            <h3 className="font-semibold text-sm">{t("pricing.faq2Q")}</h3>
                            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t("pricing.faq2A")}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xs">
                            <h3 className="font-semibold text-sm">{t("pricing.faq3Q")}</h3>
                            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t("pricing.faq3A")}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
