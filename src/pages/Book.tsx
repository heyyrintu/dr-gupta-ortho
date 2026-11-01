import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { asset } from '../lib/base';
import { areas, doctor, locations, opdLabel, pages, whatsappLink } from '../content/site';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SESSIONS = ['Morning OPD', 'Evening OPD'];

type Day = { dow: string; date: number; mon: string; iso: string; sunday: boolean };
/** The next 7 days, starting tomorrow. */
function nextDays(): Day[] {
  const t = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i + 1);
    return { dow: DOW[d.getDay()], date: d.getDate(), mon: MON[d.getMonth()], iso: d.toDateString(), sunday: d.getDay() === 0 };
  });
}

/**
 * Booking request flow (no backend yet): the visitor picks a location, day and session,
 * enters their details, and the request opens in WhatsApp pre-filled for the clinic team.
 * TODO (phase 2): replace with the appointments API of the Dr. Gupta platform (Cashfree for payments).
 */
export default function Book() {
  const [params] = useSearchParams();

  // Today's date and the ?location / ?concern pre-selection only exist in the browser, so they are
  // applied after mount — the prerendered HTML (built on another day, without a query) then hydrates cleanly.
  const [days, setDays] = useState<Day[]>([]);
  const [loc, setLoc] = useState(0);
  const [day, setDay] = useState(0);
  const [concern, setConcern] = useState('Knee');
  useEffect(() => {
    const next = nextDays();
    setDays(next);
    setDay(next[0].sunday ? 1 : 0);
    setLoc(Math.max(0, locations.findIndex((l) => l.id === params.get('location'))));
    setConcern(areas.find((a) => a.id === params.get('concern'))?.title ?? 'Knee');
  }, [params]);

  const [session, setSession] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visit, setVisit] = useState('First consultation');
  const [touched, setTouched] = useState(1);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [bad, setBad] = useState<'name' | 'phone' | null>(null); // field the error message belongs to

  const L = locations[loc];
  const D = days[day];
  const step = sent ? 3 : Math.min(3, touched);
  const when = D ? `${D.dow} ${D.date} ${D.mon} · ${SESSIONS[session]}` : SESSIONS[session];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Please enter the patient’s name.');
      setBad('name');
      return document.getElementById('book-name')?.focus();
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setBad('phone');
      return document.getElementById('book-phone')?.focus();
    }
    setError('');
    setBad(null);
    const msg = [
      `Hello, I'd like to book an appointment with ${doctor.name}.`,
      `Patient: ${name.trim()}`,
      `Mobile: ${phone.trim()}`,
      `Location: ${L.name}, ${L.area}`,
      `Preferred: ${when}`,
      `Concern: ${concern} · ${visit}`,
    ].join('\n');
    window.open(whatsappLink(msg), '_blank', 'noopener');
    setSent(true);
  };

  return (
    <>
      <Seo path="/book" title="Book an Appointment | Dr. Siddharth Gupta, Orthopaedic Surgeon" description="Book an OPD appointment with Dr. Siddharth Gupta at ILS Hospitals (Howrah, Dum Dum, Salt Lake), AMRI Mukundapur, Belle Vue Clinic, Kothari Medical Centre or ACESO Clinic, Howrah." />
      <section className="book-hero">
        <div className="container book-hero__inner">
          <div className="book-hero__copy in">
            <span className="kicker">{pages.book.eyebrow}</span>
            <h1 className="display-1">{pages.book.title}</h1>
            <p className="lead">{pages.book.lead}</p>
          </div>
          <div className="book-progress in d2" aria-live="polite">
            <span className="eyebrow">{sent ? 'Request sent' : `Step ${step} of 3`}</span>
            <div className="book-progress__bar"><span style={{ width: sent ? '100%' : `${(step / 3) * 100 - 10}%` }} /></div>
          </div>
        </div>
      </section>

      <div className="book-band">
        <form className="container book" onSubmit={submit} noValidate>
          <div className="book__steps">
            <fieldset className="book-card">
              <legend className="book-card__h"><span className="book-card__n">01</span>Location</legend>
              <div className="opt-grid">
                {locations.map((l, i) => (
                  <label key={l.id} className={`opt ${i === loc ? 'is-on' : ''}`}>
                    <input type="radio" name="location" checked={i === loc} onChange={() => { setLoc(i); setTouched((t) => Math.max(t, 2)); }} />
                    <span className="opt__top"><strong>{l.name}</strong><span className="opt__radio" /></span>
                    <small>{l.area}</small>
                    <span className="opt__meta">{opdLabel(l)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="book-card">
              <legend className="book-card__h"><span className="book-card__n">02</span>Day &amp; session</legend>
              <div className="day-grid" role="radiogroup" aria-label="Day">
                {days.map((d, i) => (
                  <label key={d.iso} className={`day ${i === day ? 'is-on' : ''} ${d.sunday ? 'is-muted' : ''}`}>
                    <input type="radio" name="day" checked={i === day} onChange={() => { setDay(i); setTouched((t) => Math.max(t, 2)); }} />
                    <span className="day__dow">{d.dow}</span>
                    <span className="day__date">{d.date}</span>
                    <span className="day__mon">{d.mon}</span>
                  </label>
                ))}
              </div>
              <div className="session-row" role="radiogroup" aria-label="Session">
                {SESSIONS.map((s, i) => (
                  <label key={s} className={`session ${i === session ? 'is-on' : ''}`}>
                    <input type="radio" name="session" checked={i === session} onChange={() => { setSession(i); setTouched(3); }} />
                    {s}
                  </label>
                ))}
              </div>
              <p className="hint">Exact time slots are confirmed by the clinic based on the OPD schedule.</p>
            </fieldset>

            <fieldset className="book-card">
              <legend className="book-card__h"><span className="book-card__n">03</span>Your details</legend>
              <div className="field-grid">
                <label className="field">
                  <span>Patient name</span>
                  <input id="book-name" type="text" autoComplete="name" aria-invalid={bad === 'name' || undefined} aria-describedby={bad === 'name' ? 'book-error' : undefined} value={name} onChange={(e) => { setName(e.target.value); setTouched(3); }} placeholder=" " required />
                </label>
                <label className="field">
                  <span>Mobile (WhatsApp)</span>
                  <input id="book-phone" type="tel" autoComplete="tel" aria-invalid={bad === 'phone' || undefined} aria-describedby={bad === 'phone' ? 'book-error' : undefined} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder=" " required />
                </label>
                <label className="field">
                  <span>Main concern</span>
                  <select value={concern} onChange={(e) => setConcern(e.target.value)}>
                    {areas.map((a) => <option key={a.id}>{a.title}</option>)}
                    <option>Second opinion</option>
                  </select>
                </label>
                <label className="field">
                  <span>Visit type</span>
                  <select value={visit} onChange={(e) => setVisit(e.target.value)}>
                    <option>First consultation</option>
                    <option>Follow-up</option>
                    <option>Video consultation</option>
                  </select>
                </label>
              </div>
            </fieldset>
          </div>

          <aside className="book-summary" aria-live="polite">
            {!sent ? (
              <div className="book-summary__body">
                <span className="book-summary__label">Your appointment</span>
                <div className="book-summary__doc">
                  <img src={asset('images/portrait-scrubs-120.webp')} alt="" width="52" height="52" />
                  <span><strong>{doctor.name}</strong><small>{doctor.shortTitle}</small></span>
                </div>
                <dl>
                  <dt>Location</dt>
                  <dd>{L.name}, {L.area}</dd>
                  <dt>When</dt>
                  <dd>{when}</dd>
                </dl>
                {error && <p id="book-error" className="form-error" role="alert">{error}</p>}
                <button type="submit" className="btn btn--primary btn--block btn--lg">Request on WhatsApp</button>
                <a href={doctor.phonePrimaryHref} className="book-summary__call">Prefer to call? {doctor.phonePrimary}</a>
              </div>
            ) : (
              <div className="book-summary__body">
                <svg className="pop" aria-hidden="true" width="64" height="64" viewBox="0 0 64 64"><circle className="ring" cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" /><path d="M21 33l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <h2 className="display-3">Request ready.</h2>
                <p>Send the WhatsApp message that just opened. The clinic will confirm your time for {L.name}, {when}. Please bring any X-rays, MRI or previous reports.</p>
                <button type="button" className="btn btn--ghost btn--block" onClick={() => setSent(false)}>Edit request</button>
              </div>
            )}
          </aside>
        </form>
      </div>
    </>
  );
}
