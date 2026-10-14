import { useCallback, useEffect, useRef, useState } from 'react';
import { SOURCE_POPOVER_ID } from '../components/AssistantSources.jsx';

// Vollbild fuer den Floating-Assistenten — ohne Browser-Fullscreen-API und ohne
// Remount: dasselbe Panel wechselt nur seine Geometrie. Chatverlauf, Eingabe,
// Scrollposition, offenes Popover und laufende Anfragen bleiben dadurch erhalten.
//
// Technik: Das Panel wird waehrend Vollbild und Animation `position: fixed`
// (Klasse .is-fullscreen). left/top/width/height/border-radius werden inline mit
// !important gesetzt und per CSS-Transition animiert. Transitions — anders als
// CSS-/Web-Animationen — setzen sich gegen die !important-Regeln der Legacy-
// Stylesheets durch. Start- und Zielrechteck werden gemessen, damit angedockter
// und Vollbild-Zustand nahtlos ineinander uebergehen.

const DURATION_MS = 500;
/** Ruhig, weich auslaufend — in der Art nativer Sheet-/Fenster-Uebergaenge. */
const EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const GEOMETRY = ['left', 'top', 'width', 'height', 'border-radius'];
const INLINE_PROPS = [...GEOMETRY, 'transition'];

/** Zielgeometrie; Abstand und Radius kommen je Breakpoint aus assistant-rag.css. */
const FULLSCREEN_GEOMETRY = {
  left: 'var(--ai-fs-inset)',
  top: 'var(--ai-fs-inset)',
  width: 'calc(100% - 2 * var(--ai-fs-inset))',
  height: 'calc(100dvh - 2 * var(--ai-fs-inset))',
  'border-radius': 'var(--ai-fs-radius)',
};

const prefersReducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const transitionFor = (ms) => [
  ...GEOMETRY.map((property) => `${property} ${ms}ms ${EASING}`),
  // Oeffnen/Schliessen des Chats blendet weiterhin wie bisher.
  'opacity 240ms ease',
  'transform 240ms ease',
].join(', ');

function setImportant(element, styles) {
  Object.entries(styles).forEach(([property, value]) => element.style.setProperty(property, value, 'important'));
}

function clearInline(element) {
  INLINE_PROPS.forEach((property) => element.style.removeProperty(property));
}

function geometryOf(element) {
  const rect = element.getBoundingClientRect();
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    'border-radius': getComputedStyle(element).borderRadius,
  };
}

/** Wie NEAR_BOTTOM_PX im Widget: so nah am Ende gilt der Verlauf als "unten". */
const NEAR_BOTTOM_PX = 72;

/**
 * Leseposition merken: entweder "ganz unten" oder die oberste sichtbare
 * Nachricht samt Versatz. Ein Pixelwert allein reicht nicht — aendert sich die
 * Breite, brechen die Bubbles anders um und der Inhalt verschiebt sich.
 */
function captureAnchor(list) {
  if (!list) return null;
  // Offene Quelle: ihr Chip ist der Anker, sonst schliesst das Popover, sobald
  // der Chip beim Verkleinern aus dem sichtbaren Bereich rutscht.
  const chip = document.getElementById(SOURCE_POPOVER_ID) && list.querySelector('.ai-chat-source-chip.is-active');
  if (chip) {
    const top = list.getBoundingClientRect().top;
    const rect = chip.getBoundingClientRect();
    return { element: chip, offset: rect.top - top, height: rect.height, keepVisible: true };
  }
  if (list.scrollHeight - list.scrollTop - list.clientHeight <= NEAR_BOTTOM_PX) return { bottom: true };
  const top = list.getBoundingClientRect().top;
  const element = [...list.children].find((child) => child.getBoundingClientRect().bottom > top + 1);
  return element ? { element, offset: element.getBoundingClientRect().top - top } : null;
}

function restoreAnchor(list, anchor) {
  if (!list || !anchor) return;
  if (anchor.bottom) {
    list.scrollTop = list.scrollHeight;
    return;
  }
  if (!anchor.element.isConnected) return;
  list.scrollTop += anchor.element.getBoundingClientRect().top - list.getBoundingClientRect().top - anchor.offset;
}

/**
 * @param {import('react').RefObject<HTMLElement>} panelRef
 * @param {import('react').RefObject<HTMLElement>} backdropRef
 * @param {import('react').RefObject<HTMLElement>} messagesRef
 */
