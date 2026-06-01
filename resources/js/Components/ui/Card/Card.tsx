import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export default function Card({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-sm
                overflow-hidden
                transition-all
                duration-200
                ${className}
            `}
        >
            {children}
        </div>
    );
}
