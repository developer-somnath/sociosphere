interface Props {
    children: React.ReactNode;
}

export default function TableHeader({
    children,
}: Props) {
    return (
        <thead
            className="
               bg-[#F8FAFC]
                border-b
            "
        >
            {children}
        </thead>
    );
}
