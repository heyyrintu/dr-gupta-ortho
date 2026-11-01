# Design options demo

`dr-gupta-design-options.html` is a single self-contained file (fonts, photos and logo inlined as
base64). It opens straight from Finder or from a WhatsApp/email attachment, with no server needed.
It is not part of the website build. Vite only ships `public/`, so this folder is never deployed.

## What the client can switch (bar at the top)
| Option | Values | Hash code |
|---|---|---|
| Direction | A · Editorial private clinic / B · Modern clinical minimal / C · Dark luxury | `editorial` / `clinical` / `dark` |
| Headings | Fraunces / Newsreader / Manrope (sans, for comparison) | `fraunces` / `newsreader` / `sans` |
| Illustrations | Fine-line icons / toned-down joint art / none | `line` / `tone` / `none` |
| Logo | Original teal emblem / emblem in theme colour / serif "SG" monogram | `teal` / `tinted` / `monogram` |
| Planned photo slots | dashed frames describing the shots to take | `/slots` |

The current choice shows as a code, e.g. `editorial/fraunces/line/teal`. "Copy link" copies it so the
client can send it back. Opening the file with that code after `#` restores the same view.

Links in the demo are switched off, so nobody messages the real WhatsApp number by accident. The knee
section shows a stand-in drawing; the real site keeps the interactive 3D knee there.

## Editing
Source: `src/page.mjs` (markup), `src/demo.css` (tokens per direction + layout), `src/demo.js`
(switcher, tabs, menu), `src/sprites.svg` (icons, fine-line joints, toned-down joint art).
All copy is read from `src/content/site.ts`, so the demo can't drift from the real wording.

```bash
npm run demo:build       # → docs/design-demo/dr-gupta-design-options.html
npm run check            # includes WCAG contrast for all three directions
```

Fonts: `assets/fonts/` holds the Fraunces and Newsreader latin variable woff2 from Google Fonts
(SIL OFL 1.1, licences alongside). Only the chosen one gets copied into `public/fonts/` for the site.
