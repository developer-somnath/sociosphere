# SocioSphere: Verified Architecture Analysis and Execution Roadmap

**Audit date:** 2026-08-02
**Evidence reviewed:** application, configuration, routes, migrations, seeders, frontend, and tests.
**Baseline verification:** `php artisan test --do-not-cache-result` passed **137 tests / 746 assertions**; `npx tsc --noEmit` passed.

## Scope and audit constraints

The repository contained substantial uncommitted application changes before this audit. They have been preserved. This document describes the code that is currently present; it does not imply that the uncommitted work is committed or deployment-ready.

## 1. Current architecture

### Backend

SocioSphere is a Laravel 12 monolith using Inertia server-driven pages, not a separate REST API. Controllers return Inertia responses or redirects. Eloquent owns persistence, with a small service layer for dashboard aggregates, reusable selector/filter queries, and centralized activity logging.

| Area | Current implementation |
|---|---|
| HTTP | Resource-style controllers for towers, flats, residents, users, roles, and visitor passes. `ComplaintController`, `InvoiceController`, and `PaymentController` are scaffolded but empty; `NoticeController` and `InvoiceItemController` are empty. |
| Validation | Dedicated Form Requests cover flats, residents, roles, towers, users, visitors, authentication, and profile updates. Unimplemented business modules have no requests. |
| Authorization | Spatie roles/permissions plus policies for activity logs, flats, residents, roles, towers, users, and visitor passes. Controllers authorize individual actions. Route groups additionally require a module `*.view` permission. |
| Tenancy | A society is the tenant. `SocietyMiddleware` sets a request-local `society_id`; `BelongsToSociety` applies a global scope and auto-populates the key on create. SuperAdmins intentionally have no bound society and controllers resolve a tenant from the selected related record where needed. |
| Auditing | `LogsActivity` logs model create/update/delete/restore through `ActivityLogger`; auth events log login, logout, failed login, password reset, and registration. Logging can write synchronously or through the database queue. |
| Persistence | MySQL is the stated target; Laravel migrations also contain PostgreSQL/SQLite-oriented partial-index syntax, which is not portable to MySQL and is a release blocker. |

### Frontend

React 18 + TypeScript is mounted by Inertia in `resources/js/app.tsx`. The Vite resolver dynamically loads `resources/js/**/*.tsx`, so Laravel page names such as `features/flats/pages/index` resolve to the feature-first folder structure.

The current design system consists of Tailwind v4 semantic tokens, Shadcn/Radix primitives, Geist typography, `next-themes`, Lucide icons, and shared `AppLayout`, sidebar, theme switcher, metric card, forms, and tables. Light and dark color tokens are defined; both TypeScript compilation and existing component imports work.

### Request/data flow

```text
Browser -> Inertia request -> Laravel route/middleware -> controller
        -> policy + FormRequest -> Eloquent/service -> MySQL
Browser <- Inertia page props or redirect + validation/flash response <-
```

The frontend uses Ziggy route generation and Inertia navigation/form submissions. Index pages presently implement server-side search/filter/pagination in their controllers. There is no general table abstraction, client-side global search, shared toast system, or loading-boundary system.

### Routing and authentication

- `/` redirects authenticated users to `overview`, otherwise to `login`.
- Guest auth routes include registration, login, password reset, email verification, and password confirmation.
- `auth` + `society` protects module routes. The society middleware rejects non-SuperAdmin users without a society.
- `permission:*` middleware protects each implemented module route; policies provide action/entity checks.
- The profile route is only `auth`-protected and its Inertia components are referenced as `Profile/Edit`; these matching frontend pages are absent from the repository. Several Breeze routes likewise point to missing `Auth/*` pages, except the custom login page. This is a runtime completeness gap despite passing request-render tests.

### Layout/component hierarchy

```text
app.tsx
└─ ThemeProvider
   └─ Inertia page
      ├─ AuthLayout -> AuthBranding + LoginForm
      └─ AppLayout
         ├─ AppSidebar (permission-filtered navigation)
         ├─ authenticated header (search placeholder, notifications placeholder,
         │  theme control, account menu)
         └─ feature page (dashboard / flats / residents / towers / users /
            roles / visitors / activity logs)
```

### Reusable assets

`components/ui` includes avatar, badge, button, card, checkbox, dropdown, input, label, separator, sheet, sidebar, skeleton, tooltip, and `MetricCard`. Features currently duplicate table, filter-select, destructive-confirmation, pagination, form-section, and error/flash patterns. Reuse should be formalized before building the larger workflow modules.

