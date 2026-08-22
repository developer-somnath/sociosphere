import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    Download,
    File,
    FileText,
    FolderOpen,
    Globe,
    Lock,
    Pencil,
    Plus,
    Trash2,
    Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import type { PageProps } from "@/types";

type DocumentItem = {
    id: number;
    uuid: string;
    title: string;
    category: string | null;
    file_name: string;
    file_size: number;
    mime_type: string | null;
    is_public: boolean;
    created_at: string;
    uploader: { id: number; name: string } | null;
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
    public: number;
    total_size: number;
};

type IndexProps = {
    documents: Paginated<DocumentItem>;
    stats: Stats;
    categories: string[];
    filters: {
        search: string;
        category: string | null;
        sort_by: string | null;
        sort_dir: "asc" | "desc" | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

function formatBytes(bytes: number): string {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function DocumentsIndex() {
    const { documents, stats, categories, filters, can } = usePage<PageProps<IndexProps>>().props;
    const [search, setSearch] = useState(filters.search);
    const [category, setCategory] = useState<string>(filters.category ?? "");
    const [showUpload, setShowUpload] = useState(false);
    const [editing, setEditing] = useState<DocumentItem | null>(null);
    const [deleting, setDeleting] = useState<DocumentItem | null>(null);
    const isFirstRender = useRef(true);

    const uploadForm = useForm({
        title: "",
        category: "",
        file: null as File | null,
        is_public: false,
    });

    const editForm = useForm({
        title: "",
        category: "",
        file: null as File | null,
        is_public: false,
    });

    const buildParams = () => ({
        search: search.trim() || undefined,
        category: category !== "" ? category : undefined,
        sort_by: filters.sort_by ?? undefined,
        sort_dir: filters.sort_dir ?? undefined,
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                route("documents.index"),
                { ...buildParams(), page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, category]);

    const openEdit = (doc: DocumentItem) => {
        setEditing(doc);
        editForm.setData({
            title: doc.title,
            category: doc.category ?? "",
            file: null,
            is_public: doc.is_public,
        });
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(route("documents.store"), {
            forceFormData: true,
            onSuccess: () => {
                setShowUpload(false);
                uploadForm.reset();
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        editForm.put(route("documents.update", editing.uuid), {
            forceFormData: true,
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(route("documents.destroy", deleting.uuid), {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Document Repository" />

            <PageHeader
                title="Document Repository"
                description="Store and share society documents, forms, and important files securely."
                icon={<FolderOpen className="size-5" />}
                actions={
                    can.create && (
                        <Button onClick={() => setShowUpload(true)}>
                            <Plus className="size-4" />
                            Upload Document
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    label="Total Documents"
                    value={stats.total}
                    icon={FileText}
                    accent="border-info/20 bg-info/10 text-info dark:text-info"
                />
                <MetricCard
                    label="Public Documents"
                    value={stats.public}
                    icon={Globe}
                    accent="border-brand/20 bg-brand/10 text-brand dark:text-brand"
                />
                <MetricCard
                    label="Total Storage"
                    value={formatBytes(stats.total_size)}
                    icon={FolderOpen}
                    accent="border-info/20 bg-info/10 text-info dark:text-info"
                />
            </div>

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search document title or file name..."
                searchLabel="Search documents"
                className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]"
                onReset={() => {
                    setSearch("");
                    setCategory("");
                    router.get(route("documents.index"), {}, { preserveState: true, replace: true });
                }}
            >
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </FilterBar>

            {documents.data.length === 0 ? (
                <EmptyState
                    icon={FolderOpen}
                    title="No documents found"
                    description="No society documents match your filters yet."
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.data.map((doc) => (
                        <Card
                            key={doc.id}
                            className="flex flex-col justify-between border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] transition-all hover:border-border"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FileText className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <CardTitle className="truncate text-base">{doc.title}</CardTitle>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {doc.file_name} · {formatBytes(doc.file_size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={doc.is_public ? "success" : "secondary"}>
                                        {doc.is_public ? <Globe className="mr-1 size-3" /> : <Lock className="mr-1 size-3" />}
                                        {doc.is_public ? "Public" : "Private"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {doc.category && (
                                        <Badge variant="outline">{doc.category}</Badge>
                                    )}
                                    <span className="inline-flex h-5 items-center gap-1 rounded-4xl bg-muted/60 px-2 text-xs font-medium text-muted-foreground">
                                        <File className="size-3" />
                                        {doc.mime_type ?? "file"}
                                    </span>
                                </div>
                                <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                                    Uploaded by <strong className="text-foreground font-semibold">{doc.uploader?.name ?? "Society"}</strong> on {formatDate(doc.created_at)}
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between border-t border-border/50 pt-3">
                                <Button size="sm" variant="outline" asChild>
                                    <a href={route("documents.download", doc.uuid)}>
                                        <Download className="size-3.5" />
                                        Download
                                    </a>
                                </Button>
                                <div className="flex items-center gap-1.5">
                                    {can.update && (
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(doc)}>
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    )}
                                    {can.delete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleting(doc)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {documents.last_page > 1 && (
                <Pagination
                    page={documents.current_page}
                    perPage={documents.per_page}
                    total={documents.total}
                    onPageChange={(next) =>
                        router.get(
                            route("documents.index"),
                            { ...buildParams(), page: next },
                            { preserveState: true, replace: true },
                        )
                    }
                    noun="documents"
                />
            )}

            {/* Upload Drawer */}
            <FormDrawer
                open={showUpload}
                onOpenChange={(open) => !open && setShowUpload(false)}
                title="Upload Document"
                description="Add a new document to the society repository."
                icon={<Upload className="size-5" />}
                isDirty={uploadForm.isDirty}
                footer={
                    <>
                        <Button variant="outline" type="button" onClick={() => setShowUpload(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="upload-doc-form" disabled={uploadForm.processing}>
                            {uploadForm.processing ? "Uploading…" : "Upload"}
                        </Button>
                    </>
                }
            >
                <form id="upload-doc-form" onSubmit={handleUpload} className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                        <Label>Title *</Label>
                        <Input
                            value={uploadForm.data.title}
                            onChange={(e) => uploadForm.setData("title", e.target.value)}
                            placeholder="e.g. AGM Minutes — August 2026"
                            required
                        />
                        {uploadForm.errors.title && (
                            <p className="text-xs text-destructive">{uploadForm.errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Input
                            value={uploadForm.data.category}
                            onChange={(e) => uploadForm.setData("category", e.target.value)}
                            placeholder="e.g. Minutes, Policies, Forms"
                        />
                        {uploadForm.errors.category && (
                            <p className="text-xs text-destructive">{uploadForm.errors.category}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>File *</Label>
                        <Input
                            type="file"
                            onChange={(e) => uploadForm.setData("file", e.target.files?.[0] ?? null)}
                            className="h-auto py-1.5"
                            required
                        />
                        {uploadForm.errors.file && (
                            <p className="text-xs text-destructive">{uploadForm.errors.file}</p>
                        )}
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3">
                        <input
                            type="checkbox"
                            checked={uploadForm.data.is_public}
                            onChange={(e) => uploadForm.setData("is_public", e.target.checked)}
                            className="size-4 accent-primary"
                        />
                        <span className="text-sm font-medium">Make this document public to all residents</span>
                    </label>
                </form>
            </FormDrawer>

            {/* Edit Drawer */}
            <FormDrawer
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                title="Edit Document"
                description={`Update metadata for "${editing?.title}".`}
                icon={<Pencil className="size-5" />}
                isDirty={editForm.isDirty}
                footer={
                    <>
                        <Button variant="outline" type="button" onClick={() => setEditing(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="edit-doc-form" disabled={editForm.processing}>
                            {editForm.processing ? "Saving…" : "Save Changes"}
                        </Button>
                    </>
                }
            >
                <form id="edit-doc-form" onSubmit={handleUpdate} className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                        <Label>Title *</Label>
                        <Input
                            value={editForm.data.title}
                            onChange={(e) => editForm.setData("title", e.target.value)}
                            placeholder="Document title"
                            required
                        />
                        {editForm.errors.title && (
                            <p className="text-xs text-destructive">{editForm.errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Input
                            value={editForm.data.category}
                            onChange={(e) => editForm.setData("category", e.target.value)}
                            placeholder="e.g. Finance, Policies, Forms"
                        />
                        {editForm.errors.category && (
                            <p className="text-xs text-destructive">{editForm.errors.category}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Replace File (optional)</Label>
                        <Input
                            type="file"
                            onChange={(e) => editForm.setData("file", e.target.files?.[0] ?? null)}
                            className="h-auto py-1.5"
                        />
                        {editForm.errors.file && (
                            <p className="text-xs text-destructive">{editForm.errors.file}</p>
                        )}
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3">
                        <input
                            type="checkbox"
                            checked={editForm.data.is_public}
                            onChange={(e) => editForm.setData("is_public", e.target.checked)}
                            className="size-4 accent-primary"
                        />
                        <span className="text-sm font-medium">Make this document public to all residents</span>
                    </label>
                </form>
            </FormDrawer>

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete Document"
                description={`Are you sure you want to delete "${deleting?.title}"? The file will be permanently removed.`}
                destructive
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}