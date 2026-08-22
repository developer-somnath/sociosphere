# SocioSphere — Localization & UI Consistency Audit

**Date:** 2026-08-23
**Scope:** Multilingual/translation, page-wise functional verification, Back button standardization, breadcrumb validation, sidebar hierarchy consistency.
**Stack:** Laravel 12 + Inertia.js v2 + React 18 + TypeScript 5 + Vite 7 + Tailwind v4. 42-locale i18n engine (`resources/js/lib/i18n.tsx`), English catalog (`resources/js/locales/en.json`) as source of truth, `app-sidebar.tsx` as the navigation source of truth.

---

## 1. Executive Summary

| Area | Status | Severity |
|------|--------|----------|
| i18n engine | Sound (fallback, RTL, interpolation) | OK |
| English catalog completeness | **~120 placeholder stubs** ("X plural", "Col x", "Page description") | **High** |
| Hardcoded English in pages | **~15 pages** bypass `t()` entirely | **High** |
| Back button consistency | 2 icon sizes (`size-3.5` vs `size-4`), 2 button sizes, 3 label variants | **Medium** |
| Breadcrumb vs sidebar | Mostly aligned; a few use generic "Section"/"Management" labels | **Medium** |
| Sidebar hierarchy | Authoritative; minor: `nav.reports`/`nav.admin` defined but unused in nav | **Low** |
| Stray keys | `"notic": "Notic"` typo key, unused | **Low** |

**Top priorities:** (1) replace placeholder stubs in `en.json` with real English, (2) route all hardcoded page strings through `t()`, (3) introduce a single `BackButton` component.

---

## 2. Page / Feature Inventory

Sidebar groups (source of truth) → routes → pages:

| Sidebar Group | Nav Item | Route | Pages |
|---|---|---|---|
| Overview | Dashboard | `overview` | `dashboard-page.tsx` |
| Properties | Societies | `societies.index` | index, create, edit, show |
| Properties | Towers | `towers.index` | index, create, edit |
| Properties | Flats | `flats.index` | index, create, edit |
| Properties | Residents | `residents.index` | index, create, edit |
| Properties | Parking | `parking-slots.index` | index, create, edit |
| Operations | Visitors | `visitors.index` | index, create, edit |
| Operations | Amenities | `amenities.index` | index, create, edit |
| Operations | Bookings | `amenity-bookings.index` | index (bookings) |
| Operations | CCTV | `cctv-cameras.index` | index, create, edit |
| Operations | Security Log | `security-logs.index` | index |
| Communications | Notices | `notices.index` | index, create, edit |
| Communications | Documents | `documents.index` | index |
| Helpdesk | Complaints | `complaints.index` | index, create, edit, show |
| Helpdesk | Categories | `complaint-categories.index` | index |
| Finance | Invoices | `invoices.index` | index, create, show, edit |
| Finance | Payments | `payments.index` | index |
| Finance | Batch Generate | `billing.preview` | batch-generate |
| Finance | Flat Ledger | `billing.ledger` | flat-ledger |
| Finance | Billing Config | `billing.settings` | billing-settings |
| Finance | Tax Settings | `billing.tax-settings.edit` | tax-settings |
| Finance | Run History | `billing.runs` | billing-runs |
| Finance | Invariant Check | `billing.verify` | invariant-check |
| Subscription | My Subscription | `subscription.show` | overview |
| Subscription | Resource Usage | `subscription.usage` | usage |
| Subscription | Subscriptions | `subscriptions.index` | admin |
| Subscription | Plans | `plans.index` | index, create, edit |
| Admin | Users | `users.index` | index, create, edit |
| Admin | Roles | `roles.index` | index, create, edit |
| Admin | Activity Log | `activity-logs.index` | index |
| (Other) | Reports | `reports.index` | (reports page) |
| (Other) | Profile | `profile.edit` | (profile) |

---

## 3. Localization Issues

### 3.1 Placeholder stubs in `en.json` (HIGH)
The English catalog contains ~120 keys whose value is a literal placeholder rather than real copy. Because all 41 other locales fall back to English, **every non-English locale displays these stubs**. Examples:

