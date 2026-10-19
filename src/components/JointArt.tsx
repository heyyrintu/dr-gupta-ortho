import { cloneElement, useId, type CSSProperties, type ReactElement } from 'react';

/**
 * Animated "glass" joint illustrations (knee, hip, shoulder, sports, spine, fractures) for the
 * treatment cards, the conditions panel and the hero title.
 *
 * Each part is its own <g class="ja-part ja-…"> drawn three times — blue→teal body, a white sheen and a
 * thin white rim — so it reads like a translucent 3D render without image assets. CSS in global.css
 * (search "Joint art") animates it:
 *  - assemble: parts spring in one after another (paused until the surrounding <Reveal> is in view);
 *  - hover (on the card): the joint moves like the real one — knee flexes, hip swings, shoulder lifts,
 *    spine ripples, the fracture knits together, sports ligaments light up — and a sheen sweeps across;
 *  - idle: a slow drift, like a render floating in place.
 * All of it is switched off by prefers-reduced-motion. Decorative only (aria-hidden).
 */
type Part = { cls: string; el: ReactElement };

const P = (cls: string, el: ReactElement): Part => ({ cls, el });

const parts: Record<string, Part[]> = {
  knee: [
    P('femur', <rect x="47" y="2" width="26" height="44" rx="11" />),
    P('femur', <circle cx="49" cy="50" r="14" />),
    P('femur', <circle cx="71" cy="50" r="14" />),
    P('tibia', <rect x="33" y="70" width="54" height="15" rx="7.5" />),
    P('tibia', <rect x="47" y="78" width="25" height="40" rx="11" />),
    P('tibia', <rect x="80" y="82" width="8" height="34" rx="4" />),
  ],
  hip: [
    P('pelvis', <path d="M8 46c0-26 22-42 46-40 14 1 22 8 22 16-12-4-26-2-36 8-8 8-12 18-12 30H14C10 56 8 52 8 46z" />),
    P('femur', <circle cx="42" cy="52" r="15" />),
    P('femur', <rect x="40" y="46" width="34" height="14" rx="7" transform="rotate(32 57 53)" />),
    P('femur', <circle cx="78" cy="58" r="11" />),
    P('femur', <rect x="62" y="58" width="22" height="60" rx="10" transform="rotate(-8 73 88)" />),
  ],
  shoulder: [
    P('clavicle', <rect x="40" y="6" width="74" height="11" rx="5.5" transform="rotate(10 77 11)" />),
    P('scapula', <path d="M18 24c14-4 26 2 30 14 4 13-2 30-14 42-8 8-18 10-22 6 6-10 10-22 8-34-1-10-6-20-2-28z" />),
    P('humerus', <circle cx="62" cy="42" r="19" />),
    P('humerus', <rect x="54" y="46" width="20" height="70" rx="10" />),
  ],
  sports: [
    P('femur', <rect x="47" y="2" width="26" height="40" rx="11" />),
    P('femur', <circle cx="49" cy="46" r="14" />),
    P('femur', <circle cx="71" cy="46" r="14" />),
    P('tibia', <rect x="33" y="74" width="54" height="15" rx="7.5" />),
    P('tibia', <rect x="47" y="82" width="25" height="36" rx="11" />),
    P('lig', <rect x="54" y="52" width="7" height="30" rx="3.5" transform="rotate(-24 57 67)" />),
    P('lig', <rect x="59" y="52" width="7" height="30" rx="3.5" transform="rotate(24 62 67)" />),
  ],
  spine: [
    P('cord', <rect x="56" y="0" width="8" height="118" rx="4" />),
    P('vert', <rect x="40" y="4" width="40" height="16" rx="7" />),
    P('vert', <rect x="37" y="26" width="46" height="17" rx="7.5" />),
    P('vert', <rect x="34" y="49" width="52" height="18" rx="8" />),
    P('vert', <rect x="31" y="73" width="58" height="19" rx="8.5" />),
    P('vert', <rect x="28" y="98" width="64" height="18" rx="9" />),
  ],
  fractures: [
    P('upper', <circle cx="50" cy="14" r="11" />),
    P('upper', <circle cx="70" cy="14" r="11" />),
    P('upper', <rect x="49" y="16" width="22" height="38" rx="8" />),
    P('lower', <rect x="49" y="64" width="22" height="40" rx="8" />),
    P('lower', <circle cx="50" cy="106" r="11" />),
    P('lower', <circle cx="70" cy="106" r="11" />),
  ],
};

export default function JointArt({ name, className = '' }: { name: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const body = `${uid}-b`, sheen = `${uid}-s`, band = `${uid}-w`, clip = `${uid}-c`;
  const list = parts[name] ?? parts.knee;
  const rotate = name === 'fractures' ? 'rotate(-38 60 60)' : undefined;
  return (
    <svg className={`ja ja--${name} ${className}`} viewBox="-6 -6 132 132" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a8d6ff" />
          <stop offset="0.5" stopColor="#3f86e0" />
          <stop offset="1" stopColor="#1f4fa8" />
        </linearGradient>
        <radialGradient id={sheen} cx="0.3" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#bdf5d6" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={band} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}>
          <g transform={rotate}>{list.map((p, i) => cloneElement(p.el, { key: i }))}</g>
        </clipPath>
      </defs>
      <g className="ja-body" transform={rotate}>
        {list.map((p, i) => (
          <g key={i} className={`ja-part ja-${p.cls}`} style={{ '--i': i } as CSSProperties}>
            {cloneElement(p.el, { fill: `url(#${body})`, opacity: 0.94 })}
            {cloneElement(p.el, { fill: `url(#${sheen})` })}
            {cloneElement(p.el, { fill: 'none', stroke: '#ffffff', strokeOpacity: 0.8, strokeWidth: 1.4 })}
          </g>
        ))}
        {name === 'fractures' && <path className="ja-crack" d="M38 58l9-6 6 8 8-7 7 7 9-6" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
      </g>
      {/* light band that sweeps across the glass on hover, clipped to the bone shapes */}
      <g clipPath={`url(#${clip})`}>
        <g transform="rotate(20 60 60)">
          <rect className="ja-sweep" x="-40" y="-30" width="40" height="190" fill={`url(#${band})`} />
        </g>
      </g>
    </svg>
  );
}
