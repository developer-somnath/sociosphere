interface Props {
    checked: boolean;
    onChange: (
        checked: boolean
    ) => void;

    label: string;
}

export default function Checkbox({
    checked,
    onChange,
    label,
}: Props) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                    onChange(
                        e.target.checked
                    )
                }
                className="
                    h-4
                    w-4
                    rounded
                    border-slate-300
                    text-emerald-600
                    focus:ring-emerald-500
                "
            />

            <span className="text-sm text-slate-600">
                {label}
            </span>
        </label>
    );
}
