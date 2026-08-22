#!/usr/bin/env node
/**
 * S4-4 Documentation Drift Guard
 *
 * Verifies that `structure-react.txt` accurately reflects the real
 * `resources/js` file tree. The doc is regenerated from the actual tree,
 * so any divergence (renamed folder, new top-level dir, deleted module)
 * is a documentation-drift regression that should fail CI.
 *
 * Exit code 0 = docs match; 1 = drift detected.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DOC = path.join(ROOT, 'structure-react.txt');
const SRC = path.join(ROOT, 'resources', 'js');

function actualTree() {
  const out = execSync(
    `find resources/js -type f \\( -name "*.tsx" -o -name "*.ts" \\) | sed "s|resources/js/||" | sort`,
    { cwd: ROOT, encoding: 'utf8' }
  )
    .trim()
    .split('\n')
    .filter(Boolean);

  const tree = {};
  for (const f of out) {
    const parts = f.split('/');
    let node = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      node[parts[i]] = node[parts[i]] || {};
      node = node[parts[i]];
    }
    node['__files'] = node['__files'] || [];
    node['__files'].push(parts[parts.length - 1]);
  }
  return tree;
}

function render(node, prefix) {
  const dirs = Object.keys(node).filter((k) => k !== '__files').sort();
  const files = (node['__files'] || []).slice().sort();
  let s = '';
  for (const d of dirs) {
    s += prefix + d + '/\n' + render(node[d], prefix + '  ');
  }
  for (const f of files) {
    s += prefix + f + '\n';
  }
  return s;
}

function main() {
  if (!fs.existsSync(DOC)) {
    console.error('ERROR: structure-react.txt is missing.');
    process.exit(1);
  }

  const expected = 'resources/js\n\n' + render(actualTree(), '');
  const actual = fs.readFileSync(DOC, 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n';

  if (actual === expected) {
    console.log('OK: structure-react.txt matches the actual resources/js tree.');
    process.exit(0);
  }

  console.error('ERROR: structure-react.txt has drifted from the actual resources/js tree.');
  console.error('Run `node scripts/check-docs-structure.cjs --write` to regenerate it.');

  if (process.argv.includes('--write')) {
    fs.writeFileSync(DOC, expected);
    console.log('Regenerated structure-react.txt.');
  }

  process.exit(1);
}

main();
