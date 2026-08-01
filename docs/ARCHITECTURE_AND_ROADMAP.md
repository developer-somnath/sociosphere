# SocioSphere — Architecture Analysis & Execution Roadmap

> **Date:** 2026-08-01
> **Author:** Principal Architect review (verified against the actual codebase)
> **Stack:** Laravel 12 · PHP 8.2 · MySQL · React 18 · TypeScript · Inertia.js v2 · Tailwind v4 · Shadcn UI

---

## Table of Contents

1. [Current Architecture](#1-current-architecture)
2. [Existing Modules](#2-existing-modules)
3. [Gap Analysis](#3-gap-analysis)
4. [Phase-Wise Execution Plan](#4-phase-wise-execution-plan)

---

# 1. Current Architecture

## 1.1 Backend Architecture

**Framework:** Laravel 12 (PHP 8.2), MySQL, Redis/Predis available for cache & queues, `spatie/laravel-permission` for RBAC, `inertiajs/inertia-laravel` v2, Sanctum (installed, not yet used), Ziggy for route typing.

### Layer breakdown (as found)

| Layer | What exists | What is missing |
|---|---|---|
| **HTTP layer** | `App\Http\Controllers` (17 controllers), `App\Http\Middleware` (2), `App\Http\Requests` (1: `LoginRequest`) | Form Request validation classes for business modules; Policies; Resource classes |
| **Domain layer** | 12 Eloquent models in `App\Models` | Services layer (except new `ActivityLogger`), Observers, Actions, DTOs, Repositories (not required for this scale) |
| **Cross-cutting** | `Traits/HasPublicUuid`, `Traits/BelongsToSociety`, `Scopes/SocietyScope`, `app/helpers.php` | Activity logging (now added), Notifications, Audit trail, Global error handling |

### Multi-tenancy model (existing)

- `SocietyScope` (global scope) filters every `BelongsToSociety` model by `society_id`.
- `SocietyMiddleware` binds the current tenant: `app()->instance('society_id', $user->society_id)` for non-SuperAdmin users.
- `BelongsToSociety` auto-fills `society_id` on create via the `society_id()` helper.
- `User` belongs to a `Society`; `isSuperAdmin()` is a **broken check** — it reads `$this->role` (a string property that does not exist on the model; roles live in spatie's `roles` tables). It always returns `false`. This must be fixed.

### Dependency wiring

- `AppServiceProvider` — only `Vite::prefetch`.
- `ActivityLogServiceProvider` — **newly added** (singleton `ActivityLogger`).
- `bootstrap/providers.php` — now registers both providers.

## 1.2 Frontend Architecture

**Framework:** React 18 + TypeScript + Inertia.js v2 (CSR SPA rendered through the Laravel blade shell), Tailwind CSS v4, Shadcn UI (Radix primitives), `react-hook-form` + `zod` (installed, unused so far), `recharts` (installed, unused), `ziggy-js` (installed).

### Entry chain

```
public/index.php → app.blade.php (@routes, @vite) → resources/js/app.tsx → createInertiaApp
```

- `app.tsx` resolves pages from `resources/js/**/*.tsx` by component name (e.g. `Features/Dashboard/Pages/Dashboard`).
- `HandleInertiaRequests::share()` shares `auth.user` (id, uuid, name, email, role, society_id) and `auth.society` (id, uuid, name, registration_no).

### Existing components

- `components/ui/*` — shadcn primitives: button, card, input, badge, avatar, checkbox, dropdown-menu, label, separator, sheet, sidebar, skeleton, tooltip.
- `components/theme/*` — `theme-provider` (next-themes), `theme-switcher`.
- `features/auth/*` — `login-page`, `login-form`, `auth-layout`, `auth-branding`.
- `lib/utils.ts` — `cn()` helper.

### Known frontend build blockers (verified via `npm run build`)

1. `import.meta.env` is untyped → missing `resources/js/vite-env.d.ts`.
2. `window.axios` is untyped → missing global type declaration.
3. `@/hooks/use-mobile` is imported by `components/ui/sidebar.tsx` but **does not exist** → TS2307.
4. `app.blade.php` has a stale `@vite([... "resources/js/Pages/{$page['component']}.tsx"])` reference (pages live under `resources/js/features/...`, and the `Pages/` directory does not exist).

## 1.3 Data Flow

```
Browser (React) ── Inertia request ──► Laravel route ──► Controller ──► Eloquent (MySQL)
      ▲                                              │
      └───────── Inertia JSON page (props) ◄──────────┘
```

- No REST API: every interaction is a full Inertia request (server-rendered initial page, then JSON swaps).
- Validation errors, flash messages and pagination metadata flow back as props.
- Tenant filtering happens at the Eloquent layer via the global `SocietyScope`.

## 1.4 Routing Flow

- `routes/web.php` — guest redirect at `/`; authenticated group (`auth` + `society`): `/overview` (named `overview`), partial `property-units` resource (buggy — see issues), `/residents`.
- `routes/auth.php` — full Breeze auth (login, register, password reset, email verification, confirm password, logout).
- **Bug found & fixed:** all post-auth redirects referenced a non-existent `dashboard` route; now use `overview`. Logout controller method was commented out; restored.

## 1.5 Authentication Flow

- Breeze standard: `AuthenticatedSessionController::store` → `LoginRequest::authenticate()` (rate-limited, 5 attempts, lockout) → session regenerate → redirect `overview`.
- `RegisteredUserController` creates users, fires `Registered` event, logs in, redirects `overview`.
- Email verification & password reset endpoints present (Breeze), now redirecting correctly.

## 1.6 Authorization Flow

- **Current:** only `auth` and `society` middleware. `spatie/laravel-permission` is installed and seeded (`RoleSeeder`, `PermissionSeeder`, `RolePermissionSeeder`) and `User` uses `HasRoles`, but **no middleware, gates, or policies enforce permissions anywhere**.
- `User::isSuperAdmin()` is broken (reads non-existent `role` attribute).
- `HandleInertiaRequests` shares `auth.user.role` — but `role` is not an attribute; must come from spatie roles.

## 1.7 Component & Layout Hierarchy

```
app.tsx
└── ThemeProvider
    └── App (Inertia page)
        ├── Auth pages ── AuthLayout ── AuthBranding / LoginForm
        └── (Authenticated shell — DOES NOT EXIST YET — no AppLayout/SidebarLayout)
```

- No authenticated layout: `Sidebar` primitives exist but no app shell, no topbar, no navigation.

## 1.8 Database Relationship Diagram (textual)

```
societies 1 ── * users
societies 1 ── * towers 1 ── * flats 1 ── 1 residents
societies 1 ── * flats (via society_id, redundant w/ scope)
flats      1 ── * invoices 1 ── * invoice_items * ── 1 invoice_heads
invoices   1 ── * payments
flats      1 ── * complaints * ── 1 complaint_categories
residents  1 ── * complaints
users      1 ── * complaints (assigned_to)
users      1 ── * notices (created_by)
users      1 ── * invoices (generated_by)
societies 1 ── * activity_logs  * ── 1 users (causer)          [NEW]
```

All tables: `id` PK, `uuid` unique public key (route key via `HasPublicUuid`), `timestamps`; `societies`, `towers`, `flats`, `residents` have `softDeletes`.

---

# 2. Existing Modules

| # | Module | Current Status | Completion % | Issues | Dependencies |
|---|--------|---------------|--------------|--------|--------------|
| 1 | **Auth** (Breeze) | Working after stabilization fixes | 90% | Was broken (dashboard route, disabled logout); no activity logging of login/logout; no 2FA | spatie permission, mail |
| 2 | **Multi-tenant scoping** | Global scope + middleware | 60% | No `withoutGlobalScope` escape hatches documented; `society_id` missing on `activity_logs` for guests | — |
| 3 | **Dashboard** | Route only | 5% | **Page component `Features/Dashboard/Pages/Dashboard` does not exist** → renders nothing/404 | App shell |
| 4 | **Flats** | Backend partial; no UI pages | 30% | Validation keys mismatch model (`flat_number` vs `flat_no`, `floor` vs `floor_no`, `type` vs `flat_type`); route definition `"{flat}/edit"` inside `only([...])` is invalid; no policy; ILIKE (Postgres) on MySQL; global counts not tenant-scoped? (Flat::count uses scope, OK); no soft-delete restore | Tower |
| 5 | **Towers** | Model + migration only | 10% | No controller, no UI, no seeder | Society |
| 6 | **Residents** | Index only | 20% | Read-only list; no create/edit/delete/UI; `is_primary_contact` unmanaged | Flat |
| 7 | **Complaints** | Stub controller | 10% | All methods empty; no UI; no status workflow; no assignment | Flat, Resident, Category |
| 8 | **Complaint Categories** | Model + migration + seeder | 15% | No CRUD/UI | Society |
| 9 | **Notices** | Model + migration only | 10% | No controller/UI; publish window unenforced | Society |
| 10 | **Invoices** | Stub controller | 10% | No generation engine, no UI, no recurring logic | Flat, Heads |
| 11 | **Invoice Heads** | Model + migration only | 10% | No CRUD/UI | Society |
| 12 | **Invoice Items** | Model only | 5% | No controller | Invoice, Head |
| 13 | **Payments** | Stub controller | 10% | No capture flow, no reconciliation, no UI | Invoice |
| 14 | **Society** | Model + migration + seeder + stub controller | 20% | Stub CRUD, no UI | — |
| 15 | **Users / Staff** | Model + factory + seeders | 15% | No management UI, no invitations, no status toggle UI | Roles |
| 16 | **Roles & Permissions** | Tables + seeders + `HasRoles` | 20% | No UI, no middleware enforcement, `isSuperAdmin()` broken | spatie |
| 17 | **Activity Logs** | **Foundation implemented** (model, migration, service, trait, provider, test) | 15% | No UI, no auth filter, no export, no queueing yet | — |
| 18 | **UI Shell** | shadcn primitives present | 20% | No AppLayout, no nav, missing `hooks/use-mobile`, TS build broken | — |
| 19 | **Testing** | Breeze tests + 1 activity test | 15% | No business-module tests; ExampleTest was wrong (fixed) | — |

---

# 3. Gap Analysis

## 3.1 Missing CRUD / Business Logic
- [ ] Towers: full CRUD (controller, requests, UI, routes)
- [ ] Residents: create / edit / delete / restore / primary-contact toggle
- [ ] Complaints: full lifecycle (create, assign, status transitions, resolve, close, priority)
- [ ] Complaint Categories: CRUD
- [ ] Notices: CRUD + publish window enforcement + visibility rules
- [ ] Invoice Heads: CRUD
- [ ] Invoices: generation engine (per flat × month), recurring, penalties, due-date logic
- [ ] Payments: capture (UPI/card/cash/cheque), reference fields, reconciliation, invoice status auto-update
- [ ] Society: complete admin CRUD (name, registration, address, status)
- [ ] Users/Staff: management CRUD, invite flow, activate/deactivate, role assignment
- [ ] Owner vs Tenant management (flats have `ownership_type`; no owner entity)
- [ ] Visitor management (gate pass, check-in/out) — **no table exists**
- [ ] Amenity booking (clubhouse, gym, slots) — **no tables exist**
- [ ] Staff management (security guard, maintenance) — exists as roles only
- [ ] Reports (collection status, occupancy, complaints, notices) — none
- [ ] Dashboard (KPIs, charts) — page missing

## 3.2 Missing Validation
- [ ] Form Request classes for every module (currently `$request->validate` inline in `FlatController`, stubs elsewhere)
- [ ] Unique-within-society rules (e.g. tower name per society, flat no per tower — schema has unique index but no validation)
- [ ] Enum whitelist validation for status/priority/payment_method fields
- [ ] Date-range validation (notice publish window), due dates vs billing month
- [ ] Phone/email format normalization

## 3.3 Missing Permissions & Policies
- [ ] Spatie middleware (`role:` / `permission:`) applied to route groups
- [ ] Policy classes per model (viewAny/view/create/update/delete/restore)
- [ ] Owner-scoped access (resident sees own flat's invoices, complaints)
- [ ] Fix `User::isSuperAdmin()` (uses non-existent `role` attribute)
- [ ] Share real roles/permissions to frontend; gate UI by permission
- [ ] `ActivityLog` view authorization (admin-only)

## 3.4 Missing UI
- [ ] Authenticated app layout (sidebar nav, topbar, user menu, mobile)
- [ ] Dashboard page
- [ ] All index/create/edit/show pages for every module above
- [ ] Role/permission management screens
- [ ] Activity Log UI (list, filters, detail, export)
- [ ] Settings (society profile, billing heads)

## 3.5 Missing Cross-Cutting UX
- [ ] Search, filters, pagination for every list (only Flats has partial; residents none)
- [ ] Sorting (multi-column)
- [ ] Empty states, loading skeletons (only `Skeleton` primitive exists, unused)
- [ ] Error handling (flash messages partially used; no error boundary, no form error display in most pages)
- [ ] Confirmation dialogs for destructive actions
- [ ] Toast notifications
- [ ] Responsive polish on all new pages (sidebar has mobile sheet already)

## 3.6 Missing Security
- [ ] `is_active` enforcement on login (field exists, unused)
- [ ] Login/logout activity logging (infrastructure ready)
- [ ] Password reset + failed-login logging
- [ ] Rate limiting beyond login (e.g. API-ish forms)
- [ ] Mass-assignment audit (fillable reviewed — OK)
- [ ] XSS hardening review of rendered user content (Inertia escapes by default; ok)
- [ ] `verified` middleware on sensitive routes (email verification wired, not enforced)
- [ ] Session security hardening (cookie flags)
- [ ] CSRF is handled by Inertia automatically — verify on all forms

## 3.7 Missing Performance
- [ ] Missing DB indexes: `flats.occupancy_status`, `residents.flat_id`, `invoices(flat_id, billing_month, billing_year)`, `complaints(status)`, `notices(publish_from, publish_to)`, `payments(invoice_id)`
- [ ] N+1 audit in all controllers (Flats uses `with()`; Resident index uses `with()` — OK; stubs unknown)
- [ ] Pagination everywhere (only Flats/Residents)
- [ ] Dashboard aggregation queries (avoid per-request heavy counts; cache)
- [ ] Queue for activity logging (infra ready: `predis`, jobs table, `queue:listen` in composer dev script)
- [ ] Vite chunk splitting / code splitting of feature pages

## 3.8 Missing Code Structure / Refactoring
- [ ] Service layer for business logic (billing generation, complaint workflow, visitor passes)
- [ ] Form Request classes (single source of validation)
- [ ] Observers for cross-cutting model events (or keep `LogsActivity` trait)
- [ ] Resource/Data objects for Inertia props (avoid leaking raw models)
- [ ] `FlatController` validation-key mismatch fix; invalid `Route::resource('property-units')->only(['create','index','{flat}/edit'])`
- [ ] `routes/web.php` cleanup: consistent naming (`flats.*` vs `property-units.*`)
- [ ] `app.blade.php` stale `@vite` Pages path
- [ ] Frontend: add `vite-env.d.ts`, global `window.axios` types, `hooks/use-mobile`
- [ ] Consistent Inertia page directory casing (`Features/...` vs `features/...` mixed)

## 3.9 Missing Testing
- [ ] Unit: services (ActivityLogger, future BillingService, ComplaintWorkflow)
- [ ] Feature: CRUD + authorization per module (policy tests)
- [ ] Feature: tenant isolation (society A cannot see society B data)
- [ ] Feature: auth events logging (login/logout/password reset)
- [ ] Test factories are already present for all core models — leverage them
- [ ] CI wiring (GitHub Actions) for `pint` + `test` + `npm run build`

## 3.10 Missing Infrastructure / Ops
- [ ] `.env.example` sync (already restored local `.env`)
- [ ] Seeders completeness (societies, roles, permissions validated)
- [ ] Laravel Pint config + run
- [ ] Horizon/pail config optional; queue worker docs
- [ ] Deployment readiness (Docker compose exists — verify prod service config)

---

# 4. Phase-Wise Execution Plan

> Rules: one phase at a time; each phase ends with green tests + `npm run build` + Pint. Backward compatible; no breaking changes.

### Phase 1 — Project Stabilization ✅ *(partially completed during analysis)*
- **Objective:** Green baseline: tests pass, frontend compiles, env restored.
- **Completed:** `.env` + APP_KEY restored; `UserFactory::unverified()`; auth redirects `dashboard→overview`; logout restored; boilerplate tests aligned; **26/26 tests green**.
- **Remaining files:** `resources/js/vite-env.d.ts` (new), `resources/js/types/global.d.ts` (new), `resources/js/hooks/use-mobile.ts` (new), `app.blade.php` (`@vite` line), `tsconfig.json` (include d.ts).
- **Database changes:** none.
- **Risk:** Low. **Effort:** 0.5 day.

### Phase 2 — Architecture Improvements
- **Objective:** Service layer, Form Requests, Policy scaffolding, permission enforcement, app shell layout.
- **Files:** new `app/Services/*`, `app/Http/Requests/*`, `app/Policies/*`, `resources/js/layouts/AppLayout.tsx`, `resources/js/components/app/*`, `routes/web.php`.
- **Database changes:** none.
- **Risk:** Medium (routing/refactor). **Effort:** 3 days.

### Phase 3 — Residents (Owners & Tenants)
- **Objective:** Full resident CRUD + primary-contact logic + list UX (search/filter/pagination).
- **Files:** `ResidentController`, new `ResidentRequest`, `ResidentPolicy`, `resources/js/features/residents/*`.
- **Database changes:** index on `residents.flat_id`; optional `resident_type` enum (Owner/Tenant) — currently derivable via flat.
- **Risk:** Low–Medium. **Effort:** 2 days.

### Phase 4 — Tower Management
- **Objective:** Tower CRUD + per-society uniqueness + delete safeguards (flats exist).
- **Files:** `TowerController` (new), `TowerRequest`, `resources/js/features/towers/*`.
- **Database changes:** unique index `(society_id, name)`.
- **Risk:** Low. **Effort:** 1 day.

### Phase 5 — Flat Management (repair + complete)
- **Objective:** Fix validation/route bugs; complete CRUD; occupancy stats; restore.
- **Files:** `FlatController` refactor, `FlatRequest`, `FlatPolicy`, `resources/js/features/flats/*` (Index/Create/Edit).
- **Database changes:** indexes (`occupancy_status`, `tower_id`), remove broken unique if conflicting with soft-delete reuse.
- **Risk:** Medium (existing partial code). **Effort:** 2 days.

### Phase 6 — Staff & User Management
- **Objective:** User CRUD, invitations, activate/deactivate, role assignment UI; fix `isSuperAdmin()`.
- **Files:** `UserController` (new), `UserRequest`, `UserPolicy`, `resources/js/features/users/*`.
- **Database changes:** none.
- **Risk:** Medium (auth impact). **Effort:** 2.5 days.

### Phase 7 — Visitor Management *(new tables)*
- **Objective:** Gate passes, check-in/out, purpose, vehicle, approval flow.
- **Files:** new `Visitor`, `VisitorPass` models + migrations + controllers + pages.
- **Database changes:** `visitors`, `visitor_passes` tables + indexes.
- **Risk:** Low. **Effort:** 3 days.

### Phase 8 — Complaint Management
- **Objective:** Full lifecycle: create (resident), assign (admin), status workflow, priority, resolution timestamps, my-complaints.
- **Files:** `ComplaintController` (implement), `ComplaintRequest`, `ComplaintPolicy`, `ComplaintCategoryController`, `resources/js/features/complaints/*`.
- **Database changes:** indexes (`status`, `assigned_to`); `resolved_by` FK.
- **Risk:** Medium. **Effort:** 3 days.

### Phase 9 — Notice Management
- **Objective:** CRUD + publish window + targeted audience (all/block/floor/flat) + priority.
- **Files:** `NoticeController`, `NoticeRequest`, `NoticePolicy`, `resources/js/features/notices/*`.
- **Database changes:** `target_type/target_ids` (or pivot), index `(publish_from, publish_to)`.
- **Risk:** Low. **Effort:** 1.5 days.

### Phase 10 — Amenity Booking *(new tables)*
- **Objective:** Amenities, slots, bookings, cancellation, conflict prevention, admin approval.
- **Files:** new `Amenity`, `AmenitySlot`, `AmenityBooking` models/controllers/pages.
- **Database changes:** `amenities`, `amenity_slots`, `amenity_bookings` + unique constraints.
- **Risk:** Medium (conflict logic). **Effort:** 4 days.

### Phase 11 — Maintenance Billing (Invoices + Payments)
- **Objective:** Billing engine (heads × flats × month), invoice generation, due dates, penalties, payment capture, auto status updates, outstanding reports.
- **Files:** `BillingService` (new), `InvoiceController` (implement), `PaymentController` (implement), requests/policies, `resources/js/features/billing/*`.
- **Database changes:** indexes `(flat_id, billing_month, billing_year)`, `payments(invoice_id)`; partial unique for generation idempotency.
- **Risk:** High (financial correctness). **Effort:** 5 days.

### Phase 12 — Reports
- **Objective:** Occupancy, collection/outstanding, complaints SLA, notices; CSV export.
- **Files:** `ReportController`, export service, `resources/js/features/reports/*`.
- **Database changes:** none (aggregations).
- **Risk:** Medium. **Effort:** 3 days.

### Phase 13 — Dashboard Improvements
- **Objective:** KPI cards, charts (recharts installed), recent activity, quick actions, role-aware views.
- **Files:** `DashboardController` (new), `resources/js/features/dashboard/*`.
- **Database changes:** none.
- **Risk:** Low. **Effort:** 2 days.

### Phase 14 — Notification System
- **Objective:** In-app + email notifications (notice published, complaint update, invoice due, visitor approved); notification center UI.
- **Files:** new `AppNotification` (or use Laravel Notifications + DB channel), listeners, `resources/js/components/notifications/*`.
- **Database changes:** `notifications` table (Laravel standard).
- **Risk:** Medium. **Effort:** 3 days.

### Phase 15 — Activity Logging (full UI + enforcement) *(backend foundation already built)*
- **Objective:** Wire `LogsActivity` into all models; log auth events; queue dispatch; Activity Log UI (search/filters/pagination/detail/export CSV); admin-only authorization.
- **Files:** extend `ActivityLogger` (queue), `ActivityLogController` (new), `ActivityLogPolicy`, `resources/js/features/activity-logs/*`; auth controller hooks.
- **Database changes:** none (table exists); add `log_name` if categorization needed.
- **Risk:** Low. **Effort:** 3 days.

### Phase 16 — Security Hardening
- **Objective:** `is_active` enforcement; verified middleware; rate limiting; session cookie flags; role middleware on all groups; mass-assignment audit; failed-login logging.
- **Files:** `AuthServiceProvider`/middleware, auth controllers, config.
- **Database changes:** none.
- **Risk:** Medium. **Effort:** 2 days.

### Phase 17 — Performance Optimization
- **Objective:** Indexes everywhere; eager-loading audit; dashboard caching; activity log pruning strategy; Vite code splitting; N+1 killer pass.
- **Files:** migrations (indexes), controllers, `vite.config.ts`.
- **Database changes:** additive indexes.
- **Risk:** Low. **Effort:** 2 days.

### Phase 18 — Testing Expansion
- **Objective:** Unit + feature tests for all services, policies, tenant isolation, auth logging; CI pipeline (Pint + PHPUnit + build).
- **Files:** `tests/**`, `.github/workflows/*`.
- **Database changes:** none.
- **Risk:** Low. **Effort:** 4 days.

### Phase 19 — Production Readiness
- **Objective:** Seed/verify prod seeders, env docs, Docker prod check, error pages (403/404/500), logging channels, backups note, README update.
- **Files:** `docker/*`, `README.md`, error blade/Inertia pages.
- **Database changes:** none.
- **Risk:** Low. **Effort:** 2 days.

### Sequencing rationale
Foundations first (stabilization → architecture shell → core entities → workflow modules → billing → reporting → cross-cutting quality), each phase keeping tests green and the build passing.

**Total estimated effort:** ~45–50 developer-days across 19 phases (single developer, with testing baked in).

---

## What was already delivered in this session (Phase 1 partial + Activity Log foundation)

1. **Activity logging foundation** — `ActivityLogger` service, `ActivityLog` model, `create_activity_logs_table` migration, `LogsActivity` trait, provider registration. Verified by `tests/Feature/ActivityLogsTest` (passing).
2. **Stabilization fixes** — `.env`/APP_KEY restored, `UserFactory::unverified()`, auth `dashboard→overview` redirects, logout restored, boilerplate tests aligned. **Full suite: 26 passed (63 assertions).**
