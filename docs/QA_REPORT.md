# Pre-launch QA report — 20 Oct 2026

Tested: the production build (`npm run build` → `vite preview`, localhost) with Lighthouse 12.8.2 in headless Chrome
(mobile = Moto G-class throttling, desktop preset), puppeteer keyboard scripts, the in-app browser at 390 px, and
headless Firefox 158 screenshots. Localhost has no CDN/HTTP2/compression tuning, so absolute timings will differ in
production; the before/after comparison is like-for-like.

## Lighthouse scores (Perf / A11y / Best practices / SEO)

| Page | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| `/` | **40** / 100 / 100 / 100 | **96** / 100 / 100 / 100 | 95 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/about` | 96 / 100 / 100 / 100 | 97 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/robotic-joint-replacement` | **75** / 100 / 100 / 100 | **96** / 100 / 100 / 100 | 98 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/book` | 96 / **95** / 100 / 100 | 96 / **100** / 100 / 100 | 100 / **95** / 100 / 100 | 99 / 100 / 100 / 100 |

Home mobile, before → after: LCP 6.1 s → 2.6 s, TBT 4,920 ms → 10 ms, TTI 9.0 s → ~2.6 s. CLS is 0–0.013 on every page
(the hero, the treatment cards and the photos don't shift; the largest shift is 0.011–0.013 on `.page-hero__copy` on
desktop inner pages, from the web-font swap). ±1 point changes on the other pages are run-to-run noise.

## Fonts: self-hosted (follow-up, same day)

Google Fonts was replaced by two self-hosted variable woff2 files: `public/fonts/archivo-latin-wght.woff2` (35 kB,
wght 600–900) and `manrope-latin-wght.woff2` (25 kB, wght 400–800). These are the same latin-subset files Google
served, so there's no visual change. The `@font-face` rules (`font-display: swap`, latin `unicode-range`) are in
`tokens.css`, both files are preloaded with `crossorigin` in `index.html`, and the OFL licences are in
`public/licenses/`. Metric-matched Arial fallback faces (`size-adjust` / `ascent-override` / `descent-override`)
sit in the font stacks so the swap doesn't shift the layout. There are no more requests to Google.

Lighthouse 12.8.2, `vite preview` on localhost, median of 3 runs per page (Perf; A11y / BP / SEO stayed at 100):

| Page | Mobile Perf | Mobile FCP / LCP | Desktop Perf | Desktop CLS |
|---|---|---|---|---|
| `/` | 96 → **99** | 1.67 / 2.65 s → **1.20 / 2.19 s** | 98 → **100** | 0.001 → 0 |
| `/about` | 96 → **98** | 1.66 / 2.63 s → **1.21 / 2.26 s** | 99 → **100** | 0.013 → **0** |
| `/book` | 96 → **99** | 1.66 / 2.61 s → **1.21 / 2.03 s** | 100 → 100 | 0.005 → 0 |
| `/robotic-joint-replacement` | 95 → **98** | 1.66 / 2.75 s → **1.21 / 2.26 s** | 98 → **100** | 0.012 → **0** |

Desktop FCP went from ≈0.5 s to ≈0.35 s, and LCP from 0.8–1.05 s to 0.47–0.65 s. The only render-blocking
resource left is the site's own CSS file. I compared viewport screenshots (headless Chrome, fonts loaded, at 390 and
1440 px, all 4 pages) before and after: they're pixel-identical, apart from the `ja-float` drift glyph on home at
390 px. `npm run build` and the prerender pass, and every prerendered page has the two font preloads.

## What I fixed

| # | Issue | Fix | File |
|---|---|---|---|
| 1 | **three.js (128 kB gz), the knee engine and the 0.44 MB model loaded and initialised on every Home/Robotic page load**, not when the story was near. This was the whole of Home mobile's 4.9 s TBT and 6 s LCP. | `KneeCanvas` now waits for an IntersectionObserver (`rootMargin: 75% 0px`) before the dynamic import. Verified in headless Chrome: at 390 px nothing loads at the top of `/` or `/robotic-joint-replacement`; scrolling to the story loads it and the canvas becomes ready. On desktop (1440×900) the story is less than one screen below the fold, so it still loads at start, as it should. | `src/three/KneeCanvas.tsx` |
| 2 | Home portrait was downloaded twice on phones: `index.html` preloaded the 640w file, but the `<picture>` picks the 1000w file at DPR ≥ 1.75. | Preload now uses the same `imagesrcset`/`imagesizes` as the `<picture>`, plus `fetchpriority="high"`. Prerender still strips it on inner pages. | `index.html` |
| 3 | Sunday in the booking day picker used `opacity: .6` → day/month labels 2.4:1 (axe fail). | Shown as muted with `--text-3` colour instead of opacity (≥ 4.5:1). | `global.css` |
| 4 | White-on-blue feature treatment card: subtitle `#dbe8f8` was 4.0:1 on the lighter part of the gradient at 11.8 px. | Subtitle is now `#fff` (worst case 4.5:1, the same as the title). | `global.css` |
| 5 | Logo link `aria-label` ("Dr. Siddharth Gupta — home") hid the visible subtitle (label-in-name, WCAG 2.5.3). | Removed the `aria-label` and added a visually hidden " — home" after the visible text. | `Layout.tsx` |
| 6 | Footer used `h3`s with no `h2` above them on `/book` (heading-order). | Footer headings are now `h2` with the same class, so they look the same. | `Layout.tsx` |
| 7 | Full-screen mobile menu: Tab could move to links hidden behind the sheet. | `#main` and the footer get `inert` while the sheet is open. Tab now cycles through the menu → browser UI → header. Esc closes the menu (focus stays on the menu button). | `Layout.tsx` |
| 8 | Mobile menu "Conditions" (`/#conditions`) had `aria-current="page"` on the home page. | Hash links render as a plain `Link`, as they already do in the desktop nav. | `Layout.tsx` |
| 9 | Treatment-card buttons scrolled to Conditions, but keyboard and screen-reader focus stayed on the card. | Focus moves to the selected tab (`preventScroll`). | `HomeSections.tsx` |
| 10 | Booking errors were announced (`role="alert"`), but focus stayed on Submit and the fields weren't marked invalid. | The failing field gets focus, `aria-invalid="true"` and `aria-describedby="book-error"`. | `Book.tsx` |
| 11 | With `prefers-reduced-motion`, the global 0.01 ms override still ran the joint-art assembly with its stagger delays, plus the hover ripple and sweep. | Explicit reduced-motion rule: `.ja`, `.ja-part`, `.ja-sweep` get `animation: none`, and hover poses switch without a transition. Verified: no running animations on `.ja` under reduce; `ja-float` still runs normally. | `global.css` |

