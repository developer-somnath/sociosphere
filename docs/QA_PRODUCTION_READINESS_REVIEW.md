# SocioSphere — Production Readiness QA Review

**Prepared by:** Principal QA Architect / Senior Test Engineer / Product Manager / UX Review Lead
**Date:** 2026-08-22
**Method:** Read-only, code-verified cross-reference of `docs/`, `routes/`, `app/`, `resources/js/`, `database/`. No code modified.
**Important caveat:** The application could not be executed live (no DB/seed run in this environment). Dynamic behaviors (rendering, click-through, real push delivery) are assessed from **code wiring**, not runtime. Findings are evidence-based from source.

---

## 0. Source-of-Truth Reconciliation (read this first)

The three documents disagree with each other, and one is materially wrong about the actual code:

| Document | Claims | Verdict vs actual code |
|---|---|---|
| `ARCHITECTURE_AND_ROADMAP.md` (v5.5.0, Aug 22) | 81.8% complete; Phases 18/19/21–22 done | **Mostly accurate** on scope, but overstates readiness (Tax UI is broken — see F-01) |
| `mdr_roadmap_architecture_and_pwa_audit.md` (v2.7.0, Aug 11) | 72.7% complete; Phases 18/19/21–22 planned | **Outdated** — those phases are now implemented in code |
| `PRODUCT_ANALYSIS_REPORT.md` (Aug 22) | "Broken transitional working tree", "~37 routes missing / only 8 modules routable", "94 hardcoded colors in 52 files", "missing Select/Dialog/FilterDrawer/Chart primitives", "raw `<table>` in residents/users/visitors/flats", "7 files use `window.confirm`" | **Largely INACCURATE** against the real tree (see §0.1) |

### 0.1 Corrections to `PRODUCT_ANALYSIS_REPORT.md` (verified by grep)
- **Route regression = FALSE.** `routes/web.php` is fully populated with ~30 modules (societies, towers, flats, users, roles, visitors, parking, cctv, security-logs, invoices, payments, billing*, subscription, plans, complaints, amenities, notices, documents, activity-logs, residents, family-members, vehicles, reports, push). `git status` shows a **clean** tree on branch `shadcn-ui`.
- **94 hardcoded colors = FALSE.** Grep for raw `bg-{color}-600/500` across `resources/js/**` returns **1** hit (`accent-emerald-600` in `role-form.tsx`). The codebase uses theme tokens (`bg-primary`, `bg-destructive/10`, `text-muted-foreground`, etc.).
- **Missing primitives = FALSE.** `components/ui/` contains `select.tsx`, `dialog.tsx`, `filter-drawer.tsx`, `confirm-dialog.tsx`, `chart.tsx`, `data-table.tsx`, `page-header` (in `components/app/`), `empty-state.tsx`, `form-drawer.tsx`.
- **Raw `<table>` in 4 modules = FALSE.** `residents`, `users`, `visitors`, `flats` index pages all import and use `DataTableFull` (15 modules use it). Raw `<table>` appears only in **detail/preview** sub-views (`invoices/show`, `batch-generate`, `billing-runs`, `subscription/admin`) — acceptable for read-only detail layouts.
- **7 `window.confirm` = FALSE.** Exactly **1** occurrence (`tax-settings.tsx` delete-rate).

### 0.2 Premise correction
The brief states *"The Builder module design is the design standard."* **No `Builder` module exists** anywhere in the codebase. The actual, consistently-applied design standard is the `ui/` primitive library (`PageHeader`, `FilterBar`, `DataTableFull`, `MetricCard`, `Card`, semantic `Badge`/`Button`, `FormDrawer`, `ConfirmDialog`, `Pagination`, `EmptyState`). This review uses that as the canonical standard.

### 0.3 Role model correction
The brief lists "Manager" as a role. The seeder creates **6 roles**: `SuperAdmin`, `SocietyAdmin`, `Treasurer`, `SecurityGuard`, `MaintenanceStaff`, `Resident`. There is **no Manager role**. (The sidebar/dashboard i18n maps also reference `societymanager`, `securitymanager`, `accountant`, `helpdesk`, `member` — none of which are seeded; see P-2-07.)

---

# 1. Executive Summary

**Overall product quality score: 7.2 / 10 (Production-Ready with 2 release-blocking defects).**

