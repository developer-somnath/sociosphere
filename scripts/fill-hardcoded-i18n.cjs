/**
 * Routes hardcoded English UI strings through the i18n engine.
 *
 * For each target page we:
 *   1. Ensure `import { useI18n } from "@/lib/i18n";` is present.
 *   2. Ensure `t` is available (add to an existing useI18n destructure, or add a
 *      `const { t } = useI18n();` line at the top of the component).
 *   3. Replace literal `title="X"` / `description="X"` / `Head title="X"` with
 *      `t("key")` using an explicit literal->key map (no guessing).
 *   4. Write the new keys (English = the literal) into en.json.
 *
 * Idempotent: re-running only fills gaps. Tracked files can be `git checkout`'d
 * to revert if needed.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const EN = path.join(ROOT, "resources/js/locales/en.json");

// file (relative to ROOT) -> [ [literal, key], ... ]
const MAP = {
  "resources/js/features/activity-logs/pages/index.tsx": [
    ["Activity Logs", "activityLogs.title"],
    ["No activity found", "activityLogs.emptyTitle"],
  ],
  "resources/js/features/documents/pages/index.tsx": [
    ["Document Repository", "documents.title"],
    ["No documents found", "documents.emptyTitle"],
    ["Upload Document", "documents.uploadTitle"],
    ["Edit Document", "documents.editTitle"],
    ["Delete Document", "documents.deleteTitle"],
  ],
  "resources/js/features/billing/pages/tax-settings.tsx": [
    ["Delete Tax Rate Rule", "taxSettings.deleteTitle"],
  ],
  "resources/js/features/invoices/pages/batch-generate.tsx": [
    ["Batch Generate Invoices", "invoices.batchGenerateTitle"],
  ],
  "resources/js/features/invoices/pages/billing-runs.tsx": [
    ["Billing Run History", "billing.runsTitle"],
    ["No billing runs yet", "billing.emptyRunsTitle"],
  ],
  "resources/js/features/invoices/pages/billing-settings.tsx": [
    ["Billing Settings", "billing.settingsTitle"],
    ["Billing Mode", "billing.modeTitle"],
    ["How monthly maintenance is calculated per flat.", "billing.modeDescription"],
    ["Penalty Policy", "billing.penaltyTitle"],
    ["Late payment fees applied after the grace period.", "billing.penaltyDescription"],
    ["Status", "billing.statusTitle"],
    ["Disable to pause future auto-billing runs without losing configuration.", "billing.statusDescription"],
  ],
  "resources/js/features/invoices/pages/flat-ledger.tsx": [
    ["Flat Ledger", "invoices.flatLedgerTitle"],
    ["No invoices", "invoices.flatLedgerEmpty"],
  ],
  "resources/js/features/invoices/pages/invariant-check.tsx": [
    ["Financial Invariant Check", "invoices.invariantHeadTitle"],
    ["Financial Invariants", "invoices.invariantTitle"],
  ],
  "resources/js/features/notices/pages/index.tsx": [
    ["Notice Board", "notices.title"],
    ["No notices found", "notices.emptyTitle"],
    ["Delete Notice", "notices.deleteTitle"],
  ],
  "resources/js/features/notices/pages/create.tsx": [
    ["New Notice", "notices.createHeadTitle"],
    ["Publish New Notice", "notices.createTitle"],
    ["Announcement", "notices.announcementTitle"],
    ["Publishing Window", "notices.publishingWindowTitle"],
  ],
  "resources/js/features/notices/pages/edit.tsx": [
    ["Edit Notice", "notices.editTitle"],
    ["Announcement", "notices.announcementTitle"],
    ["Attachments", "notices.attachmentsTitle"],
    ["Publishing Window", "notices.publishingWindowTitle"],
  ],
  "resources/js/features/subscription/pages/admin.tsx": [
    ["Subscriptions Admin", "subscription.adminTitle"],
    ["No societies found", "subscription.emptySocieties"],
  ],
  "resources/js/features/subscription/pages/overview.tsx": [
    ["Subscription", "subscription.overviewTitle"],
    ["No active subscription", "subscription.emptySubscription"],
  ],
  "resources/js/features/subscription/pages/plans/index.tsx": [
    ["Subscription Plans", "plans.indexTitle"],
    ["No plans yet", "plans.emptyTitle"],
  ],
  "resources/js/features/subscription/pages/plans/create.tsx": [
    ["New Plan", "plans.createHeadTitle"],
    ["Create Subscription Plan", "plans.createTitle"],
    ["Pricing", "plans.pricingTitle"],
    ["Set the monthly and yearly list price for this tier.", "plans.pricingDescription"],
  ],
  "resources/js/features/subscription/pages/plans/edit.tsx": [
    ["Edit Subscription Plan", "plans.editTitle"],
    ["Pricing", "plans.pricingTitle"],
    ["Set the monthly and yearly list price for this tier.", "plans.pricingDescription"],
  ],
  "resources/js/features/subscription/pages/usage.tsx": [
    ["Subscription Usage", "subscription.usageTitle"],
    ["No usage data", "subscription.emptyUsage"],
  ],
};

function ensureImport(content) {
  if (/from\s+["']@\/lib\/i18n["']/.test(content)) return content;
  const lines = content.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s.+\sfrom\s/.test(lines[i])) lastImport = i;
  }
  lines.splice(lastImport + 1, 0, 'import { useI18n } from "@/lib/i18n";');
  return lines.join("\n");
}

function ensureT(content) {
  if (/const\s*\{\s*t\b/.test(content)) return content; // t already in scope
  const m = content.match(/const\s*\{([^}]*)\}\s*=\s*useI18n\(\)/);
  if (m) {
    return content.replace(
      /const\s*\{([^}]*)\}\s*=\s*useI18n\(\)/,
      (_, inner) => {
        const trimmed = inner.trim();
        const newInner = trimmed ? `t, ${trimmed}` : "t";
        return `const { ${newInner} } = useI18n()`;
      }
    );
  }
  // add a new line right after the component function opening brace
  const fm = content.match(/export\s+(default\s+)?function\s+\w+\s*\(\s*\)\s*\{/);
  if (fm) {
    const idx = fm.index + fm[0].length;
    return content.slice(0, idx) + "\n    const { t } = useI18n();" + content.slice(idx);
  }
  return content;
}

let fileCount = 0;
const newKeys = {};

for (const [rel, pairs] of Object.entries(MAP)) {
  const file = path.join(ROOT, rel);
  let content = fs.readFileSync(file, "utf8");
  const before = content;
  content = ensureImport(content);
  content = ensureT(content);
  for (const [literal, key] of pairs) {
    const attrRepl = (attr) => {
      const needle = `${attr}="${literal}"`;
      if (content.includes(needle)) {
        content = content.split(needle).join(`${attr}={t("${key}")}`);
        newKeys[key] = literal;
      }
    };
    attrRepl("title");
    attrRepl("description");
  }
  if (content !== before) {
    fs.writeFileSync(file, content, "utf8");
    fileCount++;
  }
}

// Write new keys into en.json (overwrite with correct English).
const catalog = JSON.parse(fs.readFileSync(EN, "utf8"));
let keyCount = 0;
for (const [key, value] of Object.entries(newKeys)) {
  if (!(key in catalog)) {
    catalog[key] = value;
    keyCount++;
  }
}
fs.writeFileSync(EN, JSON.stringify(catalog, null, 2) + "\n", "utf8");

console.log("Files updated:", fileCount);
console.log("New i18n keys added:", keyCount);
