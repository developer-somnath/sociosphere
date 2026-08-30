import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    Home,
    Lock,
    Mail,
    ShieldAlert,
    Sparkles,
} from "lucide-react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

interface Props {
    status?: number;
    message?: string;
}

export default function Error403({ status = 403, message }: Props) {
    const { t } = useI18n();
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    const handleGoBack = () => {
        if (typeof window !== "undefined") {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = route("overview");
            }
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-brand/20 selection:text-foreground">
            <Head title={t("errors.403Title", undefined) || "403 — Access Denied"} />

            {/* Ambient Background Lighting Orbs & Grid Lines */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 size-[500px] rounded-full bg-destructive/15 blur-[120px] dark:bg-destructive/10" />
                <div className="absolute right-0 top-1/3 size-[450px] rounded-full bg-warning/15 blur-[140px] dark:bg-warning/10" />
                <div className="absolute bottom-0 left-1/3 size-[600px] rounded-full bg-brand/10 blur-[160px] dark:bg-brand/10" />

                {/* Radial dot matrix overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:32px_32px] opacity-40 dark:opacity-20" />
            </div>

            {/* Header Brand */}
            <header className="relative z-10 mb-8 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-info p-0.5 shadow-lg shadow-brand/20">
                    <div className="flex size-full items-center justify-center rounded-[10px] bg-slate-950">
                        <Building2 className="size-5 text-brand" />
                    </div>
                </div>
                <div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        SocioSphere
                    </span>
                    <span className="ml-2 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        SECURITY GUARD
                    </span>
                </div>
            </header>

            {/* Main Error Glass Card */}
            <main className="relative z-10 w-full max-w-lg px-4 sm:px-0">
                <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/85 p-8 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all duration-300 dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
                    {/* Glowing Shield Halo */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="absolute -inset-2 rounded-full bg-destructive/20 blur-xl animate-pulse" />
                            <div className="relative flex size-20 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive shadow-lg shadow-destructive/10">
                                <ShieldAlert className="size-10 stroke-[1.75]" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border/80 bg-background shadow-xs">
                                <Lock className="size-3.5 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Status Chip */}
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3.5 py-1 text-xs font-semibold text-destructive">
                            <span className="size-1.5 rounded-full bg-destructive animate-ping" />
                            <span>HTTP 403 · Access Denied</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                            {t("errors.403Heading", undefined) || "Restricted Area"}
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md">
                            {message ||
                                t(
                                    "errors.403Message",
                                    undefined,
                                ) ||
                                "You do not have the required permissions or society tenant context to access this resource. Please contact your Society Administrator or Super Admin if you believe this is an error."}
                        </p>
                    </div>

                    {/* Society / User Context Banner */}
                    {user && (
                        <div className="mt-6 rounded-2xl border border-border/70 bg-muted/40 p-4 text-xs">
                            <div className="flex items-center justify-between gap-2 text-muted-foreground">
                                <span>Current User:</span>
                                <span className="font-semibold text-foreground truncate max-w-[200px]">
                                    {user.name} ({user.email})
                                </span>
                            </div>
                            {auth?.society && (
                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-muted-foreground">
                                    <span>Active Society:</span>
                                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                                        {auth.society.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoBack}
                            className="w-full sm:w-auto rounded-full border-border/80 px-6 font-semibold shadow-2xs hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                            {t("common.goBack", undefined) || "Go Back"}
                        </Button>

                        <Button
                            asChild
                            variant="default"
                            className="w-full sm:w-auto rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            <Link href={route("overview")}>
                                <Home className="size-4" />
                                {t("nav.dashboard", undefined) || "Return to Overview"}
                            </Link>
                        </Button>
                    </div>

                    {/* Helpdesk Tip */}
                    <div className="mt-6 border-t border-border/60 pt-4 text-center">
                        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Sparkles className="size-3.5 text-brand" />
                            <span>Need elevated access? Ask your society manager or secretary.</span>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 mt-8 text-center text-xs text-muted-foreground">
                <p>© 2026 SocioSphere Technologies · Multi-Tenant Enterprise Security</p>
            </footer>
        </div>
    );
}
