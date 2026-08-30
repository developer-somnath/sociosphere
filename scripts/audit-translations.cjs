const fs = require("fs");
const path = require("path");

const enPath = path.resolve(__dirname, "../resources/js/locales/en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) results.push(full);
  }
  return results;
}

const jsDir = path.resolve(__dirname, "../resources/js");
const files = walk(jsDir);
const missingKeys = new Map();

for (const file of files) {
  // Avoid checking the i18n definition files themselves
  if (file.includes("i18n.tsx")) continue;
  const content = fs.readFileSync(file, "utf8");
  const regex = /(?:t|i18n\.t)\(\s*["']([a-zA-Z0-9_.]+)["']/g;
  let match;
  while ((match = regex.exec(content))) {
    const key = match[1];
    // Ignore false matches like canvas.getContext("2d"), document.createElement("a"), etc.
    if (["2d", "a", "th", "canvas", "demo", "format", "T"].includes(key)) continue;
    if (!(key in en)) {
      if (!missingKeys.has(key)) missingKeys.set(key, []);
      missingKeys.get(key).push(path.relative(jsDir, file));
    }
  }
}

console.log("=== MISSING KEYS AUDIT ===");
console.log("Total unique missing keys:", missingKeys.size);
for (const [k, flist] of missingKeys.entries()) {
  console.log(`Key: "${k}" used in: ${flist.join(", ")}`);
}

// Also check for any untranslated raw strings in common UI patterns like dialog titles, button labels, etc.
console.log("\n=== AUDIT COMPLETE ===");
