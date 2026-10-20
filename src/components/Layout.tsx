import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { doctor, whatsappLink } from '../content/site';
import { Button, Icon } from './ui';
import { asset } from '../lib/base';

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/#conditions', label: 'Conditions' },
  { to: '/robotic-joint-replacement', label: 'Robotic surgery' },
  { to: '/book', label: 'Locations' },
];

/**
 * Logo mark: Dr. Gupta's original caduceus emblem (teal, from his previous website's logo) on a white
 * rounded tile. The name beside it is real text, so search engines and screen readers read it; the image
 * itself is decorative here (alt=""). /logo-512.png is the same emblem for structured data and icons.
 */
function LogoMark() {
  return (
    <span className="logo__mark" aria-hidden="true">
      <img src={asset('logo-mark.svg')} alt="" width="30" height="29" decoding="async" />
    </span>
  );
}

function Logo() {
  return (
    <Link to="/" className="logo">
      <LogoMark />
      <span className="logo__text">
        <span className="logo__name">{doctor.name}</span>
        <span className="logo__sub">{doctor.shortTitle}</span>
      </span>
      <span className="sr-only"> — home</span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  // full-screen sheet on phones: lock page scroll and close on Escape while it is open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    // the sheet covers the page: keep Tab inside it by making the content behind it inert
    const behind = [document.getElementById('main'), document.querySelector('.site-footer')];
    behind.forEach((el) => el?.setAttribute('inert', ''));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      behind.forEach((el) => el?.removeAttribute('inert'));
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="site-header__bar">
        <Logo />
        <nav className="site-nav" aria-label="Main">
          {nav.map((n) =>
            n.to.includes('#') ? (
              <Link key={n.to} to={n.to} className="site-nav__link">{n.label}</Link>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.end} className="site-nav__link">{n.label}</NavLink>
            ),
          )}
        </nav>
        <a href={doctor.phonePrimaryHref} className="site-header__phone"><Icon name="phone" size={15} />{doctor.phonePrimary}</a>
        <Button to="/book" variant="ghost" className="site-header__cta">Book appointment</Button>
        <button className={`site-header__menu ${open ? 'is-open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
          <span className="burger" aria-hidden="true"><span /><span /></span>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          {nav.map((n, i) =>
            n.to.includes('#') ? (
              // plain Link: a NavLink to "/#conditions" would claim aria-current="page" on the home page
              <Link key={n.to} to={n.to} style={{ animationDelay: `${40 + i * 35}ms` }} className="mobile-nav__link" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.end} style={{ animationDelay: `${40 + i * 35}ms` }} className={({ isActive }) => `mobile-nav__link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                {n.label}
              </NavLink>
            ),
          )}
          <div className="mobile-nav__actions" style={{ animationDelay: `${40 + nav.length * 35}ms` }}>
            <Button to="/book" arrow={false} className="btn--block">Book an appointment</Button>
            <a href={doctor.phonePrimaryHref} className="btn btn--ghost btn--block"><Icon name="phone" size={17} /> {doctor.phonePrimary}</a>
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>
            {doctor.qualifications} · Consultant Orthopaedic &amp; Robotic Joint Surgeon
            <br />
            {doctor.registration}
          </p>
        </div>
        <div>
          <h2 className="site-footer__h">Treatments</h2>
          <Link to="/robotic-joint-replacement">Robotic knee &amp; hip replacement</Link>
          <Link to="/#conditions">Sports injuries &amp; arthroscopy</Link>
          <Link to="/#conditions">Spine &amp; scoliosis</Link>
          <Link to="/#conditions">Fractures &amp; trauma</Link>
        </div>
        <div>
          <h2 className="site-footer__h">Clinic</h2>
          <p>
            {doctor.clinic.name}
            <br />
            {doctor.clinic.address}
          </p>
          <a href={doctor.clinic.mapsUrl} target="_blank" rel="noopener">Get directions ›</a>
        </div>
        <div>
          <h2 className="site-footer__h">Contact</h2>
          <a href={doctor.phonePrimaryHref}>{doctor.phonePrimary}</a>
          <a href={whatsappLink()} target="_blank" rel="noopener">{doctor.whatsapp} · WhatsApp</a>
          <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
        </div>
      </div>
      <div className="container site-footer__legal">
        <span suppressHydrationWarning>© {new Date().getFullYear()} {doctor.name}. Information on this site is not a substitute for a medical consultation.</span>
        <span>
          3D bone anatomy: BodyParts3D, © The Database Center for Life Science, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Implants illustrative.
        </span>
      </div>
    </footer>
  );
}

function MobileActionBar() {
  return (
    <nav className="action-bar" aria-label="Quick actions">
      <a href={doctor.phonePrimaryHref} className="action-bar__btn">
        <Icon name="phone" />
        Call
      </a>
      <a href={whatsappLink('Hello Dr. Gupta, I would like to book an appointment.')} target="_blank" rel="noopener" className="action-bar__btn">
        <Icon name="whatsapp" />
        WhatsApp
      </a>
      <Link to="/book" className="action-bar__btn action-bar__btn--primary">
        <Icon name="calendar" />
        Book visit
      </Link>
    </nav>
  );
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollManager />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
