import { ReactNode } from "react";

interface Props {
    branding: ReactNode;
    children: ReactNode;
}

export default function AuthLayout({ branding, children }: Props) {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)]">
            <div className="grid min-h-screen lg:grid-cols-[52%_48%]">
                <aside className="hidden lg:block">{branding}</aside>

                <main className="relative flex items-center justify-center px-6 py-8 sm:px-8 lg:px-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#cbd5e1_1px,transparent_0)] [background-size:24px_24px] opacity-25" />

                    <div className="relative z-10 w-full max-w-xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
