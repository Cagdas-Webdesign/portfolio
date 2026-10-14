import '../styles/legal-modal.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { DatenschutzContent, ImpressumContent } from './LegalContent.jsx';

/*
 * Impressum / Datenschutz als Fullscreen-Overlay (vom Footer geoeffnet).
 * Styles: styles/legal-modal.css (Praefix .legal-).
 * Inhalte: LegalContent.jsx.
 */
const LEGAL_PAGES = {
  impressum: {
    title: 'Impressum',
    body: <ImpressumContent />,
  },
  datenschutz: {
    title: 'Datenschutz',
    body: <DatenschutzContent />,
  },
};

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
const EASE_OUT = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.32, 0.72, 0, 1];

const IconClose = () => (
  <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" viewBox="0 0 24 24">
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

/*
 * Gleiches Muster wie SettingsSheet: Phasen 'open' → 'closing' → 'closed'.
 * Sperre und Markup bleiben bis zum Ende der Ausfahrt; eine feste Frist
 * schliesst ab, falls keine Frames kommen (gedrosseltes rAF).
 *
 * Seitensperre nur ueber Eingaben (Rad, Wischen, Scroll-Tasten) — keine
 * Styles an html/body, kein position: fixed. Die Scrollposition wird daher
 * nie veraendert und muss nicht wiederhergestellt werden; sticky-Buehnen
 * und ScrollTrigger bleiben unberuehrt (kein Aufploppen beim Schliessen).
 */
export default function LegalModal({ page, onClose, returnFocusRef }) {
  const panelRef = useRef(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [phase, setPhase] = useState('closed');
  // Zuletzt gezeigte Seite: bleibt waehrend der Ausfahrt stehen.
  const [shown, setShown] = useState(null);

  useEffect(() => {
    if (page) {
      setShown(page);
      setPhase('open');
    } else {
      setPhase((current) => (current === 'open' ? 'closing' : current));
    }
  }, [page]);

  const handleExited = useCallback(() => {
    setPhase((current) => (current === 'closing' ? 'closed' : current));
  }, []);

  const locked = phase !== 'closed';
  const enter = reducedMotion ? 0.01 : 0.62;
  const exit = reducedMotion ? 0.01 : 0.46;

  useEffect(() => {
    if (phase !== 'closing') return undefined;
    const timer = window.setTimeout(handleExited, exit * 1000 + 300);
    return () => window.clearTimeout(timer);
  }, [exit, handleExited, phase]);

  useEffect(() => {
    if (!locked) return undefined;

    const html = document.documentElement;
    const root = document.getElementById('root');
    const previous = {
      rootInert: root?.inert,
      rootAriaHidden: root?.getAttribute('aria-hidden'),
    };
    const trigger = returnFocusRef?.current;

    const canScrollInside = (target, delta) => {
      const area = panelRef.current?.querySelector('.legal-modal__scroll');
      if (!area || !(target instanceof Node) || !area.contains(target)) return false;
      if (area.scrollHeight <= area.clientHeight + 1) return false;
      if (delta < 0) return area.scrollTop > 0;
      if (delta > 0) return area.scrollTop + area.clientHeight < area.scrollHeight - 1;
      return true;
    };

    const onWheel = (event) => {
      if (!canScrollInside(event.target, event.deltaY)) event.preventDefault();
    };

    let touchY = 0;
    const onTouchStart = (event) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event) => {
      const y = event.touches[0]?.clientY ?? touchY;
      if (!canScrollInside(event.target, touchY - y)) event.preventDefault();
      touchY = y;
    };

    const SCROLL_KEYS = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1, End: 1, Home: -1, ' ': 1 };
    const onKeyDown = (event) => {
      if (!(event.key in SCROLL_KEYS)) return;
      const target = event.target;
      if (event.key === ' ' && target instanceof Element && target.closest('button,a,input,textarea,select')) return;
      const delta = event.key === ' ' && event.shiftKey ? -1 : SCROLL_KEYS[event.key];
      if (canScrollInside(target, delta)) return;
      event.preventDefault();
      // Fokus am Close-Button: Tasten scrollen trotzdem den Inhalt, nie die Seite.
      const area = panelRef.current?.querySelector('.legal-modal__scroll');
      if (area && target instanceof Node && panelRef.current.contains(target)) {
        const step = event.key.startsWith('Arrow') ? 64 : area.clientHeight * 0.85;
        if (event.key === 'Home') area.scrollTo({ top: 0 });
        else if (event.key === 'End') area.scrollTo({ top: area.scrollHeight });
        else area.scrollBy({ top: delta * step });
      }
    };

    html.classList.add('legal-modal-open');
    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    document.addEventListener('keydown', onKeyDown, { capture: true });
    if (root) {
      root.inert = true;
      root.setAttribute('aria-hidden', 'true');
    }

    return () => {
      document.removeEventListener('wheel', onWheel, { capture: true });
      document.removeEventListener('touchstart', onTouchStart, { capture: true });
      document.removeEventListener('touchmove', onTouchMove, { capture: true });
      document.removeEventListener('keydown', onKeyDown, { capture: true });
      if (root) {
        root.inert = previous.rootInert ?? false;
        if (previous.rootAriaHidden === null) root.removeAttribute('aria-hidden');
        else root.setAttribute('aria-hidden', previous.rootAriaHidden);
      }
      html.classList.remove('legal-modal-open');
      trigger?.focus({ preventScroll: true });
    };
  }, [locked, returnFocusRef]);

  // Escape und Fokusfalle (nur solange offen)
  useEffect(() => {
    if (phase !== 'open') return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, phase]);

  // Fokus auf den Close-Button, sobald offen (bzw. beim Seitenwechsel).
  useEffect(() => {
    if (phase !== 'open') return;
    panelRef.current?.querySelector('.legal-modal__close')?.focus({ preventScroll: true });
    const area = panelRef.current?.querySelector('.legal-modal__scroll');
    if (area) area.scrollTop = 0;
  }, [phase, shown]);

  if (typeof document === 'undefined' || !locked || !shown) return null;

  const content = LEGAL_PAGES[shown];
  const show = phase === 'open';
  const inT = { duration: enter, ease: EASE_OUT };
  const outT = { duration: exit, ease: EASE_IN_OUT };
  const titleId = `legal-modal-title-${shown}`;

  const panelVariants = reducedMotion
    ? { hidden: { opacity: 0, transition: outT }, visible: { opacity: 1, transition: inT } }
    : { hidden: { y: '100%', transition: outT }, visible: { y: 0, transition: inT } };

  const backdropVariants = {
    hidden: { opacity: 0, transition: outT },
    visible: { opacity: 1, transition: inT },
  };

  return createPortal(
    <div className={`legal-layer${show ? '' : ' is-closing'}`}>
      <motion.div
        animate={show ? 'visible' : 'hidden'}
        aria-hidden="true"
        className="legal-backdrop"
        initial="hidden"
        variants={backdropVariants}
      />

      <motion.div
        animate={show ? 'visible' : 'hidden'}
        aria-labelledby={titleId}
        aria-modal="true"
        className="legal-modal"
        data-keep-text=""
        initial="hidden"
        onAnimationComplete={(definition) => {
          if (definition === 'hidden') handleExited();
        }}
        ref={panelRef}
        role="dialog"
        variants={panelVariants}
      >
        <div className="legal-modal__bar">
          <span className="legal-modal__eyebrow">Rechtliches</span>
          <button
            aria-label={`${content.title} schließen`}
            className="legal-modal__close"
            onClick={onClose}
            type="button"
          >
            <IconClose />
          </button>
        </div>

        <div className="legal-modal__scroll">
          <article className="legal-modal__content">
            <h2 className="legal-modal__title" id={titleId}>{content.title}</h2>
            <div className="legal-modal__body">{content.body}</div>
          </article>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
