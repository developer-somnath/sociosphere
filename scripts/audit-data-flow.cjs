const fs = require("fs");
const path = require("path");

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

console.log("=== DATA FLOW & NULL SAFETY AUDIT ===");

const dateFnIssues = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(jsDir, file);

  // Check custom formatDate functions
  const fnMatches = content.match(/function\s+formatDate\([^)]*\)\s*\{[^}]*\}/g);
  if (fnMatches) {
    for (const fn of fnMatches) {
      if (!fn.includes("!value") && !fn.includes("!val") && !fn.includes("!date") && !fn.includes("return \"—\"") && !fn.includes("return '-'")) {
        dateFnIssues.push({ file: rel, fn });
      }
    }
  }
}

console.log("Custom formatDate implementations with potential null issues:", dateFnIssues.length);
dateFnIssues.forEach((it) => console.log(`- ${it.file}: ${it.fn}`));

console.log("=== DATA FLOW AUDIT FINISHED ===");
