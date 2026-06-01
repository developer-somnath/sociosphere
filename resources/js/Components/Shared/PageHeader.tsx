interface Props {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export default function PageHeader({
    title,
    subtitle,
    actions,
}: Props) {
    return (
        <div
            className="
                flex
                items-center
                justify-between
                mb-6
            "
        >
            <div>

                <h1
                    className="
                        text-3xl
                        font-bold
                        text-slate-900
                    "
                >
                    {title}
                </h1>

                {subtitle && (
                    <p
                        className="
                            mt-1
                            text-slate-500
                        "
                    >
                        {subtitle}
                    </p>
                )}

            </div>

            {actions}
        </div>
    );
}
