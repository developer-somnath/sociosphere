interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
}

export default function Select({
    options,
    value,
    onChange,
    className,

}: Props) {
    return (
        <select
            className={`
                h-11
                rounded-lg
                border
                border-slate-300
                px-4
                bg-white
                ${className}`

            }



            value={value}
            onChange={onChange}
        >
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
}
