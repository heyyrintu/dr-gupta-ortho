// Post-build regression check for the prerendered pages in dist/.
// Run after `npm run build` (`npm run check`). Fails (exit 1) if any page loses something the
// site must keep through redesigns: one <h1>, title + canonical (noindex on 404), the medical
// disclaimer, the BodyParts3D attribution (CC BY 4.0 requires it), self-hosted fonts only, and
// local image/font/model references that actually exist in dist/.
import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const BASE = process.env.BASE_PATH || '/';

const PAGES = ['index.html', 'about.html', 'book.html', 'robotic-joint-replacement.html', '404.html'];
const DISCLAIMER = 'not a substitute for a medical consultation';
const ATTRIBUTION = 'BodyParts3D';
const EXTERNAL_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'use.typekit.net', 'fonts.bunny.net', 'fonts.cdnfonts.com'];

const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const exists = (p) => access(p).then(() => true, () => false);

/** "/dr-gupta-ortho/images/x.webp" → "<dist>/images/x.webp"; returns null for external/data URLs. */
function toDistPath(url) {
  if (!url || /^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) return null;
  let p = url.split(/[?#]/)[0];
  if (BASE !== '/' && p.startsWith(BASE)) p = '/' + p.slice(BASE.length);
  if (!p.startsWith('/')) return null; // relative app links aren't files we can resolve here
  return path.join(dist, decodeURIComponent(p));
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

for (const file of PAGES) {
  const full = path.join(dist, file);
  if (!(await exists(full))) {
    fail(file, 'missing — did `npm run build` run?');
    continue;
  }
  const html = await readFile(full, 'utf8');

  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(file, `expected exactly one <h1>, found ${h1s.length}`);

  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim();
  if (!title) fail(file, 'empty or missing <title>');

  if (file === '404.html') {
    if (!/<meta name="robots" content="noindex[^"]*"/.test(html)) fail(file, '404 must be noindex');
    if (/<link rel="canonical"/.test(html)) fail(file, '404 must not declare a canonical URL');
  } else if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) {
    fail(file, 'missing canonical link');
  }

  if (!html.includes(DISCLAIMER)) fail(file, `footer disclaimer missing ("${DISCLAIMER}")`);
  if (!html.includes(ATTRIBUTION)) fail(file, 'BodyParts3D attribution missing');

  for (const host of EXTERNAL_FONT_HOSTS) if (html.includes(host)) fail(file, `references external font host ${host}`);

  // font preloads must point at files that exist (a renamed font silently breaks the preload)
  const preloads = html.match(/<link rel="preload"[^>]*>/g) ?? [];
  for (const tag of preloads) {
    if (attr(tag, 'as') !== 'font') continue;
    const p = toDistPath(attr(tag, 'href'));
    if (p && !(await exists(p))) fail(file, `font preload points at a missing file: ${attr(tag, 'href')}`);
  }

  // every local image / font / model reference (src, srcset, imagesrcset, href) must resolve
  const refs = new Set();
  for (const m of html.matchAll(/\s(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/g)) for (const part of m[1].split(',')) refs.add(part.trim().split(/\s+/)[0]);
  for (const ref of refs) {
    if (!/\/(images|fonts|models|licenses)\/|\.(svg|png|webp|jpe?g|woff2|webmanifest)$/.test(ref)) continue;
    const p = toDistPath(ref);
    if (p && !(await exists(p))) fail(file, `broken local reference: ${ref}`);
  }
}

// built CSS must not pull fonts from a CDN either
const assets = path.join(dist, 'assets');
if (await exists(assets)) {
  for (const f of (await readdir(assets)).filter((f) => f.endsWith('.css'))) {
    const css = await readFile(path.join(assets, f), 'utf8');
    for (const host of EXTERNAL_FONT_HOSTS) if (css.includes(host)) fail(`assets/${f}`, `references external font host ${host}`);
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      if (!/\.(woff2?|ttf|otf)$/.test(m[1])) continue;
      const p = toDistPath(m[1]);
      if (p && !(await exists(p))) fail(`assets/${f}`, `@font-face points at a missing file: ${m[1]}`);
    }
  }
}

if (errors.length) {
  console.error(`check-dist: ${errors.length} problem(s)\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`check-dist: ${PAGES.length} pages OK (one h1, title, canonical/noindex, disclaimer, attribution, local fonts, local assets)`);