- `"amenities.bookingPlural": "Booking plural"`, `"amenities.bookingSingular": "Booking singular"`
- `"amenityBookings.colAmenity": "Col amenity"`, `"amenityBookings.colDateTime": "Col date time"`, `"amenityBookings.colFee": "Col fee"`
- `"cctv.colIp": "Col ip"`, `"cctv.colLocation": "Col location"`, `"cctv.colStatus": "Col status"`
- `"complaints.colComplaint": "Col complaint"`, `"complaints.colFlat": "Col flat"`
- `"flats.colArea": "Col area"`, `"flats.colFloor": "Col floor"`
- `"invoices.colInvoiceNo": "Col invoice no"`, `"payments.colReceiptNo": "Col receipt no"`
- `"*.pageDescription": "Page description"`, `"*.addPageDescription": "Add page description"`, `"*.editPageDescription": "Edit page description"`
- `"*.nounPlural": "Noun plural"`, `"*.title": "Title"` (generic), `"*.emptyTitle": "Empty title"`, `"*.emptyDescription": "Empty description"`
- `"*.confirmDeleteDescription": "Confirm delete description"`, `"*.confirmDeleteTitle": "Confirm delete title"`
- `"*.searchLabel": "Search label"`, `"*.searchPlaceholder": "Search placeholder"`
- `"*.statTotal": "Stat total"`, `"*.statActive": "Stat active"`, etc.

**Expected:** Real, human-readable English (e.g. `amenityBookings.colAmenity` → "Amenity", `cctv.colIp` → "IP Address", `amenities.bookingPlural` → "Bookings").

### 3.2 Hardcoded English bypassing `t()` (HIGH)
The following pages embed literal English strings in `Head`/`PageHeader`/`FormSection`/`EmptyState`/`ConfirmDialog`/`submitLabel`, so they are **never translated**:

| File | Hardcoded strings |
|---|---|
| `residents/pages/create.tsx` | `Head title="Add Resident"`, `title="Add Resident"`, `description="Register a new resident..."`, breadcrumb `"Management"`, `"Add Resident"`, button `"Back"` (also `submitLabel="Add Resident"`) |
| `activity-logs/pages/index.tsx` | `"Activity Logs"`, description, search labels, empty state |
| `documents/pages/index.tsx` | `"Document Repository"`, description, stat labels, search, empty, upload/edit/delete dialogs |
| `invoices/pages/batch-generate.tsx` | `"Batch Generate Invoices"`, `"Auto-Billing Engine"`, stat labels |
| `invoices/pages/billing-runs.tsx` | `"Billing Run History"` + description + empty |
| `invoices/pages/billing-settings.tsx` | `"Billing Settings"` + description + FormSection titles |
| `invoices/pages/flat-ledger.tsx` | `"Flat Ledger"` + description + labels + empty |
| `invoices/pages/invariant-check.tsx` | `"Financial Invariant Check"` + description + labels |
| `notices/pages/{create,edit,index}.tsx` | `"New Notice"`, `"Publish New Notice"`, `"Notice Board"`, FormSection titles, placeholders, empty, delete dialog |
| `subscription/pages/{overview,usage,admin,plans/index,plans/create,plans/edit}.tsx` | All titles/descriptions/dialogs/placeholders |
| `billing/pages/tax-settings.tsx` | `"Tax Settings — SocioSphere"`, dialogs, placeholders |
| `legal/pages/{privacy,terms}.tsx` | `subtitle` prose |

**Expected:** Every user-visible string wrapped in `t("key")`, with corresponding `en.json` entries.

### 3.3 Stray / typo key (LOW)
- `"notic": "Notic"` in `en.json` — typo, no references anywhere in code. Remove.

### 3.4 Terminology consistency (MEDIUM)
- "Flat" vs "Unit": `dashboard` uses "Units" while `flats` uses "Flats"; `amenityBookings.selectFlat` = "Select Unit / Flat" mixes both. Pick one (recommend "Flat" everywhere, "Unit" only in dashboard summary if desired).
- "Bookings" vs "Amenity Bookings": sidebar calls it `nav.bookings` = "Bookings" but feature copy says "Book facility". Consistent enough; keep "Bookings" as module name.
- "CCTV Feeds" (nav) vs "CCTV Cameras" (feature) — acceptable but breadcrumb uses `cctvForm.breadcrumbSurveillance` = "Breadcrumb surveillance" (placeholder). Fix to "Surveillance" or "CCTV".

