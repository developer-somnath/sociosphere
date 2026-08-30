const fs = require("fs");
const path = require("path");

const enPath = path.resolve(__dirname, "../resources/js/locales/en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

const newKeys = {
  "pricing.title": "Subscription Plans & Pricing",
  "pricing.subtitle": "Choose the perfect operational tier for your residential society or commercial complex.",
  "pricing.monthly": "Monthly",
  "pricing.yearly": "Yearly",
  "pricing.saveYearly": "Save 20%",
  "pricing.startTrial": "Start 14-Day Free Trial",
  "pricing.getStarted": "Get Started",
  "pricing.popular": "Most Popular",
  "pricing.allFeatures": "Everything you need to run your community",
  "pricing.faqTitle": "Frequently Asked Questions",
  "pricing.faq1Q": "Can I change my plan later?",
  "pricing.faq1A": "Yes, society administrators can upgrade or switch plans at any time from the Subscription management dashboard.",
  "pricing.faq2Q": "What happens after the 14-day trial?",
  "pricing.faq2A": "You can choose to continue on your selected billing cycle or switch to another tier without losing your society data.",
  "pricing.faq3Q": "Are all taxes included?",
  "pricing.faq3A": "Our Global Tax Engine supports GST, VAT, and regional sales taxes with automated invoice breakdown.",
  "pricing.badgeDefault": "Default Plan",
  "pricing.badgePopular": "Most Popular",
  "pricing.perMonth": "/ month",
  "pricing.perYear": "/ year",
  "pricing.billedMonthly": "billed monthly",
  "pricing.billedYearly": "billed yearly",

  "onboarding.title": "Setup Your Society",
  "onboarding.subtitle": "Get started with SocioSphere in minutes. 14 days free trial included.",
  "onboarding.step1": "1. Society Info",
  "onboarding.step2": "2. Admin Account",
  "onboarding.step3": "3. Plan & Confirm",
  "onboarding.societyName": "Society / Community Name",
  "onboarding.societyCode": "Society Code (Optional)",
  "onboarding.address": "Address",
  "onboarding.city": "City",
  "onboarding.state": "State / Province",
  "onboarding.postalCode": "Postal / ZIP Code",
  "onboarding.country": "Country",
  "onboarding.adminName": "Admin Full Name",
  "onboarding.adminEmail": "Admin Email",
  "onboarding.adminPhone": "Phone Number",
  "onboarding.password": "Password",
  "onboarding.passwordConfirmation": "Confirm Password",
  "onboarding.selectedPlan": "Selected Plan",
  "onboarding.billingCycle": "Billing Cycle",
  "onboarding.submit": "Complete Registration & Start Trial",
  "onboarding.submitting": "Setting up your society…",
  "onboarding.alreadyHaveAccount": "Already have an account?",
  "onboarding.login": "Sign In",
  "onboarding.viewPricing": "View Plans",
  "onboarding.trialBadge": "14-Day Free Trial Included",
  "onboarding.trialDescription": "No credit card required. Full access to all modules and features during your trial period.",
  "onboarding.societySection": "Society & Property Information",
  "onboarding.adminSection": "Primary Administrator Credentials",
  "onboarding.planSection": "Subscription Tier Confirmation",
};

for (const [k, v] of Object.entries(newKeys)) {
  en[k] = v;
}

const sorted = {};
for (const k of Object.keys(en).sort()) {
  sorted[k] = en[k];
}

fs.writeFileSync(enPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
console.log("Updated en.json with pricing & onboarding keys. Total keys:", Object.keys(sorted).length);
