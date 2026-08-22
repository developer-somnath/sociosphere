import type { ReactNode } from "react";

interface Props {
    branding: ReactNode;
    children: ReactNode;
}

export default function AuthLayout({ branding, children }: Props) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-brand selection:text-white transition-colors duration-300">
            {/* Background ambient lighting orbs & grid lines */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 size-[500px] rounded-full bg-brand/15 blur-[120px] dark:bg-brand/10" />
                <div className="absolute right-0 top-1/3 size-[450px] rounded-full bg-info/10 blur-[140px] dark:bg-info/10" />
                <div className="absolute bottom-0 left-1/3 size-[600px] rounded-full bg-info/10 blur-[160px] dark:bg-info/10" />
                
                {/* Subtle radial dot matrix overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:32px_32px] opacity-40 dark:opacity-20" />
            </div>

            {/* Split Screen Grid */}
            <div className="relative z-10 grid min-h-screen lg:grid-cols-12">
                {/* Left Branding Panel (5 Columns on Desktop) */}
                <aside className="hidden lg:col-span-5 lg:block xl:col-span-6">
                    {branding}
                </aside>

                {/* Right Form Main (7 Columns on Desktop) */}
                <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 lg:col-span-7 xl:col-span-6 lg:p-12">
                    <div className="w-full max-w-xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