### Database relationship diagram

```text
Society 1--* User
Society 1--* Tower 1--* Flat 1--* Resident
Society 1--* Visitor 1--* VisitorPass *--1 Flat
Society 1--* InvoiceHead
Society 1--* Invoice *--1 Flat; Invoice 1--* InvoiceItem *--1 InvoiceHead
Invoice 1--* Payment
Society 1--* ComplaintCategory; Complaint *--1 Flat, Resident, Category,
                                     and optionally User (assigned_to)
Society 1--* Notice
Society 1--* ActivityLog *--0..1 User (causer)
User *--* Role *--* Permission (Spatie pivot tables)
```

Important model gaps: most finance/complaint/notice models declare fillable fields but omit relationship methods and tenant scope usage. `Society` has soft deletes in the schema but its model does not use `SoftDeletes`. Activity logs do not use the tenant trait; they are deliberately scoped in their controller.

## 2. Existing modules

| Module | Status | Completion | Key issues/dependencies |
|---|---:|---:|---|
| Authentication and profile | Partially functional | 65% | Login works; inactive accounts are not blocked or updated with last-login time; registration can create an unassigned user who is then denied by society middleware; non-login Breeze page components are absent. Depends on mail/session. |
| Tenancy | Implemented foundation | 70% | Global scope works for selected models; inconsistent adoption across finance, complaints, notices, and societies; SuperAdmin tenant selection needs explicit UX and regression tests. |
| Dashboard | Basic KPI view | 35% | Six cards and static “snapshot” copy; dashboard service has status-case mismatches (`open` versus schema `Open`, `pending` versus `Pending`) and fails for SuperAdmin with null society. No role dashboards, charts, recent activity, or caching. |
| Towers | CRUD | 75% | Search/pagination, policies, validation, soft delete safeguards implemented. MySQL-incompatible partial unique index blocks production migration. No restore/export/sort/shared table. |
| Flats | CRUD | 75% | Search/filter/pagination, policies, occupancy metrics and deletion safeguards implemented. No restore, sorting, bulk/export, ownership entity, or MySQL-safe soft-delete uniqueness strategy. |
| Residents | CRUD | 70% | Search/pagination, primary-contact behavior, policies implemented. No owner/tenant lifecycle, flat/status filters, restore, self-service scope, or contact uniqueness/normalization. |
| Users/staff | CRUD and role assignment | 70% | Tenant-aware management, soft delete, role options, policies implemented. No invitations, reactivation/restore, active-login enforcement, staff profile model, or role-change audit event. |
| Roles/permissions | CRUD for roles | 70% | Feature-group permission editor and safeguards implemented. Roles are global, not tenant-scoped; no permission administration; role sync lacks an explicit semantic audit record; policy/route behavior has an apparent contradiction: `RolePolicy` lets users with `role.view` list roles, but the existing test expects SocietyAdmin to be forbidden. |
| Visitors | Gate-pass workflow | 75% | Create/edit/delete pending passes and approval/check-in/check-out implemented. Visitor records are duplicated on each pass; no visitor reuse, gate dashboard, QR/pass ID, photo, SLA, or notification. |
| Activity logging | Strong foundation + list/export | 75% | Search/filter/pagination/CSV and authorization exist. No structured detail route, UI drawer, retention/pruning, redaction configuration, activity events for role permission sync, or guaranteed post-commit dispatch. |
| Complaints/categories | Schema only | 15% | Controller empty, no routes/UI/requests/policies/workflow/relationships. |
| Notices | Schema only | 10% | No routes/UI/controller/validation/policy/delivery; active notice query exists only in dashboard. |
| Invoices/heads/items | Schema and factories | 10% | No billing workflow, generation, routes/UI, relationships, idempotency or financial integrity controls. |
| Payments/finance | Schema and factories | 10% | Controller empty; no collection/reconciliation/refund/receipt/ledger/expense/budget domain. |
| Amenities/bookings | Not started | 0% | No schema, routes, domain logic, UI, or permissions beyond seed placeholders. |
| Notifications | Not started | 0% | Bell is non-functional; no notifications table/channels/preferences/reminders. |
| Reports | Not started | 0% | No report routes/services/pages. |
| Tests/operations | Good initial suite | 45% | 137 green tests cover implemented core flows; no CI, browser tests, accessibility tests, MySQL migration test, or coverage for empty modules. |

## 3. Gap analysis and priority findings

