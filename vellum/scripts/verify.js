#!/usr/bin/env node
// Cross-check the five places a theme id has to appear.
//
// MV3 content scripts are classic scripts, so nothing can be imported and the
// catalogue is duplicated by necessity. A half-added theme is therefore the most
// likely way to break Vellum: it shows in the popup and renders nothing, or it
// animates and can never be selected. This fails loudly instead.

const fs = require('fs');
const path = require('path');

const EXT = path.join(__dirname, '..', 'extension');
const read = (p) => fs.readFileSync(path.join(EXT, p), 'utf8');

const bg = read('background.js');
const inject = read('content/inject.js');
const popupJs = read('popup/popup.js');
const popupHtml = read('popup/popup.html');

const list = (name) => {
  const m = bg.match(new RegExp(name + '\\s*=\\s*\\[(.*?)\\];', 's'));
  if (!m) throw new Error('could not find ' + name + ' in background.js');
  return m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
};

// 1. background.js — entitlement, and the authority on what exists
const free = list('ALL_FREE');
const pro = list('ALL_PRO');
const all = [...free, ...pro];

// 2. content/inject.js — the palette
const themeBlock = inject.slice(inject.indexOf('const THEMES = {'), inject.indexOf('let cssEl = null;'));
const palettes = [...themeBlock.matchAll(/^\s{4}([a-z0-9]+):\s*\{ name:/gm)].map((m) => m[1]);

// 3. content/inject.js — the engine dispatch table in startAnimation()
const dispatch = inject
  .slice(inject.indexOf('    const fns = {'), inject.indexOf('if (fns[id]) fns[id](canvas, ctx);'))
  .replace(/\/\/[^\n]*/g, '');          // comments in the table name batches, not themes
const engines = new Set(dispatch.match(/[a-zA-Z0-9_]+/g).filter((w) => w !== 'const' && w !== 'fns'));

// 4. popup/popup.js — name, number, section, free flag
const entries = [...popupJs.matchAll(/\{ id:'([a-z0-9]+)', name:'([^']*)', num:'(\d+)', section:'([a-z]+)'(, free:true)?/g)]
  .map((m) => ({ id: m[1], name: m[2], num: m[3], section: m[4], free: !!m[5] }));

// 5. popup/popup.html — the grid swatch
const swatches = new Set([...popupHtml.matchAll(/\.pv-([a-z0-9]+)\s/g)].map((m) => m[1]));

const problems = [];
const check = (label, missing) => { if (missing.length) problems.push(label + ': ' + missing.join(', ')); };

check('in background.js but has no palette in inject.js', all.filter((id) => !palettes.includes(id)));
check('has a palette but is not in background.js', palettes.filter((id) => !all.includes(id)));
check('in background.js but has no engine in the fns dispatch', all.filter((id) => id !== 'default' && !engines.has(id)));
check('in background.js but missing from the popup catalogue', all.filter((id) => !entries.some((e) => e.id === id)));
check('in the popup catalogue but not in background.js', entries.map((e) => e.id).filter((id) => !all.includes(id)));
check('in background.js but has no .pv- swatch in popup.html', all.filter((id) => !swatches.has(id)));

// The free flag is stored twice; they must not disagree.
const freeSet = new Set(free);
check('free/Pro disagreement between background.js and popup.js',
  entries.filter((e) => e.free !== freeSet.has(e.id)).map((e) => e.id));

// Catalogue numbers should be unique and run 001..N with no gaps.
const nums = entries.map((e) => +e.num).sort((a, b) => a - b);
const gaps = nums.filter((n, i) => n !== i + 1);
if (gaps.length) problems.push('catalogue numbers are not a clean 1..N run, first bad value: ' + gaps[0]);

const version = JSON.parse(read('manifest.json')).version;
console.log(`Vellum ${version}`);
console.log(`  background.js  ${all.length} themes (${free.length} free, ${pro.length} pro)`);
console.log(`  inject.js      ${palettes.length} palettes, ${engines.size} engine identifiers in the dispatch table`);
console.log(`  popup.js       ${entries.length} catalogue entries`);
console.log(`  popup.html     ${swatches.size} preview swatches`);

if (problems.length) {
  console.error('\nFAIL');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log('\nOK — all five registries agree.');
