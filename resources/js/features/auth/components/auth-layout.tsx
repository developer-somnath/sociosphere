import { ReactNode } from "react";

interface Props {
    branding: ReactNode;
    children: ReactNode;
}

export default function AuthLayout({ branding, children }: Props) {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="grid min-h-screen lg:grid-cols-[52%_48%]">
                <aside className="hidden lg:block">{branding}</aside>

                <main className="relative flex items-center justify-center bg-slate-50 px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] [background-size:24px_24px] opacity-30" />

                    <div className="relative z-10 w-full max-w-xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
