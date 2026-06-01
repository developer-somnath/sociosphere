interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps {
    label: string;

    value?: string | number;

    error?: string;

    options: SelectOption[];

    onChange: (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => void;
}

export default function Select({
    label,
    value,
    options,
    error,
    onChange,
}: SelectProps) {
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

            <select
                value={value}
                onChange={onChange}
                className="
                    w-full
                    h-11

                    rounded-lg

                    border
                    border-slate-200

                    px-4

                    text-sm

                    outline-none

                    focus:border-slate-900
                "
            >

                <option value="">
                    Select
                </option>

                {options.map((option) => (

                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>

                ))}

            </select>

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