### Release-blocking defects

1. **Database mismatch:** the tower/flat/user migrations use `whereNull()` partial unique indexes, and users use raw `CREATE UNIQUE INDEX ... WHERE`. MySQL does not support partial indexes. Choose MySQL-compatible generated columns/composite unique keys, or formally change the platform to PostgreSQL; do not ship without a migration test against the selected engine.
2. **Diagnostic endpoint exposed:** `GET /__opcache` is publicly reachable and writes a temporary file. Remove it before any shared/staging/production deployment.
3. **Missing auth/profile frontend pages:** routes render page components not present in `resources/js`; exercise those browser paths and either build the pages or remove/redirect unsupported flows.
4. **Registration tenant dead-end:** self-registration creates a user with no society, immediately producing a 403 when redirected to overview. Registration must become an invitation/onboarding workflow or be disabled.
5. **Status case mismatch:** dashboard uses lowercase complaint/payment states while schema uses title-case enums; headline counts will be wrong on MySQL.

### Functional gaps

- Full CRUD/workflows are missing for society setup, owners/tenants, staff, complaints, categories, notices, invoice heads, invoices, invoice items, payments, amenities, bookings, income, expense, budget, and reports.
- Invoice, payment, and finance requirements need an accounting design before coding: invoice-numbering, immutable financial records, adjustments/credit notes, partial payments, refunds, penalty policy, receipt/ledger generation, and gateway webhooks are not represented.
- No routes or navigation exist for the requested finance, complaint, notice, amenity, report, and notification modules.
- There is no implemented owner entity. `Flat.ownership_type` conflates a flat’s relationship with a person and cannot retain ownership/tenancy history.

### Validation, permissions, and security gaps

- Unimplemented modules have no Form Requests, policies, or permission-enforced routes.
- All request `authorize()` methods return true; controller policy calls are currently the real boundary. Keep both aligned when adding request-specific authorization.
- Add tenant-scoped relationship validation consistently, including SuperAdmin-selected tenant context.
- Enforce `is_active` during authentication and update `last_login_at` only after a successful authenticated event.
- Require email verification only if the product commits to it, then add `verified` to appropriate routes and provide working pages.
- Add rate limiting to sensitive administrative actions and exports; set cookie/HTTPS/security headers for production.
- Activity logs can capture sensitive field values beyond passwords/tokens. Define an explicit allowlist/redaction map per model and log asynchronously only after transaction commit.

### UI/UX gaps

- No shared data table supports sticky headers, server sorting, columns, row selection, bulk actions, export, responsive card view, skeletons, or consistent pagination.
- Forms are full pages rather than the requested premium drawers/sheets, lack unsaved-change protection, sticky action footers, reusable sections, and a universal validation summary.
- The app has no breadcrumb, command/global search, functional notification center, toasts, error boundary, 403/404/500 UX, or page-level loading strategy.
- Dark tokens exist, but no automated visual/accessibility verification guards against hard-coded colors or contrast regressions.
- Dashboard text contains static assertions (“healthy”, “high activity”) rather than calculated real data.

### Performance/data integrity gaps

- Add workload-driven composite indexes for common list filters: `residents(society_id, flat_id)`, `complaints(society_id,status,assigned_to)`, `notices(society_id,publish_from,publish_to)`, `invoices(society_id,flat_id,billing_year,billing_month)`, `payments(society_id,invoice_id,status,paid_at)`, and activity-log causer/date filters.
- Make every index page sort whitelist-driven and paginate. Avoid unbounded selector lists as tenant data grows (current tower/flat options load all records).
- Add query budgets and caching for dashboard/report aggregates; queue notifications/exports/billing batches.
- Establish explicit DB transactions and locking/idempotency for visitor transitions and all financial mutations.

### Architecture/testing gaps

- Repositories are **not required** now: Eloquent + focused services/actions is the simpler appropriate architecture. Introduce repositories only if multiple data sources or complex persistence contracts emerge.
- Add domain actions/services for billing, payments, complaint transitions, notification delivery, exports, and visitor operations; controllers should remain orchestration-only.
- Add Inertia prop transformers/DTOs where raw models currently leak schema fields.
- Add CI for Pint, PHP tests, TypeScript, Vite build, and a real MySQL migration smoke test; expand tenant-isolation, authorization, financial, accessibility, and browser coverage.

## 4. Phase-wise execution plan

Each phase is independently deployable, must preserve existing behavior, and concludes with Pint, PHP tests, TypeScript checking, production Vite build, and targeted browser/accessibility verification.

