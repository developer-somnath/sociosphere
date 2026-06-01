interface Props {
    children: React.ReactNode;
}

export default function Heading({
    children,
}: Props) {
    return (
        <h1
            className="
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
            "
        >
            {children}
        </h1>
    );
}
