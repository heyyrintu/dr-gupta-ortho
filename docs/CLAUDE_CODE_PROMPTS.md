# Starter prompts for Claude Code

Open the project folder in a terminal, run `claude`, then paste one of these.

**1. Get oriented and run it**
> Read CLAUDE.md and docs/BUILD_SPEC.md. Run `npm install` and `npm run dev`, then summarise the
> architecture and anything in the acceptance checklist that is not yet met.

**2. Fill in clinic content**
> Here are the confirmed OPD timings / reviews / rating: … Update src/content/site.ts only,
> following the content rules in CLAUDE.md, then run `npm run build`.

**3. Prerender for SEO** — ✅ done (see CLAUDE.md → SEO)
> Add build-time prerendering for the 4 routes (/, /robotic-joint-replacement, /about, /book) so
> each ships full HTML with its own title/description. Keep the SPA behaviour. Add 301 redirects
> from the old WordPress URLs listed in CLAUDE.md. Verify with `npm run build && npm run preview`.

**4. Shrink the 3D model** — ✅ done (Int16 positions, 0.77 → 0.44 MB, with a more detailed source)
> Reduce public/models/knee-model.json size by quantising positions to Int16 with a per-part scale
> (update scripts/build_knee.py and the decoder in src/three/kneeEngine.ts). Visual result must be identical.

**5. Phase 2 booking**
> Replace the WhatsApp hand-off in src/pages/Book.tsx with a call to our appointments API
> (endpoint spec: …). Keep the 3-step UI and the summary card; show real slots per location.
