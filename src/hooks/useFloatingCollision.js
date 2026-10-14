import { useEffect, useState } from 'react';

/**
 * Ueberdeckt ein fixiertes Floating-Element (z. B. der Assistant-Button unten
 * rechts) gerade das Ziel-Element (`targetSelector`)?
 *
 * Kein Scroll-Listener und keine geratene scrollY-Marke: Ein
 * IntersectionObserver beobachtet das Ziel mit einer Root-Box, die per
 * rootMargin exakt auf die Flaeche des Floating-Buttons (plus `gap`)
 * zugeschnitten ist. Die Box wird aus der echten Position berechnet und nur
 * bei Groessenaenderung neu vermessen — funktioniert so fuer jede
 * Viewport-Hoehe.
 */
export function useFloatingCollision(floatingRef, buttonSelector, targetSelector, gap = 12) {
  const [colliding, setColliding] = useState(false);

  useEffect(() => {
    const floating = floatingRef.current;
    const target = document.querySelector(targetSelector);
    if (!floating || !target || typeof IntersectionObserver === 'undefined') return undefined;

    let observer = null;
    const build = () => {
      observer?.disconnect();
      // Ruheposition des Buttons aus dem Layout (fixiert, right/bottom) —
      // unabhaengig von gerade laufenden Transforms der Ein-/Ausblendung.
      const button = floating.querySelector(buttonSelector) || floating;
      const style = window.getComputedStyle(floating);
      const right = parseFloat(style.right) || 0;
      const bottom = parseFloat(style.bottom) || 0;
      const top = Math.max(0, window.innerHeight - bottom - button.offsetHeight - gap);
      const left = Math.max(0, window.innerWidth - right - button.offsetWidth - gap);
      observer = new IntersectionObserver(
        ([entry]) => setColliding(entry.isIntersecting),
        { rootMargin: `${-top}px 0px 0px ${-left}px`, threshold: 0 },
      );
      observer.observe(target);
    };

    build();
    window.addEventListener('resize', build);
    return () => {
      window.removeEventListener('resize', build);
      observer?.disconnect();
    };
  }, [floatingRef, buttonSelector, targetSelector, gap]);

  return colliding;
}
