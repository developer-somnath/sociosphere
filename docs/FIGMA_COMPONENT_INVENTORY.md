# SocioSphere — Figma Component Inventory Checklist

**Purpose:** A 1:1 mapping between the design system defined in `UI_UX_DESIGN_BLUEPRINT.md` and the components in the codebase (`resources/js/components`). Use this to build the Figma library and to track design → code parity. **Status legend:** ✅ built · 🟡 partial · ⬜ not built.

## 1. Primitives (base layer)

| Component | Figma status | Code status | Location / notes |
|---|---|---|---|
| Button (7 variants) | ⬜ | 🟡 | `ui/button.tsx` — added `destructive-solid`, `destructive-ghost`, `loading` prop |
| Input | ⬜ | ✅ | `ui/input.tsx` |
| Textarea | ⬜ | ⬜ | Build from input tokens |
| Select (native) | ⬜ | ⬜ | Build — combobox variant later |
| Combobox (searchable select) | ⬜ | ⬜ | Blueprint §4.10 |
| Checkbox | ⬜ | ✅ | `ui/checkbox.tsx` |
| Radio | ⬜ | ⬜ | Build |
| Switch | ⬜ | ⬜ | Blueprint §4.10 (Radix Switch) |
| Label | ⬜ | ✅ | `ui/label.tsx` |
| Badge / Chip (9 variants) | ⬜ | 🟡 | `ui/badge.tsx` — added `brand`, `success`, `warning`, `info` |
| Avatar (+ stack, status dot) | ⬜ | 🟡 | `ui/avatar.tsx` — stack/dot variants missing |
| Card (surface, hover) | ⬜ | ✅ | `ui/card.tsx` |
| Separator | ⬜ | ✅ | `ui/separator.tsx` |
| Skeleton | ⬜ | ✅ | `ui/skeleton.tsx` |
| Tooltip | ⬜ | ✅ | `ui/tooltip.tsx` |

## 2. Feedback & state

| Component | Figma status | Code status | Location / notes |
|---|---|---|---|
| Alert (4 variants) | ⬜ | 🟡 | Partial — audit existing usage |
| Toast (4 variants + action) | ⬜ | ✅ | `ui/toaster.tsx` + `lib/toast.ts` + `app/flash-toaster.tsx` bridge |
| ConfirmDialog (destructive, typed-confirm) | ⬜ | ✅ | `ui/confirm-dialog.tsx` |
| EmptyState | ⬜ | ✅ | `ui/empty-state.tsx` |
| Loading bar (Inertia progress) | ⬜ | ✅ | `app/page-loading-indicator.tsx` |
| Skeleton rows / charts | ⬜ | 🟡 | Extend `ui/skeleton.tsx` |
| Unsaved-changes guard | ⬜ | ✅ | `hooks/use-unsaved-changes.ts` |

## 3. Navigation & shell

| Component | Figma status | Code status | Location / notes |
|---|---|---|---|
| Sidebar (collapsible, group nav) | ⬜ | ✅ | `ui/sidebar.tsx` + `app/app-sidebar.tsx` |
| Topbar | ⬜ | ✅ | `layouts/app-layout.tsx` |
| Breadcrumb | ⬜ | 🟡 | Inside `app/page-header.tsx` |
| Command palette (⌘K) | ⬜ | ✅ | `app/command-palette.tsx` |
| Notification center | ⬜ | ⬜ | Bell button placeholder in layout |
| Theme toggle (light/dark/system) | ⬜ | ✅ | `theme/theme-switcher.tsx` |
| User menu | ⬜ | ✅ | In `app-layout.tsx` (dropdown) |
| Mobile nav sheet | ⬜ | ✅ | Sidebar sheet behavior |

## 4. Data display

| Component | Figma status | Code status | Location / notes |
|---|---|---|---|
| DataTable (sort, selection, sticky header) | ⬜ | 🟡 | `ui/data-table.tsx` — primitives exist; sorting/selection/column-visibility to build |
| DataTableSkeleton | ⬜ | ✅ | `ui/data-table.tsx` |
| DataTablePagination | ⬜ | ✅ | `ui/data-table.tsx` |
| FilterBar (search + chips + reset) | ⬜ | ✅ | `ui/filter-bar.tsx` |
| StatCard / KPI | ⬜ | ✅ | `ui/metric-card.tsx` |
| ProgressBar (occupancy, storage) | ⬜ | ⬜ | Build |
| ChartCard wrapper | ⬜ | ⬜ | Build over Recharts |
| PageHeader | ⬜ | ✅ | `app/page-header.tsx` |

## 5. Overlays

| Component | Figma status | Code status | Location / notes |
|---|---|---|---|
| Dialog (modal) | ⬜ | 🟡 | Audit — `form-drawer.tsx` exists; generic Dialog check |
| Drawer / Sheet (forms, details) | ⬜ | ✅ | `ui/form-drawer.tsx`, `ui/sheet.tsx` |
| DropdownMenu | ⬜ | ✅ | `ui/dropdown-menu.tsx` |
| Popover | ⬜ | ⬜ | Build |
| Tabs (underline/pills/segmented) | ⬜ | ⬜ | Build |
| Date range picker | ⬜ | ⬜ | Build |
| Wizard/stepper | ⬜ | ⬜ | Blueprint §10.3 |

## 6. Forms

| Component | Figma status | Code status | Location / notes |
|---|---|---|---|
| FormSection (section header) | ⬜ | ✅ | `ui/form-section.tsx` |
| Field (label + control + helper + error) | ⬜ | 🟡 | Compose from label/input/badge; error pattern to formalize |
| Dynamic row list (add/remove) | ⬜ | ⬜ | Blueprint §10.1 |
| Phone input | ⬜ | ⬜ | Build |
| DatePicker | ⬜ | ⬜ | Build |
| File upload (logo, avatar) | ⬜ | ⬜ | Build |

## 7. Charts (Recharts)

| Chart | Figma status | Code status | Notes |
|---|---|---|---|
| Bar (stacked) — occupancy | ⬜ | ⬜ | Build with `--chart-*` tokens |
| Donut — parking | ⬜ | ⬜ | Build |
| Line — growth | ⬜ | ⬜ | Build |
| Sparkline — KPI deltas | ⬜ | ⬜ | Build |

## 8. Figma library structure (mirror of code)

```
SocioSphere Design System
├── Foundations
│   ├── Colors (brand/semantic/neutrals/charts, light+dark)
│   ├── Typography (Geist scale, tabular mono)
│   ├── Spacing (4px grid)
│   ├── Radius & Shadows
│   └── Icons (Lucide set)
├── Primitives (Section 1)
├── Components (Sections 2–5)
├── Patterns
│   ├── List page (header → filter → table → pagination)
│   ├── Detail page (header → tabs)
│   ├── Drawer form (sections → sticky footer)
│   └── Dashboard grid (KPI row → charts)
└── Data Visualization (Section 7)
```

## 9. Parity rule

A component is **done** only when: Figma frame exists with auto-layout, code component exists with matching token usage, and both share the exact same variant names (e.g. `variant=success|warning|info|brand` on Badge). Update this checklist after every design review.
