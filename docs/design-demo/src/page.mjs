// Build-time template for the design-options demo (see scripts/build-demo.mjs).
// Every visible fact and sentence comes from src/content/site.ts, passed in as `site`, so the demo
// can't drift from the real copy. The only strings written here are the demo's own UI labels and the
// CtaBand defaults, which live in src/sections/HomeSections.tsx (copied verbatim).

const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ico = (id, cls = '') => `<svg class="ico ${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
const arrow = () => ico('arrow', 'ico--arrow');
/** Both illustration styles are rendered; CSS shows the one picked in the switcher (or neither). */
const art = (id, cls = '') =>
  `<svg class="art art-line ${cls}" aria-hidden="true" focusable="false"><use href="#ic-${id}"/></svg>` +
  `<svg class="art art-tone ${cls}" aria-hidden="true" focusable="false"><use href="#ja-${id}"/></svg>`;
const areaLabel = (k) => k.charAt(0) + k.slice(1).toLowerCase();
const two = (n) => String(n).padStart(2, '0');

/** Planned photos for the coming shoot (shown as dashed frames when "Show planned photo slots" is on). */
export const SLOTS = {
  hero: 'New portrait: plain neutral backdrop, soft daylight, chest-up, 4:5',
  about: 'Consultation: Dr. Gupta explaining an X-ray or knee model to a patient (with consent)',
  wide: 'Wide theatre photo: robotic system in use, landscape 16:9',
  clinic: 'Clinic interior: ACESO reception or consulting room',
};

const CTA = {
  title: 'Not sure you need surgery?',
  body: "Most consultations end with a plan that doesn't involve an operation. Book a visit, or send your X-ray on WhatsApp.",
};

const NAV = ['Home', 'About', 'Conditions', 'Robotic surgery', 'Locations'];

function logo(site, extra = '') {
  const d = site.doctor;
  return `<a class="logo ${extra}" href="/">
    <span class="logo__mark" aria-hidden="true"><span class="logo__emblem"></span><span class="logo__mono">SG</span></span>
    <span class="logo__text"><span class="logo__name">${e(d.name)}</span><span class="logo__sub">${e(d.shortTitle)}</span></span>
  </a>`;
}

function switcher() {
  const select = (key, label, opts) => `
    <label class="sw__field"><span>${label}</span>
      <select data-key="${key}">${opts.map(([v, t]) => `<option value="${v}">${e(t)}</option>`).join('')}</select>
    </label>`;
  return `
<div class="sw" role="region" aria-label="Design options, not part of the site">
  <div class="sw__bar">
    <div class="sw__title"><strong>Design options</strong><small>Not part of the site · real copy &amp; photos, only the look changes</small></div>
    <button type="button" class="sw__toggle" aria-expanded="false" aria-controls="sw-panel"><span class="sw__summary" data-summary></span><span aria-hidden="true">▾</span></button>
    <div class="sw__panel" id="sw-panel">
      ${select('direction', 'Direction', [['editorial', 'A · Editorial private clinic'], ['clinical', 'B · Modern clinical minimal'], ['dark', 'C · Dark luxury']])}
      ${select('font', 'Headings', [['fraunces', 'Fraunces (serif)'], ['newsreader', 'Newsreader (serif)'], ['sans', 'Manrope (sans, to compare)']])}
      ${select('art', 'Illustrations', [['line', 'Fine-line icons'], ['tone', 'Toned-down joint art'], ['none', 'None (type & photos)']])}
      ${select('logo', 'Logo', [['teal', 'Original teal emblem'], ['tinted', 'Emblem in theme colour'], ['monogram', 'Serif monogram']])}
      <label class="sw__check"><input type="checkbox" data-key="slots" /><span>Show planned photo slots</span></label>
      <div class="sw__code"><span>Your choice: <code data-code></code></span><button type="button" class="sw__copy" data-copy>Copy link</button></div>
    </div>
  </div>
</div>`;
}

function header(site) {
  const d = site.doctor;
  return `
