// WCAG contrast check for design tokens. No dependencies.
//
// Reads CSS custom properties from a stylesheet, resolves var() chains inside a theme scope
// (e.g. `:root`, or `[data-direction="dark"]` layered over `:root`), and checks the
// foreground/background pairs declared in CHECKS below:
//   text  ≥ 4.5:1   normal body/UI text
//   large ≥ 3:1     ≥ 24px regular or ≥ 18.66px bold text
//   ui    ≥ 3:1     icons, borders that convey state, focus rings
// Semi-transparent colours are composited (fg over bg, bg over `on`, default white).
//
//   node scripts/check-contrast.mjs              check every scope in CHECKS
//   node scripts/check-contrast.mjs --self-test  prove the checker catches a bad pair
// Note: custom properties inside @media blocks are treated as unconditional.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN = { text: 4.5, large: 3, ui: 3 };

/**
 * Each check: a CSS file, the scope to read tokens from (+ scopes it layers over), and pairs
 * [foreground, background, kind, on?]. Tokens are `--name`; literal colours are allowed too.
 * Keep this list in step with how tokens are actually used in the stylesheets.
 */
export const CHECKS = [
  {
    label: 'site tokens (:root)',
    file: 'src/styles/tokens.css',
    scope: ':root',
    pairs: [
      ['--navy', '--bg', 'text'],
      ['--navy-ink', '--bg', 'text'],
      ['--text-2', '--bg', 'text'],
      ['--text-3', '--bg', 'text'],
      ['--text-3', '--card', 'text'],
      ['--text-2', '--bg-2', 'text'],
      ['--blue', '--card', 'text'],
      ['--link', '--card', 'text'],
      ['--navy', '--mint', 'text'],
      ['--white', '--navy', 'text'],
      ['--success', '--card', 'text'],
      ['--danger', '--card', 'text'],
    ],
  },
];

/* Design-options demo (docs/design-demo): the same semantic pairs for each direction. */
const DEMO_PAIRS = [
  ['--ink', '--ground', 'text'], ['--ink', '--band', 'text'], ['--ink', '--surface', 'text'],
  ['--text-2', '--ground', 'text'], ['--text-2', '--band', 'text'], ['--text-2', '--surface', 'text'],
  ['--text-3', '--ground', 'text'], ['--text-3', '--band', 'text'], ['--text-3', '--surface', 'text'],
  ['--accent-text', '--ground', 'text'], ['--accent-text', '--band', 'text'], ['--accent-text', '--surface', 'text'],
  ['--btn-ink', '--btn-bg', 'text'], ['--btn-ink', '--btn-bg-hover', 'text'],
  ['--cta-ink', '--cta-bg', 'text'], ['--cta-text-2', '--cta-bg', 'text'], ['--cta-btn-ink', '--cta-btn-bg', 'text'],
  ['--foot-ink', '--foot-bg', 'text'], ['--foot-text-2', '--foot-bg', 'text'], ['--foot-accent', '--foot-bg', 'text'],
  ['--focus', '--ground', 'ui'], ['--focus', '--band', 'ui'],
];
for (const d of ['editorial', 'clinical', 'dark']) {
  CHECKS.push({ label: `demo · ${d}`, file: 'docs/design-demo/src/demo.css', inherit: [':root'], scope: `[data-direction="${d}"]`, pairs: DEMO_PAIRS });
}

/* ---------------- CSS parsing ---------------- */
const norm = (s) => s.replace(/\s+/g, ' ').replace(/'/g, '"').trim();

function tokensFor(css, selectors) {
  const vars = {};
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const sel of selectors) {
    const want = norm(sel);
    for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const list = m[1].split(',').map(norm);
      if (!list.includes(want)) continue;
      for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) vars[d[1]] = d[2].trim();
    }
  }
  return vars;
}

function resolve(value, vars, depth = 0) {
  if (depth > 20) throw new Error(`var() cycle near ${value}`);
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_, name, fallback) => {
    if (name in vars) return resolve(vars[name], vars, depth + 1);
    if (fallback) return resolve(fallback, vars, depth + 1);
    throw new Error(`undefined token ${name}`);
  });
}

/* ---------------- colour maths ---------------- */
function parseColor(input) {
  const s = input.trim().toLowerCase();
  if (s === 'transparent') return [0, 0, 0, 0];
  if (s === 'white') return [255, 255, 255, 1];
  if (s === 'black') return [0, 0, 0, 1];
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`bad hex ${input}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    const [r, g, b] = parts.slice(0, 3).map(Number);
    const a = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : Number(parts[3]);
    return [r, g, b, a];
  }
  throw new Error(`not a plain colour: "${input}"`);
}

const over = (top, bottom) => {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1);
};

function luminance([r, g, b]) {
  const lin = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function ratio(fg, bg) {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

/* ---------------- runner ---------------- */
async function runCheck(check) {
  const css = await readFile(path.join(root, check.file), 'utf8');
  const vars = tokensFor(css, [...(check.inherit ?? []), check.scope]);
  const color = (ref) => parseColor(ref.startsWith('--') ? resolve(`var(${ref})`, vars) : ref);
  const rows = [];
  for (const [fgRef, bgRef, kind = 'text', onRef = '#ffffff'] of check.pairs) {
    const bg = over(color(bgRef), color(onRef));
    const fg = over(color(fgRef), bg);
    const r = ratio(fg, bg);
    rows.push({ fgRef, bgRef, kind, r, ok: r >= MIN[kind] });
  }
  return rows;
}

async function main() {
  if (process.argv.includes('--self-test')) {
    const bad = ratio(parseColor('#8a8a8a'), parseColor('#a0a0a0'));
    const good = ratio(parseColor('#000'), parseColor('#fff'));
    const mid = ratio(over(parseColor('rgba(0,0,0,0.5)'), parseColor('#fff')), parseColor('#fff'));
    const pass = bad < MIN.text && Math.abs(good - 21) < 0.01 && mid > 3.9 && mid < 4.0;
    console.log(`self-test: bad pair ${bad.toFixed(2)}:1 (must fail), black/white ${good.toFixed(2)}:1, 50% black on white ${mid.toFixed(2)}:1`);
    if (!pass) {
      console.error('self-test FAILED: the checker would not catch a bad pair');
      process.exit(1);
    }
    console.log('self-test OK: a sub-4.5:1 pair is reported as a failure');
    return;
  }

  let failures = 0;
  for (const check of CHECKS) {
    let rows;
    try {
      rows = await runCheck(check);
    } catch (e) {
      console.error(`✗ ${check.label}: ${e.message}`);
      failures++;
      continue;
    }
    const bad = rows.filter((r) => !r.ok);
    failures += bad.length;
    console.log(`${bad.length ? '✗' : '✓'} ${check.label} — ${rows.length - bad.length}/${rows.length} pairs pass`);
    for (const r of rows) {
      if (r.ok && !process.argv.includes('--verbose')) continue;
      console.log(`   ${r.ok ? ' ' : '!'} ${r.fgRef} on ${r.bgRef} (${r.kind}): ${r.r.toFixed(2)}:1, needs ${MIN[r.kind]}:1`);
    }
  }
  if (failures) {
    console.error(`check-contrast: ${failures} failing pair(s)`);
    process.exit(1);
  }
}

await main();
