import AuthLayout from "@/Layouts/AuthLayout";
import BrandingPanel from "../Components/BrandingPanel";
import LoginForm from "../Components/LoginForm";

export default function Login() {
    return (
        <AuthLayout>
            <BrandingPanel />

            <div className="flex items-center justify-center p-12">
                <LoginForm />
            </div>
        </AuthLayout>
    );
}
