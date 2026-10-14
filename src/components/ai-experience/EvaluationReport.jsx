import '../../styles/evaluation-report.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';

/*
 * 07 — Evaluation Report & Quality Findings
 *
 * Abschluss der RAG-Experience: Text + drei Aktionen links, rechts ein
 * 3D-Pruef-Visual (Schichten, Scan, Check). Styles:
 * styles/evaluation-report.css, Praefix .ev-.
 *
 * Einzige Datenquelle: final-acceptance-v1.2.0.json / .md (unveraendert
 * unter public/evaluation/). Release Acceptance = PASS; die Findings sind
 * dokumentierte, nicht blockierende Verbesserungspunkte.
 */
const REPORT_BASE = `${import.meta.env.BASE_URL}evaluation/`;
const REPORT_JSON = 'final-acceptance-v1.2.0.json';
const REPORT_MD = 'final-acceptance-v1.2.0.md';
const REPORT_VERSION = '1.2.0';

const FINDINGS = [
  {
    id: 'knowledge-gap',
    title: 'Knowledge gap on serverless / edge-backend wording',
    text: 'One question could not be answered because the knowledge base did not explicitly state that server-side logic can run without renting a traditional server.',
  },
  {
    id: 'grounding-refusal',
    title: 'One conservative grounding refusal',
    text: 'In one case, relevant evidence was retrieved correctly, but the grounding layer still rejected the generated answer as insufficiently supported.',
  },
  {
    id: 'retrieval-ranking',
    title: 'Retrieval ranking on broad or paraphrased questions',
    text: 'Some relevant sources were retrieved, but ranked outside the strongest top results. This mainly affected broad and indirectly phrased questions.',
  },
  {
    id: 'answer-precision',
    title: 'Minor answer precision limitations',
    text: 'In a small number of cases, the answer was correct but less precise or complete than the available knowledge allowed.',
  },
  {
    id: 'citation-labels',
    title: 'Presentation-layer citation labels',
    text: 'Internal source labels could appear in user-visible answers. This was identified as a presentation issue and has since been fixed in v1.2.1.',
    fixed: 'Fixed in v1.2.1',
  },
];

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
const SHEET_QUERY = '(max-width: 899px)';
const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_IN_OUT = [0.32, 0.72, 0, 1];

