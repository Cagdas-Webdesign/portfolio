import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

/* ==================================================================
 * Pop-up 6 — gemeinsame Hooks
 *
 * Bewusst getrennt von SeoExperience: die Hooks dort sind lokal und
 * sollen unveraendert bleiben. Hier liegen nur die Varianten, die die
 * Kampagnen-Ansicht braucht.
 * ================================================================== */

export const MOBILE_QUERY = '(max-width: 899px)';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/*
 * Ruft onEnter genau einmal pro Mount auf, sobald `threshold` des Elements
 * sichtbar ist. Danach trennt sich der Beobachter — keine Schleife.
 */
export function useOnceInView(onEnter, { enabled = true, threshold = 0.35 } = {}) {
  const ref = useRef(null);
  const callbackRef = useRef(onEnter);
  useEffect(() => {
    callbackRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      callbackRef.current();
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, threshold]);

  return ref;
}

/*
 * Scroll-Spy fuer Kapitel-Schritte.
 *
 * Jeder Eintrag mit `data-step` wird zu einem ScrollTrigger im
 * Scroll-Container des Pop-ups. Kreuzt ein Eintrag die Aktivlinie, meldet
 * er seinen Schritt. Es wird nie gescrubbt und nie gescrollt — nur
 * Zustand gesetzt. Die Aktivlinie liegt auf dem Handy tiefer, weil oben
 * das Sticky-Phone steht.
 */
export function useStepSpy(rootRef, onStep, { line, rebuildKey, onProgress } = {}) {
  const callbackRef = useRef(onStep);
  const progressRef = useRef(onProgress);
  useEffect(() => {
    callbackRef.current = onStep;
    progressRef.current = onProgress;
  }, [onStep, onProgress]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const scroller = root.closest('.sc-experience__scroll');
    if (!scroller) return undefined;

    const items = [...root.querySelectorAll('[data-step]')];
    const triggers = items.map((item) => ScrollTrigger.create({
      trigger: item,
      scroller,
      start: `top ${line}`,
      end: `bottom ${line}`,
      onToggle: (self) => {
        if (self.isActive) callbackRef.current(item.dataset.step);
      },
      // Optional: Fortschritt innerhalb des aktiven Schritts (Handy-Vorschau).
      onUpdate: (self) => {
        if (self.isActive) progressRef.current?.(item.dataset.step, self.progress);
      },
    }));

    // Nur die eigenen Trigger neu vermessen: ein globales refresh() wuerde
    // bei gesperrter Seite (Pop-up offen) die Seiten-Trigger verrechnen.
    const refresh = () => triggers.forEach((trigger) => trigger.refresh());
    const timers = [window.setTimeout(refresh, 400), window.setTimeout(refresh, 1400)];
    window.addEventListener('resize', refresh);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', refresh);
    };
  }, [rootRef, line, rebuildKey]);
}

/*
 * Orange Fortschrittslinie der Step-Listen (.mk-steps).
 *
 * Pro Liste ein ScrollTrigger im Pop-up-Scroller mit derselben Aktivlinie
 * wie useStepSpy. Die Fuellung beginnt am ersten Step-Kreis und erreicht
 * den Kreis eines Steps genau dann, wenn dessen Oberkante die Aktivlinie
 * kreuzt — also im selben Moment, in dem der Step aktiv wird.
 * Wert als --mk-steps-fill (0–1), CSS skaliert ::after.
 */
const STEP_CIRCLE = 36; // Kreismitte ab Step-Oberkante = Linienbeginn (CSS)

export function useStepLine(rootRef, { line, rebuildKey } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const scroller = root.closest('.sc-experience__scroll');
    if (!scroller) return undefined;

    const lists = [...root.querySelectorAll('.mk-steps')];
    const setFill = (list, progress) => {
      const height = list.offsetHeight;
      const length = Math.max(0, height - STEP_CIRCLE * 2);
      // Tatsaechliche Kreismitte ab Step-Oberkante (Handy: kleineres Padding)
      const index = list.querySelector('.mk-step__index');
      const center = index ? index.offsetTop + index.offsetHeight / 2 : STEP_CIRCLE;
      const reach = progress * height + (center - STEP_CIRCLE);
      const fill = length ? Math.min(1, Math.max(0, reach / length)) : 0;
      list.style.setProperty('--mk-steps-fill', fill.toFixed(4));
    };
    const triggers = lists.map((list) => ScrollTrigger.create({
      trigger: list,
      scroller,
      start: `top ${line}`,
      end: `bottom ${line}`,
      onUpdate: (self) => setFill(list, self.progress),
      onRefresh: (self) => setFill(list, self.progress),
    }));

    // Wie useStepSpy: nur die eigenen Trigger neu vermessen.
    const refresh = () => triggers.forEach((trigger) => trigger.refresh());
    const timers = [window.setTimeout(refresh, 400), window.setTimeout(refresh, 1400)];
    window.addEventListener('resize', refresh);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', refresh);
      lists.forEach((list) => list.style.removeProperty('--mk-steps-fill'));
    };
  }, [rootRef, line, rebuildKey]);
}

/*
 * Scroll-gekoppelter Fortschritt (0–1) eines Elements im Pop-up-Scroller.
 * Fuer die Handy-Journeys: kein Autoplay, der Nutzer fuehrt per Scrollen.
 * Liefert den Wert per Callback; Aufraeumen beim Deaktivieren/Unmount.
 */
export function useScrollProgress(ref, onProgress, { enabled = true, start = 'top 72%', end = 'bottom 58%' } = {}) {
  const callbackRef = useRef(onProgress);
  useEffect(() => {
    callbackRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return undefined;
    const scroller = node.closest('.sc-experience__scroll');
    if (!scroller) return undefined;
    const trigger = ScrollTrigger.create({
      trigger: node,
      scroller,
      start,
      end,
      onUpdate: (self) => callbackRef.current(self.progress),
      onRefresh: (self) => callbackRef.current(self.progress),
    });
    const timers = [window.setTimeout(() => trigger.refresh(), 400), window.setTimeout(() => trigger.refresh(), 1400)];
    return () => {
      trigger.kill();
      timers.forEach(window.clearTimeout);
    };
  }, [ref, enabled, start, end]);
}
