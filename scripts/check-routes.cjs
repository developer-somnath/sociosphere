/**
 * CI guard: fail the build if any `route('name')` referenced in the frontend
 * is not registered in routes/web.php (and routes/auth.php).
 *
 * This prevents the route-regression class of bugs where a page calls
 * `route('module.index')` but no route is registered, which crashes at runtime
 * with a Ziggy "route not found" error.
 *
 * Pure Node (no PHP runtime required) so it runs in any CI environment.
 *
 * Usage: node scripts/check-routes.cjs
 * Exit code 0 = all good, 1 = dangling route reference(s) found.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ROUTE_FILES = ["routes/web.php", "routes/auth.php"];
const FRONTEND_DIR = "resources/js";

// --- 1. Collect registered route names from the PHP route files ---------------
function extractRouteNames(php) {
  const names = new Set();
  // ->name('foo.bar')
  const inline = /->name\(\s*['"]([a-zA-Z0-9_.]+)['"]\s*\)/g;
  // ->names([ 'index' => 'foo.index', ... ])
  const namesArray = /->names\(\s*\[(.*?)\]\s*\)/gs;
  let m;
  while ((m = inline.exec(php))) names.add(m[1]);
  while ((m = namesArray.exec(php))) {
    const body = m[1];
    const pair = /'([a-zA-Z0-9_.]+)'\s*=>\s*'([a-zA-Z0-9_.]+)'/g;
    let p;
    while ((p = pair.exec(body))) names.add(p[2]);
  }
  return names;
}

const registered = new Set();
for (const rf of ROUTE_FILES) {
  const full = path.join(ROOT, rf);
  if (!fs.existsSync(full)) continue;
  for (const n of extractRouteNames(fs.readFileSync(full, "utf8"))) {
    registered.add(n);
  }
}

// --- 2. Collect route() references from the frontend --------------------------
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) files.push(p);
  }
}
walk(path.join(ROOT, FRONTEND_DIR));

const referenced = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  // route('foo.bar') or route("foo.bar")
  const re = /route\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
  let m;
  while ((m = re.exec(src))) referenced.add(m[1]);
}

// --- 3. Diff -----------------------------------------------------------------
const dangling = Array.from(referenced)
  .filter((r) => !registered.has(r))
  .sort();

console.log("REGISTERED ROUTES:", registered.size);
console.log("FRONTEND route() REFERENCES:", referenced.size);
console.log("DANGLING REFERENCES:", dangling.length);
if (dangling.length) {
  console.log("\nThe following route() calls have no registered route:\n");
  console.log(dangling.join("\n"));
  console.log(
    "\nFix: add the missing route to routes/web.php (or correct the reference)."
  );
  process.exit(1);
}
console.log("\nAll frontend route() references resolve. OK.");
