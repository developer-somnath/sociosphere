import {
    LayoutDashboard,
    Users,
    Receipt,
    Wrench,
    Settings,
    Building2,
} from "lucide-react";

import SidebarItem from "../Navigation/SidebarItem";
import { route } from "ziggy-js";
import { useSociety } from "@/Hooks/useSociety";
import { useAuth } from "@/Hooks/useAuth";
export default function Sidebar() {
    const society = useAuth().society;
    console.log(society);
    return (
        <aside className="w-[280px] bg-slate-950 text-white flex flex-col">
            <div
                className="
                    px-6
                    py-8
                    border-b
                    border-slate-800
                "
            >
                <h1
                    className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-white
                    "
                >
                    SocioSphere
                </h1>

                <div className="mt-5 relative overflow-hidden rounded-xl p-[1px]">
                    {/* Animated Border */}
                    <div
                        className="
                            absolute
                            inset-0
                            animate-spin
                            bg-[conic-gradient(from_0deg,transparent,rgba(16,185,129,0.8),transparent)]
                            duration-[6000ms]
                        "
                    />

                    {/* Content */}
                    <div
                        className="
                            relative
                            rounded-xl
                            bg-slate-950
                            px-4
                            py-3
                        "
                    >
                        <p className="text-sm font-semibold text-white">
                            {society?.name}
                        </p>

                        <p className="mt-1 text-xs text-emerald-300">
                            Reg. No. {society?.registration_no}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <SidebarItem
                    label="Overview"
                    href={route("overview")}
                    active={route().current("overview")}
                    icon={<LayoutDashboard size={18} />}
                />

                <SidebarItem
                    label="Residents Directory"
                    href={route("residents.index")}
                    active={route().current("residents.*")}
                    icon={<Users size={18} />}
                />

                <SidebarItem
                    label="Property Units"
                    href={route("property-units.index")}
                    active={route().current("property-units.*")}
                    icon={<Building2 size={18} />}
                />

                <SidebarItem
                    label="Financial Ledger"
                    href="#"
                    icon={<Receipt size={18} />}
                />

                <SidebarItem
                    label="Maintenance"
                    href="#"
                    icon={<Wrench size={18} />}
                />

                <SidebarItem
                    label="Settings"
                    href="#"
                    icon={<Settings size={18} />}
                />
            </div>
        </aside>
    );
}
