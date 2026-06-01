interface RadioCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;

    value: string;

    selected: string;

    onChange: (value: string) => void;
}

export default function RadioCard({
    title,
    description,
    icon,
    value,
    selected,
    onChange,
}: RadioCardProps) {

    const active = value === selected;

    return (
        <button
            type="button"
            onClick={() => onChange(value)}
            className={`
                w-full

                rounded-lg

                border

                p-4

                text-left

                transition-all

                ${
                    active
                        ? `
                            border-slate-900
                            bg-slate-50
                          `
                        : `
                            border-slate-200
                            hover:border-slate-400
                          `
                }
            `}
        >

            <div className="flex items-start gap-3">

                {icon}

                <div>

                    <h4
                        className="
                            font-medium
                            text-slate-900
                        "
                    >
                        {title}
                    </h4>

                    {description && (

                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                            "
                        >
                            {description}
                        </p>

                    )}

                </div>

            </div>

        </button>
    );
}
