const fs = require("fs");
const path = require("path");

const enPath = path.resolve(__dirname, "../resources/js/locales/en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

// Add comprehensive translations
const newKeys = {
  "common.default": "Default",
  "common.settings": "Settings",
  "common.society": "Society",
  "invoices.batchGenerateDesc": "Preview, exclude, and run batch maintenance invoice generation.",
  "notices.updateSubmit": "Save Changes",
  "billing.searchFlatPlaceholder": "Search flat…",
  "billing.noCapPlaceholder": "No cap",
  "language.searchPlaceholder": "Search language…",

  "subscription.adminDescription": "Manage society subscription assignments, resource caps, and lifecycles.",
  "subscription.overviewDescription": "View your current subscription plan, billing status, and resource limits.",
  "subscription.usageDescription": "Detailed breakdown of resource consumption against your plan limits.",
  "subscription.plansCrumb": "Plans",
  "subscription.plan": "Plan",
  "subscription.cycle": "Cycle",
  "subscription.assign": "Assign",
  "subscription.resume": "Resume",
  "subscription.cancel": "Cancel",
  "subscription.assignPlan": "Assign Plan",
  "subscription.confirmCancelTitle": "Cancel subscription?",
  "subscription.confirmCancelDesc": "End the subscription for :name. Access continues until the current period ends.",
  "subscription.confirmCancelLabel": "Cancel Subscription",
  "subscription.keepSubscriptionLabel": "Keep Subscription",
  "subscription.confirmResumeTitle": "Resume subscription?",
  "subscription.confirmResumeDesc": "Reactivate the subscription for :name for another billing cycle.",
  "subscription.confirmResumeLabel": "Resume Subscription",
  "subscription.keepCancelledLabel": "Keep Cancelled",
  "subscription.perMonth": "/ month",
  "subscription.perYear": "/ year",
  "subscription.year": "year",
  "subscription.month": "month",
  "subscription.resourceCount": ":count resources",
  "subscription.unlimitedCount": ":count unlimited",
  "subscription.statusTrialing": "Trialing",
  "subscription.statusActive": "Active",
  "subscription.statusPastDue": "Past Due",
  "subscription.statusCancelled": "Cancelled",
  "subscription.statusExpired": "Expired",
  "subscription.atOverLimit": "At / Over Limit",
  "subscription.unlimitedResources": "Unlimited Resources",
  "subscription.noPlan": "No plan",
  "subscription.overTheLimit": ":count over the limit",
  "subscription.withinLimits": "within plan limits",
  "subscription.resourcesNoCap": "resources with no cap",

  "plans.indexDescription": "Manage the SaaS plan catalog offered to societies.",
  "plans.newPlan": "New Plan",
  "plans.createPlan": "Create Plan",
  "plans.emptyDescription": "Create your first subscription plan to start offering tiers to societies.",
  "plans.confirmDeleteTitle": "Delete plan?",
  "plans.confirmDeleteDescription": "Delete \":name\"? Societies currently on this plan will fall back to the default plan.",
  "plans.confirmDeleteLabel": "Delete Plan",
  "plans.keepPlanLabel": "Keep Plan",
  "plans.unlimitedPlaceholder": "Unlimited",
};

for (const [k, v] of Object.entries(newKeys)) {
  en[k] = v;
}

// Sort keys alphabetically
const sorted = {};
for (const k of Object.keys(en).sort()) {
  sorted[k] = en[k];
}

fs.writeFileSync(enPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
console.log("Updated en.json with new keys. Total keys:", Object.keys(sorted).length);
