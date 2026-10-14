import { gsap } from 'gsap';
import { useCallback, useEffect, useRef } from 'react';
import { MOBILE_QUERY, useMediaQuery, useOnceInView, useScrollProgress } from './hooks.js';

/* ==================================================================
 * Journey-Schiene — Hero (5 Stationen) und Abschluss (7 Stationen).
 *
 * Ein Lichtimpuls laeuft einmal ueber die Schiene, sobald sie sichtbar
 * wird, und zuendet die Stationen nacheinander. Am Ende schliesst sich
 * der Rueckweg zur ersten Station: die Journey ist ein Kreislauf. Danach
 * bleibt alles stehen — kein Loop. Der Fortschritt laeuft ueber eine
 * einzige CSS-Variable; die Stationen werden direkt im DOM markiert,
 * damit React waehrenddessen nicht neu rendert.
 * ================================================================== */

export default function JourneyRail({
  className = '',
  items,
  label,
  loopLabel,
  reducedMotion,
}) {
  const rootRef = useRef(null);
  const tweenRef = useRef(null);

  const isMobile = useMediaQuery(MOBILE_QUERY);

  // Station = erreicht (is-lit); die zuletzt erreichte ist aktuell (is-current),
  // fruehere treten leicht zurueck.
  const light = useCallback((progress) => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll('.mk-journey__node');
    const last = nodes.length - 1;
    const current = Math.round(progress * last);
    nodes.forEach((node, index) => {
      node.classList.toggle('is-lit', progress >= (index / last) - 0.02);
      node.classList.toggle('is-current', index === current && progress < 0.999);
    });
  }, []);

  const apply = useCallback((progress) => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty('--mk-progress', progress.toFixed(4));
    light(progress);
  }, [light]);

  /*
   * Desktop: einmalige, ruhige Sequenz. Pro Station ein kurzer Weg und
   * danach eine Ruhephase, damit jede Station lesbar ist.
   */
  const play = useCallback(() => {
    if (isMobile) return;
    tweenRef.current?.kill();
    if (reducedMotion) {
      apply(1);
      return;
    }
    const last = items.length - 1;
    const state = { progress: 0 };
    apply(0);
    const tl = gsap.timeline({ delay: 0.4 });
    for (let index = 1; index <= last; index += 1) {
      tl.to(state, { progress: index / last, duration: 0.9, ease: 'power2.inOut', onUpdate: () => apply(state.progress) });
      tl.to({}, { duration: 0.9 }); // Ruhephase
    }
    tweenRef.current = tl;
  }, [apply, isMobile, items.length, reducedMotion]);

  // Handy: an den Scroll gekoppelt, keine Autoplay-Timeline.
  useScrollProgress(rootRef, apply, { enabled: isMobile, start: 'top 70%', end: 'bottom 60%' });

  const viewRef = useOnceInView(play, { threshold: 0.5 });

  useEffect(() => {
    if (reducedMotion && !isMobile) play();
    return () => tweenRef.current?.kill();
  }, [isMobile, play, reducedMotion]);

  const setRefs = (node) => {
    rootRef.current = node;
    viewRef.current = node;
  };

  return (
    <div
      className={`mk-journey ${className}`}
      ref={setRefs}
      style={{ '--mk-count': items.length }}
    >
      <ol aria-label={label} className="mk-journey__list">
        {items.map((item) => (
          <li className="mk-journey__node" key={item.id}>
            <span aria-hidden="true" className="mk-journey__dot"><i /></span>
            <strong>{item.label}</strong>
            {item.note ? <small>{item.note}</small> : null}
          </li>
        ))}
      </ol>
      <span aria-hidden="true" className="mk-journey__rail"><i /></span>
      {loopLabel ? (
        <span className="mk-journey__loop">
          <i aria-hidden="true" />
          <em>{loopLabel}</em>
        </span>
      ) : null}
    </div>
  );
}