The engineering foundation is strong and far more complete than the Aug-22 gap report implies: multi-tenant isolation via `SocietyScope` + `society` middleware, Spatie RBAC enforced **twice** (route `permission:` middleware + controller `$this->authorize()` policies), a mature token-driven `ui/` library, Recharts dashboards, i18n, PWA scaffolding, and a reporting/export engine. The test suite is substantial (30+ Feature test files; `TaxEngineTest`, `SubscriptionTest`, `AutoBillingTest`, etc.).

**Major findings (release-relevant):**
1. **P0 — Tax Settings module is unreachable/dead.** `TaxSettingsController` (the Phase-15 Orca UI) is **never imported or routed** in `web.php`. The page `tax-settings.tsx` posts to `/billing/tax-settings` and `/billing/tax-settings/rates`, which **do not exist** → every save/add/delete on the Tax Settings screen 404s. The `TaxEngineService` logic exists and is tested, but the UI is non-functional. The `TaxEngineTest` references `route('billing.tax-settings.rates.store')` which is unregistered → that test fails.
2. **P0/P1 — Real-time push is not wired end-to-end.** `WebPushService` is defined but **never instantiated** (no `app(WebPushService::class)`, no controller/service calls it). There are **no Events, no Laravel Echo/websocket** wiring. Subscription capture works; **sending** does not. PWA (Phase 19) is installable-shell-only.
3. **P1 — Button variant explosion.** `button.tsx` ships 9 color variants (emerald/blue/indigo/teal/purple/amber/rose/gradient) that contradict the "one unified language" mandate and are still used (e.g. `push-notifications-card` `variant="emerald"`).
4. **P2 — Orphan permissions & i18n role drift** (seeded perms never used; sidebar maps reference un-seeded roles).

**Bottom line:** The app is navigable and the majority of modules are functional and consistent. Two genuine blockers (Tax UI routing, push send-side) must be fixed before the "Phases 18/19/21–22 complete" claim is defensible. The Aug-22 gap report should be retracted/corrected.

---

# 2. Requirement Coverage Matrix

Legend: ✅ Implemented · 🟡 Partial · ❌ Missing · ⚠️ Incorrect/Broken

| # | Feature | Document (Phase) | Implemented | Status |
|---|---|---|---|---|
| 1 | Multi-tenant property core (Society/Tower/Flat) | Falcon (1–3) | CRUD + soft-delete + restore + tenant scope | ✅ |
| 2 | Resident management + FamilyMember + Vehicle | Wolf (5) | CRUD + ownership/occupancy + family/vehicle sub-resources | ✅ |
| 3 | Visitor passes (QR, approve/reject/check-in/out) | Panther (6) | Full workflow + routes + policies | ✅ |
| 4 | CCTV list + Security logbook | Panther (7) | List + DataTableFull; **no live grid viewer** | 🟡 |
| 5 | Maintenance & billing (Invoice/Item/Payment) | Wolf/Cheetah (9) | CRUD + ledger + receipts | ✅ |
| 6 | Auto-billing engine (Phase 13) | Cheetah (17) | `BillingService` + `GenerateMonthlyInvoicesJob` + preview/run/runs/verify | ✅ |
| 7 | Overdue penalty job | Cheetah (17) | `CalculateOverduePenaltiesJob` scheduled 02:00 | ✅ |
| 8 | Complaint state machine + categories | Wolf (10) | Status transitions + assign + policies | ✅ |
| 9 | Amenity + booking + conflict locks | Wolf (11) | Booking approve/reject/cancel; **no refund flow** | 🟡 |
| 10 | Notice board + documents | Tiger (13) | CRUD + acknowledge + pin + download; **no galleries** | 🟡 |
| 11 | Global Tax Engine (GST/VAT/Sales Tax) | Orca (15) | `TaxEngineService` + tests ✅ BUT **UI unreachable** (F-01) | ⚠️ |
| 12 | SaaS subscription & entitlement (Eagle, 14) | Eagle (14) | Plans/usage/assign/cancel/resume + `SyncSubscriptionStatuses` | ✅ |
| 13 | Payment gateway abstraction (Phase 18) | Cheetah (18) | Contract + Manager + Razorpay + webhook + digital receipt | ✅ |
| 14 | PWA + WebPush (Phase 19) | Hawk (19) | Manifest + SW + subscribe/unsubscribe ✅; **send-side unwired** (F-02) | ⚠️ |
| 15 | Reporting engine + exports (Phases 21–22) | Cobra/Bison (21–22) | `ReportingService` + CSV/Excel/PDF + scheduled delivery | ✅ |
| 16 | i18n 42-locale + RTL | Tiger (12) | Catalogs + `SetLocale` + `LocaleController` | ✅ |
| 17 | Activity logs + auth audit | — | `ActivityLog` + `LogAuthActivity` listener | ✅ |
| 18 | RBAC (Spatie) | — | Route middleware + policies + 6 roles | ✅ |
| 19 | Dashboard analytics (Recharts) | Tiger (12) | MetricCards + **Recharts composition/snapshot cards** | ✅ |
| 20 | Emergency SOS / Polls / Events (Phase 20) | Cobra (20) | Not present in code | ❌ |
| 21 | CCTV quad/matrix HLS viewer | Panther (7) | Not present (`hls.js` is a dependency, unused) | ❌ |
| 22 | Amenity cancellation refunds | Wolf (11) | Not present | ❌ |
| 23 | Notice photo/attachment galleries | Tiger (13) | Not present | ❌ |

