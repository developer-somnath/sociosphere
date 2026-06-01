import { useForm } from "@inertiajs/react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
} from "lucide-react";
import { useState } from "react";

import AuthFooter from "./AuthFooter";

import { Checkbox, Input, PasswordInput } from "@/Components/ui";

export default function LoginForm() {
    const [showPassword, setShowPassword] =
        useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        post(route("login"));
    };

    return (
        <div className="w-full max-w-md">
            {/* Header */}
            <div>
                <h1 className="text-5xl font-bold text-slate-900">
                    Welcome Back
                </h1>

                <p className="mt-3 text-slate-500">
                    Login to your enterprise account to continue.
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={submit}
                className="mt-10 space-y-6"
            >
                {/* Email */}
                <Input
                    label="EMAIL"
                    type="email"
                    value={data.email}
                    error={errors.email}
                    icon={
                        <Mail className="w-5 h-5" />
                    }
                    placeholder="name@company.com"
                    onChange={(e) =>
                        setData(
                            "email",
                            e.target.value
                        )
                    }
                />

                {/* Password */}
                 <PasswordInput
                            value={data.password}
                            error={errors.password}
                            onChange={(value) =>
                                setData(
                                    "password",
                                    value
                                )
                            }
                        />

                {/* Remember Me */}
                <Checkbox
                    checked={data.remember}
                    onChange={(checked) =>
                        setData(
                            "remember",
                            checked
                        )
                    }
                    label="Keep me logged in"
                />

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="
                        w-full
                        h-14
                        rounded-xl
                        bg-emerald-600
                        hover:bg-emerald-700
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        text-white
                        font-semibold
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition-colors
                    "
                >
                    {processing
                        ? "Signing In..."
                        : "Login to Portal"}

                    {!processing && (
                        <ArrowRight className="w-5 h-5" />
                    )}
                </button>

                {/* Divider */}
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>

                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs uppercase tracking-wide text-slate-500">
                            Other Methods
                        </span>
                    </div>
                </div>

                {/* OTP Login */}
                <button
                    type="button"
                    className="
                        w-full
                        h-14
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        hover:bg-slate-50
                        font-medium
                        transition-colors
                    "
                >
                    OTP Login
                </button>

                {/* Contact Admin */}
                <div className="text-center text-sm text-slate-500">
                    Don't have an account?

                    <span className="ml-2 font-medium text-emerald-600 cursor-pointer">
                        Contact Admin
                    </span>
                </div>

                {/* Footer */}
                <AuthFooter />
            </form>
        </div>
    );
}
