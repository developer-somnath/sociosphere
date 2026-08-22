import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    FileText,
    Globe,
    Lock,
    Printer,
    Shield,
    Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type TocItem = {
    id: string;
    title: string;
};

type Props = {
    title: string;
    subtitle: string;
    effectiveDate: string;
    tocItems: TocItem[];
    children: ReactNode;
    activePage: "terms" | "privacy";
};

export default function LegalLayout({
    title,
    subtitle,
    effectiveDate,
    tocItems,
    children,
    activePage,
}: Props) {
    const { t } = useI18n();

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-brand selection:text-white transition-colors duration-300">
            {/* Ambient Background Glow Orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
                <div className="absolute -left-20 -top-20 size-[500px] rounded-full bg-brand/10 blur-[140px] dark:bg-brand/10" />
                <div className="absolute right-0 top-1/4 size-[450px] rounded-full bg-info/10 blur-[150px] dark:bg-info/10" />
                <div className="absolute bottom-0 left-1/3 size-[500px] rounded-full bg-info/10 blur-[160px] dark:bg-info/10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:32px_32px] opacity-30 dark:opacity-15" />
            </div>

            <Head title={title} />

            {/* Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl transition-all print:hidden">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Brand Logo & Switcher */}
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="flex items-center gap-3 transition hover:opacity-90">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-info text-white shadow-md shadow-brand/20">
                                <Building2 className="size-5" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-base font-bold tracking-tight text-foreground">
                                    SocioSphere
                                </span>
                                <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand dark:text-brand">
                                    Legal Portal
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Page Switcher Tabs */}
                    <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-muted/50 p-1">
                        <Link
                            href="/terms"
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                activePage === "terms"
                                    ? "bg-background text-brand dark:text-brand shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("auth.termsOfService")}
                        </Link>
                        <Link
                            href="/privacy"
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                activePage === "privacy"
                                    ? "bg-background text-brand dark:text-brand shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("auth.privacyPolicy")}
                        </Link>
                    </div>

                    {/* Controls & Back to Login */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="hidden sm:inline-flex gap-1.5 rounded-xl text-xs"
                        >
                            <Printer className="size-3.5" />
                            <span>Print</span>
                        </Button>

                        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background p-1">
                            <LanguageSwitcher />
                            <ThemeSwitcher />
                        </div>

                        <Button asChild size="sm" className="rounded-xl gap-1.5 px-3.5 text-xs font-semibold bg-brand text-white hover:bg-brand">
                            <Link href="/login">
                                <ArrowLeft className="size-3.5" />
                                <span className="hidden sm:inline">{t("auth.backToSignIn", undefined) || "Back to Sign In"}</span>
                                <span className="sm:hidden">{t("auth.login")}</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Document Hero */}
            <section className="relative z-10 border-b border-border/60 bg-muted/20 py-10 sm:py-14 print:py-4 print:border-none">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:text-brand">
                                <Shield className="size-3.5 text-brand" />
                                <span>Official Legal Document</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
                                {title}
                            </h1>
                            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {subtitle}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-md shadow-xs md:min-w-[220px]">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Effective Date:</span>
                                <span className="font-semibold text-foreground">{effectiveDate}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Version:</span>
                                <span className="font-mono text-xs font-semibold text-brand dark:text-brand">v2.1.0 Enterprise</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Status:</span>
                                <span className="flex items-center gap-1 font-semibold text-brand dark:text-brand">
                                    <CheckCircle2 className="size-3" /> Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Body Grid with Sticky Table of Contents */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Sticky Table of Contents Sidebar */}
                    <aside className="hidden lg:col-span-3 lg:block print:hidden">
                        <div className="sticky top-24 space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl shadow-xs">
                            <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <FileText className="size-4 text-brand" />
                                <span>Table of Contents</span>
                            </div>

                            <nav className="space-y-1 text-xs">
                                {tocItems.map((item, index) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="block rounded-lg px-2.5 py-1.5 text-muted-foreground transition hover:bg-brand/10 hover:text-brand dark:hover:text-brand font-medium"
                                    >
                                        <span className="mr-2 font-mono text-[10px] text-muted-foreground">{index + 1}.</span>
                                        {item.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Legal Content Article */}
                    <article className="lg:col-span-9 space-y-10">
                        {children}
                    </article>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border/80 bg-muted/30 py-8 print:hidden">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-brand" />
                        <span className="font-semibold text-foreground">SocioSphere Community Platform</span>
                        <span>© 2026 SocioSphere Technologies Inc. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-4 font-medium">
                        <Link href="/terms" className="hover:text-foreground">{t("auth.termsOfService")}</Link>
                        <span>•</span>
                        <Link href="/privacy" className="hover:text-foreground">{t("auth.privacyPolicy")}</Link>
                        <span>•</span>
                        <Link href="/login" className="hover:text-foreground">{t("auth.login")}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
