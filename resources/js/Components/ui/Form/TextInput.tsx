import { InputHTMLAttributes } from "react";

interface TextInputProps
    extends InputHTMLAttributes<HTMLInputElement> {

    label: string;

    error?: string;
}

export default function TextInput({
    label,
    error,
    ...props
}: TextInputProps) {
    return (
        <div className="space-y-2">

            <label
                className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                "
            >
                {label}
            </label>

            <input
                {...props}
                className="
                    w-full
                    h-11

                    rounded-lg

                    border
                    border-slate-200

                    px-4

                    text-sm

                    outline-none

                    transition

                    focus:border-slate-900
                "
            />

            {error && (

                <p
                    className="
                        text-sm
                        text-red-500
                    "
                >
                    {error}
                </p>

            )}

        </div>
    );
}
