import { Link } from "@inertiajs/react";

interface SidebarItemProps {
    label: string;
    icon: React.ReactNode;
    href: string;
    active?: boolean;
}

export default function SidebarItem({
    label,
    icon,
    href,
    active = false,
}: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={`
                mx-4
                mb-2

                flex
                items-center
                gap-3

                rounded-xl

                px-4
                py-3

                font-medium

                transition-all
                duration-200

    ${
        active
            ? `
                bg-emerald-500
                text-white
              `
            : `
                text-slate-400
                hover:bg-slate-900
                hover:text-white
              `
    }
`}
        >
            {icon}

            <span className="font-medium">{label}</span>
        </Link>
    );
}
