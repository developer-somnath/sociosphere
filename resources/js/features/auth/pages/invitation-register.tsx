import { Head, useForm, usePage } from "@inertiajs/react";
import { Building, ShieldCheck, UserPlus } from "lucide-react";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type InvitationProps = {
    invitation: {
        token: string;
        email: string;
        role_name: string;
        society_name: string | null;
    };
};

export default function InvitationRegister() {
    const { invitation } = usePage<PageProps<InvitationProps>>().props;
    const { t } = useI18n();

    const form = useForm({
        name: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/register/invitation/${invitation.token}`);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
            <div className="absolute right-4 top-4 flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
            </div>

            <Head title={t("auth.completeInvitationRegistration", undefined) || "Complete Invitation Registration"} />

            <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                        <UserPlus className="size-6" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">
                        {t("auth.completeYourAccount", undefined) || "Complete Your Account"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {t("auth.invitedToJoin", undefined) || "You have been invited to join"}{" "}
                        <span className="font-semibold text-foreground">{invitation.society_name ?? "SocioSphere"}</span>{" "}
                        {t("auth.as", undefined) || "as"}{" "}
                        <span className="font-semibold text-primary">{invitation.role_name}</span>.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>{t("common.email")}</Label>
                            <Input value={invitation.email} disabled className="bg-muted/50 font-mono text-xs" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="name">{t("profile.name")} *</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData("name", e.target.value)}
                                placeholder="e.g. Alexander Wright"
                                required
                            />
                            {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">{t("common.phone")}</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(e) => form.setData("phone", e.target.value)}
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">{t("auth.newPassword")} *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData("password", e.target.value)}
                                placeholder="At least 8 characters"
                                required
                            />
                            {form.errors.password && <p className="text-xs text-destructive">{form.errors.password}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation">{t("auth.confirmNewPassword")} *</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData("password_confirmation", e.target.value)}
                                placeholder="Re-enter password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full rounded-xl" disabled={form.processing}>
                            {form.processing ? t("common.loading") : t("auth.completeRegistration", undefined) || "Complete Registration"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

