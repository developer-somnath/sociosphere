import {
    Building2,
    CheckCircle2,
    CreditCard,
    FileText,
    Gavel,
    Lock,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Users,
} from "lucide-react";
import LegalLayout from "../components/legal-layout";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
    const { t } = useI18n();

    const tocItems = [
        { id: "section-1", title: "Acceptance & Overview" },
        { id: "section-2", title: "User Accounts & Role Permissions" },
        { id: "section-3", title: "Society & Property Administration" },
        { id: "section-4", title: "Maintenance Billing & Financial Dues" },
        { id: "section-5", title: "Visitor Pass & Gate Security" },
        { id: "section-6", title: "Service SLA & Acceptable Use" },
        { id: "section-7", title: "Intellectual Property Rights" },
        { id: "section-8", title: "Limitation of Liability & Disputes" },
    ];

    return (
        <LegalLayout
            title={t("auth.termsOfService", undefined) || "Terms of Service"}
            subtitle="Please read these terms carefully. By accessing or using the SocioSphere Community Operations Platform, you agree to be bound by these enterprise governance terms."
            effectiveDate="January 1, 2026"
            tocItems={tocItems}
            activePage="terms"
        >
            {/* Section 1 */}
            <section id="section-1" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:text-brand">
                        <Building2 className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        1. Acceptance of Terms & Service Overview
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    These Terms of Service ("Terms") constitute a legally binding agreement between SocioSphere Technologies Inc. ("SocioSphere", "we", "us", or "our") and the housing society, apartment owners association, resident welfare association (RWA), property administrator, resident, tenant, or visitor ("User", "you") accessing or utilizing the SocioSphere platform.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    SocioSphere provides a multi-tenant cloud-based society management operating system incorporating resident registries, maintenance billing, automated accounting ledgers, digital helpdesk ticketing, amenity facility scheduling, gate visitor verification, and CCTV monitoring feeds.
                </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <Users className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        2. User Accounts & Role-Based Access Control
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Account access to SocioSphere is invitation-driven or administered by authorized society managers. Each user account is assigned strict Role-Based Access Control (RBAC) permissions (including Super Admin, Society Admin, Treasurer, Security Guard, and Resident).
                </p>
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                        <h4 className="text-xs font-bold text-foreground">Account Credentials Security</h4>
                        <p className="mt-1 text-xs text-muted-foreground">You are responsible for maintaining password confidentiality and ensuring multi-factor authentication compliance.</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                        <h4 className="text-xs font-bold text-foreground">Unauthorized Activity</h4>
                        <p className="mt-1 text-xs text-muted-foreground">Any unauthorized account access or compromised session keys must be reported to society management immediately.</p>
                    </div>
                </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <ShieldCheck className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        3. Society & Property Administration
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Society administrators warrant that they possess legal authorization to manage property records, flat allocations, tower configurations, parking slot assignments, and resident directory databases uploaded to SocioSphere.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Residents and tenants warrant that information provided in resident profiles, emergency contact records, vehicle registrations, and tenant move-in declarations is accurate and up-to-date.
                </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:text-brand">
                        <CreditCard className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        4. Maintenance Billing & Financial Dues
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    SocioSphere generates maintenance invoices, utility surcharge line-items, interest on arrears, and digital payment receipts based on society billing parameters configured by society treasurers.
                </p>
                <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-xs leading-relaxed text-brand dark:text-brand">
                    <strong className="font-semibold">Payment Processing Note:</strong> Online maintenance payments processed via integrated payment gateways are deposited directly into designated society bank accounts. SocioSphere does not store credit/debit card numbers or netbanking passwords.
                </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <ShieldAlert className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        5. Visitor Pass & Gate Security System
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Security personnel utilizing SocioSphere Gate Pass log visitor entry/exit times, digital pass verification codes, vehicle registration numbers, and delivery approvals.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Visitors entering society premises grant permission for temporary security verification logging in compliance with society bylaws and applicable safety protocols.
                </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <CheckCircle2 className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        6. Service SLA (99.9% Uptime) & Acceptable Use
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    SocioSphere maintains a target service availability SLA of 99.9% uptime for cloud infrastructure. Planned maintenance windows are communicated in advance via the admin notification center.
                </p>
                <ul className="list-disc pl-5 text-sm leading-relaxed text-muted-foreground space-y-1">
                    <li>No user may attempt reverse engineering, unauthorized API vulnerability scans, or brute-force access attacks.</li>
                    <li>No spamming or posting defamatory content on community notice boards or helpdesk complaint threads.</li>
                </ul>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning dark:text-warning">
                        <Lock className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        7. Intellectual Property Rights
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    All software code, database schemas, user interface designs, logos, brand trademarks, and documentation related to SocioSphere remain the exclusive intellectual property of SocioSphere Technologies Inc.
                </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive dark:text-destructive">
                        <Gavel className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        8. Limitation of Liability & Dispute Resolution
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    To the maximum extent permitted by law, SocioSphere shall not be liable for indirect, incidental, special, or consequential damages resulting from platform usage or temporary service interruptions.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    These terms are governed by the laws of India. Any legal disputes arising hereunder shall be subject to arbitration in New Delhi, India.
                </p>
            </section>
        </LegalLayout>
    );
}