---

# 3. Functional Bug Report

### F-01 — Tax Settings module is unreachable (CRITICAL / P0)
- **Module:** Billing / Tax Engine (Phase 15 Orca)
- **Severity:** Critical
- **Steps to Reproduce:** Open sidebar → Finance → "Tax Settings" (`billing.settings`). Page renders `features/billing/pages/tax-settings.tsx`. Click "Save Profile" or "Add Rate" or delete a rate.
- **Expected:** Profile/rate persisted.
- **Actual:** `tax-settings.tsx` calls `put("/billing/tax-settings")` and `rateForm.post("/billing/tax-settings/rates")` / `router.delete("/billing/tax-settings/rates/{id}")`. `routes/web.php` registers `billing.settings` → `BillingController::settings` (which renders `billing-settings.tsx`, a *different* screen for `SocietyBillingConfig`). **`TaxSettingsController` is never imported in `web.php` and no `billing/tax-settings*` routes exist** → all three requests return 404.
- **Root Cause:** Route registration for `TaxSettingsController` (`edit`/`update`/`storeRate`/`updateRate`/`destroyRate`) was never added; the sidebar links `billing.settings` to the wrong controller; frontend URLs were written against an intended-but-absent route set. `TaxEngineTest` even asserts `route('billing.tax-settings.rates.store')` which is unregistered → that test fails.
- **Recommended Fix:** Add routes in `web.php`:
  ```php
  Route::get('billing/tax-settings', [TaxSettingsController::class,'edit'])->middleware('permission:billing.configure')->name('billing.tax-settings');
  Route::put('billing/tax-settings', [TaxSettingsController::class,'update'])->middleware('permission:billing.configure')->name('billing.tax-settings.update');
  Route::resource('billing/tax-settings/rates', TaxSettingsController::class)->only(['store','update','destroy'])->middleware('permission:billing.configure');
  ```
  Repoint sidebar `nav.billingSettings` to `billing.tax-settings` (or keep both but fix the Tax page's `route()` usage). Align `TaxEngineTest` route names.

### F-02 — WebPush send-side never invoked (CRITICAL / P0–P1)
- **Module:** PWA / Real-time (Phase 19 Hawk)
- **Severity:** High (P1 for "feature incomplete", P0 if "push notifications delivered" is a release criterion)
- **Steps:** Subscribe to push in PWA; trigger any server event intended to notify (e.g., notice published, complaint assigned).
- **Expected:** Push delivered to subscribed devices; badge updated.
- **Actual:** `WebPushService` exists but is **never constructed** (`grep` for `app(WebPushService` / `new WebPushService` returns only its own definition). No `Event` classes, no `Notification` broadcasting, no Laravel Echo/websocket client. `PushSubscriptionController` only persists/unsubscribes.
- **Root Cause:** Send-side integration was never wired (no service-provider binding, no event listeners, no controller calls).
- **Recommended Fix:** Bind `WebPushService` in a provider; dispatch notifications from domain events (notice created, complaint assigned, visitor approved) or add a `Notification` that uses it; add a feature test asserting `sendToUser` is called.

### F-03 — `confirm()` used instead of `ConfirmDialog` (LOW / P2)
- **Module:** Billing / Tax Settings
- **Severity:** Low
- **Steps:** Tax Settings → delete a rate rule.
- **Expected:** Themed, accessible `ConfirmDialog`.
- **Actual:** Native `confirm("Are you sure you want to delete this tax rate rule?")` (line 103). Also the rate-add form uses a hand-rolled `useState` modal rather than the existing `Dialog` primitive.
- **Root Cause:** Inconsistent with the design system.
- **Recommended Fix:** Replace with `ConfirmDialog`; use `Dialog` for the rate form.

### F-04 — Orphan permissions seeded but unused (LOW / P2)
- **Module:** RBAC
- **Severity:** Low
- **Steps:** Inspect `PermissionSeeder` + route/policy usage.
- **Expected:** Every seeded permission is referenced.
- **Actual:** `maintenance.view/create/update/delete`, `permission.view`, `permission.assign` are seeded but **no route or policy uses them** (no Maintenance module exists).
- **Root Cause:** Leftover from a planned Maintenance module.
- **Recommended Fix:** Remove or implement the Maintenance module; document intent.

### F-05 — Sidebar/dashboard reference un-seeded roles (LOW / P2)
- **Module:** i18n / RBAC UX
- **Severity:** Low
- **Steps:** Inspect `app-sidebar.tsx` `roleKey` and `dashboard-page.tsx` `roleKey`.
- **Expected:** Role keys map only to seeded roles.
- **Actual:** Maps include `societymanager`, `securitymanager`, `accountant`, `helpdesk`, `member` — none created by `RolePermissionSeeder`. A user with such a role would show "Member" fallback label.
- **Root Cause:** UI predates/diverges from seeder role set.
- **Recommended Fix:** Reconcile role vocabulary between seeder and UI, or seed the missing roles.

### F-06 — `billing.settings` route collides conceptually with Tax Settings (MEDIUM / P1)
- **Module:** Billing navigation
- **Severity:** Medium
- **Steps:** Sidebar "Billing Settings" → `billing.settings` → renders `billing-settings.tsx` (SocietyBillingConfig), NOT the tax profile.
- **Expected:** A single coherent Billing Settings area, or clearly separated entries.
- **Actual:** Two different "settings" concepts (billing config vs tax profile) with overlapping naming; the tax one is broken (F-01).
- **Root Cause:** Naming/route overlap.
- **Recommended Fix:** Rename to `billing.config` vs `billing.tax-settings` for clarity; fix F-01.

---

# 4. UI / UX Bug Report

> Standard = `ui/` primitive library. Verified by reading pages; no live render.

| # | Surface | Issue | Severity | Evidence |
|---|---|---|---|---|
| U-01 | `button.tsx` | 9 color-specific variants (emerald/blue/indigo/teal/purple/amber/rose/gradient) contradict "one unified language"; still used (`push-notifications-card` `variant="emerald"`) | Medium | `button.tsx` cva variants |
| U-02 | `tax-settings.tsx` | Hand-rolled `useState` modal + native `confirm()` instead of `Dialog`/`ConfirmDialog` | Low | lines 93, 103 |
| U-03 | `role-form.tsx` | Only raw color usage in codebase: `accent-emerald-600` checkbox | Low | line 205 |
| U-04 | Detail sub-views (`invoices/show`, `batch-generate`, `billing-runs`, `subscription/admin`) | Raw `<table>` markup (not `DataTableFull`) | Low | grep: 52 `<table>` matches in 4 files (all detail/preview, not list indexes) |
| U-05 | `tax-settings.tsx` | Page header hand-rolled (does not use `PageHeader` component) | Low | page structure |
| U-06 | Consistency (positive) | 15 list modules consistently use `DataTableFull` + `FilterBar` + `MetricCard` + `Card` + semantic `Badge` | — | grep DataTableFull (15 files) |
| U-07 | Typography/Spacing | Geist + `font-heading`, `rounded-3xl`/`rounded-2xl` card language consistent across modules | — | visual review of pages |
| U-08 | Responsiveness | `app-sidebar` uses collapsible `Sidebar` primitive; pages use `sm:`/`md:` breakpoints; no broken-grid evidence in code | — | `app-sidebar.tsx`, page grids |

**Note:** The Aug-22 report's claims of "94 raw colors / 52 files", "3 table paradigms in list pages", and "missing Select/Dialog" are **not supported** by the code. The real inconsistencies are narrow (U-01 to U-05).

---

# 5. Permission Audit

### 5.1 Roles (from `RolePermissionSeeder`)
`SuperAdmin` (all perms), `SocietyAdmin`, `Treasurer`, `SecurityGuard`, `MaintenanceStaff`, `Resident`.

### 5.2 Enforcement layers (verified)
- **Layer 1 — Route middleware:** Every protected route uses `->middleware('permission:x.view')` etc. (e.g., `societies.index` → `society.view`).
- **Layer 2 — Controller policies:** 26 controllers call `$this->authorize('viewAny'|'create'|'update'|'view'|'delete', Model::class)`; 25 `Policy` classes exist. Defense-in-depth confirmed.
- **Layer 3 — Tenant isolation:** `SocietyScope` + `society` middleware + `BelongsToSociety` scoping in queries (`ActivityLogController`, `ModuleQueryService`, `DashboardService`, `ReportingService`).

### 5.3 Menu ↔ permission ↔ role matrix (sidebar `app-sidebar.tsx`)
| Menu | Route | Permission | SuperAdmin | SocietyAdmin | Treasurer | SecurityGuard | MaintenanceStaff | Resident |
|---|---|---|---|---|---|---|---|---|
| Dashboard | overview | dashboard.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Societies | societies.index | society.view | ✅ | ✅(view only) | ❌ | ❌ | ❌ | ❌ |
| Towers | towers.index | tower.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Flats | flats.index | flat.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Residents | residents.index | resident.view | ✅ | ✅ | ✅(view) | ❌ | ❌ | ❌ |
| Parking | parking-slots.index | parking.view | ✅ | ✅ | ❌ | ✅(view) | ❌ | ❌ |
| Visitors | visitors.index | visitor.view | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Amenities | amenities.index | amenity.view | ✅ | ✅ | ❌ | ❌ | ❌ | ✅(view/book) |
| Bookings | amenity-bookings.index | amenity.view | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| CCTV | cctv-cameras.index | cctv.view | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Security Log | security-logs.index | security_log.view | ✅ | ✅ | ❌ | ✅(view/create) | ❌ | ❌ |
| Notices | notices.index | notice.view | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Documents | documents.index | document.view | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Complaints | complaints.index | complaint.view | ✅ | ✅ | ❌ | ❌ | ✅(view/update) | ✅(view/create) |
| Categories | complaint-categories.index | complaint.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Invoices | invoices.index | invoice.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅(view) |
| Payments | payments.index | collection.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Batch Generate | billing.preview | billing.configure | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Flat Ledger | billing.ledger | invoice.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅(view) |
| Billing Settings | billing.settings | billing.configure | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Run History | billing.runs | billing.configure | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invariant Check | billing.verify | billing.configure | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Subscription | subscription.show | subscription.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Usage | subscription.usage | usage.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Subscriptions Admin | subscriptions.index | subscription.assign | ✅(SuperAdmin only via `role:SuperAdmin`) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Plans | plans.index | plan.view | ✅(SuperAdmin only) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Users | users.index | user.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Roles | roles.index | role.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Activity Log | activity-logs.index | activity-log.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 5.4 Findings
- **Direct-URL access:** Blocked by both middleware + policy (403). Verified by `abort(403)` in `TaxSettingsController::updateRate/destroyRate` and policy checks.
- **API authorization:** Webhook `payments.webhook` is throttled + signature-verified (no auth middleware by design — correct for webhooks).
- **Gap:** `subscriptions.index`/`plans.*` are gated by `role:SuperAdmin` **and** `permission:subscription.assign`/`plan.view`. Since only SuperAdmin is seeded with those, the "platform admin" separation is enforced. Good.
- **Orphan perms** (F-04) don't grant anything (no route uses them) — low risk but dead config.

---

# 6. Real-Time Validation Report

| Capability | Status | Evidence |
|---|---|---|
| Push subscription capture | ✅ Works | `PushSubscriptionController::subscribe/unsubscribe`, `push.subscribe`/`push.unsubscribe` routes, `vapid_public_key` shared prop, `pwa.ts` |
| Push **delivery (send)** | ❌ Not wired | `WebPushService` defined but never instantiated; no caller anywhere in `app/` |
| Live updates / websockets | ❌ Absent | No Laravel Echo, no `pusher`, no `Broadcast::`/Event classes (only `Notification/NewVisitorPassRequest.php` exists, unused for push) |
| Toast messages | ✅ Present | `flash-toaster.tsx` + `toaster.tsx` consume Inertia shared `flash` props |
| Badge counters | 🟡 Partial | `notification-center.tsx` renders unread count from shared props; no server-push refresh (requires polling or websocket) |
| Refresh behaviour | 🟡 Manual | Inertia `router` visits; no auto-poll for notifications |
| State sync (multi-user) | ❌ Not real-time | Relies on navigation/reload; no broadcast |

**Verdict:** PWA is installable-shell + subscription capture only. The "Mobile Push Engine" (Hawk) is **not delivering notifications**. This is a P0/P1 gap if push is a release criterion.

---

# 7. Product Gap Review

### 7.1 Missing features (vs Roadmap)
- **Phase 20 — Emergency SOS / Polls / Events:** No code (brief mentions "emergency-sos" quick action key but no route/controller).
- **CCTV quad/matrix HLS viewer:** `hls.js` is a dependency but unused; only list view exists.
- **Amenity cancellation refunds:** `amenity-bookings.cancel` exists but no refund logic.
- **Notice photo/attachment galleries:** `Notice` has no gallery UI.
- **Real-time push delivery:** see F-02.

### 7.2 Wrong / broken implementation
- **Tax Settings UI (Phase 15):** Engine correct & tested, but UI unreachable (F-01) — effectively **broken**, not "Implemented".
- **Push (Phase 19):** Scaffolded, not functional end-to-end.

### 7.3 Technical debt
- Orphan permissions (F-04), un-seeded role references in UI (F-05), `button.tsx` variant explosion (U-01), `confirm()` usage (U-03/F-03), `tax-settings.tsx` hand-rolled modal (U-05), route/controller naming overlap (F-06).
- `PRODUCT_ANALYSIS_REPORT.md` (Aug 22) is misleading and should be corrected/retracted to avoid wrong release decisions.

### 7.4 Business impact
- Finance teams **cannot configure tax profiles** in production (F-01) → GST/VAT compliance feature is dead on arrival despite being a headline Phase-15 deliverable.
- No push notifications undermines the "Mobile Precision / Hawk" value prop and resident engagement (notices/complaints).
- Otherwise, core society-operations workflows (property, residents, visitors, billing, complaints, amenities, documents, subscription) are functional and RBAC-correct.

---

# 8. Prioritized Action Plan

### P0 — Release Blockers
- **P0-1** Fix Tax Settings routing (F-01): register `TaxSettingsController` routes; repoint sidebar; align `TaxEngineTest`. *(Owner: Backend)*
- **P0-2** Wire WebPush send-side (F-02): bind `WebPushService`, dispatch from domain events, add test. *(Owner: Backend)* — *only a blocker if push is a release criterion; otherwise P1.*

### P1 — High Priority
- **P1-1** Consolidate `Button` variants (U-01): keep semantic only; migrate `emerald` usages.
- **P1-2** Resolve `billing.settings` vs Tax Settings naming overlap (F-06).
- **P1-3** Implement CCTV HLS grid viewer (Phase 7) using existing `hls.js`.
- **P1-4** Implement Amenity cancellation refunds (revenue integrity).

### P2 — Enhancements
- **P2-1** Replace `confirm()` + hand-rolled modal in `tax-settings.tsx` with `ConfirmDialog`/`Dialog` (F-03/U-05).
- **P2-2** Remove orphan permissions (F-04) or build Maintenance module.
- **P2-3** Reconcile UI role vocabulary with seeder (F-05).
- **P2-4** Add Notice attachment galleries (Phase 13).
- **P2-5** Build Phase 20 (SOS/Polls/Events) if in scope.
- **P2-6** Retract/correct `PRODUCT_ANALYSIS_REPORT.md` (Aug 22) — its headline claims are false against the tree; re-baseline completion % after P0-1.
- **P2-7** Add CI guard: fail build if a `route()` name referenced in `resources/js` is unregistered (would have caught F-01).

---

*End of report. No files were modified during this analysis. Findings are evidence-based from static cross-reference; dynamic runtime behaviors were inferred from code wiring because the app was not executed in this environment.*
