import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE, Glyph, ModuleHeading } from './shared.jsx';

/* ==================================================================
 * Ein System, das mitdenkt.
 *
 * Rechts steht bewusst NICHT je Ebene eine eigene Grafik, sondern
 * dreimal dieselbe Oberflaeche in einem anderen Zustand: gleicher
 * Rahmen, gleiche Hoehe, gleiche Innenabstaende, gleiche Statusleiste
 * oben, gleiche Messzeile unten. Der Wechsel wirkt dadurch wie eine
 * Transformation und nicht wie drei ausgetauschte Widgets.
 *
 * Alles ist Markup — keine Screenshots, keine Bilddateien. Bewegung
 * gibt es nur einmal beim Aufbau, nichts laeuft dauerhaft.
 * ================================================================== */

const PILLARS = [
  {
    id: 'responsive',
    num: '01',
    icon: 'device',
    label: 'Responsive',
    short: 'Responsive',
    teaser: 'Entwickelt für jede Perspektive.',
    status: 'Adaptive Layout',
    title: 'Entwickelt für jede Perspektive.',
    body: 'Das Layout reagiert nicht nur auf Bildschirmgrößen. Inhalte, Abstände und Hierarchien werden für jedes Gerät neu organisiert.',
    traits: [
      { label: 'Adaptive Layouts', icon: 'frame' },
      { label: 'Fluid Typography', icon: 'type' },
      { label: 'Touch optimiert', icon: 'hand' },
    ],
    // Der jeweils aktive Umbruch wird in der Messzeile hervorgehoben —
    // das ersetzt die frueheren Geraete-Tabs.
    meta: [
      { id: 'lg', label: '1440' },
      { id: 'md', label: '768' },
      { id: 'sm', label: '390' },
    ],
    // Ein Durchlauf, danach steht der volle Zustand wieder da.
    steps: ['lg', 'md', 'sm', 'lg'],
    interval: 680,
  },
  {
    id: 'performance',
    num: '02',
    icon: 'gauge',
    label: 'Performance',
    short: 'Performance',
    teaser: 'Geschwindigkeit, die man spürt.',
    status: 'Optimized Delivery',
    title: 'Geschwindigkeit, die man spürt.',
    body: 'Optimierte Assets, kontrollierte Animationen und effiziente Strukturen sorgen für ein schnelles und flüssiges Erlebnis.',
    traits: [
      { label: 'Optimierte Assets', icon: 'layers' },
      { label: 'Lazy Loading', icon: 'flow' },
      { label: 'Flüssige Interaktionen', icon: 'gauge' },
    ],
    meta: [
      { id: 'start', label: '0,8 s Start' },
      { id: 'motion', label: '60 FPS Motion' },
      { id: 'assets', label: 'Assets optimized' },
    ],
    steps: ['shell', 'type', 'content', 'media', 'motion', 'ready'],
    interval: 240,
  },
  {
    id: 'experience',
    num: '03',
    icon: 'route',
    label: 'User Experience',
    short: 'Experience',
    teaser: 'Interaktionen, die sich natürlich anfühlen.',
    status: 'Guided Interaction',
    title: 'Interaktionen, die sich natürlich anfühlen.',
    body: 'Klare Hierarchien, präzise Rückmeldungen und eine intuitive Nutzerführung machen jede Handlung verständlich.',
    traits: [
      { label: 'Klare Nutzerführung', icon: 'route' },
      { label: 'Micro Interactions', icon: 'spark' },
      { label: 'Visuelle Hierarchie', icon: 'grid' },
    ],
    meta: [
      { id: 'focus', label: 'Clear focus' },
      { id: 'feedback', label: 'Instant feedback' },
      { id: 'action', label: 'Guided action' },
    ],
    steps: ['bar', 'copy', 'cards', 'cta', 'done'],
    interval: 560,
  },
];

/*
 * Ein Durchlauf ueber Zeitgeber statt Animationsframes: der Aufbau
 * kommt damit auch dann zu Ende, wenn der Renderer gedrosselt ist
 * oder der Tab im Hintergrund lag. Bei reduzierter Bewegung steht
 * sofort der Endzustand.
 */
function useSequence(steps, interval, reducedMotion) {
  const last = steps.length - 1;
  const skip = reducedMotion
    || (typeof document !== 'undefined' && document.visibilityState === 'hidden');
  const [index, setIndex] = useState(skip ? last : 0);

  useEffect(() => {
    if (skip) {
      setIndex(last);
      return undefined;
    }
    setIndex(0);
    const timers = steps.map((_, position) => window.setTimeout(
      () => setIndex(position),
      position * interval,
    ));
    return () => timers.forEach(window.clearTimeout);
  }, [interval, last, skip, steps]);

  return steps[Math.min(index, last)];
}

/* ------------------------------------------------------------------
 * Die Oberflaeche. Dieselben Bausteine in allen drei Zustaenden —
 * was sich aendert, steuern die beiden data-Attribute am Rahmen.
 * ------------------------------------------------------------------ */