<header class="hdr">
  <div class="container hdr__bar">
    ${logo(site)}
    <nav class="hdr__nav" aria-label="Main">${NAV.map((n, i) => `<a href="/" ${i === 0 ? 'aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
    <a class="hdr__phone" href="${d.phonePrimaryHref}">${ico('phone')}${e(d.phonePrimary)}</a>
    <a class="btn btn--primary btn--sm hdr__cta" href="/book">Book appointment</a>
    <button type="button" class="hdr__menu" aria-expanded="false" aria-controls="sheet" aria-label="Open menu">${ico('menu')}</button>
  </div>
  <nav class="hdr__sheet" id="sheet" aria-label="Mobile">
    <div class="container">
      ${NAV.map((n) => `<a href="/">${n}</a>`).join('')}
      <a class="btn btn--primary btn--block" href="/book">Book an appointment</a>
      <a class="btn btn--outline btn--block" href="${d.phonePrimaryHref}">${ico('phone')} ${e(d.phonePrimary)}</a>
    </div>
  </nav>
</header>`;
}

function hero(site, img) {
  const { doctor: d, home } = site;
  const h = home.hero;
  return `
<section class="hero">
  <div class="container hero__grid">
    <div class="hero__copy" data-reveal>
      <span class="label">${e(h.eyebrow)}</span>
      <h1 class="h1">${e(h.title)}</h1>
      <p class="lead"><strong>${e(d.name)}</strong> — ${e(h.lead)} ${e(h.robots)}</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="/book">Book an appointment ${arrow()}</a>
        <a class="link" href="${site.whatsappLink('Hello Dr. Gupta, I would like a consultation.')}">${ico('whatsapp')}WhatsApp</a>
        <a class="link link--call" href="${d.phonePrimaryHref}"><small>Call the clinic</small>${e(d.phonePrimary)}</a>
      </div>
      <ul class="hero__creds">${h.credentials.map((c) => `<li>${e(c)}</li>`).join('')}</ul>
    </div>
    <figure class="portrait slot" data-slot="${e(SLOTS.hero)}" data-reveal>
      <div class="portrait__frame">
        <img class="portrait__img portrait__img--suit" src="${img('portrait-suit-700')}" alt="Portrait of Dr. Siddharth Gupta" width="700" height="1254" />
        <img class="portrait__img portrait__img--scrubs" src="${img('portrait-scrubs-1000')}" alt="Dr. Siddharth Gupta in navy surgical scrubs" width="1000" height="1400" />
      </div>
      <figcaption>${e(h.photoCaption)}</figcaption>
    </figure>
  </div>
</section>`;
}

function specialties(site) {
  const s = site.home.services;
  return `
<section class="section spec-sec" aria-labelledby="spec-h">
  <div class="container">
    <div class="sec-head" data-reveal>
      <span class="label">${e(s.eyebrow)}</span>
      <h2 class="h2" id="spec-h">${e(s.title)}</h2>
      <p class="sec-head__intro">${e(s.intro)}</p>
    </div>
    <ol class="spec">
      ${site.areas
        .map(
          (a, i) => `
      <li data-reveal>
        <button type="button" class="spec__item" data-area="${i}">
          <span class="spec__num">${two(i + 1)}</span>
          ${art(a.id, 'spec__art')}
          <span class="spec__title">${e(areaLabel(a.kicker))}</span>
          <span class="spec__sub">${e(a.conditions.slice(0, 2).join(' · '))}</span>
          <span class="spec__go">${arrow()}</span>
        </button>
      </li>`,
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

function story(site) {
  const st = site.kneeStages;
  return `
<section class="section story-sec band" aria-label="How robotic knee replacement works">
  <div class="container story">
    <div class="story__text" data-reveal>
      <span class="label">How robotic knee replacement works</span>
      <h2 class="h2">From worn joint to new knee</h2>
      <ol class="story__steps">
        ${st
          .map(
            (s, i) => `
        <li><button type="button" class="story__step ${i === 0 ? 'is-active' : ''}" data-step="${i}" ${i === 0 ? 'aria-current="step"' : ''}>
          <span class="story__num">${two(i + 1)}</span>
          <span class="story__copy"><span class="story__title">${e(s.title)}</span><span class="story__body">${e(s.body)}</span></span>
        </button></li>`,
          )
          .join('')}
      </ol>
      <div class="story__progress" aria-hidden="true"><span data-progress style="width:20%"></span></div>
    </div>
    <div class="story__stage" data-reveal>
      <div class="story__rings" aria-hidden="true"><span></span><span></span><span></span></div>
      <svg class="story__standin" aria-hidden="true" focusable="false"><use href="#ic-knee"/></svg>
      <p class="story__badge"><span data-step-k>Step 1 / ${st.length}</span><span data-step-t>${e(st[0].title)}</span></p>
      <p class="story__note">Stand-in drawing. The interactive 3D knee from the current site stays here, driven by scroll.</p>
    </div>
  </div>
</section>`;
}

function about(site, img) {
  const { doctor: d } = site;
  const a = site.home.about;
  return `
<section class="section about-sec">
  <div class="container about">
    <figure class="about__media slot" data-slot="${e(SLOTS.about)}" data-reveal>
      <div class="about__frame"><img src="${img('theatre-1-800')}" alt="Dr. Siddharth Gupta operating with his surgical team" width="800" height="600" /></div>
      <figcaption><span>${e(a.overlay.k)}</span> ${e(a.overlay.v)} · ${e(a.overlay.note)}</figcaption>
    </figure>
    <div class="about__text" data-reveal>
      <span class="label">${e(a.eyebrow)}</span>
      <h2 class="h2">${e(a.title)}</h2>
      <p>${e(a.body)}</p>
      <div class="about__actions">
        <a class="btn btn--outline" href="/about">Full profile ${arrow()}</a>
        <a class="link link--call" href="${d.phonePrimaryHref}"><small>${e(a.questions)}</small>${e(d.phonePrimary)}</a>
      </div>
    </div>
  </div>
</section>`;
}

function stats(site) {
  return `
<section class="stats-sec" aria-label="Key figures">
  <div class="container">
    <dl class="stats">
      ${site.stats.map((s) => `<div class="stats__item" data-reveal><dt>${e(s.label)}</dt><dd>${s.value.toLocaleString('en-IN')}${e(s.suffix)}</dd></div>`).join('')}
    </dl>
    <figure class="wide slot slot-only" data-slot="${e(SLOTS.wide)}"><div class="wide__frame"></div></figure>
  </div>
</section>`;
}

function conditions(site) {
  const c = site.home.conditions;
  const tabs = site.areas
    .map((a, i) => `<button type="button" role="tab" id="tab-${a.id}" aria-controls="panel-${a.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${e(a.title)}</button>`)
    .join('');
  const panels = site.areas
    .map(
      (a, i) => `
    <div class="cond" role="tabpanel" id="panel-${a.id}" aria-labelledby="tab-${a.id}" ${i === 0 ? '' : 'hidden'}>
      <div class="cond__intro">
        ${art(a.id, 'cond__art')}
        <h3 class="h3">${e(a.headline)}</h3>
        <p class="cond__when"><strong>When to see a specialist</strong>${e(a.when)}</p>
        ${a.robotic ? `<a class="link" href="/robotic-joint-replacement">How robotic ${e(a.title.toLowerCase())} replacement works ${arrow()}</a>` : ''}
      </div>
      <div class="cond__col"><h4>Common conditions</h4><ul>${a.conditions.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div>
      <div class="cond__col"><h4>Treatment options</h4><ul>${a.treatments.map((x) => `<li>${e(x)}</li>`).join('')}</ul>
        <a class="btn btn--primary btn--block" href="/book?concern=${a.id}">Book a ${e(a.title.toLowerCase())} consultation ${arrow()}</a></div>
    </div>`,
    )
    .join('');
  return `
<section class="section band cond-sec" id="conditions" aria-labelledby="cond-h">
  <div class="container">
    <div class="sec-head" data-reveal>
      <span class="label">${e(c.eyebrow)}</span>
      <h2 class="h2" id="cond-h">${e(c.title)}</h2>
      <p class="sec-head__intro">${e(c.intro)}</p>
    </div>
    <div class="tabs" role="tablist" aria-label="Body area">${tabs}</div>
    ${panels}
  </div>
</section>`;
}

function locations(site) {
  const l = site.home.locations;
  return `
<section class="section loc-sec" aria-labelledby="loc-h">
  <div class="container">
    <div class="sec-head sec-head--row" data-reveal>
      <div><span class="label">${e(l.eyebrow)}</span><h2 class="h2" id="loc-h">${e(l.title)}</h2></div>
      <a class="link" href="/book">Book an appointment ${arrow()}</a>
    </div>
    <ul class="locs">
      ${site.locations
        .map(
          (loc) => `
      <li data-reveal><a class="loc" href="/book?location=${loc.id}">
        <span class="loc__name"><strong>${e(loc.name)}</strong><small>${e(loc.area)}</small></span>
        <span class="loc__opd">${e(site.opdLabel(loc))}</span>
        <span class="loc__go">${arrow()}</span>
      </a></li>`,
        )
        .join('')}
    </ul>
    <figure class="clinic slot slot-only" data-slot="${e(SLOTS.clinic)}"><div class="clinic__frame"></div></figure>
  </div>
</section>`;
}

function cta(site) {
  return `
<section class="cta">
  <div class="container cta__inner" data-reveal>
    <h2 class="h2">${e(CTA.title)}</h2>
    <p>${e(CTA.body)}</p>
    <div class="cta__actions">
      <a class="btn btn--primary" href="/book">Book an appointment ${arrow()}</a>
      <a class="btn btn--outline" href="${site.whatsappLink('Hello Dr. Gupta, I would like to share my X-ray / reports for an opinion.')}">${ico('whatsapp')} Send reports on WhatsApp</a>
    </div>
  </div>
</section>`;
}

function footer(site) {
  const d = site.doctor;
  return `
<footer class="foot">
  <div class="container foot__grid">
    <div class="foot__brand">
      ${logo(site)}
      <p>${e(d.qualifications)} · Consultant Orthopaedic &amp; Robotic Joint Surgeon<br />${e(d.registration)}</p>
    </div>
    <div><h2 class="foot__h">Treatments</h2>
      <a href="/">Robotic knee &amp; hip replacement</a><a href="/">Sports injuries &amp; arthroscopy</a><a href="/">Spine &amp; scoliosis</a><a href="/">Fractures &amp; trauma</a></div>
    <div><h2 class="foot__h">Clinic</h2><p>${e(d.clinic.name)}<br />${e(d.clinic.address)}</p><a href="${e(d.clinic.mapsUrl)}">Get directions ›</a></div>
    <div><h2 class="foot__h">Contact</h2><a href="${d.phonePrimaryHref}">${e(d.phonePrimary)}</a><a href="${site.whatsappLink()}">${e(d.whatsapp)} · WhatsApp</a><a href="mailto:${e(d.email)}">${e(d.email)}</a></div>
  </div>
  <div class="container foot__legal">
    <span>© 2026 ${e(d.name)}. Information on this site is not a substitute for a medical consultation.</span>
    <span>3D bone anatomy: BodyParts3D, © The Database Center for Life Science, CC BY 4.0. Implants illustrative.</span>
  </div>
</footer>
<nav class="bar" aria-label="Quick actions">
  <a href="${d.phonePrimaryHref}">${ico('phone')}Call</a>
  <a href="${site.whatsappLink('Hello Dr. Gupta, I would like to book an appointment.')}">${ico('whatsapp')}WhatsApp</a>
  <a class="bar__primary" href="/book">${ico('calendar')}Book visit</a>
</nav>`;
}

export function render({ site, img }) {
  return `${switcher()}
<div class="site">
${header(site)}
<main id="main">
${hero(site, img)}
${specialties(site)}
${story(site)}
${about(site, img)}
${stats(site)}
${conditions(site)}
${locations(site)}
${cta(site)}
</main>
${footer(site)}
</div>
<div class="toast" role="status" aria-live="polite" data-toast></div>`;
}
