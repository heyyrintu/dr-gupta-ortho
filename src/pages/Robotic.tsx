import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import LocalNav from '../components/LocalNav';
import KneeStory from '../sections/KneeStory';
import { CtaBand, Head } from '../sections/HomeSections';
import { Button, Icon, Photo, Reveal } from '../components/ui';
import { pages, robotSystems, roboticFaqs, whatsappLink } from '../content/site';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'sequence', label: 'Step by step' },
  { id: 'candidate', label: 'Is it for me?' },
  { id: 'systems', label: 'Systems' },
  { id: 'faq', label: 'FAQ' },
];

export default function Robotic() {
  const r = pages.robotic;
  return (
    <>
      <Seo
        path="/robotic-joint-replacement"
        title="Robotic Knee & Hip Replacement in Kolkata | Dr. Siddharth Gupta"
        description="How robotic joint replacement works — 3D planning, robot-guided cuts and implant fitting. Dr. Siddharth Gupta is trained on MAKO, VELYS and CUVIS systems. Kolkata & Howrah."
      />
      <section id="overview" className="page-hero">
        <div className="container page-hero__grid">
          <div className="page-hero__copy in">
            <nav aria-label="Breadcrumb" className="crumbs"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Robotic joint replacement</span></nav>
            <span className="kicker">{r.eyebrow}</span>
            <h1 className="display-1">{r.title}</h1>
            <p className="lead">{r.lead}</p>
            <div className="hero__ctas">
              <Button to="/book?concern=knee">Book a joint consultation</Button>
              <Button href={whatsappLink('Hello Dr. Gupta, I would like an opinion on joint replacement. I can share my X-ray.')} variant="ghost" arrow={false}><Icon name="whatsapp" size={18} /> Send your X-ray</Button>
            </div>
          </div>
          <figure className="page-hero__panel in d2">
            <div className="page-hero__frame">
              <Photo name="theatre-2" widths={[480, 700, 800, 1400]} sizes="(max-width: 900px) 92vw, 600px" alt="Dr. Siddharth Gupta in the operating theatre" className="cover" eager />
            </div>
            <figcaption>{r.photoCaption}</figcaption>
          </figure>
        </div>
        <div className="container">
          <ul className="points">
            {r.plan.map((p, i) => (
              <li key={p.t} className="points__item">
                <span className="points__ic">{String(i + 1).padStart(2, '0')}</span>
                <span><strong>{p.t}</strong>{p.b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LocalNav title="Robotic joint replacement" links={sections} to="/book?concern=knee" />

      <KneeStory id="sequence" title="Step by step, in" accent="3D" />

      <section id="candidate" className="section-band">
        <div className="container split">
          <Head eyebrow={r.candidate.eyebrow} title={r.candidate.title} />
          <Reveal>
            <ol className="numbered">
              {r.candidate.items.map((c, i) => (
                <li key={c}>
                  <span className="numbered__n">0{i + 1}</span>
                  {c}
                </li>
              ))}
            </ol>
            <p className="note">{r.candidate.note}</p>
          </Reveal>
        </div>
      </section>

      <section id="systems" className="section-band section-band--tint">
        <div className="container">
          <Head eyebrow={r.systems.eyebrow} title={r.systems.title} intro={r.systems.intro} />
          <div className="systems">
            {robotSystems.map((s, i) => (
              <Reveal key={s.name} delay={i * 60} className="system">
                <span className="eyebrow">System {i + 1}</span>
                <span className="system__name">{s.name}</span>
                <span className="system__use">{s.use}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-band">
        <div className="container split">
          <Head eyebrow={r.faq.eyebrow} title={r.faq.title} />
          <div className="faq">
            {roboticFaqs.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>
                  {f.q}
                  <span className="faq__plus" aria-hidden="true">+</span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={r.cta.title} body={r.cta.body} />
    </>
  );
}
