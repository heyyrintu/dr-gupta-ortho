// Design-options demo behaviour: the switcher (state in the URL hash), plus just enough of the real
// site's interactions to judge the look — tabs, specialty → conditions, story steps, mobile menu.
(() => {
  const root = document.documentElement;
  root.classList.add('js');

  const OPTIONS = {
    direction: { values: ['editorial', 'clinical', 'dark'], names: { editorial: 'A · Editorial', clinical: 'B · Clinical minimal', dark: 'C · Dark luxury' } },
    font: { values: ['fraunces', 'newsreader', 'sans'], names: { fraunces: 'Fraunces', newsreader: 'Newsreader', sans: 'Manrope' } },
    art: { values: ['line', 'tone', 'none'], names: { line: 'fine-line', tone: 'toned-down art', none: 'no illustrations' } },
    logo: { values: ['teal', 'tinted', 'monogram'], names: { teal: 'teal emblem', tinted: 'tinted emblem', monogram: 'monogram' } },
  };
  const KEYS = Object.keys(OPTIONS);
  const THEME_COLOR = { editorial: '#f7f4ee', clinical: '#ffffff', dark: '#0f1620' };
  const state = { direction: 'editorial', font: 'fraunces', art: 'line', logo: 'teal', slots: false };

  // #editorial/fraunces/line/teal[/slots]
  const readHash = () => {
    const parts = decodeURIComponent(location.hash.slice(1)).split('/').filter(Boolean);
    KEYS.forEach((k, i) => { if (OPTIONS[k].values.includes(parts[i])) state[k] = parts[i]; });
    state.slots = parts.includes('slots');
  };
  const code = () => KEYS.map((k) => state[k]).join('/') + (state.slots ? '/slots' : '');

  const sw = document.querySelector('.sw');
  const selects = [...sw.querySelectorAll('select[data-key]')];
  const slotsBox = sw.querySelector('input[data-key="slots"]');
  const summary = sw.querySelector('[data-summary]');
  const codeEl = sw.querySelector('[data-code]');
  const meta = document.querySelector('meta[name="theme-color"]');

  const apply = (push) => {
    KEYS.forEach((k) => { root.dataset[k] = state[k]; });
    root.dataset.slots = state.slots ? 'on' : 'off';
    selects.forEach((s) => { s.value = state[s.dataset.key]; });
    slotsBox.checked = state.slots;
    summary.textContent = `${OPTIONS.direction.names[state.direction]} · ${OPTIONS.font.names[state.font]}`;
    codeEl.textContent = code();
    if (meta) meta.content = THEME_COLOR[state.direction];
    if (push && location.hash.slice(1) !== code()) {
      // replaceState can throw on file:// pages (opaque origin); a fragment-only replace works everywhere
      try { history.replaceState(null, '', `#${code()}`); } catch { location.replace(`#${code()}`); }
    }
  };

  selects.forEach((s) => s.addEventListener('change', () => { state[s.dataset.key] = s.value; apply(true); }));
  slotsBox.addEventListener('change', () => { state.slots = slotsBox.checked; apply(true); });
  window.addEventListener('hashchange', () => { readHash(); apply(false); });

  const toggle = sw.querySelector('.sw__toggle');
  toggle.addEventListener('click', () => {
    const open = sw.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    measure();
  });

  // keep the sticky header just under the switcher, whatever its height
  const measure = () => root.style.setProperty('--sw-h', `${sw.offsetHeight}px`);
  new ResizeObserver(measure).observe(sw);

  /* ---------- toast + copy link ---------- */
  const toastEl = document.querySelector('[data-toast]');
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  };
  sw.querySelector('[data-copy]').addEventListener('click', async () => {
    const text = location.protocol === 'file:' ? `Design choice: ${code()}` : location.href;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast(`Copied “${code()}”. Send it back to us with your choice.`);
  });

  /* ---------- demo links don't navigate (and never message the real WhatsApp number) ---------- */
  document.querySelector('.site').addEventListener('click', (ev) => {
    const a = ev.target.closest('a');
    if (!a) return;
    ev.preventDefault();
    toast('Demo only: links are switched off.');
  });

  /* ---------- mobile menu ---------- */
  const hdr = document.querySelector('.hdr');
  const menuBtn = hdr.querySelector('.hdr__menu');
  menuBtn.addEventListener('click', () => {
    const open = hdr.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && hdr.classList.contains('is-open')) { menuBtn.click(); menuBtn.focus(); }
  });

  /* ---------- conditions tabs (WAI-ARIA tabs: arrows / Home / End) ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (i, focus) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tabs[i].focus({ preventScroll: true });
    tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i, false));
    t.addEventListener('keydown', (ev) => {
      const n = tabs.length;
      const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[ev.key];
      if (to === undefined) return;
      ev.preventDefault();
      select(to, true);
    });
  });

  /* ---------- specialty rows pick a conditions tab ---------- */
  document.querySelectorAll('[data-area]').forEach((b) =>
    b.addEventListener('click', () => {
      select(Number(b.dataset.area), true);
      document.getElementById('conditions').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }),
  );

  /* ---------- story steps (the real site drives these from scroll + the 3D knee) ---------- */
  const steps = [...document.querySelectorAll('[data-step]')];
  const stepK = document.querySelector('[data-step-k]');
  const stepT = document.querySelector('[data-step-t]');
  const bar = document.querySelector('[data-progress]');
  steps.forEach((b, i) =>
    b.addEventListener('click', () => {
      steps.forEach((s, j) => {
        s.classList.toggle('is-active', i === j);
        s.classList.toggle('is-done', j < i);
        if (i === j) s.setAttribute('aria-current', 'step');
        else s.removeAttribute('aria-current');
      });
      stepK.textContent = `Step ${i + 1} / ${steps.length}`;
      stepT.textContent = b.querySelector('.story__title').textContent;
      bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    }),
  );

  /* ---------- soft fade-in on scroll ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    io.unobserve(en.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  readHash();
  apply(true);
  measure();
})();
