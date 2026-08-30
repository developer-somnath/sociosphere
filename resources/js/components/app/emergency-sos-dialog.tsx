import { router, usePage } from "@inertiajs/react";
import {
    Activity,
    AlertTriangle,
    Flame,
    PhoneCall,
    Radio,
    ShieldAlert,
    Siren,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { PageProps } from "@/types";

type EmergencyType = "Medical" | "Fire" | "Security Intrusion" | "Elevator Stuck" | "General Emergency";

const EMERGENCY_TYPES: { type: EmergencyType; labelKey: string; icon: typeof Flame; color: string }[] = [
    { type: "Medical", labelKey: "sos.medical", icon: Activity, color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
    { type: "Fire", labelKey: "sos.fire", icon: Flame, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
    { type: "Security Intrusion", labelKey: "sos.security", icon: ShieldAlert, color: "text-destructive bg-destructive/10 border-destructive/30" },
    { type: "Elevator Stuck", labelKey: "sos.elevator", icon: Zap, color: "text-warning bg-warning/10 border-warning/30" },
    { type: "General Emergency", labelKey: "sos.general", icon: AlertTriangle, color: "text-primary bg-primary/10 border-primary/30" },
];

export function EmergencySosDialog({ trigger }: { trigger?: React.ReactNode }) {
    const { t } = useI18n();
    const { auth } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<EmergencyType>("Medical");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [processing, setProcessing] = useState(false);

    const handleTriggerSos = () => {
        setProcessing(true);
        router.post(
            route("emergency-sos.store"),
            {
                emergency_type: selectedType,
                location: location.trim() || undefined,
                description: description.trim() || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setOpen(false);
                    toast({
                        title: t("sos.successTitle"),
                        description: t("sos.successDesc"),
                        variant: "error",
                    });
                },
                onError: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="relative gap-1.5 rounded-full px-3.5 shadow-md hover:shadow-lg transition-all animate-pulse"
                    >
                        <Siren className="size-4" />
                        <span className="font-bold text-xs">{t("sos.button")}</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-lg border-destructive/40 bg-card p-6 shadow-2xl">
                <DialogHeader className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-destructive">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/15">
                            <Siren className="size-5" />
                        </div>
                        <DialogTitle className="text-xl font-extrabold">{t("sos.title")}</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {t("sos.subtitle")}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-5">
                    {/* Emergency Type Selector Grid */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("sos.selectType")}
                        </Label>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {EMERGENCY_TYPES.map(({ type, labelKey, icon: Icon, color }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedType(type)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 text-center transition-all",
                                        selectedType === type
                                            ? "border-destructive bg-destructive/15 ring-2 ring-destructive/40 shadow-sm"
                                            : "border-border/60 bg-muted/40 hover:bg-muted/70 hover:border-border"
                                    )}
                                >
                                    <div className={cn("flex size-8 items-center justify-center rounded-xl border", color)}>
                                        <Icon className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold leading-tight">{t(labelKey)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location & Details */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="sos-location" className="text-xs">
                                {t("sos.location")}
                            </Label>
                            <Input
                                id="sos-location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Tower B - Flat 402, or Clubhouse Pool"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="sos-details" className="text-xs">
                                {t("sos.details")}
                            </Label>
                            <Input
                                id="sos-details"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Smoke detected near electrical shaft"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Helplines Strip */}
                    <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-foreground mb-2">
                            <PhoneCall className="size-3.5 text-primary" />
                            <span>{t("sos.contactsTitle")}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono">
                            <span className="bg-card px-2 py-1 rounded-md border border-border/50">🚓 {t("sos.police")}</span>
                            <span className="bg-card px-2 py-1 rounded-md border border-border/50">🚑 {t("sos.ambulance")}</span>
                            <span className="bg-card px-2 py-1 rounded-md border border-border/50">🚒 {t("sos.fireBrigade")}</span>
                            <span className="bg-card px-2 py-1 rounded-md border border-border/50">🛡️ {t("sos.guardStation")}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                    <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={processing}>
                        {t("sos.cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleTriggerSos}
                        disabled={processing}
                        className="gap-2 font-bold shadow-lg"
                    >
                        <Radio className="size-4 animate-spin" />
                        {processing ? t("sos.broadcasting") : t("sos.triggerButton")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
