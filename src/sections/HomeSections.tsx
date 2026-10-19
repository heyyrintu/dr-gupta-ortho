import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JointArt from '../components/JointArt';
import { areas, cases, doctor, googleRating, home, locations, opdLabel, reviews, stats, whatsappLink, type Location } from '../content/site';
import { Button, Carousel, Icon, MoreLink, Photo, Reveal, Segmented } from '../components/ui';

/** Eyebrow + heading (+ optional intro / right-hand slot) used by every home and inner-page section. */
export function Head({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <Reveal className="h-head">
      <div className="h-head__text">
        <span className="chip-green">{eyebrow}</span>
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
  const joints = stats[0];
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy in">
          <span className="tag"><Icon name="pulse" size={15} stroke={2.4} />{h.tag}</span>
          <h1 className="hero__title">
            <span>{h.display[0]}</span>{' '}
            <span className="hero__title-icon"><JointArt name="knee" className="hero__glyph" />{h.display[1]}</span>{' '}
            <span>{h.display[2]}</span>
          </h1>
          <p className="hero__lead">
            <strong>{doctor.name}</strong> — {h.lead} {h.robots}
          </p>
          <div className="hero__ctas">
            <Button to="/book">Book an appointment</Button>
            <a className="circle-btn" href={whatsappLink('Hello Dr. Gupta, I would like a consultation.')} target="_blank" rel="noopener" aria-label="Message on WhatsApp">
              <Icon name="whatsapp" size={19} />
            </a>
            <a className="hero__call" href={doctor.phonePrimaryHref}>
              <small>Call the clinic</small>
              <strong>{doctor.phonePrimary}</strong>
            </a>
          </div>
          <ul className="hero__creds">
            {h.credentials.map((c) => (
              <li key={c}><Icon name="check" size={14} stroke={2.6} />{c}</li>
            ))}
          </ul>
        </div>

        <div className="hero__media in d2">
          <figure className="arch">
            <div className="arch__frame">
              <Photo name="portrait-scrubs" widths={[640, 1000]} sizes="(max-width: 640px) 92vw, 480px" alt="Dr. Siddharth Gupta in navy surgical scrubs" className="arch__photo" eager />
            </div>
            <div className="float-card float-card--stat">
              <strong>{joints.value.toLocaleString('en-IN')}{joints.suffix}</strong>
              <small>{joints.label}</small>
            </div>
            <div className="float-card float-card--row">
              <span className="float-card__ic"><Icon name="cap" size={18} /></span>
              <span><strong>{doctor.qualifications.split(', ').pop()}</strong><small>{h.credentials[1]}</small></span>
            </div>
            <div className="float-card float-card--row float-card--robots">
              <span className="float-card__ic"><Icon name="rotate" size={18} /></span>
              <span><strong>{h.chipRobots.v}</strong><small>{h.chipRobots.k}</small></span>
            </div>
            <figcaption className="sr-only">{h.photoCaption}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ================= SERVICES (glass treatment cards) ================= */
const SELECT_AREA = 'select-area';
const areaLabel = (k: string) => k.charAt(0) + k.slice(1).toLowerCase();

export function Services() {
  const pick = (i: number) => {
    window.dispatchEvent(new CustomEvent(SELECT_AREA, { detail: i }));
    document.getElementById('conditions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // move keyboard / screen-reader focus to the chosen tab too (the scroll alone leaves it on the card)
    document.getElementById(`tab-${areas[i].id}`)?.focus({ preventScroll: true });
  };
  return (
    <section className="services" aria-label={home.services.title}>
      <div className="container svc-grid">
        {areas.map((a, i) => (
          <Reveal key={a.id} delay={i * 50} className={`svc ${i === 0 ? 'svc--feature' : ''}`}>
            <button type="button" className="svc__btn" onClick={() => pick(i)}>
              <JointArt name={a.id} className="svc__art" />
              <span className="svc__go" aria-hidden="true"><Icon name="arrowUpRight" size={18} stroke={2.4} /></span>
              <span className="svc__text">
                <span className="svc__title">{areaLabel(a.kicker)}</span>
                <span className="svc__sub">{a.conditions.slice(0, 2).join(' · ')}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================= ABOUT TEASER ================= */
export function AboutTeaser() {
  const a = home.about;
  return (
    <section className="section-band">
      <div className="container about-teaser">
        <Reveal className="about-teaser__media">
          <Photo name="theatre-1" widths={[480, 700, 800, 1400]} sizes="(max-width: 900px) 92vw, 600px" alt="Dr. Siddharth Gupta operating with his surgical team" className="cover" />
          <div className="glass-card about-teaser__overlay">
            <div className="about-teaser__overlay-top">
              <span className="plus-ic" aria-hidden="true">+</span>
              <span className="pill-white">Dr. Gupta</span>
            </div>
            <span className="about-teaser__k">{a.overlay.k}</span>
            <strong className="about-teaser__v">{a.overlay.v}</strong>
            <span className="about-teaser__note">{a.overlay.note}</span>
          </div>
        </Reveal>
        <Reveal delay={80} className="about-teaser__text">
          <span className="chip-green">{a.eyebrow}</span>
          <h2 className="display-2">{a.title}</h2>
          <p className="body-l">{a.body}</p>
          <div className="about-teaser__actions">
            <Button to="/about">Full profile</Button>
            <a className="ask" href={doctor.phonePrimaryHref}>
              <span className="ask__ic"><Icon name="phone" size={18} /></span>
              <span><strong>{a.questions}</strong><small>{doctor.phonePrimary}</small></span>
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
    <section id="conditions" className="section-band section-band--tint">
      <div className="container">
        <Head eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        <Segmented items={areas.map((a) => ({ id: a.id, label: a.title }))} value={i} onChange={setI} label="Body area" idPrefix="tab" controls="condition-panel" />
        <div id="condition-panel" role="tabpanel" aria-labelledby={`tab-${cur.id}`} className="cond" key={cur.id}>
          <div className="cond__intro">
            <JointArt name={cur.id} className="cond__art" />
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
    <section className="section-band">
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
            <span className="loc-row__ic"><Icon name="pin" size={18} /></span>
            <span className="loc-row__name">
              <strong>{loc.name}</strong>
              <small>{loc.area}</small>
            </span>
            <span className="loc-row__opd">{opdLabel(loc)}</span>
            <span className="loc-row__go" aria-hidden="true"><Icon name="chevronRight" size={16} stroke={2.4} /></span>
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
    <section className="section-band section-band--tint">
      <div className="container">
        <Head eyebrow={r.eyebrow} title={r.title}>
          {googleRating && (
            <a className="rating" href={googleRating.url} target="_blank" rel="noopener">
              <Icon name="star" size={18} /> <strong>{googleRating.rating}</strong> on Google · {googleRating.count} reviews
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
    <section className="section-band">
      <div className="container">
        <Head eyebrow={c.eyebrow} title={c.title} />
        <Carousel label="Case studies">
          {cases.map((cs, i) => (
            <a key={cs.title} href={cs.url} target="_blank" rel="noopener" className="case-card">
              <div className="case-card__media">
                <Photo name={imgs[i]} widths={[480, 700, 800]} sizes="(max-width: 900px) 85vw, 420px" alt="" className="cover" />
              </div>
              <div className="case-card__body">
                <span className="eyebrow">{cs.tag}</span>
                <h3>{cs.title}</h3>
                <span className="more-link">Read the case study <Icon name="chevronRight" size={15} stroke={2.4} /></span>
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
