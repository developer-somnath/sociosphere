const fs = require("fs");
const path = require("path");

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

const findings = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(jsDir, file);

  // Check for Head title="literal"
  const headMatches = content.match(/<Head\s+title="([^"{]+)"/g);
  if (headMatches) {
    findings.push({ file: rel, type: "Head title", matches: headMatches });
  }

  // Check for PageHeader title="literal"
  const headerMatches = content.match(/<PageHeader[^>]*title="([^"{]+)"/g);
  if (headerMatches) {
    findings.push({ file: rel, type: "PageHeader title", matches: headerMatches });
  }
}

console.log("=== HARDCODED STRING AUDIT ===");
console.log(`Found ${findings.length} files with literal titles/headers:`);
findings.forEach((f) => {
  console.log(`- ${f.file} (${f.type}): ${f.matches.join(", ")}`);
});
