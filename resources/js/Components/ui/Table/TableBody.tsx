interface Props {
    children: React.ReactNode;
}

export default function TableBody({
    children,
}: Props) {
    return (
        <tbody>
            {children}
        </tbody>
    );
}
