import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../shared.jsx';
import { ADVISOR_QUESTIONS } from './campaignData.js';
import PhoneIcon from './icons.jsx';

/* ==================================================================
 * „✦ Gartenberater" — lokaler Demo-Dialog der fiktiven Marke VERDE
 *
 * Ausschliesslich visuell und deterministisch: zwei Fragen, feste
 * Antworten, eine Einordnung. Keine API, kein Modell, kein Versand.
 * Bewusst unabhaengig vom echten Portfolio-Assistenten (andere
 * Komponenten, andere Klassen, kein gemeinsamer Zustand).
 *
 * Der Zustand liegt in useGardenAdvisor.js, damit das Kapitel daneben (Lead-Profil,
 * grosse Antwort-Buttons auf dem Handy) denselben Verlauf zeigt.
 * ================================================================== */

function Bubble({ from, children, reducedMotion }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`mk-advisor__bubble is-${from}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.32, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function GardenAdvisor({ advisor, open, onClose, onOpen, reducedMotion, visible }) {
  const { answers, current, done, request, reset, sent, typing, choose } = advisor;
  const logRef = useRef(null);

  // Neue Nachricht: nur das Protokoll im Phone scrollen, nie die Seite.
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTo({ top: log.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [answers, typing, sent, reducedMotion]);

  const project = answers.project;
  const size = answers.size;

  /*
   * Launcher-Zustand, eine Quelle der Wahrheit:
   *   entered  — 1,6 s nach Erscheinen der Seite eingeblendet
   *   compact  — 1,3 s spaeter rund; genau ein Timer pro Sichtbarkeit
   *   engaged  — Zeiger/Fokus auf dem Button: hat immer Vorrang, der
   *              Button bleibt offen, kein Timer kann dazwischenfunken
   * Frueher lag eine CSS-transition-delay von 1,6 s auch auf dem Hover
   * (Reaktion erst nach Sekunden), und width:auto liess sich nicht
   * interpolieren (Springen/Flackern) — beides ist entfernt.
   */
  const [entered, setEntered] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [engaged, setEngaged] = useState(false);
  useEffect(() => {
    setEntered(false);
    setCollapsed(false);
    if (!visible) return undefined;
    const enter = window.setTimeout(() => setEntered(true), reducedMotion ? 0 : 1600);
    const collapse = window.setTimeout(() => setCollapsed(true), reducedMotion ? 1200 : 2900);
    return () => {
      window.clearTimeout(enter);
      window.clearTimeout(collapse);
    };
  }, [reducedMotion, visible]);
  const compact = collapsed && !engaged;

  // Hinweis, dass die Antworten klickbar sind — bis zur ersten Auswahl.
  const hint = open && !project;

  return (
    <div className="mk-advisor" data-compact={compact} data-open={open} data-visible={visible && entered}>
      <button
        aria-expanded={open}
        className="mk-advisor__launcher"
        onBlur={() => setEngaged(false)}
        onClick={open ? onClose : onOpen}
        onFocus={() => setEngaged(true)}
        onPointerEnter={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        tabIndex={visible ? 0 : -1}
        type="button"
      >
        <span aria-hidden="true" className="mk-advisor__glyph">✦</span>
        <span className="mk-advisor__label">Gartenberater</span>
      </button>

      <div
        aria-label="Gartenberater (Demo)"
        className="mk-advisor__panel"
        inert={!open}
        role="dialog"
      >
        <header className="mk-advisor__head">
          <span className="mk-advisor__avatar" aria-hidden="true">✦</span>
          <span>
            <b>Gartenberater</b>
            <small>VERDE · geführte Einordnung</small>
          </span>
          <button aria-label="Gartenberater schließen" onClick={onClose} type="button">
            <PhoneIcon name="close" />
          </button>
        </header>

        <div aria-live="polite" className="mk-advisor__log" ref={logRef}>
          <Bubble from="bot" reducedMotion={reducedMotion}>{ADVISOR_QUESTIONS[0].text}</Bubble>
          {project ? <Bubble from="user" reducedMotion={reducedMotion}>{project.label}</Bubble> : null}
          {project && !(typing && !size) ? (
            <Bubble from="bot" reducedMotion={reducedMotion}>{ADVISOR_QUESTIONS[1].text}</Bubble>
          ) : null}
          {size ? <Bubble from="user" reducedMotion={reducedMotion}>{size.label}</Bubble> : null}
          {done && !typing ? (
            <Bubble from="bot" reducedMotion={reducedMotion}>
              Perfekt. Damit lässt sich Ihr Projekt bereits grob einordnen.
              <span className="mk-advisor__summary">
                <span><small>Projekt</small>{project.label}</span>
                <span><small>Fläche</small>{size.label}</span>
                <span><small>Nächster Schritt</small>{project.next}</span>
              </span>
            </Bubble>
          ) : null}
          {sent ? (
            <Bubble from="bot" reducedMotion={reducedMotion}>
              Anfrage vorbereitet. In dieser Demo wird nichts gesendet.
            </Bubble>
          ) : null}
          <AnimatePresence>
            {typing ? (
              <motion.div
                animate={{ opacity: 1 }}
                aria-label="Gartenberater schreibt"
                className="mk-advisor__typing"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <i /><i /><i />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mk-advisor__actions" data-hint={hint}>
          {current ? <span className="mk-advisor__cue" aria-hidden="true">Antwort antippen</span> : null}
          {current ? current.options.map((option) => (
            <button key={option.id} onClick={() => choose(current.id, option)} type="button">
              {option.label}
              <PhoneIcon name="arrow" />
            </button>
          )) : null}
          {done && !typing && !sent ? (
            <button className="is-primary" onClick={request} type="button">
              Projekt anfragen
              <PhoneIcon name="arrow" />
            </button>
          ) : null}
          {sent ? (
            <button className="is-ghost" onClick={reset} type="button">Neu starten</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
