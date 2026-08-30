const fs = require("fs");
const path = require("path");

const enPath = path.resolve(__dirname, "../resources/js/locales/en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

const newKeys = {
  "subscription.usageDetails": "Usage Details",
  "subscription.manageSubscriptions": "Manage Subscriptions",
  "subscription.planLimits": "Plan Limits",
  "subscription.resourceUsage": "Resource Usage",
  "subscription.noUsageData": "No usage data available.",
  "subscription.noDescription": "No description",
  "subscription.noLimitsConfigured": "No per-resource limits configured.",
  "subscription.started": "Started",
  "subscription.renews": "Renews",
  "subscription.over": "Over",
  "subscription.atLimit": "At Limit",
  "subscription.nearLimit": "Near Limit",
  "subscription.trialEndsNotice": "Trial ends :date — then converts to the paid plan.",
  "subscription.cancelledNotice": "Cancelled on :date — access continues until the period ends.",
  "subscription.usageByResource": "Usage by Resource",
  "subscription.overLimit": "Over Limit",
  "subscription.unlimited": "Unlimited",
  "subscription.remainingBeforeLimit": ":count remaining before the plan limit",
  "subscription.noRemainingCapacity": "No remaining capacity on this plan",
  "subscription.emptyPlanDescription": "This society does not have an active plan yet. Contact the platform administrator to assign a subscription.",
  "subscription.entitlementUsageEmpty": "Entitlement usage will appear here once the plan is configured.",
};

for (const [k, v] of Object.entries(newKeys)) {
  en[k] = v;
}

const sorted = {};
for (const k of Object.keys(en).sort()) {
  sorted[k] = en[k];
}

fs.writeFileSync(enPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
console.log("Updated en.json with overview & usage keys. Total keys:", Object.keys(sorted).length);
