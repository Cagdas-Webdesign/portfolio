import '../styles/back-to-top.css';
import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
 * Back to top — unten links (unten rechts sitzt der Assistent).
 *
 * Sichtbar erst ab ~50 % Scrolltiefe und nur ausserhalb der Sequenzen, deren
 * Buehne beim Scrollen stehen bleibt (ScrollTrigger-Pin oder position:
 * sticky). Dort koennte ein Wisch sonst versehentlich den Button treffen.
 * Kein eigener Scroll-Listener: Tiefe und Sequenzen laufen ueber
 * ScrollTrigger, die beim Unmount wieder entfernt werden.
 */
const DEPTH = 0.5;
const SEQUENCES = [
  '#funnel', // sticky .funnel-stage
  '#rx-inside', // sticky Canvas „Inside the RAG“
  '#certified-social-media-manager', // sticky Social-Post-Reveal
  '#automation', // gestapelte sticky Karten
  '.final-butterfly-story', // gepinnte Baum-/Schmetterlings-Story
];

export default function BackToTop() {
  const [deep, setDeep] = useState(false);
  const [inSequence, setInSequence] = useState(false);

  useEffect(() => {
    const triggers = [];
    const active = new Set();

    triggers.push(ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setDeep(self.progress >= DEPTH),
      onRefresh: (self) => setDeep(self.progress >= DEPTH),
    }));

    SEQUENCES.forEach((selector) => {
      const element = document.querySelector(selector);
      if (!element) return;
      const sync = (self) => {
        if (self.isActive) active.add(selector);
        else active.delete(selector);
        setInSequence(active.size > 0);
      };
      triggers.push(ScrollTrigger.create({
        trigger: element,
        // Stehende Phase: Section-Anfang oben bis Section-Ende unten.
        start: 'top top',
        end: 'bottom bottom',
        onToggle: sync,
        onRefresh: sync,
      }));
    });

    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  const visible = deep && !inSequence;

  const scrollToTop = (event) => {
    // Waehrend der Ausblendung (visibility schaltet erst danach) nicht ausloesen.
    if (!visible) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    // Der Button blendet waehrend der Fahrt aus; Fokus nicht an ihm haengen lassen.
    event.currentTarget.blur();
  };

  return (
    <button
      aria-hidden={visible ? undefined : 'true'}
      aria-label="Back to top"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 19V5.5M6.5 11 12 5.5l5.5 5.5" />
      </svg>
    </button>
  );
}