function Surface({ mode, state }) {
  return (
    <div className="sys-canvas" data-mode={mode} data-state={state}>
      {/* Feine Hilfslinien wie auf einer Entwurfsflaeche. */}
      <span aria-hidden="true" className="sys-canvas__guides" />

      {/* Sehr feiner Ladepfad, nur im Performance-Zustand sichtbar. */}
      <span aria-hidden="true" className="sys-canvas__progress" />

      <div className="sys-page">
        <div className="sys-page__bar">
          <i className="sys-page__mark" />
          <span className="sys-page__nav"><i /><i /><i /></span>
          <span className="sys-page__burger"><i /><i /></span>
          <i className="sys-page__pill" />
        </div>

        <div className="sys-page__hero">
          <span className="sys-page__media" />
          <div className="sys-page__copy">
            <i className="sys-page__head" />
            <i className="sys-page__line" />
            <i className="sys-page__line" />
            <span className="sys-page__cta" />
          </div>
        </div>

        <div className="sys-page__cards">
          <span><em /><i /></span>
          <span><em /><i /></span>
          <span><em /><i /></span>
        </div>

        {/* Reaktion nach der Handlung — nur im letzten UX-Zustand. */}
        <div className="sys-page__reply">
          <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m3.5 8.4 3 3 6-6.8" /></svg>
          <em>Anfrage angekommen</em>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function WebSystemStage({ reducedMotion }) {
  const [index, setIndex] = useState(0);
  const tabRefs = useRef([]);
  const current = PILLARS[index];
  const state = useSequence(current.steps, current.interval, reducedMotion);

  const select = useCallback((next, moveFocus) => {
    const target = (next + PILLARS.length) % PILLARS.length;
    setIndex(target);

    const tab = tabRefs.current[target];
    if (!tab) return;
    if (moveFocus) tab.focus({ preventScroll: true });
    // Auf schmalen Displays ist die Auswahl eine Scrollleiste: die
    // aktive Kachel muss danach vollstaendig sichtbar sein.
    tab.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [reducedMotion]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      select(index + 1, true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      select(index - 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      select(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      select(PILLARS.length - 1, true);
    }
  };

  // Im Responsive-Zustand markiert die Messzeile den aktuellen Umbruch,
  // in den anderen beiden bleibt sie eine ruhige Aufzaehlung.
  const activeMeta = current.id === 'responsive' ? state : null;

  return (
    <section className="sc-experience__section sc-system">
      <ModuleHeading title="Ein System, das mitdenkt.">
        <p>
          Responsive Design, starke Performance und eine Nutzerführung, die sich
          selbstverständlich anfühlt.
        </p>
      </ModuleHeading>

      <div className="sc-system__grid">
        <div
          aria-label="Systemebene wählen"
          className="sc-system__rail"
          onKeyDown={handleKeyDown}
          role="tablist"
        >
          {PILLARS.map((pillar, pillarIndex) => (
            <button
              aria-controls={`sys-panel-${pillar.id}`}
              aria-label={`${pillar.num} ${pillar.label}`}
              aria-selected={pillarIndex === index}
              className={`sc-system__module${pillarIndex === index ? ' is-active' : ''}`}
              id={`sys-tab-${pillar.id}`}
              key={pillar.id}
              onClick={() => select(pillarIndex, false)}
              ref={(node) => { tabRefs.current[pillarIndex] = node; }}
              role="tab"
              tabIndex={pillarIndex === index ? 0 : -1}
              type="button"
            >
              <span aria-hidden="true" className="sc-system__num">{pillar.num}</span>
              <span aria-hidden="true" className="sc-system__icon"><Glyph name={pillar.icon} /></span>
              <span aria-hidden="true" className="sc-system__label">{pillar.label}</span>
              <span aria-hidden="true" className="sc-system__short">{pillar.short}</span>
              <span aria-hidden="true" className="sc-system__teaser">{pillar.teaser}</span>
            </button>
          ))}
        </div>

        <div
          aria-labelledby={`sys-tab-${current.id}`}
          className="sc-system__stage"
          id={`sys-panel-${current.id}`}
          role="tabpanel"
          tabIndex={0}
        >
          <div className="sys-stage">
            {/* Schmale Produktstatusleiste, mittig ueber der Flaeche. */}
            <p className="sys-stage__status">
              <span className="sys-stage__status-mode">
                <span className="sys-stage__status-icon"><Glyph name={current.icon} /></span>
                <b>{current.label}</b>
              </span>
              <span className="sys-stage__status-state">
                <span aria-hidden="true" className="sys-stage__status-dot" />
                {current.status}
              </span>
            </p>

            {/*
              Flacher Wechsel ohne mode="wait": aus- und einlaufende
              Oberflaeche liegen uebereinander und sind gleich lang. Ein
              stockender Exit kann den Wechsel dadurch nicht blockieren.
            */}
            <div className="sys-stage__frame">
              <AnimatePresence initial={false}>
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="sys-stage__layer"
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                  key={current.id}
                  transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: EASE }}
                >
                  <Surface mode={current.id} state={state} />
                </motion.div>
              </AnimatePresence>
            </div>

            <ul className="sys-stage__meta">
              {current.meta.map((item) => (
                <li
                  className={item.id === activeMeta ? 'is-active' : undefined}
                  key={item.id}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="sc-system__copy">
            <AnimatePresence initial={false}>
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="sc-system__copy-layer"
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                key={current.id}
                transition={{ duration: reducedMotion ? 0.01 : 0.44, delay: reducedMotion ? 0 : 0.06, ease: EASE }}
              >
                <h4>{current.title}</h4>
                <p>{current.body}</p>
                <ul className="sc-system__traits">
                  {current.traits.map((trait) => (
                    <li key={trait.label}>
                      <span className="sc-system__trait-icon"><Glyph name={trait.icon} /></span>
                      {trait.label}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
