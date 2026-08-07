import type { PropsWithChildren } from "react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import AuthBranding from "@/features/auth/components/auth-branding";
import AuthLayout from "@/features/auth/components/auth-layout";

export default function AuthPageShell({ children }: PropsWithChildren) {
    return (
        <AuthLayout branding={<AuthBranding />}>
            <div className="relative">
                <div className="absolute -top-8 right-0 sm:-top-6">
                    <ThemeSwitcher />
                </div>
                {children}
            </div>
        </AuthLayout>
    );
}
