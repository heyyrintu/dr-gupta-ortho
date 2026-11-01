import Seo from '../components/Seo';
import { CtaBand, Head, LocationList } from '../sections/HomeSections';
import { Button, Icon, MoreLink, Photo, Reveal } from '../components/ui';
import { awards, doctor, locations, memberships, pages, training, whatsappLink } from '../content/site';

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function About() {
  const a = pages.about;
  const hospitals = locations.filter((l) => l.id !== 'aceso');
  const creds = [doctor.qualifications, doctor.registration, doctor.languages, `${locations.length} hospitals & clinics`].filter(Boolean) as string[];
  return (
    <>
      <Seo
        path="/about"
        title="About Dr. Siddharth Gupta | Orthopaedic Surgeon, Kolkata"
        description="MBBS (IPGME&R SSKM), MS Orthopaedics, APOA-SIAA arthroplasty fellowship, training at King's College Hospital NHS (UK) and Barcelona. Consultant at ILS, AMRI, Belle Vue and Kothari Medical Centre."
      />
      <section className="page-hero">
        <div className="container page-hero__grid">
          <div className="page-hero__copy in">
            <span className="kicker">{a.eyebrow}</span>
            <h1 className="display-1">{doctor.name}</h1>
            <p className="lead">{a.lead}</p>
            <div className="hero__ctas">
              <Button to="/book">Book an appointment</Button>
              <Button href={whatsappLink('Hello Dr. Gupta, I would like a consultation.')} variant="ghost" arrow={false}>
                <Icon name="whatsapp" size={18} /> WhatsApp
              </Button>
            </div>
            <ul className="hero__creds">
              {creds.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <figure className="portrait portrait--cutout in d2">
            <div className="portrait__frame">
              <Photo name="portrait-scrubs" widths={[640, 1000]} sizes="(max-width: 640px) 88vw, 460px" alt="Dr. Siddharth Gupta in surgical scrubs" className="portrait__cutout" eager />
            </div>
            <figcaption className="portrait__cap">
              <strong>{doctor.name}</strong>
              <span>{a.photoCaption}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-band">
        <div className="container split">
          <Head eyebrow={a.training.eyebrow} title={a.training.title} />
          <Reveal>
            <dl className="quals quals--wide">
              {training.map((t) => (
                <div key={t.title} className="quals__row">
                  <dt>{t.kind === 'MBBS' || t.kind.startsWith('MS') ? t.kind : sentence(t.kind)}</dt>
                  <dd>
                    <strong>{t.title}</strong>
                    <span>{t.place}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="section-band section-band--tint">
        <div className="container">
          <Head eyebrow={a.hospitals.eyebrow} title={a.hospitals.title}>
            <MoreLink to="/book">OPD days &amp; booking</MoreLink>
          </Head>
          <LocationList items={hospitals} />
        </div>
      </section>

      <section className="section-band">
        <div className="container about-creds">
          <div>
            <Head eyebrow={a.memberships.eyebrow} title={a.memberships.title} />
            <Reveal as="div">
              <ul className="member-list">
                {memberships.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </Reveal>
          </div>
          <div>
            <Head eyebrow={a.awards.eyebrow} title={a.awards.title} />
            <Reveal>
              <dl className="award-list">
                {awards.map((w) => (
                  <div key={w.title} className="award-list__row">
                    <dt>{w.year}</dt>
                    <dd>
                      <strong>{w.title}</strong>
                      <span>{w.note}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
