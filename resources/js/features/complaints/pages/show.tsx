import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    MapPin,
    MessageSquareWarning,
    User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { t, useI18n } from "@/lib/i18n";
import type { PageProps } from "@/types";

type ComplaintDetail = {
    id: number;
    uuid: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    status: "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    flat?: { id: number; flat_number: string; tower?: { id: number; name: string } };
    resident?: { id: number; name: string };
    category?: { id: number; name: string };
    assignee?: { id: number; name: string; email: string };
};

type StaffUser = { id: number; name: string; email: string };

type ShowProps = {
    complaint: ComplaintDetail;
    staffUsers: StaffUser[];
    can: { update: boolean; delete: boolean };
};

function priorityBadge(priority: ComplaintDetail["priority"]) {
    switch (priority) {
        case "Critical":
            return <Badge variant="destructive">{t("complaints.priority.critical")}</Badge>;
        case "High":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("complaints.priority.high")}
                </Badge>
            );
        case "Medium":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("complaints.priority.medium")}
                </Badge>
            );
        default:
            return <Badge variant="secondary">{t("complaints.priority.low")}</Badge>;
    }
}

function statusBadge(status: ComplaintDetail["status"]) {
    switch (status) {
        case "Open":
            return (
                <Badge className="border-transparent bg-info/20 text-info dark:bg-info/20 dark:text-info">
                    {t("complaints.status.open")}
                </Badge>
            );
        case "Assigned":
            return (
                <Badge className="border-transparent bg-info/20 text-info dark:bg-info/20 dark:text-info">
                    {t("complaints.status.assigned")}
                </Badge>
            );
        case "In Progress":
            return (
                <Badge className="border-transparent bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning">
                    {t("complaints.status.inProgress")}
                </Badge>
            );
        case "Resolved":
            return (
                <Badge className="border-transparent bg-brand/20 text-brand dark:bg-brand/20 dark:text-brand">
                    {t("complaints.status.resolved")}
                </Badge>
            );
        case "Closed":
            return <Badge variant="secondary">{t("complaints.status.closed")}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function statusLabel(status: string): string {
    switch (status) {
        case "Open":
            return t("complaints.status.open");
        case "Assigned":
            return t("complaints.status.assigned");
        case "In Progress":
            return t("complaints.status.inProgress");
        case "Resolved":
            return t("complaints.status.resolved");
        case "Closed":
            return t("complaints.status.closed");
        default:
            return status;
    }
}

const STATUS_FLOW: Record<string, string[]> = {
    Open: ["Assigned", "In Progress", "Closed"],
    Assigned: ["In Progress", "Resolved", "Closed"],
    "In Progress": ["Resolved", "Closed"],
    Resolved: ["Closed", "In Progress"],
    Closed: [],
};

export default function ComplaintShow() {
    const { complaint, staffUsers, can } = usePage<PageProps<ShowProps>>().props;
    const { t } = useI18n();
    const [showDelete, setShowDelete] = useState(false);

    const assignForm = useForm({
        assigned_to: complaint.assignee ? String(complaint.assignee.id) : "",
    });

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        assignForm.post(route("complaints.assign", complaint.id));
    };

    const handleTransition = (newStatus: string) => {
        router.post(route("complaints.transition", complaint.id), {
            status: newStatus,
        });
    };

    const handleDelete = () => {
        router.delete(route("complaints.destroy", complaint.id));
    };

    const nextStatuses = STATUS_FLOW[complaint.status] ?? [];

    return (
        <AppLayout>
            <Head title={t("complaints.showHead", { title: complaint.title })} />

            <PageHeader
                title={complaint.title}
                description={`#${complaint.id} · ${complaint.category?.name ?? t("complaints.uncategorized")}`}
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    <div className="flex items-center gap-2">
                        {can.update && (
                            <Button variant="outline" asChild>
                                <Link href={route("complaints.edit", complaint.id)}>
                                    {t("common.edit")}
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={route("complaints.index")}>
                                <ArrowLeft className="size-4" />
                                {t("common.back")}
                            </Link>
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main detail card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                        <CardHeader className="pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {statusBadge(complaint.status)}
                                {priorityBadge(complaint.priority)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">{complaint.title}</h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                                    {complaint.description}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">{t("complaints.flatTower")}</p>
                                        <p className="text-sm text-foreground">
                                            {complaint.flat?.flat_number ?? "—"}
                                            {complaint.flat?.tower ? ` · ${complaint.flat.tower.name}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <UserIcon className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">{t("complaints.colReportedBy")}</p>
                                        <p className="text-sm text-foreground">
                                            {complaint.resident?.name ?? "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">{t("complaints.raisedOn")}</p>
                                        <p className="text-sm text-foreground">
                                            {new Date(complaint.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {complaint.resolved_at && (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 size-4 text-brand" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">{t("complaints.resolvedOn")}</p>
                                            <p className="text-sm text-foreground">
                                                {new Date(complaint.resolved_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar actions */}
                <div className="space-y-6">
                    {/* Status transitions */}
                    {can.update && nextStatuses.length > 0 && (
                        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">
                                    <Clock className="mr-1.5 inline size-4" />
                                    {t("complaints.updateStatus")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {nextStatuses.map((s) => (
                                    <Button
                                        key={s}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTransition(s)}
                                    >
                                        {statusLabel(s)}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Assign staff */}
                    {can.update && (
                        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">
                                    <UserIcon className="mr-1.5 inline size-4" />
                                    {t("complaints.assignToStaff")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAssign} className="space-y-3">
                                    <Combobox
                                        items={staffUsers.map((u) => ({
                                            value: String(u.id),
                                            label: `${u.name} (${u.email})`,
                                        }))}
                                        value={assignForm.data.assigned_to}
                                        onValueChange={(value) =>
                                            assignForm.setData("assigned_to", value)
                                        }
                                        placeholder={t("complaints.selectStaffMember")}
                                        emptyText={t("complaintForm.noStaffFound")}
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-full"
                                        disabled={assignForm.processing || !assignForm.data.assigned_to}
                                    >
                                        {complaint.assignee ? t("complaints.reassign") : t("complaints.assign")}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current assignee */}
                    {complaint.assignee && (
                        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">{t("complaints.currentlyAssigned")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium text-foreground">{complaint.assignee.name}</p>
                                <p className="text-xs text-muted-foreground">{complaint.assignee.email}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Danger zone */}
                    {can.delete && (
                        <Card className="border-destructive/30 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-destructive">
                                    {t("complaints.dangerZone")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setShowDelete(true)}
                                >
                                    {t("complaints.deleteComplaint")}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title={t("complaints.deleteComplaint")}
                description={t("complaints.confirmDeleteDescription", {
                    title: complaint.title,
                })}
                destructive
                confirmLabel={t("common.delete")}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