export function useAssistantFullscreen(panelRef, backdropRef, messagesRef) {
  const [fullscreen, setFullscreen] = useState(false);
  const active = useRef(false);
  const finishTimer = useRef(null);
  const anchorFrame = useRef(0);

  // Leseposition waehrend der Groessenaenderung jeden Frame nachfuehren und am
  // Ende ein letztes Mal setzen. heightDelta: Aenderung der Panelhoehe — damit
  // ein Chip-Anker schon vorab so liegt, dass er auch in der Zielhoehe sichtbar ist.
  const holdReadingPosition = useCallback((anchor, duration, heightDelta = 0) => {
    cancelAnimationFrame(anchorFrame.current);
    const list = messagesRef.current;
    if (anchor?.keepVisible && list) {
      const limit = list.clientHeight + Math.min(0, heightDelta) - anchor.height - 16;
      anchor.offset = Math.max(8, Math.min(anchor.offset, limit));
    }
    const until = performance.now() + duration + 80;
    const step = () => {
      restoreAnchor(list, anchor);
      if (performance.now() < until) anchorFrame.current = requestAnimationFrame(step);
    };
    step();
    return () => restoreAnchor(list, anchor);
  }, [messagesRef]);

  const enter = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || active.current) return;
    clearTimeout(finishTimer.current);
    const duration = prefersReducedMotion() ? 0 : DURATION_MS;
    const settleReading = holdReadingPosition(captureAnchor(messagesRef.current), duration);

    // Am aktuellen Ort fixieren, dann zum Vollbild-Rechteck uebergehen.
    const from = geometryOf(panel);
    panel.classList.add('is-fullscreen');
    // Waehrend der Animation darf ein offenes Quellen-Popover nicht schliessen,
    // nur weil sein Chip durch den Neu-Umbruch kurz aus dem Bild rutscht.
    panel.dataset.fsAnimating = 'true';
    setImportant(panel, { transition: 'none', ...from });
    panel.getBoundingClientRect();
    setImportant(panel, { transition: transitionFor(duration), ...FULLSCREEN_GEOMETRY });

    active.current = true;
    setFullscreen(true);
    if (duration === 0) settleReading();
    // Danach Fenstergroessen-Aenderungen ohne Nachziehen uebernehmen.
    finishTimer.current = setTimeout(() => {
      panel.style.removeProperty('transition');
      delete panel.dataset.fsAnimating;
      settleReading();
    }, duration + 60);
  }, [panelRef, messagesRef, holdReadingPosition]);

  const exit = useCallback(({ animate = true } = {}) => {
    const panel = panelRef.current;
    if (!panel || !active.current) return;
    clearTimeout(finishTimer.current);
    const duration = !animate || prefersReducedMotion() ? 0 : DURATION_MS;
    // Anker vor jeder Geometrieaenderung erfassen.
    const anchor = captureAnchor(messagesRef.current);

    // Aktuelle Geometrie (auch mitten in einer Animation) und Ziel im
    // angedockten Zustand messen — ohne dass dazwischen gezeichnet wird.
    const from = geometryOf(panel);
    panel.classList.remove('is-fullscreen');
    clearInline(panel);
    panel.style.setProperty('transition', 'none', 'important');
    const to = geometryOf(panel);

    active.current = false;
    setFullscreen(false);

    if (duration === 0) {
      panel.style.removeProperty('transition');
      delete panel.dataset.fsAnimating;
      // Bereits in Zielgroesse: keine Hoehendifferenz mehr zu beruecksichtigen.
      holdReadingPosition(anchor, 0)();
      return;
    }

    panel.classList.add('is-fullscreen');
    panel.dataset.fsAnimating = 'true';
    setImportant(panel, from);
    panel.getBoundingClientRect();
    // Erst jetzt (wieder in Startgroesse) den Anker nachfuehren, mit Zielhoehe.
    const settleReading = holdReadingPosition(anchor, duration, parseFloat(to.height) - parseFloat(from.height));
    setImportant(panel, { transition: transitionFor(duration), ...to });

    finishTimer.current = setTimeout(() => {
      panel.classList.remove('is-fullscreen');
      clearInline(panel);
      delete panel.dataset.fsAnimating;
      settleReading();
    }, duration + 60);
  }, [panelRef, messagesRef, holdReadingPosition]);

  const toggle = useCallback(() => (active.current ? exit() : enter()), [enter, exit]);

  useEffect(() => () => {
    clearTimeout(finishTimer.current);
    cancelAnimationFrame(anchorFrame.current);
  }, []);

  // Seite dahinter nicht scrollen. scrollbar-gutter haelt den Platz der
  // Scrollleiste frei, damit das angedockte Widget beim Zurueckkehren nicht springt.
  useEffect(() => {
    if (!fullscreen) return undefined;
    const html = document.documentElement;
    const previous = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
    if (window.innerWidth > html.clientWidth) html.style.scrollbarGutter = 'stable';
    html.style.overflow = 'hidden';

    const backdrop = backdropRef.current;
    const block = (event) => event.preventDefault();
    backdrop?.addEventListener('wheel', block, { passive: false });
    backdrop?.addEventListener('touchmove', block, { passive: false });

    return () => {
      html.style.overflow = previous.overflow;
      html.style.scrollbarGutter = previous.gutter;
      backdrop?.removeEventListener('wheel', block);
      backdrop?.removeEventListener('touchmove', block);
    };
  }, [fullscreen, backdropRef]);

  // Escape verlaesst das Vollbild. Ist ein Quellen-Popover offen, gehoert der
  // Tastendruck zuerst dem Popover; stopPropagation haelt den Legacy-Handler
  // davon ab, zusaetzlich den ganzen Chat zu schliessen.
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape' || document.getElementById(SOURCE_POPOVER_ID)) return;
      event.stopPropagation();
      exit();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [fullscreen, exit]);

  return { fullscreen, toggle, exit };
}
