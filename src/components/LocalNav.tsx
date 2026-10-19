import { useEffect, useState } from 'react';
import { Button } from './ui';

/**
 * Apple-style local navigation: a slim frosted bar that sticks under the site header on long
 * pages, with in-page links that highlight the section currently in view. Tablet/desktop only —
 * phones already have the bottom action bar.
 */
export default function LocalNav({ title, links, cta = 'Book', to = '/book' }: { title: string; links: { id: string; label: string }[]; cta?: string; to?: string }) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = links.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [links]);
  return (
    <nav className="local-nav" aria-label={`${title} sections`}>
      <div className="container local-nav__bar">
        <span className="local-nav__title">{title}</span>
        <div className="local-nav__links">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'is-active' : ''} aria-current={active === l.id ? 'location' : undefined}>
              {l.label}
            </a>
          ))}
        </div>
        <Button to={to} arrow={false} className="btn--sm">{cta}</Button>
      </div>
    </nav>
  );
}
