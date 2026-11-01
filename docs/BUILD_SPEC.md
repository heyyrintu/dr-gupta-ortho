# Build spec — drsiddharthguptaortho.in redesign

Use this as the source of truth for layout, behaviour and acceptance criteria. Values (colours,
radii, type) live in `src/styles/tokens.css`; this document explains intent.

## 1. Goals
1. A patient can find **where and when** to see Dr. Gupta and request an appointment in < 60 s on a phone.
2. The site communicates **surgical precision + human care** — robotic joint replacement is the flagship.
3. Credentials are visible above the fold (MS Ortho, APOA-SIAA fellowship, King's College NHS UK, WBMC reg.).
4. Fast, accessible, SEO-ready; no fabricated content.

## 2. Visual language — "editorial private practice"
- Replaces the earlier "clinical glass" look, which the client found not classy. Modelled on high-end
  private-consultant sites: warm ivory ground, deep navy ink, muted brass accent, serif display type,
  generous whitespace, hairline rules, real photography. Direction A of `docs/design-demo/`.
- Grounds: `#F7F4EE` page, `#EFE9DF` bands, `#FFFDF9` cards with a 1px `#DDD5C7` border. No gradients,
  no glass, no drop shadows. Radius 2px.
- Colour roles: ink `#14213D` headings, buttons, selected states; `#0E1830` CTA band + footer; brass
  `#B0915F` for rules/keylines only, `#7A5C34` when brass is text (labels, numerals, the hero accent line).
- Type: Fraunces (light, sentence case) for display, numerals and the wordmark; Manrope body; small
  uppercase tracked labels.
- Ornament = numbering (`01`–`06`) and hairlines. No illustrations. The 3D knee stays the signature visual
  in the pinned story (not in the hero).
- No invented figures — only `stats` / `doctor` data.

## 3. Global components
| Component | Behaviour |
|---|---|
| Logo | Original teal caduceus emblem from the old site (`public/logo-mark.svg`) in a thin square keyline + name (Fraunces) and short title (brass, uppercase) as real text. Favicon, touch icon and JSON-LD `logo` use the same emblem. |
| Header | Fixed 80px bar (70px on phones), transparent over the hero, ivory + hairline after 24px scroll. Text nav with a brass underline that draws in on hover / marks the active page + phone + navy "Book appointment". ≤1000px: logo + square burger → full-screen ivory sheet (serif links, staggered fade, scroll lock, Esc closes). |
| Mobile action bar | ≤1000px: docked to the bottom edge, white with a top hairline — Call · WhatsApp · **Book visit** (navy). Hidden while the menu sheet is open. Footer has bottom padding so it never covers content. |
| Local nav | Robotic page, ≥768px: sticky ivory bar under the header — page title (serif), section links with scroll-spy (brass underline), Book button. |
| Segmented | Underline tabs: a 2px brass bar slides under the active tab (tablist; arrow keys). Conditions tabs. |
| Carousel | Scroll-snap row with square outline prev/next buttons (disabled at the ends). Case studies. |
| Button | 2px radius, 52px; primary = navy with a thin → that slides on hover; ghost = 1px navy outline that fills on hover; light / ghostDark on the navy band; sm, lg, block. `arrow={false}` for icon buttons. |
| Reveal | Fades/slides 20px up once when 10% into view. |
| CountUp | Animates to value when visible (cubic ease-out, 1.6s); reduced-motion shows final value. |
| Footer | Navy. Brand + reg. no., treatments, clinic address + directions, contacts, legal + **BodyParts3D attribution**. |

## 4. Pages

### Home `/`
1. **Hero** (ivory) — 2 columns ≥1000px, stacked below.
   - Brass label "Consultant Orthopaedic Surgeon · Kolkata & Howrah"; serif H1 "Robotic knee and hip
     replacement, *and complete orthopaedic care.*" (second half in brass-text); lead with name + robotic
     systems; Book → + WhatsApp outline buttons; "Call the clinic" number; 2×2 hairline credential list.
   - Media: the suit portrait at 4:5 with a thin brass keyline offset behind it; caption = name, qualifications,
     registration. On phones the portrait follows the headline. No 3D model in the hero.
2. **Stats strip** — 4 serif figures from `stats` between hairlines, static (no count-up).
3. **Areas of practice** — numbered 3×2 index (01 Knee … 06 Trauma), three conditions each, "View conditions →".
   Click → selects that area in Conditions and scrolls there.
4. **Knee story** (pinned scroll, 500vh desktop / 540vh mobile, tint band) — see §5.
5. **About teaser** (tint) — framed theatre photo with caption; label, heading, paragraph, a 4-row training
   ledger, Full profile (outline), "For any questions" phone.
6. **Conditions** `#conditions` — underline tabs (Knee … Fractures); card with headline, "When to see a
   specialist" (brass rule), robotic link (knee/hip) · common conditions · treatment options + "Book a …
   consultation" → `/book?concern=id`.
7. **Locations** (tint) — two-column numbered hairline list of 7 → `/book?location=id`; OPD label or "Call to confirm timings".
8. **Reviews** — quote cards when `reviews` has data; otherwise a serif line + "Read reviews on Google".
9. **Case studies** (tint) — carousel of 3 cards linking to existing case-study posts.
10. **CTA band** — navy panel, serif heading, ivory + outlined buttons.

### Inner pages — shared pattern
Same shell as Home: ivory page hero (brass label, serif H1, lead, buttons, credential list) with a photo +
caption (About: the scrubs cut-out on a warm panel with the brass keyline); sections alternate page / tint
bands; headings via `Head` (label + display-2); `split` = sticky heading left, content right (stacks ≤900px).
Lists are hairline rows under a stronger top rule, with brass dashes or numerals. Nothing loops or floats.
Copy lives in `content/site.ts → pages`.

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
Ivory hero (label, serif H1, lead) + "Step n of 3" label over a hairline progress rule (brass fill) → form below,
two columns (stacked ≤1000px):
- Bordered step cards numbered 01–03: **Location** radio cards (7; selected = navy double ring + navy check) ·
  **Day & session** (next 7 days, a swipe strip on phones; Sunday dimmed; selected day = solid navy;
  Morning/Evening OPD as a two-option bar) · **Your details** (floating-label fields: name, mobile,
  concern, visit type).
- Sticky summary card (navy top rule): doctor row, location, when, validation errors, **Request on WhatsApp**
  (large navy button; opens wa.me with a pre-filled message), call link. Success state with a green tick drawn once.
- Query params pre-select: `?location=ils-howrah`, `?concern=knee`.
- Phase 2: swap WhatsApp hand-off for the platform API (real slots, Cashfree).

### 404
Centred on ivory: "Error 404 · Page not found" label, H1 "This page has moved.", lead, Home + Book buttons.

## 5. Knee story — interaction spec
- Section height 500vh (540vh mobile); inner panel `position: sticky; top: 0; height: 100svh`.
- Progress p = scrolled distance / (section height − viewport), eased toward that value with a speed cap
  (≈0.9 s per stage) so fast scrolling still plays every stage. Step = floor(p × 5).
- Left: 5 numbered step rows between hairlines (active expands body text; done rows dim less); clicking smooth-scrolls to that step's midpoint. Progress bar = p.
- Right: bordered white stage with a soft halo, brass planning grid fades in on steps 2–3, 3D canvas, "STEP n / 5" badge, "Aligned & balanced" badge on step 5.
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
