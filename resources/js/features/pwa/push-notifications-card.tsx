import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import {
    getExistingSubscription,
    isPushSupported,
    subscribeToPush,
    unsubscribeFromPush,
} from "@/lib/pwa";
import { usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";

export function PushNotificationsCard() {
    const { t } = useI18n();
    const { vapid_public_key } = usePage<PageProps>().props;
    const [busy, setBusy] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supported = isPushSupported() && !!vapid_public_key;

    async function refreshState() {
        const existing = await getExistingSubscription();
        setSubscribed(!!existing);
    }

    async function handleSubscribe() {
        if (!vapid_public_key) return;
        setBusy(true);
        setError(null);
        try {
            const sub = await subscribeToPush(vapid_public_key);
            setSubscribed(!!sub);
            if (!sub) {
                setError(t("pwa.pushPermissionDenied"));
            }
        } catch {
            setError(t("pwa.pushError"));
        } finally {
            setBusy(false);
        }
    }

    async function handleUnsubscribe() {
        setBusy(true);
        setError(null);
        try {
            await unsubscribeFromPush();
            setSubscribed(false);
        } catch {
            setError(t("pwa.pushError"));
        } finally {
            setBusy(false);
        }
    }

    if (!supported) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="size-4" />
                        {t("pwa.pushTitle")}
                    </CardTitle>
                    <CardDescription>{t("pwa.pushUnsupported")}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="size-4" />
                    {t("pwa.pushTitle")}
                </CardTitle>
                <CardDescription>{t("pwa.pushDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant={subscribed ? "outline" : "emerald"}
                        onClick={subscribed ? handleUnsubscribe : handleSubscribe}
                        disabled={busy}
                    >
                        {busy ? (
                            <Loader2 className="animate-spin" />
                        ) : subscribed ? (
                            <BellOff />
                        ) : (
                            <Bell />
                        )}
                        {subscribed ? t("pwa.pushDisable") : t("pwa.pushEnable")}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {subscribed ? t("pwa.pushEnabled") : t("pwa.pushDisabled")}
                    </span>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
        </Card>
    );
}