function IconDownload() {
  return (
    <svg aria-hidden="true" className="ev-btn__icon" viewBox="0 0 24 24">
      <path d="M12 4v11" />
      <path d="m7.5 11 4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

function IconFindings() {
  return (
    <svg aria-hidden="true" className="ev-btn__icon" viewBox="0 0 24 24">
      <path d="M12 3.5 19 6v5.4c0 4.3-2.9 7.6-7 9.1-4.1-1.5-7-4.8-7-9.1V6l7-2.5Z" />
      <path d="m8.8 12.1 2.2 2.2 4.3-4.6" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg aria-hidden="true" className="ev-btn__icon" viewBox="0 0 24 24">
      <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M12 11v5.5" />
      <path d="m9.6 14.2 2.4 2.4 2.4-2.4" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

/* ---------- 3D-Visual ---------- */

function EvaluationVisual() {
  const ref = useRef(null);

  // Einmaliger Einstieg (is-in) + Animationen nur im Viewport (is-live).
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-in', 'is-live');
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) node.classList.add('is-in');
      node.classList.toggle('is-live', entry.isIntersecting);
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="ev-visual" ref={ref}>
      <div className="ev-scene">
        {/* Pruef-Schichten (isometrisch), durch die ein Scan laeuft */}
        <div className="ev-stack">
          <span className="ev-plate is-1" />
          <span className="ev-plate is-2" />
          <span className="ev-plate is-3" />
          <span className="ev-scan" />
        </div>

        {/* Validierungs-Kern */}
        <div className="ev-core-wrap">
          <div className="ev-core">
            <svg className="ev-core__check" viewBox="0 0 64 64">
              <path d="M19 33.5 28.5 43 46 23" pathLength="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Modal: Quality Findings ---------- */

/*
 * Phasen statt open-Boolean: 'open' → 'closing' → 'closed'.
 * Die Seite bleibt gesperrt (Scroll-Lock, inert, eingefrorene Trigger), bis
 * die Exit-Animation abgeschlossen ist — erst dann wird entsperrt und das
 * Markup entfernt. Bleiben die Frames aus (gedrosseltes rAF), schliesst eine
 * feste Frist per setTimeout den Vorgang trotzdem ab.
 */
function FindingsModal({ onExited, onRequestClose, phase, returnFocusRef }) {
  const dialogRef = useRef(null);
  const reducedMotion = Boolean(useReducedMotion());
  const locked = phase !== 'closed';
  const sheet = typeof window !== 'undefined' && window.matchMedia(SHEET_QUERY).matches;

  const enter = reducedMotion ? 0.01 : sheet ? 0.52 : 0.42;
  const exit = reducedMotion ? 0.01 : sheet ? 0.38 : 0.26;

  // Fallback: Exit gilt spaetestens nach Ablauf der Frist als beendet.
  useEffect(() => {
    if (phase !== 'closing') return undefined;
    const timer = window.setTimeout(onExited, exit * 1000 + 300);
    return () => window.clearTimeout(timer);
  }, [exit, onExited, phase]);

  /*
   * Seitensperre: an die Phase gekoppelt, nicht an das Ende einer Animation.
   *
   * Bewusst NUR overflow: hidden — kein position: fixed auf dem body. Ein
   * fixierter body setzt window.scrollY auf 0; dann muessten alle
   * ScrollTrigger eingefroren werden, und ein globales ScrollTrigger.refresh()
   * waehrend der Sperre (z. B. resize durch die iOS-Adressleiste) setzt
   * eingefrorene Trigger per _revertAll zurueck, ohne sie wiederherzustellen:
   * Pins und Animationen spaeterer Sections (Baum-Story) blieben nach dem
   * Schliessen im Rohzustand haengen. So bleibt scrollY unveraendert, alle
   * Trigger bleiben aktiv und ein Refresh laeuft ganz normal.
   */
  useEffect(() => {
    if (!locked) return undefined;

    const html = document.documentElement;
    const root = document.getElementById('root');
    const scrollY = window.scrollY;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
      rootInert: root?.inert,
      rootAriaHidden: root?.getAttribute('aria-hidden'),
    };
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    const trigger = returnFocusRef?.current;

    html.classList.add('ev-modal-open');
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    if (root) {
      root.inert = true;
      root.setAttribute('aria-hidden', 'true');
    }

    return () => {
      if (root) {
        root.inert = previous.rootInert ?? false;
        if (previous.rootAriaHidden === null) root.removeAttribute('aria-hidden');
        else root.setAttribute('aria-hidden', previous.rootAriaHidden);
      }
      html.style.overflow = previous.htmlOverflow;
      document.body.style.overflow = previous.bodyOverflow;
      document.body.style.paddingRight = previous.bodyPaddingRight;
      html.classList.remove('ev-modal-open');
      // Absicherung: Position sollte unveraendert sein.
      if (Math.abs(window.scrollY - scrollY) > 1) window.scrollTo(0, scrollY);
      trigger?.focus({ preventScroll: true });
    };
  }, [locked, returnFocusRef]);

  // Escape + Fokusfalle (nur solange offen, nicht waehrend der Ausfahrt)
  useEffect(() => {
    if (phase !== 'open') return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onRequestClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = Array.from(dialog.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onRequestClose, phase]);

  useEffect(() => {
    if (phase !== 'open') return;
    dialogRef.current?.querySelector(FOCUSABLE)?.focus({ preventScroll: true });
  }, [phase]);

  if (typeof document === 'undefined' || !locked) return null;

  const show = phase === 'open';
  const inT = { duration: enter, ease: EASE_OUT };
  const outT = { duration: exit, ease: sheet ? EASE_IN_OUT : EASE_OUT };

  // Handy: Bottom-Sheet faehrt aus dem Viewport herein und wieder hinaus.
  // Desktop: unveraendert (Fade + leichter Lift). Reduced Motion: nur Fade.
  const dialogVariants = reducedMotion
    ? { hidden: { opacity: 0, transition: outT }, visible: { opacity: 1, transition: inT } }
    : sheet
      ? { hidden: { y: '100%', transition: outT }, visible: { y: 0, transition: inT } }
      : {
        hidden: { opacity: 0, y: show ? 24 : 16, scale: 0.985, transition: outT },
        visible: { opacity: 1, y: 0, scale: 1, transition: inT },
      };

  const backdropVariants = {
    hidden: { opacity: 0, transition: outT },
    visible: { opacity: 1, transition: inT },
  };

  return createPortal(
    <div className={`ev-modal-layer${show ? '' : ' is-closing'}`} data-keep-text="">
      <motion.div
        animate={show ? 'visible' : 'hidden'}
        aria-hidden="true"
        className="ev-modal-backdrop"
        initial="hidden"
        onClick={onRequestClose}
        variants={backdropVariants}
      />

      <motion.div
        animate={show ? 'visible' : 'hidden'}
        aria-labelledby="ev-modal-title"
        aria-modal="true"
        className="ev-modal"
        initial="hidden"
        onAnimationComplete={(definition) => {
          if (definition === 'hidden') onExited();
        }}
        ref={dialogRef}
        role="dialog"
        variants={dialogVariants}
      >
        <header className="ev-modal__head">
          <div>
            <span className="ev-modal__label">Quality Findings</span>
            <h3 className="ev-modal__title" id="ev-modal-title">Areas for Improvement</h3>
          </div>
          <button aria-label="Schließen" className="ev-modal__close" onClick={onRequestClose} type="button">
            <IconClose />
          </button>
        </header>

        <div className="ev-modal__body">
          <div className="ev-status">
            <span className="ev-status__badge">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
              Release Acceptance · PASS
            </span>
            <span className="ev-status__meta">v{REPORT_VERSION}</span>
          </div>
          <p className="ev-status__note">
            All acceptance gates passed. The points below are documented, non-blocking improvements.
          </p>

          <ol className="ev-findings">
            {FINDINGS.map((finding, index) => (
              <li className={`ev-finding${finding.fixed ? ' is-fixed' : ''}`} key={finding.id}>
                <span aria-hidden="true" className="ev-finding__num">{String(index + 1).padStart(2, '0')}</span>
                <div className="ev-finding__body">
                  <strong>{finding.title}</strong>
                  <p>{finding.text}</p>
                  {finding.fixed ? <span className="ev-finding__fixed">{finding.fixed}</span> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

/* ---------- Section ---------- */

export default function EvaluationReport() {
  const [phase, setPhase] = useState('closed');
  const triggerRef = useRef(null);
  const requestClose = useCallback(() => setPhase((p) => (p === 'open' ? 'closing' : p)), []);
  const handleExited = useCallback(() => setPhase((p) => (p === 'closing' ? 'closed' : p)), []);

  return (
    <section aria-labelledby="ev-title" className="rx-block ev">
      <div className="ev__copy">
        <h3 className="ev__title" id="ev-title">
          Evaluation Report
          <br />
          &amp; Quality Findings
        </h3>
        <p className="ev__lead">
          Das Backend wurde nicht nur gebaut, sondern systematisch geprüft: gegen definierte
          Qualitätskriterien, mit nachvollziehbaren Ergebnissen. Report und Findings legen offen,
          wie zuverlässig das System arbeitet.
        </p>

        <div className="ev__actions">
          <a className="ev-btn ev-btn--primary" download={REPORT_JSON} href={`${REPORT_BASE}${REPORT_JSON}`}>
            <IconDownload />
            <span>Download JSON</span>
          </a>

          <a className="ev-btn ev-btn--dark" download={REPORT_MD} href={`${REPORT_BASE}${REPORT_MD}`}>
            <IconDocument />
            <span>Download MD</span>
          </a>

          <button
            aria-haspopup="dialog"
            className="ev-btn ev-btn--secondary"
            onClick={() => setPhase('open')}
            ref={triggerRef}
            type="button"
          >
            <IconFindings />
            <span>Quality Findings</span>
          </button>
        </div>
      </div>

      <div className="ev__visual">
        <EvaluationVisual />
      </div>

      <FindingsModal
        onExited={handleExited}
        onRequestClose={requestClose}
        phase={phase}
        returnFocusRef={triggerRef}
      />
    </section>
  );
}
