/**
 * Fills placeholder stub values in resources/js/locales/en.json with real English.
 * v2: proper singularization + expanded stub patterns.
 */
const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../resources/js/locales/en.json");
const raw = fs.readFileSync(file, "utf8");
const catalog = JSON.parse(raw);

function titleCase(s) {
    return s
        .split(/[\s-]+/)
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

function nounFromNs(ns) {
    const spaced = ns
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
    return titleCase(spaced);
}

function singularize(noun) {
    const words = noun.split(" ");
    const last = words[words.length - 1];
    let s = last;
    if (/ies$/i.test(s)) s = s.slice(0, -3) + "y";
    else if (/(ses|xes|zes|ches|shes)$/i.test(s)) s = s.slice(0, -2);
    else if (/s$/i.test(s) && !/ss$/i.test(s)) s = s.slice(0, -1);
    words[words.length - 1] = s;
    return words.join(" ");
}

const NS_OVERRIDE = { cctv: "CCTV", cctvForm: "CCTV" };

function isStub(value) {
    if (typeof value !== "string") return false;
    const v = value.trim();
    if (/^Col [a-z ]+$/i.test(v)) return true;
    if (/^Stat [a-z ]+$/i.test(v)) return true;
    if (/^Type [a-z ]+$/i.test(v)) return true;
    if (/^Status [a-z ]+$/i.test(v)) return true;
    return [
        "Noun plural", "Page description", "Page title", "Section", "Create submit",
        "Edit configuration", "Edit title", "Edit description", "Edit page description",
        "Create description", "Create title", "Add page description", "Add page title",
        "Breadcrumb surveillance", "Add description", "Add title", "Empty description",
        "Empty title", "Search label", "Search placeholder", "Booking plural",
        "Booking singular", "Booking type label", "Confirm delete description",
        "Confirm delete title", "Drawer description", "Drawer title", "Title",
    ].includes(v);
}

function derive(ns, suffix, value) {
    const baseNs = ns.split(".")[0];
    const noun = NS_OVERRIDE[baseNs] ?? nounFromNs(baseNs);
    const singular = singularize(noun);
    const v = value.trim();

    let m = /^Col ([a-z ]+)$/i.exec(v);
    if (m) return titleCase(m[1]);

    m = /^Stat ([a-z ]+)$/i.exec(v);
    if (m) return titleCase(m[1]);

    m = /^Type ([a-z ]+)$/i.exec(v);
    if (m) return titleCase(m[1]);

    m = /^Status ([a-z ]+)$/i.exec(v);
    if (m) return titleCase(m[1]);

    if (/^col[A-Z]/.test(suffix) && v === "Title") return "Title";

    switch (suffix) {
        case "nounPlural": return noun;
        case "title": return noun;
        case "section": return noun;
        case "pageDescription": return "Manage " + noun.toLowerCase() + " in your society.";
        case "pageTitle": return noun;
        case "searchLabel": return "Search " + noun.toLowerCase();
        case "searchPlaceholder": return "Search " + noun.toLowerCase() + "…";
        case "emptyTitle": return "No " + noun.toLowerCase() + " yet";
        case "emptyDescription": return "When you add " + noun.toLowerCase() + ", they will appear here.";
        case "createSubmit": return "Create " + singular.toLowerCase();
        case "createTitle": return "Create " + singular.toLowerCase();
        case "createDescription": return "Fill in the details to add a new " + singular.toLowerCase() + ".";
        case "addTitle": return "Add " + singular.toLowerCase();
        case "addDescription": return "Provide the information for the new " + singular.toLowerCase() + ".";
        case "addPageTitle": return "Add " + singular.toLowerCase();
        case "addPageDescription": return "Fill in the details to add a new " + singular.toLowerCase() + ".";
        case "editTitle": return "Edit " + singular.toLowerCase();
        case "editDescription": return "Update the details of this " + singular.toLowerCase() + ".";
        case "editPageDescription": return "Update the details of this " + singular.toLowerCase() + ".";
        case "editConfiguration": return "Edit " + singular.toLowerCase() + " configuration";
        case "bookingPlural": return noun + " Bookings";
        case "bookingSingular": return "Booking";
        case "bookingTypeLabel": return "Booking type";
        case "confirmDeleteTitle": return "Delete " + singular.toLowerCase();
        case "confirmDeleteDescription": return "Are you sure you want to delete this " + singular.toLowerCase() + "? This action cannot be undone.";
        case "drawerTitle": return noun;
        case "drawerDescription": return "Manage " + noun.toLowerCase() + " details.";
        case "breadcrumbSurveillance": return "Surveillance";
        default: return value;
    }
}

let changed = 0;
for (const key of Object.keys(catalog)) {
    const value = catalog[key];
    if (!isStub(value)) continue;
    const dot = key.lastIndexOf(".");
    const ns = key.slice(0, dot);
    const suffix = key.slice(dot + 1);
    const next = derive(ns, suffix, value);
    if (next !== value) {
        catalog[key] = next;
        changed++;
    }
}

fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log("Stub keys rewritten:", changed);
console.log("Total keys:", Object.keys(catalog).length);
