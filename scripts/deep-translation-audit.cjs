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
    else if (full.endsWith(".tsx")) results.push(full);
  }
  return results;
}

const jsDir = path.resolve(__dirname, "../resources/js");
const files = walk(jsDir);

console.log("Auditing", files.length, "TSX files...");

const rawStrings = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(jsDir, file);

  // Check for placeholder="literal" where not {t(...)}
  const placeholderMatches = [...content.matchAll(/placeholder="([^"{]+)"/g)];
  for (const m of placeholderMatches) {
    if (!m[1].includes("{") && m[1].length > 1 && !/^[0-9+.\-/: ]+$/.test(m[1])) {
      rawStrings.push({ file: rel, type: "placeholder", text: m[1] });
    }
  }

  // Check for title="literal" on buttons/links
  const titleMatches = [...content.matchAll(/title="([^"{]+)"/g)];
  for (const m of titleMatches) {
    if (!m[1].includes("{") && m[1].length > 2 && !/^[0-9+.\-/: ]+$/.test(m[1]) && !m[1].includes("1×1") && !m[1].includes("2×2") && !m[1].includes("3×3") && !m[1].includes("4×4")) {
      rawStrings.push({ file: rel, type: "title", text: m[1] });
    }
  }
}

console.log(`Found ${rawStrings.length} potential raw attribute strings:`);
const grouped = {};
for (const item of rawStrings) {
  if (!grouped[item.file]) grouped[item.file] = [];
  grouped[item.file].push(`${item.type}: "${item.text}"`);
}

for (const [f, items] of Object.entries(grouped)) {
  console.log(`\n${f}:`);
  items.forEach((it) => console.log(`  - ${it}`));
}
