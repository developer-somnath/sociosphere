import { TextareaHTMLAttributes } from "react";

interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {

    label: string;

    error?: string;
}

export default function Textarea({
    label,
    error,
    ...props
}: TextareaProps) {
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

            <textarea
                {...props}
                className="
                    w-full

                    rounded-lg

                    border
                    border-slate-200

                    px-4
                    py-3

                    text-sm

                    outline-none

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
