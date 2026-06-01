interface Props {
    children: React.ReactNode;
}

export default function Text({
    children,
}: Props) {
    return (
        <p
            className="
                text-sm
                text-slate-500
            "
        >
            {children}
        </p>
    );
}
