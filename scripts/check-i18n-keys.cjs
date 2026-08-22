const fs = require("fs");
const path = require("path");

const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p);
  }
}
walk("resources/js");

const keys = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const re = /t\("([a-zA-Z0-9_.]+)"/g;
  let m;
  while ((m = re.exec(src))) keys.add(m[1]);
}

const en = JSON.parse(fs.readFileSync("resources/js/locales/en.json", "utf8"));
const missing = Array.from(keys)
  .filter((k) => !(k in en))
  .sort();

console.log("TOTAL KEYS USED:", keys.size);
console.log("MISSING FROM en.json:", missing.length);
console.log(missing.join("\n"));