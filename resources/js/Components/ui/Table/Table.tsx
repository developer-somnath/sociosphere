interface Props {
    children: React.ReactNode;
}

export default function Table({
    children,
}: Props) {
    return (

            <table className="w-full">
                {children}
            </table>
    );
}
