import { TdHTMLAttributes } from "react";

interface Props
    extends TdHTMLAttributes<HTMLTableCellElement> {

    children: React.ReactNode;

    header?: boolean;
}

export default function TableCell({
    children,
    header = false,
    className="",
    ...props
}: Props) {

    if (header) {
        return (
            <th
                className="
                    text-left
                    px-6
                    py-4
                    text-xs
                    uppercase
                    tracking-wide
                    text-slate-500
                    font-semibold
                "
            >
                {children}
            </th>
        );
    }

    return (
        <td
            {...props}
            className={`
                px-6
                py-5
                text-sm
                text-slate-700

                ${className}
            `}
        >
            {children}
        </td>
    );
}
