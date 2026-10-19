# Build spec — drsiddharthguptaortho.in redesign

Use this as the source of truth for layout, behaviour and acceptance criteria. Values (colours,
radii, type) live in `src/styles/tokens.css`; this document explains intent.

## 1. Goals
1. A patient can find **where and when** to see Dr. Gupta and request an appointment in < 60 s on a phone.
2. The site communicates **surgical precision + human care** — robotic joint replacement is the flagship.
3. Credentials are visible above the fold (MS Ortho, APOA-SIAA fellowship, King's College NHS UK, WBMC reg.).
4. Fast, accessible, SEO-ready; no fabricated content.

## 2. Visual language — "clinical glass"
- Based on the reference landing page the owner supplied: sky-blue gradient hero, frosted cards, bold
  uppercase Archivo headings, navy primary, mint circle-arrow accents, 3D-style visuals.
- Grounds: `#F6F9FD` page, `#EAF1F9` bands, `--hero-grad` on heroes. Cards white or frosted, radius 16–32px.
- Colour roles: navy `#0B2A5C`-family for headings, buttons, footer; blue `#2F6FC4` accent line; mint
  `#4BE38A` only as a fill behind navy (circle arrows, pill labels, dots, checks).
- Type: Archivo 800–900 uppercase for display headings; Manrope body.
- The 3D knee stays the signature visual in the pinned story (not in the hero); joint SVGs on treatment cards.
- No invented figures on stat chips — only `stats` / `doctor` data.

## 3. Global components
| Component | Behaviour |
|---|---|
| Logo | Original teal caduceus emblem from the old site (`public/logo-mark.svg`) on a white rounded tile + name and short title as real text; tilts on hover. Favicon, touch icon and JSON-LD `logo` use the same emblem. |
| Header | Fixed 72px bar, transparent over the hero, frosted after 24px scroll. Pill nav (active = navy pill) + phone + white "Book appointment" pill with mint ↗ circle. ≤980px: logo + round burger → full-screen sheet (uppercase links, staggered fade, scroll lock, Esc closes). |
| Mobile action bar | ≤980px: floating rounded glass bar inset 10px from the edges — Call · WhatsApp · **Book visit** (navy pill). Hidden while the menu sheet is open. Footer has bottom padding so it never covers content. |
| Local nav | Robotic page, ≥768px: sticky frosted bar under the header — page title, section links with scroll-spy, Book pill. |
| Segmented | White pill track with a sliding navy thumb (tablist; arrow keys). Conditions tabs; booking session picker uses the same look. |
| Carousel | Scroll-snap row with round prev/next buttons (disabled at the ends). Case studies. |
| Button | Pill; primary = navy with a white ↗ circle (rotates on hover); ghost/light = white with a mint circle; ghostDark on navy; sm, lg, block. `arrow={false}` for icon buttons. |
| Reveal | Fades/slides 26px up once when 10% into view. |
| CountUp | Animates to value when visible (cubic ease-out, 1.6s); reduced-motion shows final value. |
| Footer | Navy. Brand + reg. no., treatments, clinic address + directions, contacts, legal + **BodyParts3D attribution**. |

## 4. Pages

### Home `/`
1. **Hero** (gradient) — 2 columns ≥1100px, stacked below.
   - Glass tag "Robotic joint replacement"; H1 in 3 uppercase lines "Robotic / Knee & Hip / Replacement"
     (middle line blue with a knee glyph); lead with name + robotic systems; CTAs (Book ↗, WhatsApp circle,
     "Call the clinic" number); credential pills.
   - Media: only the arched portrait (offset glass panel behind) with three static glass chips — joint
     replacements (`stats`), MS + fellowship, MAKO · VELYS · CUVIS. No 3D model in the hero.
2. **Treatment cards** — 6 glass cards (one blue feature card) overlapping the hero edge, each with a joint
   illustration, mint ↗ circle, title + two conditions. Click → selects that area in Conditions and scrolls there.
   Joint illustrations are animated: assemble on reveal, joint-specific motion + sheen on hover, slow idle drift
   (all off with reduced motion).
3. **Knee story** (pinned scroll, 500vh desktop / 540vh mobile) — see §5.
4. **About teaser** — theatre photo with a glass overlay card (Trained at King's College Hospital NHS, UK);
   mint label, uppercase heading, paragraph, Full profile ↗, rotated phone circle "For any questions".
5. **Stats band** — 4 big figures from `stats` on a pale gradient panel, static (no count-up).
6. **Conditions** `#conditions` — segmented control (Knee … Fractures); white panel with joint illustration,
   headline, "When to see a specialist" callout, robotic link (knee/hip) · common conditions · treatment
   options + "Book a … consultation" → `/book?concern=id`.
7. **Locations** — grid of 7 white cards with mint ↗ circles → `/book?location=id`; OPD label or "Call to confirm timings".
8. **Reviews** — quote cards when `reviews` has data; otherwise a "Read reviews on Google" card.
9. **Case studies** — carousel of 3 cards linking to existing case-study posts.
10. **CTA band** — navy gradient tile, uppercase heading, white + outlined pills.

### Inner pages — shared pattern
Same shell as Home: gradient page hero (mint label, uppercase H1, lead, navy ↗ + white pills,
credential pills) with a rounded (About: arched) photo + caption; sections alternate page / tint bands;
headings via `Head` (label + display-2); `split` = sticky heading left, content right (stacks ≤900px).
Lists are white rounded cards with hairline rows and mint dots. Nothing loops or floats. Copy lives in `content/site.ts → pages`.

### Robotic `/robotic-joint-replacement`
Page hero (breadcrumb, "MAKO · VELYS · CUVIS trained" label, theatre photo tile) + 4 "plan" tiles →
**local nav** (sticky; Overview · Step by step · Is it for me? · Systems · FAQ + Book, scroll-spy) →
Knee story ("Step by step, in 3D") → "You may be a candidate if…" grouped numbered list + note (split) →
3 robot-system cards with large product names (first one blue) on a tint band → FAQ grouped accordion (height animates
open, + rotates to ×) → CTA.

### About `/about`
Page hero (name, lead, CTAs, credential ticks; suit portrait tile + caption) → training grouped list
(split: kind · institution · place) → "Consultant at" hospital cards (tint band, same cards as Home,
ACESO excluded) → professional societies (2-column grouped list) beside awards (year · title · note) → CTA.

### Book `/book`
Gradient hero (label, uppercase H1, lead) + glass "Step n of 3" progress card → form below, two columns
(stacked ≤980px):
- White rounded step cards: **Location** radio cards (7; selected = navy ring + mint check that pops in) ·
  **Day & session** (next 7 days, a swipe strip on phones; Sunday dimmed; selected day = solid navy;
  Morning/Evening OPD as a segmented pill) · **Your details** (floating-label fields: name, mobile,
  concern, visit type).
- Sticky white summary card: doctor row, location, when, validation errors, **Request on WhatsApp**
  (large navy pill; opens wa.me with a pre-filled message), call link. Success state with a green tick drawn once.
- Query params pre-select: `?location=ils-howrah`, `?concern=knee`.
- Phase 2: swap WhatsApp hand-off for the platform API (real slots, Cashfree).

### 404
Centred on the hero gradient: "Error 404 · Page not found" label, H1 "This page has moved.", lead, Home + Book pills.

## 5. Knee story — interaction spec
- Section height 500vh (540vh mobile); inner panel `position: sticky; top: 0; height: 100svh`.
- Progress p = scrolled distance / (section height − viewport), eased toward that value with a speed cap
  (≈0.9 s per stage) so fast scrolling still plays every stage. Step = floor(p × 5).
- Left: 5 step buttons (active expands body text; done shows ✓); clicking smooth-scrolls to that step's midpoint. Progress bar = p.
- Right: arch halo, planning grid fades in on steps 2–3, 3D canvas, "STEP n / 5" glass badge, "Aligned & balanced" badge on step 5.
- 3D timeline: see CLAUDE.md → "The 3D knee".
- Mobile: canvas on top (46svh), only the active step card shown below, heading hidden to save space.
- Reduced motion: no idle sway/flex; scroll still drives the stages (user-initiated).

## 6. Accessibility
- WCAG AA contrast; focus-visible outlines (3px blue); skip link; landmarks; one H1 per page.
- 3D canvases have `role="img"` + descriptive `aria-label` that updates with the step.
- Tabs use `role=tablist/tab/tabpanel` + `aria-selected`; booking pickers are native radios.
- All interactive targets ≥ 44px.

## 7. Performance budget
- JS (initial, gz) ≤ 75 kB (currently ≈ 69 kB). three.js (≈119 kB gz) + model load lazily.
- LCP element = hero portrait (preloaded 640w WebP). Images: WebP srcset + JPG fallback, lazy below fold.
- 3D renders only on-screen; DPR ≤ 1.75.

## 8. Acceptance checklist
- [ ] `npm run build` passes (strict TS).
- [ ] 390px & 1440px: no horizontal scroll; header/menu/action bar work.
- [ ] Hero knee renders, follows pointer, explodes on scroll; story pins and runs all 5 stages forwards and backwards.
- [ ] Booking: radios keyboard-operable; validation messages; WhatsApp opens with all fields.
- [ ] Lighthouse: Performance ≥ 85 mobile, Accessibility ≥ 95, SEO ≥ 95 (after prerender).
- [ ] All `TODO` items in `docs/CONTENT_TODO.md` resolved or consciously deferred.
