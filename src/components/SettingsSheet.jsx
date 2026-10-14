import '../styles/shell-menu.css';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { TECH_LOGOS } from './ai-experience/techLogos.js';
import { useLatestGitHubRelease } from '../hooks/useLatestGitHubRelease.js';
import {
  CONTACT_MAIL,
  GITHUB_PROFILE_URL,
  RAG_BACKEND_REPOSITORY_URL,
  REACT_PORTFOLIO_REPOSITORY_URL,
} from '../siteConfig.js';

/*
 * Menue: Accordion-Panel (Desktop zentriert, Handy Bottom Sheet).
 *
 * Einzige Stelle fuer die Ziele und Projektdaten. Leerer String = existiert
 * noch nicht: der Bereich bleibt sichtbar, zeigt aber nur einen neutralen
 * Hinweis. Nichts wird erfunden.
 *
 *  · GITHUB_PROFILE_URL  — GitHub-Profil (kein Repository).
 *  · REACT_PORTFOLIO     — Repository wird erst spaeter angelegt (leer).
 *  · RAG_BACKEND         — Repository-URL.
 *  Release-Tags werden NIE hartcodiert: useLatestGitHubRelease holt fuer jede
 *  hinterlegte Repository-URL den neuesten veroeffentlichten GitHub-Release
 *  (services/githubRelease.js). Ohne Repository/Release: neutraler Zustand.
 *  · CONTACT_MAIL        — Kontakt-E-Mail.
 */
// Werte zentral in siteConfig.js (Kontakt, Profil, Repositories).
const REACT_PORTFOLIO = {
  repositoryUrl: REACT_PORTFOLIO_REPOSITORY_URL,
};

const RAG_BACKEND = {
  repositoryUrl: RAG_BACKEND_REPOSITORY_URL,
};

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
const SHEET_QUERY = '(max-width: 699px)';
const EASE_OUT = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.32, 0.72, 0, 1];

/* ---------- Icons ---------- */

