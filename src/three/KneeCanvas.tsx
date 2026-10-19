import { useEffect, useRef, useState } from 'react';
import type { KneeMode } from './kneeEngine';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  mode: KneeMode;
  /** story mode: return 0→1 progress through the sequence (read every frame, no re-render) */
  getProgress?: () => number;
  /** hero mode: return 0→1 as the hero scrolls away (implant explodes) */
  getScroll?: () => number;
  label: string;
  className?: string;
};

/**
 * Mounts the three.js knee. three + the model are loaded lazily, so pages
 * without a knee never download them. Rendering pauses while off-screen.
 */
export default function KneeCanvas({ mode, getProgress, getScroll, label, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const progressRef = useRef(getProgress);
  const scrollRef = useRef(getScroll);
  progressRef.current = getProgress;
  scrollRef.current = getScroll;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let engine: { dispose: () => void; setVisible: (v: boolean) => void } | null = null;
    let io: IntersectionObserver | null = null;

    // three + the model are only fetched once the canvas is within ~¾ of a screen of the viewport,
    // so they don't compete with the hero (LCP / main thread) on first load.
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      start();
    }, { rootMargin: '75% 0px' });
    near.observe(canvas);

    const start = () => import('./kneeEngine')
      .then(async ({ createKneeEngine, loadKneeModel }) => {
        const model = await loadKneeModel();
        if (disposed) return;
        engine = createKneeEngine(canvas, model, {
          mode,
          reducedMotion,
          getProgress: () => progressRef.current?.() ?? 0,
          getScroll: () => scrollRef.current?.() ?? 0,
        });
        setReady(true);
        io = new IntersectionObserver(([entry]) => engine?.setVisible(entry.isIntersecting), { rootMargin: '200px' });
        io.observe(canvas);
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      near.disconnect();
      io?.disconnect();
      engine?.dispose();
    };
  }, [mode, reducedMotion]);

  if (failed) return <div className={`knee-fallback ${className ?? ''}`} role="img" aria-label={label} />;
  return <canvas ref={canvasRef} className={`knee-canvas ${ready ? 'is-ready' : ''} ${className ?? ''}`} role="img" aria-label={label} />;
}
