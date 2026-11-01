import { useRef } from 'react';
import KneeCanvas from '../three/KneeCanvas';
import { kneeStages } from '../content/site';
import { Icon } from '../components/ui';
import { useScrollProgress } from '../hooks/useScrollProgress';

/**
 * Pinned, scroll-driven knee-replacement sequence.
 * The section is several screens tall; its inner panel sticks to the viewport while the
 * 3D knee steps through the stages as the visitor scrolls.
 */
export default function KneeStory({ id = 'how-it-works', title = 'From worn joint to', accent = 'new knee' }: { id?: string; title?: string; accent?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { progressRef, step, pct, goToStep } = useScrollProgress(sectionRef, kneeStages.length);

  return (
    <section id={id} ref={sectionRef} className="story" aria-label="How robotic knee replacement works">
      <div className="story__sticky">
        <div className="container story__grid">
          <div className="story__text">
            <span className="kicker">How robotic knee replacement works</span>
            <h2 className="display-2">
              {title} <span className="accent">{accent}</span>
            </h2>
            <ol className="story__steps">
              {kneeStages.map((s, i) => (
                <li key={s.title}>
                  <button type="button" className={`story__step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`} aria-current={i === step ? 'step' : undefined} onClick={() => goToStep(i)}>
                    <span className="story__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="story__copy">
                      <span className="story__title">{s.title}</span>
                      <span className="story__body">{s.body}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="story__progress" aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="story__stage">
            <div className="story__halo" aria-hidden="true" />
            <div className={`story__grid-bg ${step === 1 || step === 2 ? 'is-on' : ''}`} aria-hidden="true" />
            <KneeCanvas mode="story" getProgress={() => progressRef.current} label={`3D knee replacement, step ${step + 1} of 5: ${kneeStages[step].title}`} className="story__canvas" />
            <div className="story__badge">
              <span className="story__badge-k">STEP {step + 1} / {kneeStages.length}</span>
              <span className="story__badge-t">{kneeStages[step].title}</span>
            </div>
            <div className={`story__done ${step === kneeStages.length - 1 ? 'is-on' : ''}`}>
              <span className="story__done-ic"><Icon name="check" size={14} /></span>
              Aligned &amp; balanced
            </div>
            <div className="story__hint" aria-hidden="true">Scroll to operate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