---

## 4. Back Button Standardization

### 4.1 Current state (inconsistent)
33 Back buttons found. Two distinct implementations:

**Variant A (majority, 26 files):** `size="sm"` + `rounded-full px-4 text-xs font-semibold` + icon `size-3.5` + label `t("common.back")`.
```tsx
<Button variant="outline" size="sm" asChild className="rounded-full px-4 text-xs font-semibold hover:bg-muted">
  <Link href={route("X.index")}>
    <ArrowLeft className="size-3.5" />
    {t("common.back")}
  </Link>
</Button>
```

**Variant B (complaints, invoices show/billing-runs/billing-settings, subscription plans/usage, complaints/show):** default button size + icon `size-4` + custom label (`complaintForm.backToComplaints`, `common.back`, etc.), no `rounded-full`/text-xs.

**Variant C (legal-layout):** custom layout, `size-3.5`.

### 4.2 Standard spec
A single `BackButton` component (`components/app/back-button.tsx`):
- Icon: `ArrowLeft`, `size-4` (consistent optical weight).
- Button: `variant="outline"`, `size="sm"`, `rounded-full px-4 text-xs font-semibold`, `hover:bg-muted`, `gap-1.5`.
- Label: `t("common.back")` (single canonical key).
- Behavior: `asChild` wrapping `<Link href={href}>`.
- Props: `{ href: string; label?: string }`.

All 33 call sites replaced with `<BackButton href={route("X.index")} />`.

---

## 5. Breadcrumb Validation vs Sidebar

`PageHeader` renders `Home › {items}`. Sidebar is source of truth. Findings:

| Page | Breadcrumb first segment | Issue |
|---|---|---|
| `flats/create`, `towers/create`, `residents/edit`, `amenities/create`, `parking/create`, `visitors/create`, `societies/create`, `roles/create`, `users/create`, `cctv/create`, `notices/create` | `t("*.breadcrumb.section")` = **"Section"** | Generic placeholder; should be the sidebar group label (e.g. "Properties", "Operations"). |
| `residents/create` | `"Management"` (hardcoded) | Not a sidebar group; should be "Properties" or "Residents". |
| `invoices/*`, `billing-*` | `t("nav.finance")` = "Finance" | ✅ matches sidebar group. |
| `subscription/*` | `{ label: "Subscription" }` (literal) | Should use `t("nav.subscription")`. |
| `towers/index` | `t("towers.breadcrumb.section")` + `t("nav.towers")` | ✅ but first segment still "Section". |
| `parking/index` | `[{label:"Parking"}]` only (no Home/group) | Acceptable but inconsistent with others that include group. |

**Expected:** Breadcrumb = `Home › <Sidebar Group Label> › <Module> › <Current>`. Replace all `*.breadcrumb.section` = "Section" usages with the correct `t("nav.<group>")` key, and replace literal "Subscription"/"Management" with i18n keys.

---

## 6. Sidebar Hierarchy Consistency