| Phase | Objective and main work | Files / DB / frontend / backend | Dependencies, risk, effort |
|---|---|---|---|
| 1. Stabilization | Remove release blockers and establish an accurate baseline. Remove `/__opcache`; fix MySQL-compatible uniqueness; repair missing auth/profile pages or routes; correct dashboard enum queries and SuperAdmin behavior. | Routes, migrations, dashboard service/controller, auth/profile pages, tests. DB: additive/replacement compatibility migrations, validated on MySQL. | Depends on chosen DB engine. High risk because migrations/auth affect every tenant. **3–4 days.** |
| 2. Platform foundations | Standardize errors, flash/toasts, page loading, shared forms, responsive table primitives, sorting/filter contracts, drawers/sheets, breadcrumb, and semantic design tokens. | New shared React components/hooks; app layout/CSS; shared Inertia props; no required DB change. | Depends on Phase 1. Medium UI regression risk. **4 days.** |
| 3. Tenancy and authorization hardening | Define SuperAdmin society-switch/select behavior; make tenant rules consistent; audit all policies and permissions; protect registration/inactive accounts; add security headers/rate limits. | Middleware, policies, auth listener/controller, permission catalog/seeders, tests; optional tenant context/session table. | Depends on Phase 1. High authorization risk. **3 days.** |
| 4. Activity log completion | Add detail drawer/route, redaction policy, role/permission business events, retention, post-commit queue behavior, date/user/module export controls. | Activity service/job/model/controller/page, config, pruning command, indexes, tests. DB: activity indexes/retention strategy. | Depends on Phase 3. Medium privacy/performance risk. **3 days.** |
| 5. Society, tower, and flat foundation | Build society administration and settings; finish property hierarchy with restore/archive, table features, tenant-safe selectors, property history basis. | Society controller/request/policy/pages; extend current tower/flat code/pages; migrations for constraints/indexes. | Depends on Phases 1–3. Medium migration risk. **4 days.** |
| 6. Resident, owner, and tenant lifecycle | Separate people/occupancy from flat ownership; add owner/tenant history, move-in/out, contacts, resident self-service policy, and complete filters. | New ownership/tenancy models/migrations; resident services/requests/pages; data migration plan. | Depends on Phase 5. High data-model risk. **5–6 days.** |
| 7. User and staff operations | Add invitations, activate/deactivate, restore, staff profiles/assignments, role-change audit events, and role-aware staff views. | User flows, mail notifications, staff tables if needed, pages/tests. | Depends on Phases 3–4. Medium auth risk. **4 days.** |
| 8. Visitor/security operations | Refactor visitor creation/reuse; enforce transition action service/transactions; gate register dashboard, QR/pass lookup, security events, notifications. | Visitor service/controller/pages; optional pass-code/attachments tables; indexes/tests. | Depends on Phases 2–4 and 5. Medium workflow risk. **4 days.** |
| 9. Complaint management | Implement categories and complaint CRUD, assignment, SLA/status state machine, comments/attachments, resident and staff queues, resolution/closure audit. | Controllers/requests/policies/services/pages; complaint comments/attachments/history tables and indexes. | Depends on Phases 2–6. Medium workflow/privacy risk. **5 days.** |
| 10. Notice and document management | Add notice drafting/publishing, targeting/audience, attachments, acknowledgement, document library, and delivery events. | Notice/document models/controllers/pages; target pivots, attachments, acknowledgement tables. | Depends on Phases 2–4 and 6. Medium delivery risk. **4 days.** |
| 11. Amenity booking | Design amenities, availability/slots, booking/approval/cancel/refund rules, conflict prevention and operational calendar. | New models/controllers/services/policies/pages; amenity/slot/booking tables with conflict constraints. | Depends on Phases 2–6. High concurrent-booking risk. **5 days.** |
| 12. Billing domain design | Agree financial invariants before implementation: billing heads, cycles, numbering, penalty policy, tax, approval, immutable adjustments, partial payments and refunds. | ADRs, schemas, seeders, service contracts, focused tests; invoice sequence/ledger/adjustment tables. | Requires product/finance approval. High correctness/compliance risk. **4–5 days.** |
| 13. Maintenance invoices | Implement invoice-head CRUD, batch preview/generation, idempotent monthly invoices, line items, due/overdue/penalty jobs, PDF invoice/receipt architecture. | Invoice/head/item controllers/services/jobs/pages; unique cycle constraints and indexes. | Depends on Phase 12 and queue setup. High financial risk. **6 days.** |
| 14. Payments and ledger | Offline collection, online gateway abstraction/webhooks, reconciliation, refunds, receipts, resident statement, outstanding/collection views, double-entry-or-defined ledger approach. | Payment/ledger/refund services/controllers/pages; transaction/idempotency/webhook tables and indexes. | Depends on Phase 13 and gateway decision. Very high financial/security risk. **7–10 days.** |
| 15. Finance management | Add income, expenses, budget, cash-flow, approval workflows and monthly statements; bind all to the agreed ledger model. | Finance models/services/controllers/pages; income/expense/budget tables, reports indexes. | Depends on Phase 14. High reporting/compliance risk. **6 days.** |
| 16. Notifications and reminders | Deliver in-app/email notifications, preferences, templates, scheduled reminders, payment/maintenance/activity alerts and a functional bell center. | Laravel Notifications, jobs/listeners, pages/components; `notifications` and preferences tables. | Depends on events from prior modules and queue/mail configuration. Medium delivery risk. **4 days.** |
| 17. Role-specific analytics dashboards | Build Executive, Management, Society, Resident, Finance, Operations, Security, and Maintenance dashboards using real aggregates and date filters. | Dashboard/report query services, Recharts components, cache keys; aggregate indexes/materialized strategy if needed. | Depends on underlying module data. Medium performance risk. **6 days.** |
| 18. Reports and exports | Implement occupancy, dues, collections, expenses, complaints SLA, visitor, amenities and tower/flat reports; safe queued CSV/Excel/PDF exports. | Report services/controllers/pages/jobs; export audit records and indexes. | Depends on Phases 8–17. Medium data-volume risk. **5 days.** |
| 19. Performance and observability | Query/index audit, dashboard caching, queue monitoring, log/metric/error instrumentation, rate limits, background export/billing throughput tests. | Index migrations, cache/job config, health/monitoring docs, performance tests. | Depends on complete workflows. Medium operations risk. **4 days.** |
| 20. Quality and security test expansion | Add policy/tenant matrix tests, financial invariants, browser journeys, accessibility/contrast, load tests, restore/archive tests, CI and dependency/security scans. | Tests, GitHub Actions, quality config; no required DB schema change. | Depends on all preceding features. Medium scope risk. **6–8 days.** |
| 21. Production readiness | Run migration rehearsal/backups/rollback plan, data import validation, env/secret/runbook review, error pages, backup/retention/DR plan, release checklist and UAT. | Docker/deploy docs, health checks, README/runbooks, migrations/seed verification. | Requires infrastructure and stakeholder sign-off. High release risk. **4–5 days.** |

