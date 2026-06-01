import { useState } from "react";
import {
    Eye,
    EyeOff,
    Lock,
} from "lucide-react";

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    placeholder?: string;
}

export default function PasswordInput({
    value,
    onChange,
    error,
    label = "PASSWORD",
    placeholder = "Enter password",
}: PasswordInputProps) {
    const [showPassword, setShowPassword] =
        useState(false);

    return (
        <div>
            <label className="block text-sm font-semibold mb-2">
                {label}
            </label>

            <div className="relative">
                <Lock
                    className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        w-5
                        h-5
                        text-slate-400
                    "
                />

                <input
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) =>
                        onChange(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        h-14
                        pl-12
                        pr-12
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        focus:border-emerald-500
                        focus:ring-2
                        focus:ring-emerald-100
                        outline-none
                        transition-all
                    "
                />

                <button
                    type="button"
                    onClick={() =>
                        setShowPassword(
                            !showPassword
                        )
                    }
                    className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        hover:text-slate-600
                    "
                >
                    {!showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </button>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
