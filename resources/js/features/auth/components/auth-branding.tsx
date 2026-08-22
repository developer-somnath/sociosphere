import {
    Building2,
    Users,
    Wrench,
    ReceiptIndianRupee,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AuthBranding() {
    const { t } = useI18n();

    return (
        <div className="relative flex h-full flex-col justify-between overflow-hidden bg-slate-950 p-10 lg:p-14 xl:p-16 text-white shadow-2xl border-r border-slate-800/60">
            {/* Ambient Background Light Orbs */}
            <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-brand/20 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-info/15 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/2 left-1/3 size-64 rounded-full bg-info/10 blur-[120px]" />

            {/* Top Brand Header */}
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-info p-0.5 shadow-lg shadow-brand/20 transition-transform duration-300 hover:scale-105">
                            <div className="flex size-full items-center justify-center rounded-[14px] bg-slate-950">
                                <Building2 className="size-6 text-brand" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    SocioSphere
                                </h1>
                                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand border border-brand/20">
                                    PRO
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-400">
                                {t("auth.communityPlatform")}
                            </p>
                        </div>
                    </div>

                    {/* Operational Status Badge */}
                    <div className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand backdrop-blur-md">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-brand" />
                        </span>
                        <span>{t("auth.slaActive", undefined) || "SLA 99.9% Active"}</span>
                    </div>
                </div>
            </div>

            {/* Middle Hero & Feature Grid */}
            <div className="relative z-10 my-auto py-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-info/30 bg-info/10 px-3 py-1 text-xs font-medium text-info backdrop-blur-md mb-6">
                    <Sparkles className="size-3.5 text-info" />
                    <span>{t("auth.nextGenPlatform", undefined) || "Next-Gen Society Operations Platform"}</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
                    {t("auth.heroManage")}
                    <span className="block mt-1 bg-gradient-to-r from-brand via-info to-info bg-clip-text text-transparent">
                        {t("auth.heroNotSpreadsheets")}
                    </span>
                </h2>

                <p className="mt-4 text-base lg:text-lg leading-relaxed text-slate-300/90 max-w-xl">
                    {t("auth.heroParagraph")}
                </p>

                {/* Interactive Glass Feature Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <FeatureCard
                        icon={<Users className="size-4 text-brand" />}
                        title={t("auth.featureResidentMgmt")}
                        desc={t("auth.featureResidentMgmtDesc", undefined) || "Digital owner & tenant database with flat ledger tracking"}
                    />

                    <FeatureCard
                        icon={<Wrench className="size-4 text-info" />}
                        title={t("auth.featureMaintenance")}
                        desc={t("auth.featureMaintenanceDesc", undefined) || "Real-time helpdesk ticketing & facility bookings"}
                    />

                    <FeatureCard
                        icon={<ReceiptIndianRupee className="size-4 text-brand" />}
                        title={t("auth.featureBilling")}
                        desc={t("auth.featureBillingDesc", undefined) || "Automated billing, GST invoices & online payments"}
                    />

                    <FeatureCard
                        icon={<ShieldCheck className="size-4 text-info" />}
                        title={t("auth.featureSecurity")}
                        desc={t("auth.featureSecurityDesc", undefined) || "Gate visitor logs, vehicle tags & CCTV feeds"}
                    />
                </div>

                {/* Metrics Summary Strip */}
                <div className="mt-8 grid grid-cols-3 gap-3">
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

            {/* Footer Trust & Security Badges */}
            <div className="relative z-10 border-t border-slate-800/80 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="size-3.5 text-brand" />
                            {t("auth.enterpriseReady")}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <Lock className="size-3.5 text-info" />
                            {t("auth.isoAligned")}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="size-3.5 text-info" />
                            {t("auth.roleBasedAccess")}
                        </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono">
                        © 2026 SocioSphere Technologies
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 transition-all duration-300 hover:border-brand/40 hover:bg-slate-900/70 hover:shadow-lg hover:shadow-brand/5">
            <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 group-hover:bg-brand/10 transition-colors">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-brand transition-colors">
                        {title}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {desc}
                    </p>
                </div>
            </div>
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
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3.5 text-center backdrop-blur-md">
            <div className="text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {value}
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-400">
                {label}
            </div>
        </div>
    );
}
