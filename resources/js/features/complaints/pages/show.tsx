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
            return <Badge variant="destructive">Critical</Badge>;
        case "High":
            return (
                <Badge className="border-transparent bg-orange-500/20 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    High
                </Badge>
            );
        case "Medium":
            return (
                <Badge className="border-transparent bg-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    Medium
                </Badge>
            );
        default:
            return <Badge variant="secondary">Low</Badge>;
    }
}

function statusBadge(status: ComplaintDetail["status"]) {
    switch (status) {
        case "Open":
            return (
                <Badge className="border-transparent bg-blue-500/20 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    Open
                </Badge>
            );
        case "Assigned":
            return (
                <Badge className="border-transparent bg-purple-500/20 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                    Assigned
                </Badge>
            );
        case "In Progress":
            return (
                <Badge className="border-transparent bg-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    In Progress
                </Badge>
            );
        case "Resolved":
            return (
                <Badge className="border-transparent bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Resolved
                </Badge>
            );
        case "Closed":
            return <Badge variant="secondary">Closed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
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
            <Head title={`Complaint: ${complaint.title}`} />

            <PageHeader
                title={complaint.title}
                description={`#${complaint.id} · ${complaint.category?.name ?? "Uncategorized"}`}
                icon={<MessageSquareWarning className="size-5" />}
                actions={
                    <div className="flex items-center gap-2">
                        {can.update && (
                            <Button variant="outline" asChild>
                                <Link href={route("complaints.edit", complaint.id)}>
                                    Edit
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={route("complaints.index")}>
                                <ArrowLeft className="size-4" />
                                Back
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
                                        <p className="text-xs font-medium text-muted-foreground">Flat / Tower</p>
                                        <p className="text-sm text-foreground">
                                            {complaint.flat?.flat_number ?? "—"}
                                            {complaint.flat?.tower ? ` · ${complaint.flat.tower.name}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <UserIcon className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Reported By</p>
                                        <p className="text-sm text-foreground">
                                            {complaint.resident?.name ?? "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Raised On</p>
                                        <p className="text-sm text-foreground">
                                            {new Date(complaint.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {complaint.resolved_at && (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 size-4 text-emerald-500" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Resolved On</p>
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
                                    Update Status
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
                                        {s}
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
                                    Assign To Staff
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
                                        placeholder="Select staff member…"
                                        emptyText="No staff found"
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-full"
                                        disabled={assignForm.processing || !assignForm.data.assigned_to}
                                    >
                                        {complaint.assignee ? "Reassign" : "Assign"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current assignee */}
                    {complaint.assignee && (
                        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">Currently Assigned</CardTitle>
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
                                    Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setShowDelete(true)}
                                >
                                    Delete Complaint
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete Complaint"
                description={`Are you sure you want to delete "${complaint.title}"? This action cannot be undone.`}
                destructive
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
