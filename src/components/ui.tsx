import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/base';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

/* ---------- Icons (stroke, currentColor) ---------- */
type IconName = 'arrowUpRight' | 'arrowRight' | 'chevronLeft' | 'chevronRight' | 'check' | 'phone' | 'whatsapp' | 'pin' | 'pulse' | 'cap' | 'menu' | 'close' | 'rotate' | 'calendar' | 'shield' | 'star';
const paths: Record<IconName, ReactNode> = {
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  arrowRight: <path d="M5 12h14M13 5l7 7-7 7" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  check: <path d="M20 6 9 17l-5-5" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  whatsapp: <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" />,
  pin: <><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  pulse: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  cap: <path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  rotate: <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
};
export function Icon({ name, size = 18, stroke = 2.2, className }: { name: IconName; size?: number; stroke?: number; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

/* ---------- Buttons ---------- */
type BtnProps = { to?: string; href?: string; children: ReactNode; variant?: 'primary' | 'light' | 'ghost' | 'ghostDark'; arrow?: boolean; className?: string; onClick?: () => void };
export function Button({ to, href, children, variant = 'primary', arrow = true, className = '', onClick }: BtnProps) {
  const cls = `btn btn--${variant} ${arrow ? 'btn--arrow' : ''} ${className}`; // arrow = trailing circle with ↗
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <span className="btn__go" aria-hidden="true">
          <Icon name="arrowUpRight" size={16} stroke={2.4} />
        </span>
      )}
    </>
  );
  if (to) return <Link to={to} className={cls} onClick={onClick}>{inner}</Link>;
  const external = href?.startsWith('http');
  return (
    <a href={href} className={cls} onClick={onClick} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>
      {inner}
    </a>
  );
}

/* ---------- Reveal on scroll ---------- */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: { children: ReactNode; delay?: number; as?: 'div' | 'section' | 'li' | 'article'; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/* ---------- Animated number ---------- */
export function CountUp({ value, suffix = '', duration = 1600 }: { value: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);
  return (
    <span ref={ref} aria-label={`${value.toLocaleString('en-IN')}${suffix}`}>
      {n.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({ tag, title, accent, after, children, light }: { tag?: string; title: string; accent?: string; after?: string; children?: ReactNode; light?: boolean }) {
  return (
    <Reveal className={`section-head ${light ? 'section-head--light' : ''}`}>
      <div className="section-head__text">
        {tag && <span className="chip-green">{tag}</span>}
        <h2 className="display-2">
          {title} {accent && <span className="accent">{accent}</span>}
          {after}
        </h2>
      </div>
      {children && <div className="section-head__aside">{children}</div>}
    </Reveal>
  );
}

/* ---------- Responsive image ---------- */
export function Photo({ name, widths, alt, sizes, className, eager }: { name: string; widths: number[]; alt: string; sizes: string; className?: string; eager?: boolean }) {
  const srcSet = widths.map((w) => `${asset(`images/${name}-${w}.webp`)} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={asset(`images/${name}.jpg`)} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" {...((eager ? { fetchpriority: 'high' } : {}) as Record<string, string>)} />
    </picture>
  );
}

/* ---------- Segmented control (tablist) ----------
 * Apple-style pill track with a thumb that slides to the active segment. Before the thumb is
 * measured (prerendered HTML, no JS) the active segment paints its own background instead.
 * Arrow keys / Home / End move between segments (WAI-ARIA tabs pattern). */
export function Segmented({ items, value, onChange, label, idPrefix, controls }: { items: { id: string; label: string }[]; value: number; onChange: (i: number) => void; label: string; idPrefix: string; controls?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const measure = useCallback(() => {
    const b = btns.current[value];
    if (b) setThumb({ x: b.offsetLeft, w: b.offsetWidth });
  }, [value]);
  useEffect(() => {
    measure();
    const b = btns.current[value];
    const sc = scroller.current;
    // keep the active segment visible when the track scrolls sideways (phones)
    if (b && sc && sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: b.offsetLeft - (sc.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, value]);
  const onKey = (e: KeyboardEvent) => {
    const last = items.length - 1;
    const next = e.key === 'ArrowRight' ? Math.min(last, value + 1) : e.key === 'ArrowLeft' ? Math.max(0, value - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(next);
    btns.current[next]?.focus();
  };
  return (
    <div className="seg-scroll" ref={scroller}>
      <div role="tablist" aria-label={label} className={`seg ${thumb ? 'is-ready' : ''}`} onKeyDown={onKey}>
        {thumb && <span className="seg__thumb" aria-hidden="true" style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }} />}
        {items.map((it, i) => (
          <button
            key={it.id}
            ref={(el) => { btns.current[i] = el; }}
            type="button"
            role="tab"
            id={`${idPrefix}-${it.id}`}
            aria-selected={i === value}
            aria-controls={controls}
            tabIndex={i === value ? 0 : -1}
            className={`seg__btn ${i === value ? 'is-active' : ''}`}
            onClick={() => onChange(i)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Carousel ----------
 * Native horizontal scroll with snap points; the round buttons page by ~one viewport of cards
 * and disable at either end. Works with touch, trackpad, keyboard (track is focusable) and no JS. */
export function Carousel({ children, label, className = '' }: { children: ReactNode[]; label: string; className?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setEdge({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth >= t.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);
  const page = (dir: 1 | -1) => {
    const t = track.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.85, behavior: 'smooth' });
  };
  return (
    <div className={`carousel ${className}`}>
      <ul ref={track} className="carousel__track" aria-label={label} tabIndex={0} onScroll={update}>
        {children.map((c, i) => <li key={i} className="carousel__item">{c}</li>)}
      </ul>
      <div className="carousel__nav">
        <button type="button" className="round-btn" aria-label="Previous" disabled={edge.start} onClick={() => page(-1)}><Icon name="chevronLeft" size={18} stroke={2.4} /></button>
        <button type="button" className="round-btn" aria-label="Next" disabled={edge.end} onClick={() => page(1)}><Icon name="chevronRight" size={18} stroke={2.4} /></button>
      </div>
    </div>
  );
}

/* ---------- Chevron text link ("Learn more ›") ---------- */
export function MoreLink({ to, href, children }: { to?: string; href?: string; children: ReactNode }) {
  const inner = <>{children}<Icon name="chevronRight" size={15} stroke={2.4} /></>;
  if (to) return <Link to={to} className="more-link">{inner}</Link>;
  return <a href={href} className="more-link" {...(href?.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>{inner}</a>;
}
