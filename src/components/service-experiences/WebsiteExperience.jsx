import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import {
  EASE,
  Glyph,
  ModuleHeading,
  PeekSlider,
  SegmentedControl,
} from './shared.jsx';
import WebSystemStage from './WebSystemStage.jsx';

/* ==================================================================
 * Der frühere Geräte-Umschalter mit codiertem Website-Mockup wurde
 * durch WebSystemStage.jsx ersetzt. PROJECTS und DISCIPLINES bleiben:
 * die Vergleichsfassungen weiter unten arbeiten damit.
 * ================================================================== */

/* `line` nutzt nur die Vorher-Vorlage: aeltere Seiten schrieben in jede
   Listenzeile alles hinein, was sie hatten. Die gestaltete Fassung laesst
   dieselbe Information bewusst weg. */
const PROJECTS = [
  { id: 'haus-f', name: 'Haus F.', place: 'Starnberg', tone: 'warm', line: 'Wohnhaus · Umbau 2024' },
  { id: 'praxis', name: 'Praxis Nord', place: 'München', tone: 'cool', line: 'Praxisräume · Neubau 2023' },
  { id: 'loft', name: 'Loft K.', place: 'Berlin', tone: 'deep', line: 'Loft · Sanierung 2022' },
];

/* Leistungsfelder des fiktiven Studios — der Endlos-Streifen zeigt echte
   Inhalte statt dekorativer Logos. Jeder Begriff hat sein eigenes Zeichen
   aus dem Projekt-Icon-Set; ein einheitlicher Punkt trug keine Bedeutung. */
const DISCIPLINES = [
  { label: 'Konzept', icon: 'compass' },
  { label: 'Raumplanung', icon: 'grid' },
  { label: 'Lichtdesign', icon: 'spark' },
  { label: 'Material', icon: 'layers' },
  { label: 'Möbelbau', icon: 'frame' },
  { label: 'Bauleitung', icon: 'route' },
];

/*
 * Endlos-Streifen.
 *
 * Zwei Kopien reichen nur, wenn eine Gruppe breiter ist als der sichtbare
 * Streifen. Sechs Begriffe ergeben rund 900px, der Streifen wird im Popup
 * aber bis zu 1170px breit — nach der letzten Gruppe klaffte deshalb eine
 * Luecke, bevor die Animation neu ansetzte. Vier Gruppen und ein Versatz
 * von genau einem Viertel loesen das ohne Rechnerei zur Laufzeit: drei
 * Gruppen stehen immer bereit, der Umlauf ist an keiner Stelle sichtbar.
 * Nur die erste Gruppe ist fuer Screenreader da.
 */
const MARQUEE_COPIES = 4;

