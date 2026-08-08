import {
    Building2,
    Users,
    Wrench,
    ReceiptIndianRupee,
    ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AuthBranding() {
    const { t } = useI18n();
    return (
        <div className="relative flex h-full flex-col justify-between overflow-hidden bg-slate-950 p-16 text-white">

            <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative z-10">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-emerald-500/10 p-3">
                        <Building2 className="h-10 w-10 text-emerald-400" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold">
                            SocioSphere
                        </h1>

                        <p className="text-slate-400">
                            {t("auth.communityPlatform")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div className="relative z-10 max-w-2xl">
                <h2 className="text-6xl font-bold leading-tight">
                    {t("auth.heroManage")}
                    <span className="block text-emerald-400">
                        {t("auth.heroNotSpreadsheets")}
                    </span>
                </h2>

                <p className="mt-6 text-xl text-slate-400">
                    {t("auth.heroParagraph")}
                </p>

                {/* Features */}
                <div className="mt-12 grid gap-5">
                    <Feature
                        icon={<Users size={20} />}
                        text={t("auth.featureResidentMgmt")}
                    />

                    <Feature
                        icon={<Wrench size={20} />}
                        text={t("auth.featureMaintenance")}
                    />

                    <Feature
                        icon={<ReceiptIndianRupee size={20} />}
                        text={t("auth.featureBilling")}
                    />

                    <Feature
                        icon={<ShieldCheck size={20} />}
                        text={t("auth.featureSecurity")}
                    />
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-3 gap-4">
                    <StatCard
                        value="12K+"
                        label={t("auth.statResidents")}
                    />

                    <StatCard
                        value="₹5Cr+"
                        label={t("auth.statCollections")}
                    />

                    <StatCard
                        value="99.9%"
                        label={t("auth.statUptime")}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10">
                <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span>{t("auth.enterpriseReady")}</span>
                    <span>{t("auth.isoAligned")}</span>
                    <span>{t("auth.roleBasedAccess")}</span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                    © 2026 SocioSphere Technologies
                </p>
            </div>
        </div>
    );
}

function Feature({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="text-emerald-400">
                {icon}
            </div>

            <span className="text-lg">
                {text}
            </span>
        </div>
    );
}

function StatCard({
    value,
    label,
}: {
    value: string;
    label: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-2xl font-bold">
                {value}
            </div>

            <div className="mt-1 text-sm text-slate-400">
                {label}
            </div>
        </div>
    );
}
