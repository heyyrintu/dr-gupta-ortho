// Build-time prerender: renders each route with the SSR bundle (dist-ssr/) into dist/*.html
// so crawlers and link previews get full HTML + per-route <head>. The browser then hydrates.
// Run via `npm run build` (after `vite build` and `vite build --ssr`).
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');
const SITE = 'https://drsiddharthguptaortho.in';

// url → output file. "<name>.html" is served at "/<name>" by Netlify, Cloudflare Pages and
// Vercel (cleanUrls). 404.html is served for any unknown URL with a real 404 status.
const ROUTES = [
  ['/', 'index.html'],
  ['/robotic-joint-replacement', 'robotic-joint-replacement.html'],
  ['/about', 'about.html'],
  ['/book', 'book.html'],
  ['/404', '404.html'],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function setHead(html, { title, description, path: p }, file) {
  const url = SITE + (p === '/404' ? '/' : p);
  const swaps = [
    [/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`],
    [/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`],
    [/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`],
    [/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`],
    [/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`],
    // a 404 must not claim a canonical URL; it is also kept out of the index
    [/<link rel="canonical" href="[^"]*" \/>/, file === '404.html' ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`],
  ];
  // the hero portrait preload only helps the home page's LCP
  if (p !== '/') swaps.push([/\s*<!-- Above-the-fold portrait -->\s*<link rel="preload"[^>]*>/, '']);
  for (const [re, rep] of swaps) {
    if (!re.test(html)) throw new Error(`prerender: ${file}: head tag not found for ${re}`);
    html = html.replace(re, rep);
  }
  return html;
}

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: <div id="root"></div> not found in dist/index.html');
const { render } = await import(path.join(ssrDir, 'entry-server.js'));

for (const [url, file] of ROUTES) {
  const { html, head } = render(url);
  if (!head.title || !head.description) throw new Error(`prerender: ${url} rendered no <Seo>`);
  const page = setHead(template, head, file).replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  await writeFile(path.join(dist, file), page);
  console.log(`prerendered ${url.padEnd(28)} → dist/${file} (${(page.length / 1024).toFixed(1)} kB)`);
}

await rm(ssrDir, { recursive: true, force: true });
