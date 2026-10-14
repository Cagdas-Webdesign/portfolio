import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

export const MOBILE_QUERY = '(max-width: 899px)';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/*
 * Step-Spy auf der Seite (Scroller = window): Jeder [data-stage] wird zu
 * einem ScrollTrigger; kreuzt er die Aktivlinie, wird er aktiv. Nur
 * Zustand, kein Scrubbing. Aufraeumen beim Unmount/Breakpoint-Wechsel.
 */
export function useStageSpy(rootRef, onStage, { line = '55%', rebuildKey } = {}) {
  const callbackRef = useRef(onStage);
  useEffect(() => {
    callbackRef.current = onStage;
  }, [onStage]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const triggers = [...root.querySelectorAll('[data-stage]')].map((item) => ScrollTrigger.create({
      trigger: item,
      start: `top ${line}`,
      end: `bottom ${line}`,
      onToggle: (self) => {
        if (self.isActive) callbackRef.current(Number(item.dataset.stage));
      },
    }));
    const timer = window.setTimeout(() => triggers.forEach((t) => t.refresh()), 600);
    return () => {
      window.clearTimeout(timer);
      triggers.forEach((t) => t.kill());
    };
  }, [rootRef, line, rebuildKey]);
}

/* Einmal pro Mount, sobald sichtbar. */
export function useOnceInView(onEnter, threshold = 0.35) {
  const ref = useRef(null);
  const callbackRef = useRef(onEnter);
  useEffect(() => {
    callbackRef.current = onEnter;
  }, [onEnter]);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      callbackRef.current();
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

/* Laufende Impulse nur, solange das Element im Bild ist (Performance). */
export function useLiveWhileVisible(ref) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      node.classList.toggle('is-live', entry.isIntersecting);
    }, { rootMargin: '120px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
}

/*
 * Horizontale Tabbar folgt dem aktiven Tab — NUR horizontal.
 * Bewusst kein scrollIntoView(): das wuerde auch die Seite vertikal
 * verschieben. Stattdessen scrollLeft der Leiste selbst.
 */
export function useTabFollow(barRef, activeIndex, reducedMotion) {
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || bar.scrollWidth <= bar.clientWidth + 1) return;
    const tab = bar.children[activeIndex];
    if (!tab) return;
    const left = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [barRef, activeIndex, reducedMotion]);
}
