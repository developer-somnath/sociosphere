import {
    Building2,
    CheckCircle2,
    Database,
    Eye,
    Key,
    Lock,
    Mail,
    Shield,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import LegalLayout from "../components/legal-layout";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
    const { t } = useI18n();

    const tocItems = [
        { id: "privacy-1", title: "Information We Collect" },
        { id: "privacy-2", title: "Purpose of Data Processing" },
        { id: "privacy-3", title: "Data Retention Schedules" },
        { id: "privacy-4", title: "Encryption & Security Architecture" },
        { id: "privacy-5", title: "Third-Party Data Sharing" },
        { id: "privacy-6", title: "Resident Rights & Data Protection" },
        { id: "privacy-7", title: "Cookies & Audit Logs" },
        { id: "privacy-8", title: "Data Protection Officer Contact" },
    ];

    return (
        <LegalLayout
            title={t("auth.privacyPolicy", undefined) || "Privacy Policy"}
            subtitle="Your privacy and data protection are core priorities at SocioSphere. Learn how we collect, safeguard, and process resident and visitor data."
            effectiveDate="January 1, 2026"
            tocItems={tocItems}
            activePage="privacy"
        >
            {/* Section 1 */}
            <section id="privacy-1" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:text-brand">
                        <Database className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        1. Information We Collect
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    To deliver enterprise society management, maintenance billing, and security operations, SocioSphere processes specific categories of personal data submitted by society administrators, property owners, residents, tenants, and visitors.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                        <h4 className="text-xs font-bold text-foreground">Resident & Owner Data</h4>
                        <p className="mt-1 text-xs text-muted-foreground">Full name, email address, mobile number, flat allocation, ownership status, emergency contacts, and vehicle registration numbers.</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                        <h4 className="text-xs font-bold text-foreground">Visitor & Gate Security Logs</h4>
                        <p className="mt-1 text-xs text-muted-foreground">Visitor full name, contact number, flat visited, entry/exit timestamp, vehicle tag number, and digital pass verification code.</p>
                    </div>
                </div>
            </section>

            {/* Section 2 */}
            <section id="privacy-2" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <UserCheck className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        2. Purpose of Data Processing
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    We process personal data strictly for legitimate operational purposes required to manage residential property governance:
                </p>
                <ul className="list-disc pl-5 text-sm leading-relaxed text-muted-foreground space-y-1.5">
                    <li>Generating monthly maintenance invoices, utility bills, and automated payment receipts.</li>
                    <li>Verifying visitor gate entry requests and sending real-time resident entry approval notifications.</li>
                    <li>Processing facility amenity bookings and managing Helpdesk complaint tickets.</li>
                    <li>Transmitting urgent society broadcasts, notice board announcements, and security alerts.</li>
                </ul>
            </section>

            {/* Section 3 */}
            <section id="privacy-3" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <ShieldCheck className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        3. Data Retention Schedules
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    SocioSphere enforces strict automated data retention lifecycle rules aligned with legal and accounting standards:
                </p>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="font-semibold text-foreground">Financial & Billing Records:</span>
                        <span className="font-mono text-brand dark:text-brand font-bold">7 Years (Statutory Requirement)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="font-semibold text-foreground">Gate Visitor Entry Logs:</span>
                        <span className="font-mono text-info dark:text-info font-bold">90 Days Auto-Purge</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Active Resident Profiles:</span>
                        <span className="font-mono text-info dark:text-info font-bold">Duration of Tenancy / Ownership</span>
                    </div>
                </div>
            </section>

            {/* Section 4 */}
            <section id="privacy-4" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <Lock className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        4. Encryption & Security Architecture
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    All data transmitted between your web browser or mobile application and SocioSphere infrastructure is encrypted using modern TLS 1.3 encryption protocols.
                </p>
                <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-xs leading-relaxed text-brand dark:text-brand">
                    <strong className="font-semibold">At-Rest Storage Encryption:</strong> Database backups and uploaded document attachments (ownership deeds, tenant lease agreements) are encrypted at rest using AES-256 bit encryption keys.
                </div>
            </section>

            {/* Section 5 */}
            <section id="privacy-5" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning dark:text-warning">
                        <Key className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        5. Third-Party Data Sharing
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    SocioSphere does not sell, rent, or monetize resident or visitor data to third-party advertisers. Data is shared exclusively with vetted subprocessors necessary for system operation:
                </p>
                <ul className="list-disc pl-5 text-sm leading-relaxed text-muted-foreground space-y-1">
                    <li>Payment Gateways (Razorpay / Stripe) for processing maintenance collections.</li>
                    <li>SMS & Email Providers (Twilio / SendGrid) for emergency alerts and notice broadcasts.</li>
                    <li>Cloud Infrastructure Hosting (AWS / DigitalOcean) in secure ISO 27001 data centers.</li>
                </ul>
            </section>

            {/* Section 6 */}
            <section id="privacy-6" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <Eye className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        6. Resident Rights & Data Portability
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Residents and property owners possess statutory data rights under applicable privacy legislation:
                </p>
                <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs">
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                        <span className="font-bold text-foreground">Right of Access & Export:</span> Request a CSV/PDF export of personal flat ledger receipts and profile history.
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                        <span className="font-bold text-foreground">Right of Rectification:</span> Update outdated contact details via the Profile Settings page.
                    </div>
                </div>
            </section>

            {/* Section 7 */}
            <section id="privacy-7" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:text-brand">
                        <CheckCircle2 className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        7. Cookies & Audit Logs
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    SocioSphere utilizes essential session cookies and local storage tokens (`sociosphere_locale`, theme preference) required to maintain secure user login states and language preferences.
                </p>
            </section>

            {/* Section 8 */}
            <section id="privacy-8" className="scroll-mt-28 space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info dark:text-info">
                        <Mail className="size-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        8. Data Protection Officer (DPO) Contact
                    </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    For data protection inquiries, privacy rights requests, or security vulnerability reports, please contact our Data Protection Officer:
                </p>
                <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-xs space-y-1">
                    <p className="font-semibold text-foreground">SocioSphere Privacy & Security Team</p>
                    <p className="text-muted-foreground">Email: privacy@sociosphere.com</p>
                    <p className="text-muted-foreground">Address: SocioSphere Technologies Inc., Cyber City, Gurgaon, HR 122002, India</p>
                </div>
            </section>
        </LegalLayout>
    );
}
