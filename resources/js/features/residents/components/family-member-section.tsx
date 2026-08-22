import { router, useForm } from "@inertiajs/react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import type { FamilyMember } from "@/features/residents/types";

type FamilyMemberForm = {
    name: string;
    relation: "Spouse" | "Child" | "Parent" | "Sibling" | "Other" | "";
    date_of_birth: string;
    gender: "Male" | "Female" | "Other" | "";
    phone: string;
    email: string;
    is_dependent: boolean;
};

const emptyForm: FamilyMemberForm = {
    name: "",
    relation: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    is_dependent: true,
};

const relations = ["Spouse", "Child", "Parent", "Sibling", "Other"] as const;
const genders = ["Male", "Female", "Other"] as const;

type Props = {
    residentUuid: string;
    members: FamilyMember[];
};

export function FamilyMemberSection({ residentUuid, members }: Props) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<FamilyMember | null>(null);
    const [deleting, setDeleting] = useState<FamilyMember | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FamilyMemberForm>(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        clearErrors();
        setOpen(true);
    };

    const openEdit = (member: FamilyMember) => {
        setEditing(member);
        setData("name", member.name);
        setData("relation", member.relation);
        setData("date_of_birth", member.date_of_birth ?? "");
        setData("gender", member.gender ?? "");
        setData("phone", member.phone ?? "");
        setData("email", member.email ?? "");
        setData("is_dependent", member.is_dependent);
        clearErrors();
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(
                route("residents.family-members.update", [
                    residentUuid,
                    editing.uuid,
                ]),
                {
                    onSuccess: () => {
                        reset();
                        setEditing(null);
                        setOpen(false);
                    },
                },
            );
        } else {
            post(route("residents.family-members.store", residentUuid), {
                onSuccess: () => {
                    reset();
                    clearErrors();
                    setOpen(false);
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deleting) return;
        setDeleteBusy(true);
        router.delete(
            route("residents.family-members.destroy", [
                residentUuid,
                deleting.uuid,
            ]),
            {
                preserveScroll: true,
                onFinish: () => setDeleteBusy(false),
                onSuccess: () => setDeleting(null),
            },
        );
    };

    return (
        <Card className="border-border/60 bg-background/70 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="size-5 text-brand" />
                        {t("residents.familyMembers")}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        {t("residents.familyMembersDescription")}
                    </CardDescription>
                </div>
                <Button
                    variant="emerald"
                    size="sm"
                    className="rounded-full px-4 text-xs font-semibold"
                    onClick={openCreate}
                >
                    <Plus className="size-3.5" />
                    {t("residents.addFamilyMember")}
                </Button>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title={t("residents.familyMembers")}
                        description={t("residents.familyMembersEmpty")}
                    />
                ) : (
                    <ul className="divide-y divide-border/60">
                        {members.map((member) => (
                            <li
                                key={member.id}
                                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {member.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {t(`residents.relation.${member.relation}`)}
                                        {member.is_dependent &&
                                            ` · ${t("residents.familyMemberIsDependent")}`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-full"
                                        onClick={() => openEdit(member)}
                                        aria-label={t("residents.editFamilyMember")}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleting(member)}
                                        aria-label={t("residents.editFamilyMember")}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>

            <FormDrawer
                open={open}
                onOpenChange={setOpen}
                title={
                    editing
                        ? t("residents.editFamilyMember")
                        : t("residents.addFamilyMember")
                }
                description={t("residents.familyMembersDescription")}
                icon={<Users className="size-5" />}
                isDirty={
                    JSON.stringify(data) !==
                    JSON.stringify(
                        editing
                            ? {
                                  name: editing.name,
                                  relation: editing.relation,
                                  date_of_birth: editing.date_of_birth ?? "",
                                  gender: editing.gender ?? "",
                                  phone: editing.phone ?? "",
                                  email: editing.email ?? "",
                                  is_dependent: editing.is_dependent,
                              }
                            : emptyForm,
                    )
                }
                footer={
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="emerald"
                            type="submit"
                            form="family-member-form"
                            disabled={processing}
                        >
                            {t("common.save")}
                        </Button>
                    </>
                }
            >
                <form
                    id="family-member-form"
                    onSubmit={submit}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <Label htmlFor="fm-name">
                            {t("residents.familyMemberName")}{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="fm-name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder={t("residents.familyMemberName")}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fm-relation">
                                {t("residents.familyMemberRelation")}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.relation}
                                onValueChange={(v) =>
                                    setData(
                                        "relation",
                                        v as FamilyMemberForm["relation"],
                                    )
                                }
                            >
                                <SelectTrigger id="fm-relation">
                                    <SelectValue
                                        placeholder={t(
                                            "residents.familyMemberRelation",
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {relations.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {t(`residents.relation.${r}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.relation && (
                                <p className="text-sm text-destructive">
                                    {errors.relation}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fm-gender">
                                {t("residents.familyMemberGender")}
                            </Label>
                            <Select
                                value={data.gender}
                                onValueChange={(v) =>
                                    setData(
                                        "gender",
                                        v as FamilyMemberForm["gender"],
                                    )
                                }
                            >
                                <SelectTrigger id="fm-gender">
                                    <SelectValue
                                        placeholder={t(
                                            "residents.familyMemberGender",
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {genders.map((g) => (
                                        <SelectItem key={g} value={g}>
                                            {t(`residents.relation.${g}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-destructive">
                                    {errors.gender}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fm-dob">
                            {t("residents.familyMemberDateOfBirth")}
                        </Label>
                        <Input
                            id="fm-dob"
                            type="date"
                            value={data.date_of_birth}
                            onChange={(e) =>
                                setData("date_of_birth", e.target.value)
                            }
                        />
                        {errors.date_of_birth && (
                            <p className="text-sm text-destructive">
                                {errors.date_of_birth}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fm-phone">
                                {t("residents.familyMemberPhone")}
                            </Label>
                            <Input
                                id="fm-phone"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder={t("residents.familyMemberPhone")}
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fm-email">
                                {t("residents.familyMemberEmail")}
                            </Label>
                            <Input
                                id="fm-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                placeholder={t("residents.familyMemberEmail")}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/25 p-3">
                        <Checkbox
                            checked={data.is_dependent}
                            onCheckedChange={(c) =>
                                setData("is_dependent", Boolean(c))
                            }
                            className="mt-0.5"
                        />
                        <span className="text-sm">
                            <span className="font-medium">
                                {t("residents.familyMemberIsDependent")}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                {t("residents.familyMemberDependentHint")}
                            </span>
                        </span>
                    </label>
                </form>
            </FormDrawer>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(o) => !o && setDeleting(null)}
                title={t("residents.editFamilyMember")}
                description={t("residents.confirmRemoveDescription")}
                confirmLabel={t("common.delete")}
                cancelLabel={t("common.cancel")}
                destructive
                loading={deleteBusy}
                onConfirm={confirmDelete}
            />
        </Card>
    );
}
