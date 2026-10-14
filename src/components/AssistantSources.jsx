import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Quellen einer Assistenten-Antwort: runde Chips unter der Antwort und ein
// einzelnes Popover innerhalb des Chatfensters. Angezeigt wird nur, was die
// Backend-Citation tatsaechlich enthaelt (title, section, source als URL).

export const SOURCE_POPOVER_ID = 'aiSourcePopover';

/** Abstand Chip ↔ Popover und Mindestabstand zum Rand des Nachrichtenbereichs. */
const GAP = 6;
const INSET = 8;
/** Unter dieser Hoehe wird das Popover nicht weiter gestaucht. */
const MIN_HEIGHT = 96;

const chipKey = (messageId, index) => `${messageId}:${index}`;
const isUrl = (value) => /^https?:\/\//i.test(value ?? '');
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/**
 * @param {{
 *   messageId: string,
 *   citations: import('../services/ragApi.js').SourceCitation[],
 *   openSource: { messageId: string, index: number } | null,
 *   onToggle: (source: { messageId: string, index: number }, viaKeyboard: boolean) => void,
 * }} props
 */
export function SourceChips({ messageId, citations, openSource, onToggle }) {
  if (!citations.length) return null;

  const moveFocus = (event, index) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const chips = event.currentTarget.parentElement.querySelectorAll('.ai-chat-source-chip');
    chips[(index + step + chips.length) % chips.length]?.focus();
  };

  return (
    <div aria-label="Quellen" className="ai-chat-sources" data-keep-text="" role="group">
      <span aria-hidden="true" className="ai-chat-sources-label">Quellen</span>
      {citations.map((citation, index) => {
        const open = openSource?.messageId === messageId && openSource.index === index;
        return (
          <button
            aria-controls={open ? SOURCE_POPOVER_ID : undefined}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={`Quelle ${index + 1}: ${citation.title}`}
            className={`ai-chat-source-chip${open ? ' is-active' : ''}`}
            data-source-chip={chipKey(messageId, index)}
            key={`${citation.document_id}-${citation.section ?? ''}-${index}`}
            onClick={(event) => onToggle({ messageId, index }, event.detail === 0)}
            onKeyDown={(event) => moveFocus(event, index)}
            type="button"
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Position im sichtbaren Nachrichtenbereich berechnen.
 *
 * Grenzen sind die Kanten von `.ai-chat-messages` — Slider, Turnstile und
 * Composer liegen darunter und zaehlen damit als belegt. Reihenfolge:
 * passt es unter den Chip → unten; sonst passt es darueber → oben; sonst die
 * groessere Seite mit begrenzter Hoehe und eigenem Scroll.
 */
function computeLayout(container, scroller, chip, popover) {
  const box = container.getBoundingClientRect();
  const view = scroller.getBoundingClientRect();
  const anchor = chip.getBoundingClientRect();

  // Nur der sichtbare Teil des Chips zaehlt als Anker.
  const anchorTop = Math.max(anchor.top, view.top);
  const anchorBottom = Math.min(anchor.bottom, view.bottom);

  const frame = popover.offsetHeight - popover.clientHeight;
  const natural = popover.scrollHeight + frame;
  const spaceBelow = view.bottom - INSET - (anchorBottom + GAP);
  const spaceAbove = anchorTop - GAP - (view.top + INSET);

  let placement;
  let height = natural;
  let maxHeight = null;
  if (natural <= spaceBelow) {
    placement = 'below';
  } else if (natural <= spaceAbove) {
    placement = 'above';
  } else {
    placement = spaceBelow >= spaceAbove ? 'below' : 'above';
    height = Math.min(natural, Math.max(MIN_HEIGHT, placement === 'below' ? spaceBelow : spaceAbove));
    maxHeight = height;
  }

  let top = placement === 'below' ? anchorBottom + GAP : anchorTop - GAP - height;
  // Letzte Sicherung: nie ueber den Nachrichtenbereich hinaus.
  top = clamp(top, view.top + INSET, view.bottom - INSET - height);

  const width = popover.offsetWidth;
  const left = clamp(anchor.left - 12, view.left + INSET, view.right - INSET - width);

  return {
    placement,
    top: Math.round(top - box.top),
    left: Math.round(left - box.left),
    maxHeight: maxHeight === null ? null : Math.floor(maxHeight),
  };
}

/**
 * @param {{
 *   source: { messageId: string, index: number },
 *   citation: import('../services/ragApi.js').SourceCitation,
 *   containerRef: import('react').RefObject<HTMLElement>,
 *   scrollRef: import('react').RefObject<HTMLElement>,
 *   focusOnOpen: boolean,
 *   onClose: (restoreFocus: boolean) => void,
 * }} props
 */
export function SourcePopover({ source, citation, containerRef, scrollRef, focusOnOpen, onClose }) {
  const popoverRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [layout, setLayout] = useState(null);
  const key = chipKey(source.messageId, source.index);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Beim Oeffnen: Chip ggf. minimal in den sichtbaren Bereich holen — kein
  // Sprung des ganzen Chats, nur so weit wie noetig.
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const chip = scroller?.querySelector(`[data-source-chip="${key}"]`);
    if (!scroller || !chip) return;
    const view = scroller.getBoundingClientRect();
    const anchor = chip.getBoundingClientRect();
    if (anchor.top < view.top + INSET) scroller.scrollTop -= view.top + INSET - anchor.top;
    else if (anchor.bottom > view.bottom - INSET) scroller.scrollTop += anchor.bottom - (view.bottom - INSET);
  }, [scrollRef, key]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const scroller = scrollRef.current;
    const popover = popoverRef.current;
    if (!container || !scroller || !popover) return undefined;

    const place = () => {
      const chip = scroller.querySelector(`[data-source-chip="${key}"]`);
      const view = scroller.getBoundingClientRect();
      const anchor = chip?.getBoundingClientRect();
      if (!chip) {
        onCloseRef.current(false);
        return;
      }
      // Chip komplett aus dem sichtbaren Bereich gescrollt: schliessen — ausser
      // waehrend der Vollbild-Animation, dort fuehrt useAssistantFullscreen den
      // Chip gleich wieder in den sichtbaren Bereich.
      if (anchor.bottom <= view.top || anchor.top >= view.bottom) {
        if (!container.closest('[data-fs-animating]')) onCloseRef.current(false);
        return;
      }
      const next = computeLayout(container, scroller, chip, popover);
      setLayout((current) => (
        current
        && current.top === next.top
        && current.left === next.left
        && current.maxHeight === next.maxHeight
        && current.placement === next.placement
          ? current
          : next
      ));
    };

    place();
    scroller.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    // Slider ein-/ausklappen veraendert die Hoehe des Nachrichtenbereichs.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place);
    observer?.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
      observer?.disconnect();
    };
  }, [containerRef, scrollRef, key, citation]);

  useEffect(() => {
    if (focusOnOpen) closeRef.current?.focus({ preventScroll: true });
  }, [focusOnOpen, key]);

  // Escape und Klick ausserhalb. Capture-Phase, damit Escape nur das Popover
  // schliesst und nicht zusaetzlich den ganzen Chat (Legacy-Handler).
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onCloseRef.current(true);
    };
    const onPointerDown = (event) => {
      const target = event.target;
      if (popoverRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('[data-source-chip]')) return;
      // Design-Wechsel ist reine Darstellung: eine offene Quelle bleibt offen.
      if (target instanceof Element && target.closest('.ai-theme-switcher')) return;
      onCloseRef.current(false);
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, []);

  const style = layout
    ? { top: layout.top, left: layout.left, maxHeight: layout.maxHeight ?? undefined }
    : { top: 0, left: 0, visibility: 'hidden' };

  return (
    <div
      aria-label={`Quelle ${source.index + 1}: ${citation.title}`}
      className={`ai-chat-source-popover${layout?.maxHeight ? ' is-constrained' : ''}`}
      data-keep-text=""
      data-placement={layout?.placement}
      id={SOURCE_POPOVER_ID}
      ref={popoverRef}
      role="dialog"
      style={style}
    >
      <div className="ai-chat-source-popover-head">
        {/* Nummer wie der aktive Chip — ordnet das Popover eindeutig zu. */}
        <span aria-hidden="true" className="ai-chat-source-popover-badge">{source.index + 1}</span>
        <span className="ai-chat-source-popover-context">Wissensdatenbank</span>
        <button
          aria-label="Quelle schließen"
          className="ai-chat-source-popover-close"
          onClick={() => onClose(true)}
          ref={closeRef}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </button>
      </div>
      <p className="ai-chat-source-popover-title">{citation.title}</p>
      {citation.section && <p className="ai-chat-source-popover-section">{citation.section}</p>}
      {isUrl(citation.source) && (
        <a className="ai-chat-source-popover-link" href={citation.source} rel="noopener noreferrer" target="_blank">
          {citation.source.replace(/^https?:\/\//i, '')}
        </a>
      )}
    </div>
  );
}
