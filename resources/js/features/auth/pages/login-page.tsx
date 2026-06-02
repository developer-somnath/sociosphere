import AuthBranding from "../components/auth-branding";
import AuthLayout from "../components/auth-layout";
import LoginForm from "../components/login-form";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";

export default function LoginPage() {
    return (
        <AuthLayout branding={<AuthBranding />}>
            <div className="relative">
                <div className="absolute -top-24 right-0">
                    {/* <ThemeSwitcher /> */}
                </div>

                <LoginForm />
            </div>
        </AuthLayout>
    );
}
