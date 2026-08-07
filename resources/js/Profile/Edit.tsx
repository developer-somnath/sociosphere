import { Head, useForm, usePage } from "@inertiajs/react";
import { AlertTriangle, Loader2, Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import AppLayout from "@/layouts/app-layout";
import type { PageProps } from "@/types";

type ProfileProps = { mustVerifyEmail: boolean; status?: string };

export default function ProfileEdit() {
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

    return <AppLayout><Head title="Profile" /><div><h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1><p className="mt-1 text-sm text-muted-foreground">Manage the personal information for your SocioSphere account.</p></div><Card><CardHeader><CardTitle>Personal information</CardTitle><CardDescription>Keep your name and email address current.</CardDescription></CardHeader><CardContent><form onSubmit={updateProfile} className="grid max-w-xl gap-5"><div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={profile.data.name} onChange={(event) => updateData("name", event.target.value)} required />{profile.errors.name && <p className="text-sm text-destructive">{profile.errors.name}</p>}</div><div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={profile.data.email} onChange={(event) => updateData("email", event.target.value)} required />{profile.errors.email && <p className="text-sm text-destructive">{profile.errors.email}</p>}</div>{status && <p className="text-sm text-emerald-700 dark:text-emerald-400">{status}</p>}<div><Button disabled={profile.processing}>{profile.processing ? <Loader2 className="animate-spin" /> : <Save />}Save changes</Button></div></form></CardContent></Card><Card className="border-destructive/30"><CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="size-4" />Delete account</CardTitle><CardDescription>This permanently removes your account and cannot be undone.</CardDescription></CardHeader><CardContent><form onSubmit={deleteAccount} className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end"><div className="flex-1 space-y-2"><Label htmlFor="delete-password">Confirm password</Label><Input id="delete-password" type="password" value={deletion.data.password} onChange={(event) => deletion.setData("password", event.target.value)} autoComplete="current-password" required />{deletion.errors.password && <p className="text-sm text-destructive">{deletion.errors.password}</p>}</div><Button type="submit" variant="destructive-solid" disabled={deletion.processing}>{deletion.processing ? <Loader2 className="animate-spin" /> : <Trash2 />}Delete account</Button></form></CardContent></Card></AppLayout>;
}
