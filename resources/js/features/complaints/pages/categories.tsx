import { Head, router, useForm, usePage } from "@inertiajs/react";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/app-layout";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import type { PageProps } from "@/types";

type Category = {
    id: number;
    uuid: string;
    name: string;
    complaints_count: number;
    created_at: string;
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

type CategoriesProps = {
    categories: Paginated<Category>;
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function ComplaintCategories() {
    const { categories, can } = usePage<PageProps<CategoriesProps>>().props;
    const [showCreate, setShowCreate] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    const createForm = useForm({ name: "" });
    const editForm = useForm({ name: "" });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route("complaint-categories.store"), {
            onSuccess: () => {
                setShowCreate(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        editForm.put(route("complaint-categories.update", editingCategory.id), {
            onSuccess: () => {
                setEditingCategory(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingCategory) return;
        router.delete(route("complaint-categories.destroy", deletingCategory.id), {
            onSuccess: () => setDeletingCategory(null),
        });
    };

    const openEdit = (cat: Category) => {
        setEditingCategory(cat);
        editForm.setData("name", cat.name);
    };

    return (
        <AppLayout>
            <Head title="Complaint Categories" />

            <PageHeader
                title="Complaint Categories"
                description="Manage complaint types and classifications."
                icon={<FolderOpen className="size-5" />}
                actions={
                    can.create && (
                        <Button onClick={() => setShowCreate(true)}>
                            <Plus className="size-4" />
                            Add Category
                        </Button>
                    )
                }
            />

            <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
                <CardContent className="p-0">
                    {categories.data.length === 0 ? (
                        <EmptyState
                            icon={FolderOpen}
                            title="No categories yet"
                            description="Create complaint categories to organize and classify issues."
                        />
                    ) : (
                        <div className="divide-y divide-border/50">
                            {categories.data.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <FolderOpen className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{cat.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {cat.complaints_count} complaint{cat.complaints_count !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="secondary" className="tabular-nums">
                                            {cat.complaints_count}
                                        </Badge>
                                        {can.update && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={() => openEdit(cat)}
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 text-destructive hover:text-destructive"
                                                onClick={() => setDeletingCategory(cat)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {categories.last_page > 1 && (
                        <Pagination
                            page={categories.current_page}
                            perPage={categories.per_page}
                            total={categories.total}
                            onPageChange={(next) =>
                                router.get(
                                    route("complaint-categories.index"),
                                    { page: next },
                                    { preserveState: true, replace: true },
                                )
                            }
                            noun="categories"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Create Drawer */}
            <FormDrawer
                open={showCreate}
                onOpenChange={(open) => !open && setShowCreate(false)}
                title="New Category"
                description="Add a new complaint classification."
                icon={<FolderOpen className="size-5" />}
                footer={
                    <>
                        <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="create-category-form" disabled={createForm.processing}>
                            Create
                        </Button>
                    </>
                }
            >
                <form id="create-category-form" onSubmit={handleCreate} className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <Label>Category Name *</Label>
                        <Input
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData("name", e.target.value)}
                            placeholder="e.g. Plumbing"
                            required
                        />
                        {createForm.errors.name && (
                            <p className="text-xs text-destructive">{createForm.errors.name}</p>
                        )}
                    </div>
                </form>
            </FormDrawer>

            {/* Edit Drawer */}
            <FormDrawer
                open={!!editingCategory}
                onOpenChange={(open) => !open && setEditingCategory(null)}
                title="Edit Category"
                description={`Rename "${editingCategory?.name ?? ""}".`}
                icon={<Pencil className="size-5" />}
                footer={
                    <>
                        <Button variant="outline" type="button" onClick={() => setEditingCategory(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="edit-category-form" disabled={editForm.processing}>
                            Save
                        </Button>
                    </>
                }
            >
                <form id="edit-category-form" onSubmit={handleEdit} className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <Label>Category Name *</Label>
                        <Input
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData("name", e.target.value)}
                            placeholder="Category name"
                            required
                        />
                        {editForm.errors.name && (
                            <p className="text-xs text-destructive">{editForm.errors.name}</p>
                        )}
                    </div>
                </form>
            </FormDrawer>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deletingCategory}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                title="Delete Category"
                description={`Are you sure you want to delete "${deletingCategory?.name}"? Categories with existing complaints cannot be deleted.`}
                destructive
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
