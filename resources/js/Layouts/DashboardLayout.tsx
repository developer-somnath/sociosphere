import { ReactNode } from "react";

import Sidebar from "./Partials/Sidebar";
import Topbar from "./Partials/Topbar";

interface Props {
    children: ReactNode;
}

export default function DashboardLayout({
    children,
}: Props) {
    return (
        <div className="flex h-screen bg-slate-50">

            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">

                <Topbar />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-[1600px] p-8">
                        {children}
                    </div>
                </main>

            </div>

        </div>
    );
}
