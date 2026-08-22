import { Head } from "@inertiajs/react";
import AuthBranding from "../components/auth-branding";
import AuthLayout from "../components/auth-layout";
import LoginForm from "../components/login-form";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
    const { t } = useI18n();

    return (
        <AuthLayout branding={<AuthBranding />}>
            <Head title={t("auth.login")} />

            <div className="relative">
                {/* Header controls bar */}
                <div className="mb-4 flex items-center justify-end gap-2">
                    <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card/60 p-1 shadow-xs backdrop-blur-md">
                        <LanguageSwitcher />
                        <ThemeSwitcher />
                    </div>
                </div>

                {/* Main Glassmorphic Login Form */}
                <LoginForm />
            </div>
        </AuthLayout>
    );
}
