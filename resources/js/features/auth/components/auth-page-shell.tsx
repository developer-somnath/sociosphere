import type { PropsWithChildren } from "react";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import AuthBranding from "@/features/auth/components/auth-branding";
import AuthLayout from "@/features/auth/components/auth-layout";

export default function AuthPageShell({ children }: PropsWithChildren) {
    return (
        <AuthLayout branding={<AuthBranding />}>
            <div className="relative">
                <div className="absolute -top-8 right-0 sm:-top-6 flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                </div>
                {children}
            </div>
        </AuthLayout>
    );
}

