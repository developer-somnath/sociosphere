import { Head, router, useForm } from "@inertiajs/react";
import {
    CheckCircle2,
    Clock,
    Lock,
    Plus,
    Radio,
    Shield,
    Trash2,
    Users,
    Vote,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type PollOptionItem = {
    id: number;
    option_text: string;
    sort_order: number;
    votes_count: number;
    percentage: number;
};

type PollItem = {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    status: "active" | "draft" | "closed";
    is_anonymous: boolean;
    allow_multiple: boolean;
    expires_at: string | null;
    created_at: string;
    creator: { id: number; name: string } | null;
    options: PollOptionItem[];
    total_votes: number;
    has_voted: boolean;
    user_voted_options: number[];
    is_expired: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Stats = {
    total: number;
    active: number;
    closed: number;
};

type Props = {
    polls: Paginated<PollItem>;
    stats: Stats;
    filters: {
        search: string;
        status: string | null;
    };
    can: {
        create: boolean;
        vote: boolean;
        manage: boolean;
    };
};

export default function PollsIndex({ polls, stats, filters, can }: Props) {
    const { t } = useI18n();

    // Create Modal State
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PollItem | null>(null);

    // Selected options per poll for voting: Record<pollId, number[]>
    const [selectedVotes, setSelectedVotes] = useState<Record<number, number[]>>({});

    const createForm = useForm({
        title: "",
        description: "",
        is_anonymous: false,
        allow_multiple: false,
        expires_at: "",
        options: ["", ""],
    });

    const handleAddOption = () => {
        if (createForm.data.options.length < 8) {
            createForm.setData("options", [...createForm.data.options, ""]);
        }
    };

    const handleRemoveOption = (index: number) => {
        if (createForm.data.options.length > 2) {
            const updated = createForm.data.options.filter((_, i) => i !== index);
            createForm.setData("options", updated);
        }
    };

    const handleOptionChange = (index: number, val: string) => {
        const updated = [...createForm.data.options];
        updated[index] = val;
        createForm.setData("options", updated);
    };

    const handleCreatePoll = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route("polls.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
                toast({
                    title: t("polls.createSuccessTitle"),
                    description: t("polls.createSuccessDesc"),
                    variant: "success",
                });
            },
        });
    };

    const handleOptionSelect = (pollId: number, optionId: number, allowMultiple: boolean) => {
        setSelectedVotes((prev) => {
            const current = prev[pollId] || [];
            if (allowMultiple) {
                if (current.includes(optionId)) {
                    return { ...prev, [pollId]: current.filter((id) => id !== optionId) };
                } else {
                    return { ...prev, [pollId]: [...current, optionId] };
                }
            } else {
                return { ...prev, [pollId]: [optionId] };
            }
        });
    };

    const handleCastVote = (poll: PollItem) => {
        const optionIds = selectedVotes[poll.id] || [];
        if (optionIds.length === 0) return;

        router.post(
            route("polls.vote", poll.uuid),
            { option_ids: optionIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: t("polls.voteSuccessTitle"),
                        description: t("polls.voteSuccessDesc"),
                        variant: "success",
                    });
                },
            }
        );
    };

    const handleClosePoll = (poll: PollItem) => {
        router.post(
            route("polls.close", poll.uuid),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: t("polls.closedTitle"),
                        description: t("polls.closedDesc"),
                        variant: "info",
                    });
                },
            }
        );
    };

    const handleDeletePoll = () => {
        if (!deleteTarget) return;
        router.delete(route("polls.destroy", deleteTarget.uuid), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                toast({
                    title: t("polls.deleteSuccessTitle"),
                    description: t("polls.deleteSuccessDesc"),
                    variant: "success",
                });
            },
        });
    };

    const activeFilterCount = (filters.search ? 1 : 0) + (filters.status ? 1 : 0);

    return (
        <AppLayout>
            <Head title={t("polls.pageTitle")} />

            <div className="space-y-6">
                <PageHeader
                    title={t("polls.title")}
                    description={t("polls.description")}
                    breadcrumbs={[
                        { label: t("nav.home"), href: route("overview") },
                        { label: t("nav.communications") },
                        { label: t("polls.title") },
                    ]}
                    actions={
                        can.create ? (
                            <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-semibold">
                                <Plus className="size-4" />
                                {t("polls.createButton")}
                            </Button>
                        ) : undefined
                    }
                />

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard
                        label={t("polls.statTotal")}
                        value={stats.total}
                        icon={Vote}
                    />
                    <MetricCard
                        label={t("polls.statActive")}
                        value={stats.active}
                        icon={Radio}
                    />
                    <MetricCard
                        label={t("polls.statClosed")}
                        value={stats.closed}
                        icon={CheckCircle2}
                    />
                </div>

                {/* Filter Bar */}
                <FilterBar
                    searchPlaceholder={t("polls.searchPlaceholder")}
                    searchValue={filters.search}
                    onSearchChange={(val: string) =>
                        router.get(
                            route("polls.index"),
                            { ...filters, search: val || undefined },
                            { preserveState: true, replace: true }
                        )
                    }
                    onReset={() => router.get(route("polls.index"), {}, { preserveState: true, replace: true })}
                >
                    <div className="flex items-center gap-2">
                        <select
                            value={filters.status ?? ""}
                            onChange={(e) =>
                                router.get(
                                    route("polls.index"),
                                    { ...filters, status: e.target.value || undefined },
                                    { preserveState: true, replace: true }
                                )
                            }
                            className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">{t("polls.allStatuses")}</option>
                            <option value="active">{t("polls.statusActive")}</option>
                            <option value="closed">{t("polls.statusClosed")}</option>
                        </select>
                    </div>
                </FilterBar>

                {/* Polls Cards Grid */}
                {polls.data.length === 0 ? (
                    <Card className="rounded-2xl border border-border/60">
                        <EmptyState
                            icon={Vote}
                            title={t("polls.emptyTitle")}
                            description={t("polls.emptyDesc")}
                            action={
                                can.create ? (
                                    <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-semibold">
                                        <Plus className="size-4" />
                                        {t("polls.createButton")}
                                    </Button>
                                ) : undefined
                            }
                        />
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {polls.data.map((poll) => {
                            const isClosed = poll.status === "closed" || poll.is_expired;
                            const showResults = poll.has_voted || isClosed;
                            const selectedForThis = selectedVotes[poll.id] || [];

                            return (
                                <Card
                                    key={poll.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md"
                                >
                                    <CardHeader className="space-y-2 pb-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge
                                                variant={isClosed ? "secondary" : "success"}
                                                className="gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-semibold"
                                            >
                                                {isClosed ? t("polls.badgeClosed") : t("polls.badgeActive")}
                                            </Badge>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {poll.is_anonymous && (
                                                    <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                                                        <Shield className="size-3" />
                                                        {t("polls.anonymous")}
                                                    </span>
                                                )}
                                                {poll.allow_multiple && (
                                                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                                        {t("polls.multiSelect")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <CardTitle className="text-lg font-bold leading-snug">{poll.title}</CardTitle>
                                        {poll.description && (
                                            <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                                                {poll.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-3 pb-4">
                                        {/* Options / Live Results */}
                                        <div className="space-y-2.5">
                                            {poll.options.map((option) => {
                                                const isSelected = selectedForThis.includes(option.id);
                                                const hasUserVotedThis = poll.user_voted_options.includes(option.id);

                                                if (showResults) {
                                                    return (
                                                        <div key={option.id} className="space-y-1.5">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className={cn("font-medium", hasUserVotedThis && "font-bold text-primary flex items-center gap-1")}>
                                                                    {hasUserVotedThis && <CheckCircle2 className="size-3.5" />}
                                                                    {option.option_text}
                                                                </span>
                                                                <span className="font-semibold text-muted-foreground">
                                                                    {option.votes_count} ({option.percentage}%)
                                                                </span>
                                                            </div>
                                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full transition-all duration-500",
                                                                        hasUserVotedThis ? "bg-primary" : "bg-primary/50"
                                                                    )}
                                                                    style={{ width: `${option.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Voting UI
                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => handleOptionSelect(poll.id, option.id, poll.allow_multiple)}
                                                        className={cn(
                                                            "flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-medium transition-all",
                                                            isSelected
                                                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                                                : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/60"
                                                        )}
                                                    >
                                                        <span>{option.option_text}</span>
                                                        <div
                                                            className={cn(
                                                                "flex size-4 items-center justify-center rounded-full border",
                                                                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                                                            )}
                                                        >
                                                            {isSelected && <div className="size-1.5 rounded-full bg-card" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Poll Meta */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Users className="size-3.5" />
                                                    {poll.total_votes} {t("polls.votesCount")}
                                                </span>
                                                {poll.expires_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3.5" />
                                                        {t("polls.expires")}: {new Date(poll.expires_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {poll.creator && (
                                                <span>
                                                    {t("polls.by")}: {poll.creator.name}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/10 px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            {can.manage && !isClosed && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleClosePoll(poll)}
                                                    className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                                >
                                                    <Lock className="mr-1 size-3.5" />
                                                    {t("polls.closeAction")}
                                                </Button>
                                            )}
                                            {can.manage && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteTarget(poll)}
                                                    className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>

                                        {!showResults && can.vote && (
                                            <Button
                                                size="sm"
                                                disabled={selectedForThis.length === 0}
                                                onClick={() => handleCastVote(poll)}
                                                className="gap-1.5 font-bold shadow-sm"
                                            >
                                                <Vote className="size-3.5" />
                                                {t("polls.submitVote")}
                                            </Button>
                                        )}
                                        {poll.has_voted && (
                                            <Badge variant="outline" className="gap-1 font-semibold text-primary">
                                                <CheckCircle2 className="size-3.5" />
                                                {t("polls.votedStatus")}
                                            </Badge>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {polls.total > polls.per_page && (
                    <Pagination
                        page={polls.current_page}
                        perPage={polls.per_page}
                        total={polls.total}
                        onPageChange={(page) =>
                            router.get(
                                route("polls.index"),
                                { ...filters, page },
                                { preserveState: true }
                            )
                        }
                    />
                )}
            </div>

            {/* Create Poll Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-md bg-card p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">{t("polls.createTitle")}</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {t("polls.createSubtitle")}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreatePoll} className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="poll-title" className="text-xs font-semibold">
                                {t("polls.formTitle")} *
                            </Label>
                            <Input
                                id="poll-title"
                                required
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData("title", e.target.value)}
                                placeholder="e.g. Annual Society Picnic Venue Selection"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="poll-desc" className="text-xs font-semibold">
                                {t("polls.formDescription")}
                            </Label>
                            <Input
                                id="poll-desc"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData("description", e.target.value)}
                                placeholder="Brief context or voting guidelines"
                                className="h-9 text-xs"
                            />
                        </div>

                        {/* Options dynamic list */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">{t("polls.formOptions")} *</Label>
                            {createForm.data.options.map((opt, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        required
                                        value={opt}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`${t("polls.optionPlaceholder")} ${index + 1}`}
                                        className="h-9 text-xs"
                                    />
                                    {createForm.data.options.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveOption(index)}
                                            className="size-8 p-0 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {createForm.data.options.length < 8 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddOption}
                                    className="h-8 w-full border-dashed text-xs font-semibold"
                                >
                                    <Plus className="mr-1 size-3.5" />
                                    {t("polls.addOption")}
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.allow_multiple}
                                    onChange={(e) => createForm.setData("allow_multiple", e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                                {t("polls.formMultiple")}
                            </label>
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.is_anonymous}
                                    onChange={(e) => createForm.setData("is_anonymous", e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                                {t("polls.formAnonymous")}
                            </label>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="poll-expires" className="text-xs font-semibold">
                                {t("polls.formExpires")}
                            </Label>
                            <Input
                                id="poll-expires"
                                type="date"
                                value={createForm.data.expires_at}
                                onChange={(e) => createForm.setData("expires_at", e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCreateOpen(false)}
                                disabled={createForm.processing}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={createForm.processing}
                                className="font-semibold shadow-sm"
                            >
                                {createForm.processing ? t("polls.creating") : t("polls.submitCreate")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete */}
            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t("polls.deleteConfirmTitle")}
                description={t("polls.deleteConfirmDesc")}
                confirmLabel={t("common.delete")}
                destructive
                onConfirm={handleDeletePoll}
            />
        </AppLayout>
    );
}
