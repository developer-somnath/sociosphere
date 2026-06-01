import {
    Building2,
    Users,
    ShieldCheck,
    BarChart3,
} from "lucide-react";

export default function BrandingPanel() {
    return (
        <div
            className="
                hidden
                lg:flex
                flex-col
                justify-between
                p-12
                text-white
                bg-gradient-to-br
                from-emerald-800
                via-emerald-700
                to-emerald-600
            "
        >
            <div>
                <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8" />

                    <h1 className="text-4xl font-bold">
                        SocioSphere
                    </h1>
                </div>

                <div className="mt-20 max-w-xl">
                    <h2 className="text-6xl font-bold leading-tight">
                        Manage Your Society,
                        Simplify Every Operation.
                    </h2>

                    <p className="mt-8 text-xl text-emerald-100 leading-relaxed">
                        The operating system for modern
                        residential communities.
                    </p>
                </div>

                <div className="mt-16 space-y-5">
                    <Feature
                        icon={<Users />}
                        title="Resident Management"
                    />

                    <Feature
                        icon={<ShieldCheck />}
                        title="Visitor Tracking"
                    />

                    <Feature
                        icon={<BarChart3 />}
                        title="Community Analytics"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <Stat
                    value="500+"
                    label="Societies"
                />

                <Stat
                    value="50K+"
                    label="Residents"
                />

                <Stat
                    value="99.9%"
                    label="Uptime"
                />
            </div>
        </div>
    );
}

function Feature({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3">
            {icon}

            <span className="text-lg">
                {title}
            </span>
        </div>
    );
}

function Stat({
    value,
    label,
}: {
    value: string;
    label: string;
}) {
    return (
        <div>
            <h3 className="text-4xl font-bold">
                {value}
            </h3>

            <p className="text-emerald-100">
                {label}
            </p>
        </div>
    );
}
