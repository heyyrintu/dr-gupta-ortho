# CLAUDE.md — Dr. Siddharth Gupta website

Guidance for Claude Code when working in this repository.

## What this is
Marketing + booking website for **Dr. Siddharth Gupta**, consultant orthopaedic & robotic joint
replacement surgeon (Kolkata & Howrah). Replaces the old WordPress/Elementor site at
drsiddharthguptaortho.in. Audience: **patients first** (often on phones, often older, often
arriving via Google/WhatsApp), referring doctors second.

Signature feature: a **real-time 3D knee** (three.js) built from real anatomical meshes that performs a
full robotic knee-replacement sequence in a pinned, scroll-driven section (Home + Robotic page). The owner
asked for the home hero to show only the doctor's portrait, so the knee is no longer in the hero
(`KneeCanvas mode="hero"` still exists in the engine but is unused).

## Commands
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + client build + SSR build + prerender → dist/*.html
npm run preview    # serve dist/ at http://localhost:4173
npm run typecheck
```
Always run `npm run build` before declaring work done — it must pass with zero TS errors.

## Stack
- Vite 5 + React 18 + TypeScript (strict) + react-router-dom 6 (BrowserRouter)
- three.js 0.169 — **lazy-loaded** (dynamic import in `KneeCanvas`), own chunk via `manualChunks`
- Plain CSS with design tokens (`src/styles/tokens.css`) + one stylesheet (`src/styles/global.css`).
  No CSS framework. No UI library. Keep it that way unless asked.

## Structure
```
index.html                 SEO meta, OG tags, JSON-LD Physician schema, font preloads (self-hosted Fraunces + Manrope
                           variable woff2 in public/fonts/, @font-face + metric fallbacks in tokens.css, OFL in licenses/)
public/
  models/knee-model.json   3D knee (base64 Int16 positions + baked AO per part, see below)
  images/                  photos as responsive WebP (+ JPG fallback), og-image.jpg
  licenses/                BodyParts3D licence (CC BY 4.0 — attribution required)
  robots.txt sitemap.xml _redirects favicon.svg
scripts/build_knee.py      how knee-model.json was generated (trimesh); re-run to change cuts
src/
  App.tsx                  routes: / · /robotic-joint-replacement · /about · /book · *
  main.tsx                 browser entry: hydrates prerendered HTML (createRoot in dev)
  entry-server.tsx         build-only SSR entry used by scripts/prerender.mjs
  content/site.ts          ★ ALL copy & practice data (doctor, locations, stats, FAQs, reviews…)
  components/Layout.tsx    transparent→ivory header (text nav with brass underline, phone, Book button + full-screen mobile menu), navy footer, docked action bar on phones
  components/ui.tsx        Icon, Button, Reveal, CountUp, SectionHead, Photo, Segmented, Carousel, MoreLink
  components/LocalNav.tsx  sticky in-page section bar with scroll-spy (Robotic page)
  components/Seo.tsx       per-route title/description/canonical/OG
  three/kneeEngine.ts      ★ the 3D scene: materials, lighting, stage animation logic
  three/surgicalRig.ts     robot arm + saw, navigation trackers, bone dust (story props)
  three/KneeCanvas.tsx     React wrapper: lazy import, model fetch, pause off-screen, fallback
  hooks/                   useScrollProgress (pinned section 0→1, smoothed), useInView, useReducedMotion
  sections/KneeStory.tsx   pinned scroll story (used on Home + Robotic page)
  sections/HomeSections.tsx Hero, StatsBand, Services, AboutTeaser, ConditionExplorer, LocationsStrip, Reviews, Cases, CtaBand
                           (+ shared Head, LocationList used by inner pages)
  pages/                   Home, Robotic, About, Book, NotFound
docs/BUILD_SPEC.md         design spec + acceptance criteria (read before UI changes)
docs/CONTENT_TODO.md       facts that must be confirmed by the clinic before launch
```

## Content rules (important)
- **Never invent medical facts, numbers, reviews, prices, timings or outcomes.** All copy lives in
  `src/content/site.ts`; unknown values are `null`/empty with a `// TODO` and the UI degrades
  gracefully (e.g. "Call to confirm timings", reviews section shows a "Read reviews on Google" card).
- Stats (4,590+ / 4,500+ / 9,950+) were carried over from the old site — flagged TODO to confirm.
- Robot-system uses (MAKO knee & hip; VELYS, CUVIS knee) are general knowledge — confirm per hospital.
- Keep the medical disclaimer in the footer. Keep tone factual, calm, patient-friendly; no hype
  ("best surgeon", "painless", "guaranteed") — Indian medical advertising norms (NMC) apply.
- Real photos of Dr. Gupta are in `public/images/` (sourced from his existing website).

## Design system (see tokens.css)
"Editorial private practice" — the client found the earlier "clinical glass" look (sky-blue gradients, frosted
cards, uppercase Archivo, mint pills) not classy enough. Now: the restraint of a private consultant's practice —
warm ivory ground, deep navy ink, a muted brass accent, serif display type, hairline rules instead of shadows and
glass, real photography instead of 3D-style icons. It is direction A of `docs/design-demo/`.
- Type: **Fraunces** (variable, opsz + wght, light ~360–420) for `.display-1/2/3`, the hero title, card titles,
  numerals and the wordmark — always sentence case, never bold or uppercase; body **Manrope**. Small labels
  (`.kicker`, list headings, dt) are 0.7rem uppercase tracked 0.14–0.16em.
- Colour: page `--bg #f7f4ee`, bands `--bg-2 #efe9df`, surfaces `--card #fffdf9`. `--ink #14213d` headings,
  primary buttons, selected states; `--dark #0e1830` CTA band + footer. **`--brass #b0915f` is decorative only**
  (rules, underlines, keylines, list dashes); brass as text uses `--brass-text #7a5c34` (numerals, `.kicker`,
  `.accent` — the second half of the hero title). On dark: `--on-dark`, `--on-dark-2`, `--on-dark-accent`.
  Every text pair is in `scripts/check-contrast.mjs` (`npm run check`).
- Buttons: near-square (2px radius), 52px tall. `arrow` (default on) = a thin → that slides 4px on hover.
  Variants: `primary` (ink), `ghost` (1px ink outline, fills on hover), `light` / `ghostDark` on dark bands.
- Surfaces: no glass, no gradients, no drop shadows. Sections are separated by band colour; content by 1px
  `--rule` hairlines under a stronger `--rule-strong` top rule (lists, ledgers, the stats strip, the services
  index). Cards (`.cond`, `.review`, `.case-card`, `.book-card`) are `--card` with a 1px `--rule` border.
- Home: hero (kicker, serif H1 `home.hero.title` + accent `titleAccent`, lead, Book + WhatsApp buttons, call
  link, 2×2 credential list) beside a **framed portrait** (`.portrait`: the suit photo at 4:5 with a thin brass
  keyline offset behind it and a caption with qualifications + registration). On phones the hero copy is
  `display: contents` so the portrait sits right after the headline. Then a hairline stats strip (real data only,
  `stats`), the numbered "areas of practice" index (`Services`), the knee story, about teaser (framed theatre
  photo + training ledger), an "Approach" section (`home.approach`: three numbered principles reusing copy
  already on the site — TODO confirm wording), conditions, locations, reviews, case studies, CTA.
- Logo (`LogoMark` in `components/Layout.tsx`): Dr. Gupta's **original teal caduceus emblem** from his old website
  (`public/logo-mark.svg`, extracted from his old 250×60 logo SVG with the outlined lettering removed) in a thin
  square keyline; wordmark = real text (name in Fraunces + `doctor.shortTitle` in small uppercase brass)
  so it stays crawlable — the mark itself is `alt=""`. Same emblem: `favicon.svg`, `favicon-32.png`,
  `apple-touch-icon.png`, `icon-192.png`, `logo-512.png` (JSON-LD `logo`), `site.webmanifest`.
- Numbering is the ornament: `01`–`06` in brass-text Fraunces on the services index, locations, story steps,
  Robotic points and booking steps. No illustrations (the old `JointArt` glass icons were removed).
- Treatment cells (`Services`) dispatch a `select-area` window event that `ConditionExplorer` listens for, then
  scroll to `#conditions`.
- Interactive pieces: `Segmented` (underline tabs, a 2px brass bar slides under the active one), `Carousel`
  (square outline buttons), `MoreLink` (text + brass underline + →), `LocalNav` (Robotic page), full-screen
  mobile menu (serif links), floating-label booking fields, animated FAQ `<details>` — see `components/ui.tsx`.
  The header has no backdrop-filter (it would make the header the containing block for the fixed mobile sheet).
- Motion: slow fade-up on load/scroll, nav underlines draw in, arrows slide, photos zoom 4% on hover. No loops,
  no bounces. Everything respects `prefers-reduced-motion`.
- Touch targets ≥ 44px. Real `<button>`/`<a>`/`<input>`; radio-card pickers are real radios.
- Home copy lives in `content/site.ts → home`; About / Robotic / Book / 404 copy in `content/site.ts → pages`.
- Inner pages: ivory `.page-hero` (About uses the scrubs cut-out on a warm panel, `.portrait--cutout`),
  `section-band` / `section-band--tint`, `Head` + `LocationList` from `sections/HomeSections.tsx`, `.split`,
  hairline grouped lists.

## The 3D knee
- Source meshes: **BodyParts3D 3.0, 95% polygon reduction** (© DBCLS, CC BY 4.0) — the most detailed
  public release (~5× the 4.0/99% set), left femur, tibia, fibula, patella of one reference adult.
  Download URL + venv setup are in the header of `scripts/build_knee.py`. The script converts to Y-up,
  centres on the joint line, Taubin-smooths + Loop-subdivides once, slices the distal femur (≈9 mm) and
  proximal tibia (≈8 mm) into `femurTop/femurCap` and `tibiaBot/tibiaCap` (flat saw-cut triangles last,
  count in `c`), procedurally builds the implants (femoral component = bone shell offset 2.2 mm, tibial
  tray + keel + fin, poly insert) and **bakes per-vertex ambient occlusion** (voxel ray-march; patella
  excluded because it fades out). Positions are Int16 per part (`meta.q[part]` = offset + scale).
  `meta` also holds `fcut`, `tcut`, `pivot` (flexion axis), `tgap` (joint distraction after cuts).
- Look (`kneeEngine.ts`): realistic, not brand-coloured — ivory cortical bone, spongy (trabecular)
  cut faces, pearly cartilage on the caps (glows red when "worn"), cobalt-chrome femoral component,
  satin titanium tray, off-white polyethylene insert. Bone detail is procedural GLSL injected via
  `onBeforeCompile` (`boneSurface()`: AO, mottling, micro-bump, roughness variation) — no textures.
  Lighting: RoomEnvironment IBL for bone, a separate high-contrast softbox env for metals, warm key
  light with soft shadow map (1024 on small screens, 2048 otherwise), cool rim, weak fill.
- **Attribution is mandatory** (footer already has it). Implants are illustrative, not a product.
- Story timeline in `kneeEngine.ts` (progress p 0→1), modelled on a MAKO-style robotic TKR:
  0–.16 worn cartilage glows red, patella moves aside · .15–.20 navigation trackers pinned into femur
  & tibia · .20–.30 registration points light up · .27–.35 CT ring sweeps (wireframe) · .33–.38 planned
  implants appear as a blue ghost + resection planes · .40–.43 robot arm approaches from the lateral
  side · .43–.49 femoral cut (blade oscillates, plane turns green, bone dust) · .49–.52 femoral piece
  lifted off · .52–.57 tibial cut · .57–.61 tibial piece lifted, arm retracts, joint distracts by `tgap` ·
  .62–.80 femoral component, tray (slide + press) and insert follow insertion paths and seat ·
  .80–.86 trackers removed · .82–.96 lateral view, knee moves through its range of motion.
  Props (arm with 2-link IK, saw, trackers, dust) live in `three/surgicalRig.ts`.
- Story pacing: `.story` is 500vh desktop / 540vh mobile (scroll per stage). Playback is smoothed in
  `useScrollProgress` — `STORY_SMOOTHING` (0.22 s ease) and `STORY_MAX_SPEED` (0.22 progress/s ≈ 0.9 s
  per stage) — so fast flicks still play every stage. Text, bar and 3D read the same smoothed value.
  Reduced-motion users get the raw scroll position (no glide).
  Step text lives in `content/site.ts → kneeStages`; keep stage count = 5 or update both.
- three r155+ light units: legacy intensities are multiplied by π. `preserveDrawingBuffer: true`
  is on so screenshots/share captures work.
- Performance: engine renders only while on-screen (IntersectionObserver), DPR capped at 1.75.
  Shadow map 1024 on small screens. three chunk ≈119 kB gz + engine ≈5 kB gz + model 0.44 MB
  (gzip ≈ 0.29 MB, Int16-quantised). Smaller still: Draco/meshopt GLB.

## SEO
- `index.html` has default meta, OG, and a **Physician JSON-LD** (fill `sameAs` with Google
  Business / Practo / social URLs). `Seo.tsx` sets per-route title/description/canonical.
- **Prerendered**: `npm run build` renders the 4 routes + 404 with `react-dom/server`
  (`src/entry-server.tsx` → `scripts/prerender.mjs`) into `dist/index.html`, `about.html`, `book.html`,
  `robotic-joint-replacement.html`, `404.html`, each with its own title/description/canonical/OG
  (taken from `<Seo>` via `HeadContext`). The browser hydrates them. New route → add it to
  `App.tsx` **and** `ROUTES` in `scripts/prerender.mjs` (+ `sitemap.xml`).
- Hydration rule: render output must not depend on browser-only state (date, query string,
  `matchMedia`, `window`) — read those in `useEffect` (see `Book.tsx`, `useReducedMotion`).
- Old WordPress URLs `/about-2/`, `/robotics/`, `/contacts/`, `/form/` 301 to the new pages
  (`public/_redirects`, `vercel.json`). Old blog posts are **not** redirected yet. Case-study links currently
  point to the old blog URLs; migrate those posts or keep the old blog alive.

## Deploy
Static `dist/`. `name.html` is served at `/name` (Netlify, Cloudflare Pages; Vercel via `cleanUrls`), and
unknown URLs get `404.html` with a real 404 status — there is deliberately **no** SPA catch-all rewrite.
`public/_redirects` works on Netlify and Cloudflare Pages; `vercel.json` mirrors it.
Cache headers: `public/_headers` (Netlify / Cloudflare Pages, copied to `dist/` by the build) and the `headers` block in
`vercel.json` — keep them in sync. `/assets/*` (content-hashed) = `max-age=31536000, immutable`; `/fonts/*`, `/models/*`,
`/images/*` are **not** hashed, so they get `max-age=2592000` (30 days) instead — if you change one of those files in place,
give it a new filename (e.g. `knee-model.v2.json`) and update its references, or returning visitors may see the old one for up to 30 days.
HTML routes are `max-age=0, must-revalidate`, listed one by one (Netlify/Cloudflare join overlapping rules, so there's no `/*`);
a new route needs adding to both header configs too.

**GitHub Pages preview**: `.github/workflows/pages.yml` builds on every push to `main` with `BASE_PATH=/<repo>/` and
`NOINDEX=1` and publishes to `https://<owner>.github.io/<repo>/`. The same code runs at the root or under a sub-path:
`vite.config.ts` reads `BASE_PATH`, the router uses `BASENAME` (`src/lib/base.ts`), and every hard-coded `public/` file
goes through `asset()` — use it for any new image/model/logo path, or it will 404 on the preview. `NOINDEX` adds
`robots noindex` to every page so the preview never competes with the real domain. Local check: build with those
env vars, then the `preview-pages` config in `.claude/launch.json` (port 4180, `/dr-gupta-ortho/`).

## Roadmap (phase 2 — the Dr. Gupta healthcare platform)
- Replace the WhatsApp booking hand-off in `pages/Book.tsx` with the platform's appointments API
  (real OPD slots per location; payments via **Cashfree**). Keep the same 3-step UI.
- Patient login/records live in the platform, not this site — link out.
- Multi-doctor later: keep doctor data in `content/site.ts` shaped so it can come from the API.

## Working conventions for Claude Code
- Make targeted changes; don't restyle sections you weren't asked to touch.
- New copy → `content/site.ts`, not hard-coded in JSX.
- New colours/sizes → tokens first. No new fonts without asking.
- Test at 390px and 1440px widths; check the pinned story at both.
- Don't add trackers/analytics or third-party embeds without asking (patient privacy).
