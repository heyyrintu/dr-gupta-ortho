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
index.html                 SEO meta, OG tags, JSON-LD Physician schema, font preloads (self-hosted Archivo + Manrope
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
  components/Layout.tsx    transparent→frosted header (pill nav, phone, Book pill + full-screen mobile menu), navy footer, floating glass action bar
  components/ui.tsx        Icon, Button, Reveal, CountUp, SectionHead, Photo, Segmented, Carousel, MoreLink
  components/LocalNav.tsx  sticky in-page section bar with scroll-spy (Robotic page)
  components/JointArt.tsx  SVG "glass" joint illustrations for treatment cards
  components/Seo.tsx       per-route title/description/canonical/OG
  three/kneeEngine.ts      ★ the 3D scene: materials, lighting, stage animation logic
  three/surgicalRig.ts     robot arm + saw, navigation trackers, bone dust (story props)
  three/KneeCanvas.tsx     React wrapper: lazy import, model fetch, pause off-screen, fallback
  hooks/                   useScrollProgress (pinned section 0→1, smoothed), useInView, useReducedMotion
  sections/KneeStory.tsx   pinned scroll story (used on Home + Robotic page)
  sections/HomeSections.tsx Hero, Services, AboutTeaser, StatsBand, ConditionExplorer, LocationsStrip, Reviews, Cases, CtaBand
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
"Clinical glass" — modelled on a modern medical landing page the owner supplied as reference: sky-blue
gradient hero, frosted white cards, bold uppercase headings, navy + mint accents, 3D-style visuals.
- Type: **Archivo** 800–900 UPPERCASE for `.display-1/.display-2` and the hero title (`--fs-hero`);
  `.display-3` and card titles in sentence case; body **Manrope**.
- Colour: page `--bg #f6f9fd`, bands `--bg-2`, hero/page-hero `--hero-grad` (sky blue → white). Navy
  `#0b2a5b` headings, primary buttons, footer, selected states; `--blue #2f6fc4` for the accent line in the
  hero title; **mint `#4be38a` only as a fill behind navy text/icons** (circle arrows, `.chip-green` pill
  labels, list dots, the active local-nav link, the selected-location check) — never mint text on white.
- Buttons: pill; `arrow` (default on) = a trailing circle with ↗ that rotates on hover — white circle on
  navy buttons, mint circle on white ones. `.circle-btn` = 50px round icon button (WhatsApp in the hero).
- Surfaces: frosted glass cards (`.glass`, `.glass-card`, `.float-card`, `.svc__btn`) over gradients;
  solid white cards with soft blue shadows elsewhere. Radii 16–32px, pills for controls.
- Home hero: tag chip, 3-line uppercase title with a small `JointArt` knee glyph, lead, CTAs, credential
  pills; media = **only the arched portrait** (`.arch`, with an offset glass panel behind it) and three static
  `.float-card` chips (joint replacements, MS + fellowship, MAKO · VELYS · CUVIS) placed clear of the face.
  Stat chips show real data only (`stats`, `doctor`) — never the reference's made-up numbers. No 3D bone here.
- Logo (`LogoMark` in `components/Layout.tsx`): Dr. Gupta's **original teal caduceus emblem** from his old website
  (`public/logo-mark.svg`, extracted from his old 250×60 logo SVG with the outlined lettering removed) on a white rounded
  tile; wordmark = real text (name in Archivo 800 + `doctor.shortTitle` in small uppercase blue, mint in the navy footer)
  so it stays crawlable — the mark itself is `alt=""`. Same emblem: `favicon.svg`, `favicon-32.png`,
  `apple-touch-icon.png`, `icon-192.png`, `logo-512.png` (JSON-LD `logo`), `site.webmanifest`.
- `components/JointArt.tsx` draws the animated "glass" joint illustrations (knee, hip, shoulder, sports,
  spine, fractures) used on the treatment cards, the conditions panel and the hero title — SVG, no image
  assets. Each part is its own `.ja-part` group (CSS block "Joint art" in global.css): parts spring in one by
  one (paused until the parent `<Reveal>` is in view); on card hover the joint moves like the real one
  (knee flexes, hip swings, shoulder abducts, spine ripples, fracture halves knit + crack fades, sports
  ligaments turn green) and a light band sweeps across; idle = slow `ja-float` drift (the one deliberate
  loop). Small UI icons have one-shot micro-animations (lines draw in, phone rings, pin drops). Joint
  motion uses view-box `transform-origin`s — keep them in sync if you edit the shapes.
- Treatment cards (`Services`) overlap the hero edge; clicking one dispatches a `select-area` window event
  that `ConditionExplorer` listens for, then scrolls to `#conditions`.
- Interactive pieces: `Segmented` (navy sliding thumb), `Carousel`, `MoreLink`, `LocalNav` (Robotic page),
  full-screen mobile menu, floating-label booking fields, animated FAQ `<details>` — see `components/ui.tsx`.
  A backdrop-filter makes an element the containing block for fixed children, which is why
  `.site-header.is-open` drops it (the mobile sheet is `position: fixed` inside the header).
- Motion: fade-up on load/scroll, hover lifts, circle arrows rotate, cards scale on press. Float cards are
  static; the only loop is the slow joint-art drift. Everything respects `prefers-reduced-motion`.
- Contrast: hero title is navy/blue on the pale gradient (not white). `--text-3` is the lightest text.
- Touch targets ≥ 44px. Real `<button>`/`<a>`/`<input>`; radio-card pickers are real radios.
- Home copy lives in `content/site.ts → home`; About / Robotic / Book / 404 copy in `content/site.ts → pages`.
- Inner pages: gradient `.page-hero` (About portrait is arched), `section-band` / `section-band--tint`,
  `Head` + `LocationList` from `sections/HomeSections.tsx`, `.split`, white grouped lists.

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
