const fs = require("fs");
const path = require("path");

const enPath = path.resolve(__dirname, "../resources/js/locales/en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

const newKeys = {
  "sos.button": "Emergency SOS",
  "sos.title": "Emergency SOS Broadcast",
  "sos.subtitle": "Instantly dispatches critical alerts to security guards and community administrators.",
  "sos.selectType": "Select Emergency Category",
  "sos.medical": "Medical Emergency",
  "sos.fire": "Fire Incident",
  "sos.security": "Security Intrusion",
  "sos.elevator": "Elevator Breakdown",
  "sos.general": "General Emergency",
  "sos.location": "Location / Flat No.",
  "sos.details": "Additional Information (Optional)",
  "sos.triggerButton": "Broadcast Emergency SOS",
  "sos.broadcasting": "Broadcasting Alert…",
  "sos.successTitle": "Emergency SOS Dispatched",
  "sos.successDesc": "Security guards and administration have been notified with critical priority.",
  "sos.contactsTitle": "Emergency Helplines",
  "sos.police": "Police: 112",
  "sos.ambulance": "Ambulance: 108",
  "sos.fireBrigade": "Fire: 101",
  "sos.guardStation": "Security Main Gate",
  "sos.cancel": "Cancel",
};

for (const [k, v] of Object.entries(newKeys)) {
  en[k] = v;
}

const sorted = {};
for (const k of Object.keys(en).sort()) {
  sorted[k] = en[k];
}

fs.writeFileSync(enPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
console.log("Updated en.json with emergency SOS keys. Total keys:", Object.keys(sorted).length);