## Phase 1 implementation record (2026-08-02)

**Database decision:** PostgreSQL is the deployment platform. Docker Compose already provisions PostgreSQL 17, the local deployment configuration uses `pgsql`, and `php artisan migrate:status` confirms every migration has run successfully against that database. SQLite remains test-only through `phpunit.xml`.

Completed without changing the pre-existing feature work:

- Removed the publicly exposed `/__opcache` diagnostic endpoint.
- Made PostgreSQL the fallback database and queue database configuration, and aligned `.env.example` with PostgreSQL connection variables.
- Corrected dashboard status matching to the title-cased database enum values and added an intentional portfolio dashboard scope for SuperAdmins.
- Prevented inactive accounts from logging in and now records `last_login_at` after successful authentication.
- Replaced public account creation with invitation-only access so no tenantless accounts can be created; the registration route now communicates the supported administrator-created workflow.
- Added functional Inertia pages for registration access messaging, password reset/request/confirmation, email verification, and profile management.

Verification after implementation: **140 tests / 775 assertions** pass, TypeScript passes `tsc --noEmit`, and PostgreSQL migration status is fully applied.

## Phase 2 implementation record (2026-08-02)

Completed the reusable UI and interaction foundation without changing business-module controller contracts:

- Added shared Inertia flash props and a global accessible toast viewport for success/error redirects.
- Added a global navigation loading indicator.
- Added reusable `PageHeader`/breadcrumb, empty-state, data-table, table-skeleton, pagination, form-section, and form-drawer components.
- Form drawers include an unsaved-changes guard and sticky action footer.
- Migrated Towers as the reference module for the shared page header, breadcrumb, sticky data-table header, and form section.

The next approved unit of work is **Phase 3: tenancy and authorization hardening**.
