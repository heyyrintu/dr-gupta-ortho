import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { areas, cases, doctor, googleRating, home, locations, opdLabel, reviews, stats, training, whatsappLink, type Location } from '../content/site';
import { Button, Carousel, Icon, MoreLink, Photo, Reveal, Segmented } from '../components/ui';

/** Eyebrow + heading (+ optional intro / right-hand slot) used by every home and inner-page section. */
export function Head({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <Reveal className="h-head">
      <div className="h-head__text">
        <span className="kicker">{eyebrow}</span>
        <h2 className="display-2">{title}</h2>
        {intro && <p className="body-l">{intro}</p>}
      </div>
      {children && <div className="h-head__aside">{children}</div>}
    </Reveal>
  );
}

/* ================= HERO ================= */
export function Hero() {
  const h = home.hero;
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy in">
          <span className="kicker">{h.eyebrow}</span>
          <h1 className="hero__title">
            {h.title} <span className="accent">{h.titleAccent}</span>
          </h1>
          <p className="hero__lead">
            <strong>{doctor.name}</strong> — {h.lead} {h.robots}
          </p>
          <div className="hero__ctas">
            <Button to="/book">Book an appointment</Button>
            <Button href={whatsappLink('Hello Dr. Gupta, I would like a consultation.')} variant="ghost" arrow={false}>
              <Icon name="whatsapp" size={18} /> WhatsApp
            </Button>
          </div>
          <a className="hero__call" href={doctor.phonePrimaryHref}>
            <small>Call the clinic</small>
            <strong>{doctor.phonePrimary}</strong>
          </a>
          <ul className="hero__creds">
            {h.credentials.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>

        <figure className="portrait in d2">
          <div className="portrait__frame">
            <Photo name="portrait-suit" widths={[480, 600, 700, 900]} sizes="(max-width: 640px) 88vw, 460px" alt="Portrait of Dr. Siddharth Gupta" className="cover cover--top" eager />
          </div>
          <figcaption className="portrait__cap">
            <strong>{doctor.name}</strong>
            <span>{doctor.qualifications} · {doctor.registration}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ================= SERVICES (areas of practice, numbered index) ================= */
const SELECT_AREA = 'select-area';
const areaLabel = (k: string) => k.charAt(0) + k.slice(1).toLowerCase();
const two = (n: number) => String(n).padStart(2, '0');

export function Services() {
  const s = home.services;
  const pick = (i: number) => {
    window.dispatchEvent(new CustomEvent(SELECT_AREA, { detail: i }));
    document.getElementById('conditions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // move keyboard / screen-reader focus to the chosen tab too (the scroll alone leaves it on the card)
    document.getElementById(`tab-${areas[i].id}`)?.focus({ preventScroll: true });
  };
  return (
    <section className="section-band services" aria-label={s.title}>
      <div className="container">
        <Head eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
        <ol className="svc-grid">
          {areas.map((a, i) => (
            <Reveal as="li" key={a.id} delay={i * 50} className="svc">
              <button type="button" className="svc__btn" onClick={() => pick(i)}>
                <span className="svc__num">{two(i + 1)}</span>
                <span className="svc__title">{areaLabel(a.kicker)}</span>
                <span className="svc__sub">{a.conditions.slice(0, 3).join(' · ')}</span>
                <span className="svc__go" aria-hidden="true">View conditions <Icon name="arrowRight" size={15} /></span>
              </button>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================= ABOUT TEASER ================= */
export function AboutTeaser() {
  const a = home.about;
  return (
    <section className="section-band section-band--tint">
      <div className="container about-teaser">
        <Reveal as="div" className="about-teaser__media">
          <figure className="framed">
            <div className="framed__img">
              <Photo name="theatre-1" widths={[480, 700, 800, 1400]} sizes="(max-width: 900px) 92vw, 600px" alt="Dr. Siddharth Gupta operating with his surgical team" className="cover" />
            </div>
            <figcaption><span>{a.overlay.k}</span> {a.overlay.v} · {a.overlay.note}</figcaption>
          </figure>
        </Reveal>
        <Reveal delay={80} className="about-teaser__text">
          <span className="kicker">{a.eyebrow}</span>
          <h2 className="display-2">{a.title}</h2>
          <p className="body-l">{a.body}</p>
          <dl className="ledger">
            {training.slice(0, 4).map((t) => (
              <div key={t.title} className="ledger__row">
                <dt>{t.kind === 'MBBS' || t.kind.startsWith('MS') ? t.kind : areaLabel(t.kind)}</dt>
                <dd>{t.title}</dd>
              </div>
            ))}
          </dl>
          <div className="about-teaser__actions">
            <Button to="/about" variant="ghost">Full profile</Button>
            <a className="ask" href={doctor.phonePrimaryHref}>
              <small>{a.questions}</small>
              <strong>{doctor.phonePrimary}</strong>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= STATS BAND ================= */
export function StatsBand() {
  return (
    <section className="stats-band" aria-label="Key figures">
      <div className="container">
        <dl className="stats">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60} className="stats__item">
              <dt>{s.label}</dt>
              <dd>{s.value.toLocaleString('en-IN')}{s.suffix}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ================= CONDITIONS ================= */
export function ConditionExplorer() {
  const [i, setI] = useState(0);
  // the treatment cards above pick an area for us
  useEffect(() => {
    const on = (e: Event) => setI((e as CustomEvent<number>).detail);
    window.addEventListener(SELECT_AREA, on);
    return () => window.removeEventListener(SELECT_AREA, on);
  }, []);
  const cur = areas[i];
  const c = home.conditions;
  return (
    <section id="conditions" className="section-band">
      <div className="container">
        <Head eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        <Segmented items={areas.map((a) => ({ id: a.id, label: a.title }))} value={i} onChange={setI} label="Body area" idPrefix="tab" controls="condition-panel" />
        <div id="condition-panel" role="tabpanel" aria-labelledby={`tab-${cur.id}`} className="cond" key={cur.id}>
          <div className="cond__intro">
            <h3 className="display-3">{cur.headline}</h3>
            <p className="cond__when">
              <strong>When to see a specialist</strong>
              {cur.when}
            </p>
            {cur.robotic && <MoreLink to="/robotic-joint-replacement">How robotic {cur.title.toLowerCase()} replacement works</MoreLink>}
          </div>
          <div className="cond__col">
            <h4>Common conditions</h4>
            <ul>{cur.conditions.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="cond__col">
            <h4>Treatment options</h4>
            <ul>{cur.treatments.map((x) => <li key={x}>{x}</li>)}</ul>
            <Button to={`/book?concern=${cur.id}`} className="btn--block">Book a {cur.title.toLowerCase()} consultation</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= LOCATIONS ================= */
export function LocationsStrip() {
  const l = home.locations;
  return (
    <section className="section-band section-band--tint">
      <div className="container">
        <Head eyebrow={l.eyebrow} title={l.title}>
          <MoreLink to="/book">Book an appointment</MoreLink>
        </Head>
        <LocationList items={locations} />
      </div>
    </section>
  );
}

/** Grid of hospital/clinic cards, each → /book?location=id. Also used on the About page. */
export function LocationList({ items }: { items: Location[] }) {
  return (
    <ul className="loc-list">
      {items.map((loc, i) => (
        <Reveal as="li" key={loc.id} delay={i * 40}>
          <Link to={`/book?location=${loc.id}`} className="loc-row">
            <span className="loc-row__ic">{two(i + 1)}</span>
            <span className="loc-row__name">
              <strong>{loc.name}</strong>
              <small>{loc.area}</small>
            </span>
            <span className="loc-row__opd">{opdLabel(loc)}</span>
            <span className="loc-row__go" aria-hidden="true"><Icon name="arrowRight" size={16} /></span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

/* ================= REVIEWS ================= */
export function Reviews() {
  const r = home.reviews;
  return (
    <section className="section-band">
      <div className="container">
        <Head eyebrow={r.eyebrow} title={r.title}>
          {googleRating && (
            <a className="rating" href={googleRating.url} target="_blank" rel="noopener">
              <Icon name="star" size={16} /> <strong>{googleRating.rating}</strong> on Google · {googleRating.count} reviews
            </a>
          )}
        </Head>
        {reviews.length > 0 ? (
          <div className="reviews">
            {reviews.map((rv) => (
              <figure key={rv.name} className="review">
                <blockquote>“{rv.text}”</blockquote>
                <figcaption>
                  <strong>{rv.name}</strong>
                  <small>Google review{rv.treatment ? ` · ${rv.treatment}` : ''}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="reviews-empty">
            <p>{r.empty}</p>
            <Button href="https://www.google.com/search?q=Dr+Siddharth+Gupta+orthopaedic+Howrah+reviews" variant="ghost">Read reviews on Google</Button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ================= CASES ================= */
export function Cases() {
  const imgs = ['theatre-2', 'theatre-1', 'theatre-2'];
  const c = home.cases;
  return (
    <section className="section-band section-band--tint">
      <div className="container">
        <Head eyebrow={c.eyebrow} title={c.title} />
        <Carousel label="Case studies">
          {cases.map((cs, i) => (
            <a key={cs.title} href={cs.url} target="_blank" rel="noopener" className="case-card">
              <div className="case-card__media">
                <Photo name={imgs[i]} widths={[480, 700, 800]} sizes="(max-width: 900px) 85vw, 420px" alt="" className="cover" />
              </div>
              <div className="case-card__body">
                <span className="kicker kicker--plain">{cs.tag}</span>
                <h3>{cs.title}</h3>
                <span className="more-link">Read the case study <Icon name="arrowRight" size={15} /></span>
                <span className="sr-only"> {c.newTab}</span>
              </div>
            </a>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* ================= CTA ================= */
export function CtaBand({ title = 'Not sure you need surgery?', body = "Most consultations end with a plan that doesn't involve an operation. Book a visit, or send your X-ray on WhatsApp." }: { title?: string; body?: string }) {
  return (
    <section className="container section">
      <Reveal className="cta-band">
        <div className="cta-band__text">
          <h2 className="display-2">{title}</h2>
          <p>{body}</p>
        </div>
        <div className="row-gap">
          <Button to="/book" variant="light">Book an appointment</Button>
          <Button href={whatsappLink('Hello Dr. Gupta, I would like to share my X-ray / reports for an opinion.')} variant="ghostDark" arrow={false}>
            <Icon name="whatsapp" size={18} /> Send reports on WhatsApp
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
