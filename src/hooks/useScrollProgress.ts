import { useEffect, useRef, useState } from 'react';

/**
 * Playback feel of the pinned story. The animation never jumps to the scroll position; it glides
 * there, so a fast flick or swipe still plays every stage instead of skipping them.
 *  - SMOOTHING: seconds to cover ~63% of the remaining distance (higher = softer, laggier)
 *  - MAX_SPEED: fastest playback in progress-per-second (0.22 ≈ 0.9 s per stage, 4.5 s for all five)
 * Section height (how much scrolling one stage takes) is `.story` in global.css.
 */
export const STORY_SMOOTHING = 0.22;
export const STORY_MAX_SPEED = 0.22;

/**
 * Tracks how far the page has scrolled through a tall "pinned" section.
 * - progressRef.current: smoothed 0→1 (read by the 3D loop every frame, no re-render)
 * - step / pct: derived from the same smoothed value, so text, bar and 3D stay in sync
 */
export function useScrollProgress(sectionRef: React.RefObject<HTMLElement>, steps: number) {
  const progressRef = useRef(0);
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = 0;
    let raf = 0;
    let last = 0;

    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const publish = (p: number) => {
      progressRef.current = p;
      setStep(Math.min(steps - 1, Math.floor(p * steps * 0.999)));
      setPct(Math.round(p * 100));
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const cur = progressRef.current;
      const diff = target - cur;
      if (reduced || Math.abs(diff) < 0.0005) {
        publish(target);
        raf = 0;
        last = 0;
        return;
      }
      // exponential ease toward the scroll position, capped at STORY_MAX_SPEED
      const eased = diff * (1 - Math.exp(-dt / STORY_SMOOTHING));
      const cap = STORY_MAX_SPEED * dt;
      publish(cur + Math.max(-cap, Math.min(cap, eased)));
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // start where the page already is (e.g. reload mid-section) without playing from 0
    measure();
    publish(target);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [sectionRef, steps]);

  /** Smooth-scroll so the sequence lands on a given step. */
  const goToStep = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const target = (i + 0.5) / steps;
    window.scrollTo({ top: window.scrollY + r.top + total * target, behavior: 'smooth' });
  };

  return { progressRef, step, pct, goToStep };
}