`npm run build` passes (tsc + client + SSR + prerender).

## Checked and OK
- **Keyboard:** skip link; header nav; Segmented tabs (←/→/Home/End move and select, roving tabindex, `tabpanel` labelled by
  the active tab); treatment cards are real `<button>`s; carousel track is focusable and Previous/Next disable at the ends;
  FAQ is native `<details>/<summary>`; story step buttons.
- **Booking:** location, day and session are real radios (arrow keys work) with a visible `:has(:focus-visible)` ring;
  floating labels are real `<label>`s; the summary is `aria-live="polite"`.
- **Contrast:** navy on mint (chips, circle arrows, FAQ +) is 8.5:1; `--text-3` on `--bg` is ≥ 5:1.
- **Images:** every content image has alt text (case-card images are decorative, `alt=""`, inside a titled link). CLS is
  ≈ 0 because the photo frames have fixed aspect ratios, so I didn't add `width`/`height` to `Photo`.
- **SEO:** 100 everywhere. Unique title, description and canonical per route; the 404 page is `noindex`.

## Browsers
- **Chrome:** everything above.
- **Firefox 158 (headless screenshots):** at 390 px and 1440 px the layout matches Chrome. Backdrop-filter glass, the
  `:has()` floating labels on /book, the selected-radio cards, the Segmented thumb and the CSS `translate`/`rotate` drift
  all render. Headless screenshots are taken mid-load, so fades and reveals look partly faded there; that's capture
  timing, not a bug. I couldn't open the FAQ in headless mode, so `::details-content` was not checked in Firefox (without
  support it just opens without the height animation).
- **Safari 27:** installed but **not tested**. Driving it needs "Allow Remote Automation" (`safaridriver --enable`
  needs sudo), which I didn't change. Please check by hand on an iPhone and in Safari: the header blur
  (`-webkit-backdrop-filter` is in the CSS), the sticky knee story with `100svh`, the FAQ animation and the floating labels.

## Images and links (follow-up, same day)

