# Content to confirm before launch

Everything below lives in `src/content/site.ts` (and `index.html` for SEO fields).
The site works without these, but they are what patients look for first.

## Must have
- [ ] **OPD days & times for each location** → `locations[].opd` (e.g. `'Mon & Thu · 5–8 pm'`)
      ACESO Clinic · ILS Howrah · ILS Dum Dum · ILS Salt Lake (by appointment) · AMRI Mukundapur · Belle Vue · Kothari
- [ ] **Which phone number is for appointments** vs. personal; which number has WhatsApp
      (currently: call +91 88302 58641, WhatsApp +91 91300 88422)
- [ ] **Confirm surgery counts** → `stats` (4,590+ joint replacements, 4,500+ arthroscopy, 9,950+ trauma)
- [ ] **Google rating + review count + Google Business URL** → `googleRating`
- [ ] **3–6 real review excerpts** (with patient permission) → `reviews`
- [ ] **Robot systems per hospital** (which hospital has MAKO / VELYS / CUVIS) → `robotSystems`

## Nice to have
- [ ] Languages spoken → `doctor.languages`
- [ ] Short personal note from Dr. Gupta for the About page
- [ ] Typical hospital stay & recovery timeline for knee/hip replacement → `roboticFaqs`
- [ ] Cost range / insurance & cashless panels → `roboticFaqs`
- [ ] Social / directory links for JSON-LD `sameAs` (Google Business, Practo, Instagram, LinkedIn, Facebook)
- [ ] Higher-resolution portrait (transparent background) and 2–3 more theatre/clinic photos
- [ ] Clinical-case images (X-rays with patient identifiers removed) for the Cases cards
- [ ] Final domain + email for the site (`SITE` in `components/Seo.tsx`, canonical/OG URLs in `index.html`, `sitemap.xml`)

## Compliance check
- [ ] Review all copy against NMC guidelines on medical advertising (no superlatives, no outcome guarantees)
- [ ] Patient consent on file for any testimonial or case image used

- [ ] **Approach section** (home): confirm Dr. Gupta is happy with the three principles in `site.ts → home.approach` (wording reused from the Robotic page).
