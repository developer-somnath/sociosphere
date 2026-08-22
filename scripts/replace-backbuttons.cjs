const fs = require("fs");
const path = require("path");

const dir = "resources/js/features";
const files = [];
function walk(d) {
    for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        const s = fs.statSync(p);
        if (s.isDirectory()) walk(p);
        else if (f.endsWith(".tsx")) files.push(p);
    }
}
walk(dir);

let changed = 0;
for (const file of files) {
    let src = fs.readFileSync(file, "utf8");
    const orig = src;

    const re = /<Button\s+variant="outline"[^>]*asChild[^>]*>\s*<Link\s+href=\{(?:route\("([^"]+)"\)|"([^"]+)")\}[^>]*>\s*<ArrowLeft\s+className="size-[0-9.]+"\s*\/>\s*\{(?:t\("([^"]+)"\)|"([^"]+)")\}\s*<\/Link>\s*<\/Button>/g;

    src = src.replace(re, (m, routeName, href, labelKey, labelLit) => {
        const dest = routeName ? `routeName="${routeName}"` : `href="${href}"`;
        const label = labelKey
            ? ` label={t("${labelKey}")}`
            : labelLit && labelLit !== "Back"
            ? ` label="${labelLit}"`
            : "";
        return `<BackButton ${dest}${label} />`;
    });

    if (src !== orig) {
        if (!/from "@\/components\/app\/back-button"/.test(src)) {
            if (/import \{ PageHeader \} from "@\/components\/app\/page-header";/.test(src)) {
                src = src.replace(
                    /(import \{ PageHeader \} from "@\/components\/app\/page-header";)/,
                    '$1\nimport { BackButton } from "@/components/app/back-button";'
                );
            } else if (/import AppLayout from "@\/layouts\/app-layout";/.test(src)) {
                src = src.replace(
                    /(import AppLayout from "@\/layouts\/app-layout";)/,
                    '$1\nimport { BackButton } from "@/components/app/back-button";'
                );
            }
        }
        fs.writeFileSync(file, src);
        changed++;
        console.log("UPDATED", file);
    }
}
console.log("Total changed:", changed);
