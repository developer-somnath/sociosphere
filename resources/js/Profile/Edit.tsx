import { Head, useForm, usePage } from "@inertiajs/react";
import { AlertTriangle, Loader2, Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useI18n } from "@/lib/i18n";
import { PushNotificationsCard } from "@/features/pwa/push-notifications-card";
import AppLayout from "@/layouts/app-layout";
import type { PageProps } from "@/types";

type ProfileProps = { mustVerifyEmail: boolean; status?: string };

export default function ProfileEdit() {
    const { t } = useI18n();
    const { auth, status } = usePage<PageProps<ProfileProps>>().props;
    const user = auth.user!;
    const profile = useForm({ name: user.name, email: user.email });
    const deletion = useForm({ password: "" });
    const { setDirty, markDirty, reset } = useUnsavedChanges();
    const rawSetData = profile.setData;
    const setData = rawSetData as <K extends keyof typeof profile.data>(
        key: K,
        value: (typeof profile.data)[K],
    ) => void;
    const updateData: typeof setData = (key, value) => {
        markDirty();
        setData(key, value);
    };
    const updateProfile = (event: FormEvent) => {
        event.preventDefault();
        profile.patch(route("profile.update"), {
            onSuccess: () => reset(),
            onError: () => setDirty(true),
        });
    };
    const deleteAccount = (event: FormEvent) => { event.preventDefault(); deletion.delete(route("profile.destroy")); };

    return <AppLayout><Head title={t("profile.title")} /><div><h1 className="text-2xl font-semibold tracking-tight">{t("profile.settings")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("profile.settingsDescription")}</p></div><Card><CardHeader><CardTitle>{t("profile.personalInfo")}</CardTitle><CardDescription>{t("profile.personalInfoDescription")}</CardDescription></CardHeader><CardContent><form onSubmit={updateProfile} className="grid max-w-xl gap-5"><div className="space-y-2"><Label htmlFor="name">{t("profile.name")}</Label><Input id="name" value={profile.data.name} onChange={(event) => updateData("name", event.target.value)} required />{profile.errors.name && <p className="text-sm text-destructive">{profile.errors.name}</p>}</div><div className="space-y-2"><Label htmlFor="email">{t("profile.email")}</Label><Input id="email" type="email" value={profile.data.email} onChange={(event) => updateData("email", event.target.value)} required />{profile.errors.email && <p className="text-sm text-destructive">{profile.errors.email}</p>}</div>{status && <p className="text-sm text-brand dark:text-brand">{status}</p>}<div><Button disabled={profile.processing}>{profile.processing ? <Loader2 className="animate-spin" /> : <Save />}{t("common.saveChanges")}</Button></div></form></CardContent></Card><Card className="border-destructive/30"><CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="size-4" />{t("profile.deleteAccount")}</CardTitle><CardDescription>{t("profile.deleteAccountDescription")}</CardDescription></CardHeader><CardContent><form onSubmit={deleteAccount} className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end"><div className="flex-1 space-y-2"><Label htmlFor="delete-password">{t("profile.confirmPassword")}</Label><Input id="delete-password" type="password" value={deletion.data.password} onChange={(event) => deletion.setData("password", event.target.value)} autoComplete="current-password" required />{deletion.errors.password && <p className="text-sm text-destructive">{deletion.errors.password}</p>}</div><Button type="submit" variant="destructive-solid" disabled={deletion.processing}>{deletion.processing ? <Loader2 className="animate-spin" /> : <Trash2 />}{t("profile.deleteAccount")}</Button></form></CardContent></Card><PushNotificationsCard /></AppLayout>;
}
