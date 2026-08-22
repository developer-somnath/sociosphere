/**
 * Fills placeholder stub values in resources/js/locales/en.json with real English.
 *
 * A "stub" is a value that is a literal description of the key suffix, e.g.
 *   "amenities.nounPlural": "Noun plural"
 *   "cctv.colIp": "Col ip"
 *   "complaints.pageDescription": "Page description"
 *   "amenities.breadcrumb.section": "Section"
 *
 * These stubs are displayed verbatim in every non-English locale (they fall back
 * to English), so they must be replaced with real, human-readable English.
 *
 * Strategy: derive the English from the key's namespace (the noun) + suffix (the
 * role). Only keys whose value is an actual stub pattern are rewritten; keys with
 * genuine translations (e.g. "All amenities", "Active Cameras") are left untouched.
 */
const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../resources/js/locales/en.json");
const raw = fs.readFileSync(file, "utf8");
const catalog = JSON.parse(raw);

// Title-case a word/phrase (handles simple multi-word).
function titleCase(s) {
    return s
        .split(/[\s-]+/)
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

// Human-friendly noun from a namespace like "amenityBookings" -> "Amenity Bookings".
function nounFromNs(ns) {
    // Insert spaces before capitals, then title-case.
    const spaced = ns
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
    return titleCase(spaced);
}

// Detect a stub value (literal description of the suffix).
function isStub(value) {
    if (typeof value !== "string") return false;
    const v = value.trim();
    if (/^Col [a-z]+$/i.test(v)) return true; // "Col ip"
    if (/^Stat [a-z]+$/i.test(v)) return true; // "Stat active"
    return [
        "Noun plural",
        "Page description",
        "Section",
        "Create submit",
        "Edit configuration",
        "Edit title",
        "Edit description",
        "Create description",
        "Create title",
        "Breadcrumb surveillance",
        "Add description",
        "Add title",
        "Empty description",
        "Empty title",
        "Search label",
        "Search placeholder",
        "Booking plural",
        "Title",
    ].includes(v);
}

function derive(ns, suffix, value) {
    const noun = nounFromNs(ns);
    const v = value.trim();

    // "Col <word>" -> "Word" (column header)
    let m = /^Col ([a-z]+)$/i.exec(v);
    if (m) return titleCase(m[1]);

    // "Stat <word>" -> "Word" (stat label)
    m = /^Stat ([a-z]+)$/i.exec(v);
    if (m) return titleCase(m[1]);

    // A column whose value is literally "Title" -> "Title" (header for a title column).
    if (/^col[A-Z]/.test(suffix) && v === "Title") return "Title";

    switch (suffix) {
        case "nounPlural":
            return noun + "s";
        case "title":
            return noun;
        case "section":
            // e.g. "amenities.breadcrumb.section" -> "Amenities"
            return nounFromNs(ns.split(".")[0]);
        case "pageDescription":
            return "Manage " + noun.toLowerCase() + " in your society.";
        case "searchLabel":
            return "Search " + noun.toLowerCase();
        case "searchPlaceholder":
            return "Search " + noun.toLowerCase() + "…";
        case "emptyTitle":
            return "No " + noun.toLowerCase() + " yet";
        case "emptyDescription":
            return "When you add " + noun.toLowerCase() + ", they will appear here.";
        case "createSubmit":
            return "Create " + noun.replace(/s$/, "").toLowerCase();
        case "createTitle":
            return "Create " + noun.replace(/s$/, "").toLowerCase();
        case "createDescription":
            return "Fill in the details to add a new " + noun.replace(/s$/, "").toLowerCase() + ".";
        case "editTitle":
            return "Edit " + noun.replace(/s$/, "").toLowerCase();
        case "editDescription":
            return "Update the details of this " + noun.replace(/s$/, "").toLowerCase() + ".";
        case "editConfiguration":
            return "Edit " + noun.replace(/s$/, "").toLowerCase() + " configuration";
        case "addTitle":
            return "Add " + noun.replace(/s$/, "").toLowerCase();
        case "addDescription":
            return "Provide the information for the new " + noun.replace(/s$/, "").toLowerCase() + ".";
        case "bookingPlural":
            return noun + " Bookings";
        case "breadcrumbSurveillance":
            return "Surveillance";
        default:
            return value; // leave untouched
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