- **New image variants.** Made from the JPG masters in `public/images/` with Pillow (Lanczos resize, WebP `quality=80`,
  `method=6`). Those settings give file sizes closest to the existing variants (within ≈ 5 %). The JPGs stay as the only
  fallback, as before.
  - `portrait-scrubs-120.webp` (2.3 kB): the /book summary avatar now uses this instead of the 640w file (21 kB).
  - `portrait-suit-480/700`, `theatre-1-480/700` and `theatre-2-480/700`: added to `widths` on About, Robotic, the home
    "About" photo and the case cards (the case cards had only an 800w file).

  700w is there because a 480w file alone wouldn't help on Lighthouse's phone: its ≈ 373 px slot at DPR 1.75 needs
  ≈ 650 px, so the browser would still pick 800/900w. 480w serves DPR 1–1.25 phones and the 400 px desktop case cards.
- **Case-study links.** A visually hidden " (opens in a new tab)" follows "Read the case study" in each card. The copy is
  `home.cases.newTab` in `site.ts`. `.case-card` now has `position: relative`. Without it, the absolutely positioned
  `.sr-only` span on the third card sat at x ≈ 716 px and widened the mobile layout viewport to 716 px. That also made the
  knee story count as "near", so three.js loaded at page start. I caught and fixed this before the runs below.
- **Route lazy-loading.** Skipped; see item 2 under "Left to do".

Lighthouse 12.8.2, `vite preview` on localhost, 3 runs per page. A11y / BP / SEO are 100 on every run. Times are medians.

| Page | Mobile Perf | Mobile FCP / LCP | Desktop Perf | Desktop FCP / LCP | Image now loaded (mobile) |
|---|---|---|---|---|---|
| `/` | 98 / 99 / 99 | 1.20 / 2.19 s | 100 ×3 | 0.35 / 0.53 s | (unchanged; case cards are lazy) |
| `/about` | 98 ×3 | 1.21 / 2.26 s | 100 ×3 | 0.32 / 0.48 s | `portrait-suit-700` 43 kB (was 900w, 67 kB) |
| `/book` | 99 ×3 | 1.21 / 1.96 s | 100 ×3 | 0.32 / 0.44 s | `portrait-scrubs-120` 3 kB (was 640w, 21 kB) |
| `/robotic-joint-replacement` | 98 ×3 | 1.20 / 2.25 s | 100 ×3 | 0.41 / 0.65 s | `theatre-2-700` 51 kB (was 800w, 69 kB) |

TBT is 0 ms and CLS is 0 everywhere. "Properly size images" now passes on /book and Robotic. Three flags remain, all
from things I didn't change:
- About: ≈ 18 kB (mobile) and ≈ 22 kB (desktop). The tall portrait is cropped by `object-fit: cover` into a squarer
  frame, so only a cropped master would clear this.
- Home: the hero portrait, 32 kB on mobile and 13 kB on desktop. This was already flagged before.

Checked at 390 px (DPR 3) and 1440 px in headless Chrome:
- `scrollWidth` equals the viewport on all 4 pages, so there's no horizontal overflow.
- The new files load and look sharp: the avatar, the About/Robotic heroes and the case cards.
- `npm run build` passes.

## Left to do (suggested fixes)
1. ~~**Google Fonts blocked rendering on every page**~~ **Done.** The fonts are self-hosted now; see "Fonts: self-hosted" above.
2. ~~**Unused JS ≈ 27–31 kB** in the main bundle on inner pages~~ **Skipped on purpose.** Book + Robotic + LocalNav
   come to ≈ 4.7 kB gz of the 72 kB main bundle. The "unused" bytes are mostly React DOM code that isn't run on first
   paint, and lazy routes wouldn't remove that. `React.lazy` would also make `/book` and `/robotic-joint-replacement`
   wait for an extra chunk before they hydrate, and it would need a server/client split around `<Suspense>` to keep the
   prerender intact. That costs more than it saves. See "Images and links" below.
3. ~~**Image sizing**~~ **Done.** See "Images and links" below.
4. ~~**Case-study links open the old blog in a new tab** with no warning~~ **Done.** See "Images and links" below.
5. **Mobile menu focus:** when the menu opens, focus stays on the toggle (acceptable). Optionally move it to the first
   link.
6. **Booking flow:** a Sunday can still be selected although it's shown muted. Confirm with the clinic whether Sunday
   OPDs exist (content question, not changed).
7. ~~**Font-swap CLS 0.011–0.013** on desktop inner-page heroes~~ **Done.** The metric-matched fallback faces bring CLS to 0.
