import { InputHTMLAttributes } from "react";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function Input({
    label,
    error,
    icon,
    className = "",
    ...props
}: InputProps) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}

                <input
                    {...props}
                    className={`
                        w-full
                        h-14
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        transition-all
                        focus:border-emerald-500
                        focus:ring-2
                        focus:ring-emerald-100
                        outline-none
                        ${icon ? "pl-12" : "pl-4"}
                        pr-4
                        ${className}
                    `}
                />
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
