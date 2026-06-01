interface Props {
    children: React.ReactNode;
}

export default function TableRow({
    children,
}: Props) {
    return (
        <tr
            className="
                 border-b
                hover:bg-slate-50
                transition-colors
            "
        >
            {children}
        </tr>
    );
}