function DisciplineStrip({ variant }) {
  return (
    <div className={`sc-strip sc-strip--${variant}`}>
      <div className="sc-strip__marquee">
        {Array.from({ length: MARQUEE_COPIES }, (_, copy) => (
          <ul aria-hidden={copy > 0} key={copy}>
            {DISCIPLINES.map((item) => (
              <li key={item.label}>
                <span className="sc-strip__icon"><Glyph name={item.icon} /></span>
                <span className="sc-strip__label">{item.label}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* 2 · Handwerk sichtbar machen                                        */
/* Zwei echte, codierte Fassungen derselben Seite. Der Regler ist ein  */
/* natives range-Input: mit Maus ziehbar, mit Pfeiltasten bedienbar.   */
/* ================================================================== */

/*
 * Beide Fassungen tragen denselben Inhalt: gleicher Studioname, gleiche
 * Überschrift, gleicher Fließtext, dieselben drei Projekte, dieselben
 * Leistungsfelder. Unterschiedlich ist ausschließlich, wie dieser Inhalt
 * gebaut ist — deshalb bleibt der Regler ein Vergleich und wird nicht zur
 * Gegenüberstellung zweier verschiedener Firmen.
 *
 * Die Fassungen tragen bewusst NICHT mehr dasselbe Markup: die Vorher-Seite
 * ist eine klassische Vorlage mit Kopfbanner, Reiterleiste und linker
 * Randspalte (LegacyPane), die Nachher-Seite eine gestaltete Fassung mit
 * zentrierter Kopfzeile (CraftedPane). Beide sitzen in derselben
 * Rasterzelle des Betrachters, füllen ihn über flex und behalten dadurch
 * dieselben Außenmaße.
 */
function CraftedPane() {
  return (
    <div className="sc-craft__pane is-crafted">
      <div className="sc-craft__nav">
        <b>Atelier Kern</b>
        <span>Projekte</span>
        <span>Atelier</span>
        <span>Journal</span>
        <em>Anfragen</em>
      </div>

      <div className="sc-craft__body">
        <div className="sc-craft__copy">
          <span className="sc-craft__eyebrow">Innenarchitektur seit 2016</span>
          <h6>Räume mit Haltung.</h6>
          <p>Wir gestalten Interieurs, die auch nach Jahren noch stimmig wirken.</p>
          <span className="sc-craft__action">Projekt besprechen</span>
        </div>

        <div className="sc-craft__scene">
          <span className="sc-kern__light" />
          <span className="sc-kern__room">
            <i className="sc-kern__wall" />
            <i className="sc-kern__window" />
            <i className="sc-kern__floor" />
          </span>
        </div>
      </div>

      <div className="sc-craft__row">
        {PROJECTS.map((project) => (
          <span className={`sc-craft__box is-${project.tone}`} key={project.id}>
            <i />
            <b>{project.name}</b>
            <em>{project.place}</em>
          </span>
        ))}
      </div>

      <DisciplineStrip variant="craft" />

      {/* Fussbereich. Beide Fassungen tragen ihn, damit die Aussenmasse
          identisch bleiben und der Regler exakt synchron laeuft. */}
      <div className="sc-craft__foot">
        <span className="sc-craft__foot-brand">© 2026 Atelier Kern</span>
        <span>Impressum</span>
        <span>Datenschutz</span>
      </div>
    </div>
  );
}

/*
 * Fassung A — die Vorher-Seite.
 *
 * Eine andere Bauart, nicht dieselbe Seite in anderen Farben: farbiges
 * Kopfbanner, Reiterleiste, linke Randspalte mit Kasten-Navigation und
 * rechts eine Textspalte mit umflossenem Bild und Projektliste. Das ist
 * der Aufbau tausender Standardvorlagen aus der Zeit vor dem responsiven
 * Web — glaubwuerdig und ordentlich gemacht, aber ohne Hierarchie,
 * ohne Weissraum und ohne eigene Haltung.
 *
 * Der Inhalt ist derselbe wie rechts, damit der Vergleich traegt: die
 * Leistungsfelder stehen hier als Liste in der Randspalte statt als
 * Laufband, die Projekte als Zeilen statt als Kacheln.
 */
function LegacyPane() {
  return (
    <div className="sc-craft__pane is-raw">
      <div className="sc-old__banner">
        <b>Atelier Kern</b>
        <span>Innenarchitektur seit 2016</span>
      </div>

      <div className="sc-old__menu">
        <span className="is-current">Startseite</span>
        <span>Projekte</span>
        <span>Atelier</span>
        <span>Journal</span>
        <span>Anfragen</span>
      </div>

      <div className="sc-old__main">
        <div className="sc-old__side">
          <p className="sc-old__side-head">Leistungen</p>
          <ul className="sc-old__side-list">
            {DISCIPLINES.map((item) => (
              <li key={item.label}>{item.label}</li>
            ))}
          </ul>
          <div className="sc-old__box">
            <b>Kontakt</b>
            <span>Tel. 089 / 12 34 56</span>
            <span>info@atelier-kern.de</span>
          </div>

          <div className="sc-old__box">
            <b>Öffnungszeiten</b>
            <span>Mo – Fr 9 – 17 Uhr</span>
            <span>Sa nach Vereinbarung</span>
          </div>
        </div>

        <div className="sc-old__content">
          <h6>Räume mit Haltung.</h6>
          <span aria-hidden="true" className="sc-old__rule" />

          <div className="sc-old__intro">
            <span aria-hidden="true" className="sc-old__photo">
              <i className="sc-old__photo-wall" />
              <i className="sc-old__photo-window" />
              <i className="sc-old__photo-floor" />
            </span>
            <p>
              Wir gestalten Interieurs, die auch nach Jahren noch stimmig wirken.
            </p>
            <p>
              Seit 2016 planen wir Wohn- und Geschäftsräume in München und
              Umgebung. Von der ersten Skizze über die Materialauswahl bis zur
              Bauleitung erhalten Sie alle Leistungen aus einer Hand.
            </p>
            <span className="sc-old__button">Projekt besprechen »</span>
          </div>

          <p className="sc-old__sub">Aktuelle Projekte</p>
          <ul className="sc-old__list">
            {PROJECTS.map((project) => (
              <li className={`is-${project.tone}`} key={project.id}>
                <i />
                <span>
                  <b>{project.name}</b>
                  <em>{project.place}</em>
                  <small>{project.line}</small>
                </span>
                <u>mehr »</u>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sc-old__foot">
        <span>© 2026 Atelier Kern – Alle Rechte vorbehalten</span>
        <span>Impressum</span>
        <span>Datenschutz</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 3 · Technik folgt dem Projekt                                       */
/* ================================================================== */

const PROJECT_MODES = [
  { id: 'website', label: 'Unternehmensauftritt', panelId: 'web-arch' },
  { id: 'application', label: 'Digitale Anwendung', panelId: 'web-arch' },
];

const STACKS = {
  website: {
    line: 'Inhalte pflegt das Team selbst. Die Basis bleibt bewusst redaktionsfreundlich.',
    tech: [
      { name: 'WordPress', icon: `${import.meta.env.BASE_URL}icons/tech-wordpress.svg` },
      { name: 'Elementor', icon: `${import.meta.env.BASE_URL}icons/tech-elementor.svg` },
      { name: 'WooCommerce', icon: `${import.meta.env.BASE_URL}icons/tech-woocommerce.svg` },
    ],
  },
  application: {
    line: 'Eigene Logik und besondere Interaktionen brauchen eine komponentenbasierte Basis.',
    tech: [
      { name: 'React', icon: `${import.meta.env.BASE_URL}icons/tech-react.svg` },
      { name: 'Next.js', icon: `${import.meta.env.BASE_URL}icons/tech-nextjs.svg` },
      { name: 'REST API', icon: `${import.meta.env.BASE_URL}icons/tech-api.svg` },
    ],
  },
};

/* ================================================================== */
/* 4 · Arbeitsweise als Peek-Slider                                    */
/* ================================================================== */

const STAGES = [
  {
    id: 'listen',
    icon: 'compass',
    title: 'Erst zuhören.',
    line: 'Ziel, Publikum und Angebot werden klar, bevor die erste Fläche entsteht.',
    visual: 'lines',
    pagerLabel: 'Verstehen',
  },
  {
    id: 'shape',
    icon: 'pen',
    title: 'Dann formen.',
    line: 'Typografie, Raster und Farbe entstehen als ein System mit eigener Haltung.',
    visual: 'grid',
    pagerLabel: 'Gestalten',
  },
  {
    id: 'build',
    icon: 'layers',
    title: 'Sauber bauen.',
    line: 'Responsiv, zugänglich, wartbar – mit der Technik, die zum Projekt passt.',
    visual: 'stack',
    pagerLabel: 'Bauen',
  },
  {
    id: 'evolve',
    icon: 'loop',
    title: 'Weiter denken.',
    line: 'Nach dem Start zählen echte Nutzung und Tempo. Die Seite wird besser, nicht älter.',
    visual: 'curve',
    pagerLabel: 'Weiterentwickeln',
  },
];

function StageVisual({ kind, active }) {
  return (
    <span aria-hidden="true" className={`sc-stage-vis sc-stage-vis--${kind}${active ? ' is-active' : ''}`}>
      {kind === 'lines' && <><i /><i /><i /></>}
      {kind === 'grid' && <><i /><i /><i /><i /></>}
      {kind === 'stack' && <><i /><i /><i /></>}
      {kind === 'curve' && (
        <svg viewBox="0 0 100 30"><path d="M0 26C18 26 24 6 42 6s24 16 58 3" fill="none" /></svg>
      )}
    </span>
  );
}

export default function WebsiteExperience({ reducedMotion }) {
  const [mode, setMode] = useState('website');
  const [craft, setCraft] = useState(50);
  const viewerRef = useRef(null);
  const draggingRef = useRef(0);
  const stack = STACKS[mode];

  /*
   * Vergleichsregler auf Pointer Events.
   *
   * Vorher lag ein unsichtbares range-Input ueber der ganzen Flaeche. Das
   * hatte zwei Fehler: die nutzbare Spur eines range-Inputs ist um die
   * halbe Griffbreite eingerueckt, der Trenner lief dem Zeiger also
   * versetzt hinterher — und auf Touch war das Ziehen unzuverlaessig.
   * Jetzt wird die Position direkt aus dem Container gerechnet.
   */
  const setFromClientX = useCallback((clientX) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (!rect.width) return;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setCraft(Math.min(100, Math.max(0, position)));
  }, []);

  const endDrag = useCallback((event) => {
    if (!draggingRef.current) return;
    draggingRef.current = 0;
    const target = event.currentTarget;
    if (target?.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleDragMove = useCallback((event) => {
    if (draggingRef.current !== event.pointerId) return;
    setFromClientX(event.clientX);
  }, [setFromClientX]);

  // Der Griff nimmt jede Eingabeart an und faengt den Zeiger ein.
  const handleHandleDown = useCallback((event) => {
    draggingRef.current = event.pointerId;
    // Ohne aktiven Zeiger wirft setPointerCapture — das darf das Ziehen
    // nicht verhindern, die Bewegung laeuft dann ohne Einfangen weiter.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* kein Capture verfuegbar */
    }
    event.preventDefault();
    setFromClientX(event.clientX);
  }, [setFromClientX]);

  /*
   * Auf der Flaeche selbst reagieren nur Maus und Stift. Auf Touch bliebe
   * das vertikale Scrollen der Seite sonst am Vergleich haengen — dort
   * zieht man ausschliesslich am Griff.
   */
  const handleSurfaceDown = useCallback((event) => {
    if (event.pointerType === 'touch') return;
    if (event.target.closest('.sc-craft__handle')) return;
    setFromClientX(event.clientX);
  }, [setFromClientX]);

  const handleHandleKeys = useCallback((event) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setCraft((value) => Math.max(0, value - step));
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setCraft((value) => Math.min(100, value + step));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setCraft(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setCraft(100);
    }
  }, []);


  return (
    <>
      <WebSystemStage reducedMotion={reducedMotion} />

      {/* ---------- Handwerk sichtbar machen ---------- */}
      <section className="sc-experience__section sc-craft">
        <ModuleHeading title="Zieh den Regler. Der Unterschied ist kein Geschmack.">
          <p>Links schnell zusammengesetzt, rechts bewusst gestaltet. Gleicher Inhalt.</p>
        </ModuleHeading>

        <div
          className="sc-craft__viewer"
          onPointerDown={handleSurfaceDown}
          ref={viewerRef}
          style={{ '--sc-craft': `${craft}%` }}
        >
          <div className="sc-craft__layer">
            <LegacyPane />
          </div>
          <div className="sc-craft__layer sc-craft__layer--crafted">
            <CraftedPane />
          </div>

          <span aria-hidden="true" className="sc-craft__divider" />

          <button
            aria-label="Vergleich zwischen der alten und der neuen Fassung"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(craft)}
            aria-valuetext={`${Math.round(craft)} Prozent neue Fassung`}
            className="sc-craft__handle"
            onKeyDown={handleHandleKeys}
            onPointerCancel={endDrag}
            onPointerDown={handleHandleDown}
            onPointerMove={handleDragMove}
            onPointerUp={endDrag}
            role="slider"
            type="button"
          >
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M10 8.5 6.5 12 10 15.5M14 8.5l3.5 3.5-3.5 3.5" /></svg>
            </span>
          </button>

          <span aria-hidden="true" className="sc-craft__tag sc-craft__tag--left">Vorher</span>
          <span aria-hidden="true" className="sc-craft__tag sc-craft__tag--right">Nachher</span>
        </div>

      </section>

      {/* ---------- Technik folgt dem Projekt ---------- */}
      <section className="sc-experience__section sc-stack">
        <ModuleHeading title="Die Technik folgt dem Projekt.">
          <p>
            Inhalt und Gestaltung bleiben. Nur die unterste Schicht wechselt –
            und genau dort entscheidet sich Pflege, Tempo und Ausbau.
          </p>
        </ModuleHeading>

        <SegmentedControl
          items={PROJECT_MODES}
          label="Projekttyp wählen"
          onSelect={setMode}
          selected={mode}
        />

        <div className="sc-stack__layers" id="web-arch" role="region" aria-live="polite">
          <div className="sc-stack__layer">
            <Glyph name="type" />
            <strong>Inhalt & Botschaft</strong>
          </div>
          <div className="sc-stack__layer">
            <Glyph name="pen" />
            <strong>Gestaltung & System</strong>
          </div>

          <div className="sc-stack__layer sc-stack__layer--base">
            <Glyph name="layers" />
            <strong>Technische Basis</strong>
            <div className="sc-stack__tech">
              {/* Bewusst ohne mode="wait": aus- und einlaufende Liste bewegen
                  sich gleichzeitig. Ein stockender Exit kann den Inhaltswechsel
                  dadurch nicht blockieren. */}
              <AnimatePresence initial={false}>
                <motion.ul
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reducedMotion ? 0 : -18 }}
                  initial={{ opacity: 0, x: reducedMotion ? 0 : 18 }}
                  key={mode}
                  transition={{ duration: reducedMotion ? 0.01 : 0.36, ease: EASE }}
                >
                  {stack.tech.map((item, index) => (
                    <motion.li
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                      key={item.name}
                      transition={{
                        delay: reducedMotion ? 0 : 0.06 + index * 0.05,
                        duration: reducedMotion ? 0.01 : 0.3,
                        ease: EASE,
                      }}
                    >
                      <img alt="" height="22" loading="lazy" src={item.icon} width="22" />
                      {item.name}
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="sc-stack__note">
          <AnimatePresence initial={false}>
            <motion.p
              animate={{ opacity: 1 }}
              className="sc-stack__line"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key={mode}
              transition={{ duration: reducedMotion ? 0.01 : 0.28 }}
            >
              {stack.line}
            </motion.p>
          </AnimatePresence>
        </div>
      </section>

      {/* ---------- Arbeitsweise ---------- */}
      <section className="sc-experience__section sc-stages">
        <ModuleHeading title="Wie aus einem Gespräch eine Website wird." />
        <PeekSlider
          ariaLabel="Arbeitsweise"
          className="sc-stages__slider"
          items={STAGES}
          reducedMotion={reducedMotion}
          renderSlide={(slide, _, isCurrent) => (
            <article className={`sc-stage-card${isCurrent ? ' is-current' : ''}`}>
              <Glyph name={slide.icon} />
              <h4>{slide.title}</h4>
              <p>{slide.line}</p>
              <StageVisual active={isCurrent && !reducedMotion} kind={slide.visual} />
            </article>
          )}
        />
      </section>
    </>
  );
}
