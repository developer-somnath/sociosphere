/**
 * SocioSphere Enterprise Role-Driven Adaptive Widget Registry
 */

import {
    AlertCircle,
    Building2,
    CalendarDays,
    Car,
    CreditCard,
    DoorOpen,
    Megaphone,
    Plus,
    ReceiptText,
    ShieldAlert,
    Sparkles,
    Users,
    type LucideIcon,
} from "lucide-react";

export type WidgetSize = "small" | "medium" | "large" | "full";

export type DashboardWidgetConfig = {
    id: string;
    title: string;
    description?: string;
    permission?: string;
    roles?: string[];
    priority: number;
    size: WidgetSize;
};

export type QuickActionItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
    permission?: string;
    roles?: string[];
    variant: "teal" | "rose" | "amber" | "indigo" | "purple" | "blue";
};

/* ─── Global Quick Actions Registry ─────────────────────────────────────── */

export const QUICK_ACTIONS_REGISTRY: QuickActionItem[] = [
    {
        id: "add-tower",
        label: "New Tower",
        icon: Building2,
        href: "/towers/create",
        permission: "tower.create",
        roles: ["SuperAdmin", "SocietyAdmin", "SocietyManager"],
        variant: "indigo",
    },
    {
        id: "add-flat",
        label: "New Flat",
        icon: Plus,
        href: "/flats/create",
        permission: "flat.create",
        roles: ["SuperAdmin", "SocietyAdmin", "SocietyManager"],
        variant: "teal",
    },
    {
        id: "add-resident",
        label: "Add Resident",
        icon: Users,
        href: "/residents/create",
        permission: "resident.create",
        roles: ["SuperAdmin", "SocietyAdmin", "SocietyManager"],
        variant: "teal",
    },
    {
        id: "issue-invoice",
        label: "Issue Invoice",
        icon: ReceiptText,
        href: "/invoices/create",
        permission: "invoice.create",
        roles: ["SuperAdmin", "SocietyAdmin", "Accountant"],
        variant: "rose",
    },
    {
        id: "allocate-parking",
        label: "Allocate Parking",
        icon: Car,
        href: "/parking-slots/create",
        permission: "parking.create",
        roles: ["SuperAdmin", "SocietyAdmin", "SocietyManager"],
        variant: "amber",
    },
    {
        id: "raise-complaint",
        label: "Raise Complaint",
        icon: AlertCircle,
        href: "/complaints/create",
        permission: "complaint.create",
        roles: ["SuperAdmin", "SocietyAdmin", "SocietyManager", "Resident", "HelpdeskExecutive"],
        variant: "amber",
    },
    {
        id: "book-facility",
        label: "Book Facility",
        icon: Sparkles,
        href: "/amenity-bookings",
        permission: "amenity.book",
        roles: ["SuperAdmin", "SocietyAdmin", "Resident"],
        variant: "purple",
    },
    {
        id: "log-visitor",
        label: "Create Visitor Pass",
        icon: DoorOpen,
        href: "/visitors",
        permission: "visitor.create",
        roles: ["SecurityGuard", "SecurityManager", "Resident", "SocietyAdmin"],
        variant: "blue",
    },
    {
        id: "emergency-sos",
        label: "Emergency Alert",
        icon: ShieldAlert,
        href: "/security-logs",
        roles: ["SecurityGuard", "SecurityManager", "Resident"],
        variant: "rose",
    },
];

/**
 * Filter quick actions by user roles and permissions
 */
export function getFilteredQuickActions(userRoles: string[], userPermissions: string[]): QuickActionItem[] {
    const isSuperAdmin = userRoles.includes("SuperAdmin");

    return QUICK_ACTIONS_REGISTRY.filter((action) => {
        if (isSuperAdmin) return true;

        if (action.roles && action.roles.length > 0) {
            const hasRole = action.roles.some((r) => userRoles.includes(r));
            if (!hasRole) return false;
        }

        if (action.permission) {
            return userPermissions.includes(action.permission);
        }

        return true;
    });
}