function Svg({ children, filled = false }) {
  return filled ? (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">{children}</svg>
  ) : (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

const IconGithub = () => (
  <Svg filled>
    <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49l-.01-1.71c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.28 9.28 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.06 10.06 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
  </Svg>
);

const IconReact = () => (
  <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <circle cx="12" cy="12" fill="currentColor" r="1.9" stroke="none" />
    <ellipse cx="12" cy="12" rx="10" ry="4.1" />
    <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(120 12 12)" />
  </svg>
);

// RAG: Wissensbasis (Stapel) mit Abfrage-Knoten
const IconRag = () => (
  <Svg>
    <ellipse cx="10" cy="5.5" rx="6.5" ry="2.5" />
    <path d="M3.5 5.5v6c0 1.4 2.9 2.5 6.5 2.5M16.5 5.5v3.2" />
    <path d="M3.5 11.5v6c0 1.4 2.9 2.5 6.5 2.5" />
    <circle cx="17.5" cy="16" r="3.2" />
    <path d="m19.8 18.3 1.9 1.9" />
  </Svg>
);

const IconMail = () => (
  <Svg>
    <rect height="14" rx="2.5" width="18" x="3" y="5" />
    <path d="m3.8 6.6 7.1 5.1a2 2 0 0 0 2.2 0l7.1-5.1" />
  </Svg>
);

const IconClose = () => (
  <Svg>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

const IconChevron = () => (
  <Svg>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Svg>
);

const IconArrow = () => (
  <Svg>
    <path d="M7 17 17 7M9 7h8v8" />
  </Svg>
);

const IconTag = () => (
  <Svg>
    <path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1a1 1 0 0 1 .7.3l7.2 7.2a1 1 0 0 1 0 1.4l-8.1 8.1a1 1 0 0 1-1.4 0l-7.2-7.2a1 1 0 0 1-.3-.7Z" />
    <circle cx="8.5" cy="8.5" r="1.4" />
  </Svg>
);

/* ---------- Tech-Pins ---------- */


// Absolute URL: Eine relative url() in einer CSS-Variablen wird gegen das
// Stylesheet aufgeloest, nicht gegen die Seite — mit base './' (GitHub Pages)
// zeigte sie sonst auf assets/assets/…
const GSAP_MARK_URL = typeof document === 'undefined'
  ? `${import.meta.env.BASE_URL}assets/brand/gsap-mark.svg`
  : new URL(`${import.meta.env.BASE_URL}assets/brand/gsap-mark.svg`, document.baseURI).href;

// Eigene Glyphen fuer Technologien ohne Eintrag in techLogos.js
const GLYPHS = {
  react: <IconReact />,
  vite: (
    <Svg>
      <path d="M21.4 4.6 12.5 20.3a.6.6 0 0 1-1 0L2.6 4.6a.6.6 0 0 1 .6-.9L12 5.3l8.8-1.6a.6.6 0 0 1 .6.9Z" />
      <path d="m13.4 2.8-4.3.9-.3 5.6 2.4-.5-.6 4 4.2-6.2-2.4.5Z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  // Offizielles GSAP-Zeichen (vier Kreise): gsap.com/safari-pinned-tab.svg,
  // unveraendert lokal unter public/assets/brand/. Als Maske eingefaerbt.
  gsap: (
    <span
      aria-hidden="true"
      className="menu-pin__mask"
      style={{ '--mask': `url(${GSAP_MARK_URL})` }}
    />
  ),
  framer: (
    <Svg filled>
      <path d="M5 1h14v7h-7zM5 8h7l7 7H5zM5 15h7v7z" />
    </Svg>
  ),
  lottie: (
    <Svg>
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <path d="M7.5 16c3.2 0 3.6-8 7.4-8h1.6" />
    </Svg>
  ),
  // Offizielles Node.js-Zeichen (Simple Icons „nodedotjs“, Quelle nodejs.org/en/about/branding)
  node: (
    <Svg filled>
      <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z" />
    </Svg>
  ),
  pydantic: (
    <Svg>
      <path d="M12 3.5 21 19.5H3Z" />
      <path d="M12 3.5v16M7.6 11.5h8.8" />
    </Svg>
  ),
};

function TechIcon({ logo }) {
  if (GLYPHS[logo]) return GLYPHS[logo];
  const entry = TECH_LOGOS[logo];
  if (!entry) return null;
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d={entry.d} />
    </svg>
  );
}

/*
 * Nur tatsaechlich verwendete Technologien, Farben = offizielle bzw. vertraute
 * Markenfarben (auf dunklem Grund ggf. die helle Markenvariante).
 */
// Belegt durch package.json / Importe in src (react, vite, gsap, framer-motion, lottie-web)
// sowie engines.node / .nvmrc (Node.js als Build-Runtime)
const FRONTEND_STACK = [
  { label: 'React 19', logo: 'react', color: '#61DAFB' },
  { label: 'Vite 8', logo: 'vite', color: '#A78BFA' },
  { label: 'GSAP', logo: 'gsap', color: '#0AE448' },
  { label: 'Framer Motion', logo: 'framer', color: '#4D9FFF' },
  { label: 'Lottie', logo: 'lottie', color: '#00DDB3' },
  // Build-/Tooling-Runtime (Vite, Rolldown, oxlint) — nicht das Backend der Seite
  { label: 'Node.js', logo: 'node', color: '#5FA04E' },
];

// Belegt durch pyproject.toml, .python-version, Dockerfile, Adapter und README
const BACKEND_STACK = [
  { label: 'Python 3.13', logo: 'python', color: '#FFD43B' },
  { label: 'FastAPI', logo: 'fastapi', color: '#05B8A1' },
  { label: 'Pydantic', logo: 'pydantic', color: '#E92063' },
  { label: 'Docker', logo: 'docker', color: '#2496ED' },
  { label: 'Mistral', logo: 'mistralai', color: '#FA520F' },
  { label: 'Cloudflare Vectorize', logo: 'cloudflare', color: '#F38020' },
  { label: 'Workers AI', logo: 'cloudflare', color: '#F38020' },
  { label: 'Google Cloud Run', logo: 'googlecloud', color: '#4285F4' },
];

function TechPins({ items, label }) {
  return (
    <ul aria-label={label} className="menu-pins">
      {items.map((item) => (
        <li className="menu-pin" key={item.label} style={{ '--pin': item.color }}>
          <span className="menu-pin__icon" data-logo={item.logo}><TechIcon logo={item.logo} /></span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Bausteine ---------- */

function ActionLink({ href, children, pending }) {
  if (!href) {
    return (
      <span aria-disabled="true" className="menu-action is-pending">
        {children}
        {pending ? <span className="menu-action__note">{pending}</span> : null}
      </span>
    );
  }
  const external = href.startsWith('http');
  return (
    <a
      className="menu-action"
      href={href}
      rel={external ? 'noopener noreferrer' : undefined}
      target={external ? '_blank' : undefined}
    >
      {children}
      <span className="menu-action__arrow"><IconArrow /></span>
    </a>
  );
}

/*
 * Release-Zeile fuer ein Repository — derselbe Chip fuer beide Bereiche.
 * ok → neuester Tag; kein Release → dezent „Release coming soon“;
 * Fehler/Rate Limit/noch nichts → nichts (keine Fake-Version).
 */
function ReleaseChip({ release }) {
  if (release?.status === 'ok') {
    return (
      <a
        aria-label={`Neuestes Release ${release.tag} auf GitHub`}
        className="menu-release"
        href={release.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <IconTag />
        {release.tag}
      </a>
    );
  }
  if (release?.status === 'none') return <span className="menu-status">Release coming soon</span>;
  return null;
}

function Accordion({ accent, children, icon, id, meta, onToggle, open, title }) {
  const baseId = useId();
  const panelId = `${baseId}-${id}-panel`;
  const triggerId = `${baseId}-${id}-trigger`;

  return (
    <li className={`menu-acc${open ? ' is-open' : ''}`} style={{ '--acc': accent }}>
      <h3 className="menu-acc__heading">
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className="menu-acc__trigger"
          id={triggerId}
          onClick={onToggle}
          type="button"
        >
          <span className="menu-acc__icon">{icon}</span>
          <span className="menu-acc__text">
            <span className="menu-acc__title">{title}</span>
            <span className="menu-acc__meta">{meta}</span>
          </span>
          <span className="menu-acc__chevron"><IconChevron /></span>
        </button>
      </h3>
      {/* Grid-Zeile 0fr → 1fr: Hoehe animiert ohne feste Masse. inert
          haelt den eingeklappten Inhalt aus Tab-Reihenfolge und Screenreader. */}
      <div
        aria-labelledby={triggerId}
        className="menu-acc__panel"
        id={panelId}
        inert={!open}
        role="region"
      >
        <div className="menu-acc__clip">
          <div className="menu-acc__content">{children}</div>
        </div>
      </div>
    </li>
  );
}

/* ---------- Sheet ---------- */

/*
 * Phasen statt open-Boolean (wie Quality Findings): 'open' → 'closing' →
 * 'closed'. Die Seitensperre bleibt bis zum Ende der Ausfahrt bestehen; erst
 * danach wird entsperrt und das Markup entfernt. Bleiben Frames aus
 * (gedrosseltes rAF), schliesst eine feste Frist den Vorgang ab.
 */
export default function SettingsSheet({ onClose, open, returnFocusRef }) {
  const sheetRef = useRef(null);
  const dragControls = useDragControls();
  const reducedMotion = Boolean(useReducedMotion());
  const [phase, setPhase] = useState('closed');
  const [openSection, setOpenSection] = useState(null);
  // Erst abrufen, wenn das Menue wirklich geoeffnet wird.
  const reactRelease = useLatestGitHubRelease(REACT_PORTFOLIO.repositoryUrl, phase === 'open');
  const ragRelease = useLatestGitHubRelease(RAG_BACKEND.repositoryUrl, phase === 'open');

  useEffect(() => {
    if (open) {
      setPhase('open');
      setOpenSection(null);
    } else {
      setPhase((current) => (current === 'open' ? 'closing' : current));
    }
  }, [open]);

  const handleExited = useCallback(() => {
    setPhase((current) => (current === 'closing' ? 'closed' : current));
  }, []);

  const locked = phase !== 'closed';
  const sheet = typeof window !== 'undefined' && window.matchMedia(SHEET_QUERY).matches;
  const enter = reducedMotion ? 0.01 : sheet ? 0.52 : 0.6;
  const exit = reducedMotion ? 0.01 : sheet ? 0.38 : 0.42;

  // Fallback: Ausfahrt gilt spaetestens nach Ablauf der Frist als beendet.
  useEffect(() => {
    if (phase !== 'closing') return undefined;
    const timer = window.setTimeout(handleExited, exit * 1000 + 300);
    return () => window.clearTimeout(timer);
  }, [exit, handleExited, phase]);

  /*
   * Seitensperre OHNE Layout-Eingriff: Es werden keine Styles an html/body
   * gesetzt, sondern nur Scroll-EINGABEN ausserhalb des scrollbaren
   * Menue-Inhalts abgefangen (Rad, Wischen, Scroll-Tasten).
   *
   * Warum nicht overflow: hidden (Befund 2026-10-07):
   *  · auf html: body hat aus base.css overflow-x: hidden und wird dann zum
   *    eigenen Scroll-Container → alle gerade klebenden position: sticky-
   *    Buehnen (Social-Reveal, Funnel, Karten) verlieren ihren Versatz und
   *    schnappen beim Schliessen zurueck („Aufploppen“).
   *  · auf body: die Scrollleiste verschwindet → alle fixierten Elemente
   *    (Header, Assistent, Icon-Bruecke) ruecken seitlich und springen zurueck.
   *  · position: fixed auf body: scrollY = 0, ScrollTrigger-Refresh setzt
   *    Pins/Animationen zurueck (siehe EvaluationReport).
   * So bleibt die Seite darunter exakt, wie sie war — nichts wird versteckt,
   * verschoben oder neu berechnet, also kann beim Schliessen nichts aufploppen.
   */
  useEffect(() => {
    if (!locked) return undefined;

    const html = document.documentElement;
    const root = document.getElementById('root');
    const previous = {
      rootInert: root?.inert,
      rootAriaHidden: root?.getAttribute('aria-hidden'),
    };
    const trigger = returnFocusRef?.current;

    // Darf diese Geste den Menue-Inhalt (statt der Seite) scrollen?
    const canScrollInside = (target, delta) => {
      const area = sheetRef.current?.querySelector('.shell-sheet__body');
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
      // Ziehen am Sheet-Kopf (Drag zum Schliessen) laeuft ueber Framer Motion.
      if (event.target instanceof Element && event.target.closest('.shell-sheet__grip,.shell-sheet__head')) return;
      const y = event.touches[0]?.clientY ?? touchY;
      if (!canScrollInside(event.target, touchY - y)) event.preventDefault();
      touchY = y;
    };

    const SCROLL_KEYS = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1, End: 1, Home: -1, ' ': 1 };
    const onKeyDown = (event) => {
      if (!(event.key in SCROLL_KEYS)) return;
      const target = event.target;
      // Leertaste auf Buttons/Links ist eine Aktivierung, kein Scrollen.
      if (event.key === ' ' && target instanceof Element && target.closest('button,a,input,textarea,select')) return;
      const delta = event.key === ' ' && event.shiftKey ? -1 : SCROLL_KEYS[event.key];
      if (!canScrollInside(target, delta)) event.preventDefault();
    };

    html.classList.add('shell-sheet-open');
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
      html.classList.remove('shell-sheet-open');
      trigger?.focus({ preventScroll: true });
    };
  }, [locked, returnFocusRef]);

  // Escape und Fokusfalle (nur solange offen, nicht waehrend der Ausfahrt)
  useEffect(() => {
    if (phase !== 'open') return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = sheetRef.current;
      if (!panel) return;

      const items = Array.from(panel.querySelectorAll(FOCUSABLE))
        .filter((node) => !node.closest('[inert]'))
        .filter((node) => node.offsetParent !== null || node === document.activeElement);
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
  }, [onClose, phase]);

  // Fokus in das Panel holen, sobald es offen ist.
  useEffect(() => {
    if (phase !== 'open') return;
    sheetRef.current?.querySelector(FOCUSABLE)?.focus({ preventScroll: true });
  }, [phase]);

  const handleDragEnd = useCallback((_event, info) => {
    if (info.offset.y > 130 || info.velocity.y > 620) onClose();
  }, [onClose]);

  /*
   * Ziehen startet nur am Kopfbereich — eine Wischgeste im Inhalt soll
   * scrollen und nicht das Sheet greifen.
   */
  const startDrag = useCallback((event) => {
    if (event.pointerType === 'mouse') return;
    if (event.target.closest('button,a')) return;
    dragControls.start(event);
  }, [dragControls]);

  const toggle = useCallback((id) => {
    setOpenSection((current) => (current === id ? null : id));
  }, []);

  if (typeof document === 'undefined' || !locked) return null;

  const show = phase === 'open';
  const inT = { duration: enter, ease: EASE_OUT };
  const outT = { duration: exit, ease: EASE_IN_OUT };

  // Beide Varianten fahren aus dem Viewport herein und wieder hinaus:
  // Handy als Bottom Sheet (eigene Hoehe), Desktop vom unteren Rand bis in die
  // zentrierte Endlage (100vh liegt immer ganz unterhalb). Reduced Motion: Fade.
  const offscreen = sheet ? '100%' : '100vh';
  const sheetVariants = reducedMotion
    ? { hidden: { opacity: 0, transition: outT }, visible: { opacity: 1, transition: inT } }
    : { hidden: { y: offscreen, transition: outT }, visible: { y: 0, transition: inT } };

  const backdropVariants = {
    hidden: { opacity: 0, transition: outT },
    visible: { opacity: 1, transition: inT },
  };

  return createPortal(
    <div className={`shell-sheet-layer${show ? '' : ' is-closing'}`}>
      <motion.div
        animate={show ? 'visible' : 'hidden'}
        aria-hidden="true"
        className="shell-sheet-backdrop"
        initial="hidden"
        onClick={onClose}
        variants={backdropVariants}
      />

      <motion.div
        animate={show ? 'visible' : 'hidden'}
        aria-labelledby="shell-sheet-title"
        aria-modal="true"
        className="shell-sheet"
        data-keep-text=""
        drag={sheet && show ? 'y' : false}
        dragConstraints={{ bottom: 0, top: 0 }}
        dragControls={dragControls}
        dragElastic={{ bottom: 0.34, top: 0 }}
        dragListener={false}
        id="shell-sheet"
        initial="hidden"
        onAnimationComplete={(definition) => {
          if (definition === 'hidden') handleExited();
        }}
        onDragEnd={handleDragEnd}
        ref={sheetRef}
        role="dialog"
        variants={sheetVariants}
      >
        <div aria-hidden="true" className="shell-sheet__grip" onPointerDown={startDrag} />

        <div className="shell-sheet__head" onPointerDown={startDrag}>
          <div>
            <h2 className="shell-sheet__title" id="shell-sheet-title">Menü</h2>
            <p className="shell-sheet__note">Projekte, Quellcode und Kontakt.</p>
          </div>
          <button
            aria-label="Menü schließen"
            className="shell-sheet__close"
            onClick={onClose}
            type="button"
          >
            <IconClose />
          </button>
        </div>

        <div className="shell-sheet__body">
          <ul className="menu-accs">
            <Accordion
              accent="#ffffff"
              icon={<IconGithub />}
              id="github"
              meta="Profil und Projekte"
              onToggle={() => toggle('github')}
              open={openSection === 'github'}
              title="GitHub"
            >
              <div className="menu-feature">
                <span className="menu-feature__mark"><IconGithub /></span>
                <p className="menu-feature__text">
                  Quellcode, Projekte und Aktivität an einem Ort.
                </p>
              </div>
              <div className="menu-actions">
                <ActionLink href={GITHUB_PROFILE_URL} pending="Profil-Link folgt">
                  Open GitHub Profile
                </ActionLink>
              </div>
            </Accordion>

            <Accordion
              accent="#61DAFB"
              icon={<IconReact />}
              id="react"
              meta="Diese Website · Frontend"
              onToggle={() => toggle('react')}
              open={openSection === 'react'}
              title="React Portfolio"
            >
              <div className="menu-actions">
                {REACT_PORTFOLIO.repositoryUrl ? (
                  <ActionLink href={REACT_PORTFOLIO.repositoryUrl}>Open Repository</ActionLink>
                ) : (
                  <span className="menu-status">Repository coming soon</span>
                )}
                <ReleaseChip release={reactRelease} />
              </div>
              <TechPins items={FRONTEND_STACK} label="Tech Stack React Portfolio" />
            </Accordion>

            <Accordion
              accent="#ff7a3d"
              icon={<IconRag />}
              id="rag"
              meta="Custom RAG · AI Portfolio Assistant"
              onToggle={() => toggle('rag')}
              open={openSection === 'rag'}
              title="Portfolio RAG Backend"
            >
              <div className="menu-actions">
                <ActionLink href={RAG_BACKEND.repositoryUrl}>Open Repository</ActionLink>
                <ReleaseChip release={ragRelease} />
              </div>
              <TechPins items={BACKEND_STACK} label="Tech Stack Portfolio RAG Backend" />
            </Accordion>

            <Accordion
              accent="#ff2d78"
              icon={<IconMail />}
              id="contact"
              meta="Projektanfragen per E-Mail"
              onToggle={() => toggle('contact')}
              open={openSection === 'contact'}
              title="Kontakt"
            >
              <p className="menu-contact">{CONTACT_MAIL}</p>
              <div className="menu-actions">
                <ActionLink href={`mailto:${CONTACT_MAIL}`}>E-Mail schreiben</ActionLink>
              </div>
            </Accordion>
          </ul>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
