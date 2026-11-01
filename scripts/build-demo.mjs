// Builds the single-file design-options demo:
//   docs/design-demo/src/{page.mjs, demo.css, demo.js, sprites.svg}
//   + fonts (docs/design-demo/assets/fonts, public/fonts) + photos (public/images) + logo-mark.svg
//   → docs/design-demo/dr-gupta-design-options.html  (everything inlined as base64, opens from file://)
// Copy comes straight from src/content/site.ts (Node's built-in TypeScript type-stripping loads it).
//   npm run demo:build
import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demo = path.join(root, 'docs/design-demo');
const out = path.join(demo, 'dr-gupta-design-options.html');
const MAX_BYTES = 2.5 * 1024 * 1024;

const site = await import(pathToFileURL(path.join(root, 'src/content/site.ts')).href);
const { render } = await import(pathToFileURL(path.join(demo, 'src/page.mjs')).href);

const b64 = async (p) => (await readFile(p)).toString('base64');
const dataUri = async (p, mime) => `data:${mime};base64,${await b64(p)}`;

const FONTS = {
  __FONT_FRAUNCES__: path.join(demo, 'assets/fonts/fraunces-latin-opsz-wght.woff2'),
  __FONT_NEWSREADER__: path.join(demo, 'assets/fonts/newsreader-latin-opsz-wght.woff2'),
  __FONT_MANROPE__: path.join(root, 'public/fonts/manrope-latin-wght.woff2'),
};

let css = await readFile(path.join(demo, 'src/demo.css'), 'utf8');
for (const [token, file] of Object.entries(FONTS)) css = css.replaceAll(token, `'${await dataUri(file, 'font/woff2')}'`);
css = css.replaceAll('__LOGO_MASK__', `'${await dataUri(path.join(root, 'public/logo-mark.svg'), 'image/svg+xml')}'`);

const images = new Map();
const used = [];
for (const name of ['portrait-suit-700', 'portrait-scrubs-1000', 'theatre-1-800']) {
  images.set(name, await dataUri(path.join(root, `public/images/${name}.webp`), 'image/webp'));
}
const img = (name) => {
  if (!images.has(name)) throw new Error(`build-demo: image ${name} not preloaded in build-demo.mjs`);
  used.push(name);
  return images.get(name);
};

const js = await readFile(path.join(demo, 'src/demo.js'), 'utf8');
const sprites = await readFile(path.join(demo, 'src/sprites.svg'), 'utf8');
const body = render({ site, img });

const html = `<!doctype html>
<html lang="en-IN" data-direction="editorial" data-font="fraunces" data-art="line" data-logo="teal" data-slots="off">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<meta name="theme-color" content="#f7f4ee" />
<title>Dr. Siddharth Gupta: design options for the new website</title>
<style>
${css}
</style>
</head>
<body>
${sprites}
${body}
<script>
${js}
</script>
</body>
</html>
`;

// self-contained or nothing: no remote stylesheets, scripts, images, fonts or leftover placeholders
const problems = [];
if (/\ssrc="https?:/i.test(html)) problems.push('remote src= found');
if (/<link[^>]+rel="(stylesheet|preload|modulepreload)"[^>]+href="https?:/i.test(html)) problems.push('remote stylesheet/preload found');
if (/<script[^>]+src=/i.test(html)) problems.push('external <script src> found');
if (/url\(\s*['"]?https?:/i.test(html)) problems.push('remote url() in CSS found');
if (/__(FONT_[A-Z]+|LOGO_MASK)__/.test(html)) problems.push('unreplaced asset placeholder');
const bytes = Buffer.byteLength(html);
if (bytes > MAX_BYTES) problems.push(`file is ${(bytes / 1048576).toFixed(2)} MB, over the 2.5 MB budget`);
if (problems.length) {
  console.error(`build-demo: ${problems.join('; ')}`);
  process.exit(1);
}

await writeFile(out, html);
const { size } = await stat(out);
console.log(`build-demo: wrote ${path.relative(root, out)} (${(size / 1024).toFixed(0)} kB, ${new Set(used).size} photos, 3 fonts inlined)`);