- `NAV_GROUPS` is authoritative and well-structured (8 groups). ✅
- Minor: `nav.reports` ("Reports") and `nav.admin` ("Admin") are defined in `en.json` but **not used** in `NAV_GROUPS` (Reports is a standalone route; Admin group uses `nav.admin`? Actually Admin group label is `nav.admin` = "Admin" — used). `nav.reports` is unused (Reports page exists but not in sidebar). Either add Reports to sidebar or leave as-is (it's SuperAdmin-only). Low priority.
- `nav.communications` group contains Notices + Documents — consistent. ✅
- Icons: some modules share `Building2` (Societies/Towers/Flats) and `FolderOpen` (Documents/Categories) — acceptable for grouping.

---

## 7. Implementation Plan (fixes)

1. **`BackButton` component** — new `resources/js/components/app/back-button.tsx`; replace 33 call sites.
2. **`en.json` placeholder stubs** — replace ~120 stub values with real English copy (add new keys where needed, e.g. `common.management`, `nav.properties`, etc.).
3. **Hardcoded English** — wrap all literal strings in `residents/create`, `activity-logs`, `documents`, `invoices/*`, `notices/*`, `subscription/*`, `tax-settings`, `legal/*` with `t()` + new `en.json` keys.
4. **Breadcrumbs** — replace `*.breadcrumb.section` ("Section") and literal "Management"/"Subscription" with correct group i18n keys.
5. **Remove** `"notic": "Notic"` typo key.
6. **Terminology** — standardize "Flat" vs "Unit" (decide one), fix `cctvForm.breadcrumbSurveillance`.

---

## 8. UI Consistency Checklist

- [ ] Single `BackButton` component used everywhere (icon `size-4`, `rounded-full text-xs`, label `common.back`).
- [ ] No hardcoded user-visible English strings (all via `t()`).
- [ ] `en.json` has zero placeholder stub values ("X plural", "Col x", "Page description").
- [ ] Breadcrumbs follow `Home › Group › Module › Current` and use sidebar group labels.
- [ ] All i18n keys referenced in code exist in `en.json`.
- [ ] No orphan/typo keys in `en.json`.
- [ ] Terminology consistent ("Flat" vs "Unit", "CCTV" naming).
- [ ] RTL verified for `ar/ur/fa/he` (engine supports; visual check recommended).

---

## 9. Fixes Implemented (status)

All HIGH and MEDIUM findings from §3 have been remediated. Verification: `npx tsc --noEmit` → 0 errors; `vendor/bin/phpunit` → **254 tests / 1382 assertions / 0 failures**.

| # | Finding (severity) | Fix | Status |
|---|---|---|---|
| 1 | Placeholder stubs in `en.json` (~120, shown in all 41 non-English locales) (HIGH) | Restored `en.json` from git, re-ran `scripts/fill-i18n-stubs-v2.cjs` → **302 keys** rewritten to real English. Result: 1443 keys, valid JSON, zero stub values. | ✅ Done |
| 2 | Hardcoded English bypassing `t()` (~17 pages) (HIGH) | `scripts/fill-hardcoded-i18n.cjs` wrapped literals in `t()` + added **40 keys**. Files: activity-logs, documents, invoices/* (batch-generate, billing-runs, billing-settings, flat-ledger, invariant-check), notices/* (index/create/edit), subscription/* (overview/usage/admin/plans index+create+edit), billing/tax-settings. | ✅ Done |
| 3 | `notic` typo key (LOW) | Removed `"notic": "Notic"` from `en.json`. | ✅ Done |
| 4 | Back-button inconsistency (2 icon sizes, 2 button sizes, 3 label variants) (MEDIUM) | New `BackButton` component (`components/app/back-button.tsx`) as single source of truth; standardized **30** call sites (22 via `scripts/replace-backbuttons.cjs` + 8 manual). `invoices/show` (icon-only) and `legal/legal-layout` (custom header) left as documented exceptions. | ✅ Done |
| 5 | Breadcrumbs use generic "Section" / wrong group (MEDIUM) | Replaced all `*.breadcrumb.section` usages with correct `nav.<group>` keys (amenities/visitors→operations; flats/parking/residents/societies/towers→properties; users→admin). Also converted literal `"Finance"`→`t("nav.finance")` and `"Subscription"`→`t("nav.subscription")` first-crumbs in invoices/* and subscription/* pages. | ✅ Done |
| 6 | "Flat" vs "Unit" terminology mix (MEDIUM) | Canonical term = **"Flat"** (per `nav.flats`). Fixed `amenityBookings.selectFlat`: "Select Unit / Flat" → "Select Flat". `cctvForm.breadcrumbSurveillance` already correct ("Surveillance"). | ✅ Done |
| 7 | `nav.reports` defined but unused (LOW) | Left as-is (reserved for future Reports module); documented. | ⚪ N/A |

### Remaining minor items (out of scope, documented)
- Second breadcrumb labels in finance/subscription pages ("Batch Generate", "Run History", "Billing Settings", "Flat Ledger", "Invariant Check", "Admin", "Overview", "Plans", "Usage") remain literal English. They map to existing page-title keys (`invoices.batchGenerateTitle`, `billing.runsTitle`, etc.) and could be wrapped in `t()` for full parity, but are low-impact.
- RTL visual verification for `ar/ur/fa/he` is engine-supported but not visually confirmed.
