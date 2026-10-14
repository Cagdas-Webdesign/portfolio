import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EASE, ModuleHeading } from '../shared.jsx';
import { useOnceInView } from './hooks.js';
import PhoneIcon from './icons.jsx';
import { GardenVisual, VerdeWordmark } from './verde.jsx';

/* ==================================================================
 * 10 — Measurement & Iteration
 *
 * Eine einzige, lesbare Geschichte: Signal → Hypothese → Aenderung →
 * naechste Version. Rechts dieselbe Landingpage als V1 und V2. Laeuft
 * die Geschichte durch, wechselt die Vorschau sichtbar auf V2: Vertrauen
 * und Projektbeispiel ruecken nach oben. Der Umschalter ist ein klar
 * beschrifteter Versions-Schalter. Keine Zahlen.
 * ================================================================== */

const STORY = [
  { id: 'signal', label: 'Signal', text: 'Viele Klicks, aber wenige Anfragen.' },
  { id: 'hypo', label: 'Hypothese', text: 'Das Creative weckt Interesse, aber die Landingpage schafft noch nicht genug Vertrauen.' },
  { id: 'change', label: 'Änderung', text: 'Projektbeispiel und Vertrauenselemente direkt unter den Einstieg holen.' },
  { id: 'next', label: 'Nächste Version', text: 'V2 geht live und wird gegen V1 beobachtet.' },
];

const STEP_MS = 1900; // jede Stufe bekommt Zeit

/*
 * Die Vorschau erzaehlt mit der Geschichte:
 *   Signal     → Markierung, wo Besucher die Seite verlassen
 *   Hypothese  → Vertrauen/Projekt stehen „zu spät“
 *   Aenderung  → beide bekommen einen Pfeil nach oben
 *   V2         → Bloecke ruecken hoch, markiert als „Neu in V2“
 */
function MiniLanding({ reducedMotion, stage, version }) {
  const v2 = version === 2;
  const late = !v2 && stage >= 2;
  const moving = !v2 && stage >= 3;
  const blocks = v2 ? ['hero', 'trust', 'project', 'services'] : ['hero', 'services', 'project', 'trust'];
  return (
    <div className="mk-it-lp" data-version={version}>
      <span className="mk-it-lp__url"><PhoneIcon name="lock" />verde-garten.de</span>
      <span className={`mk-it-lp__version${v2 ? ' is-v2' : ''}`}>
        {v2 ? 'V2 · Gezielte Verbesserung' : 'V1 · Erster Ansatz'}
      </span>
      {blocks.map((block) => (
        <motion.div
          className={`mk-it-lp__block is-${block}${v2 && (block === 'trust' || block === 'project') ? ' is-changed' : ''}${late && (block === 'trust' || block === 'project') ? ' is-late' : ''}`}
          key={block}
          layout
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: EASE }}
        >
          {block === 'hero' ? (
            <>
              <GardenVisual />
              <span className="mk-it-lp__shade" />
              <VerdeWordmark className="mk-it-lp__brand" sub={false} />
              <p>Ihr Garten. Neu gedacht.</p>
            </>
          ) : null}
          {block === 'services' ? <p className="mk-it-lp__rows"><i /><i /><i /></p> : null}
          {block === 'project' ? (
            <>
              <GardenVisual focusY={480} />
              <span className="mk-it-lp__label">Projektbeispiel</span>
            </>
          ) : null}
          {block === 'trust' ? (
            <>
              <q>Nach dem ersten Termin wussten wir, wie es wird.</q>
              <span className="mk-it-lp__checks"><PhoneIcon name="check" />Beratung vor Ort <PhoneIcon name="check" />Fester Ansprechpartner</span>
            </>
          ) : null}
          {v2 && (block === 'trust' || block === 'project') ? <em className="mk-it-lp__new">Neu in V2</em> : null}
          {late && (block === 'trust' || block === 'project') ? (
            <em className="mk-it-lp__new is-late">{moving ? '↑ nach oben' : 'zu spät'}</em>
          ) : null}
        </motion.div>
      ))}
      {!v2 && stage >= 1 ? (
        <motion.span
          animate={{ opacity: 1 }}
          className="mk-it-lp__drop"
          initial={{ opacity: 0 }}
          style={{ top: 238 }}
        >
          Hier verlassen viele die Seite
        </motion.span>
      ) : null}
    </div>
  );
}

export default function MarketingIteration({ reducedMotion }) {
  const [reached, setReached] = useState(reducedMotion ? STORY.length : 0);
  const [version, setVersion] = useState(reducedMotion ? 2 : 1);
  const timersRef = useRef([]);

  const clear = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  const play = useCallback(() => {
    clear();
    if (reducedMotion) {
      setReached(STORY.length);
      setVersion(2);
      return;
    }
    setReached(0);
    setVersion(1);
    STORY.forEach((_, index) => {
      timersRef.current.push(window.setTimeout(() => {
        setReached(index + 1);
        if (index === STORY.length - 1) setVersion(2);
      }, 300 + index * STEP_MS));
    });
  }, [reducedMotion]);

  const viewRef = useOnceInView(play, { threshold: 0.4 });
  useEffect(() => clear, []);

  return (
    <section className="sc-experience__section mk-iterate">
      <ModuleHeading eyebrow="10 — Measurement & Iteration" title="Veröffentlichen ist nicht das Ende.">
        <p>Wir veröffentlichen, beobachten, interpretieren, verändern und testen erneut.</p>
      </ModuleHeading>

      <div className="mk-it" ref={viewRef}>
        <ol className="mk-it__story">
          {STORY.map((item, index) => (
            <li className={index < reached ? 'is-lit' : ''} key={item.id}>
              <span aria-hidden="true" className="mk-it__dot">{index === STORY.length - 1 ? 'V2' : index + 1}</span>
              <small>{item.label}</small>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>

        <div className="mk-it__preview">
          <div aria-label="Landingpage-Version" className="mk-it__switch" role="group">
            {[1, 2].map((value) => (
              <button
                aria-pressed={version === value}
                className={version === value ? 'is-selected' : ''}
                key={value}
                onClick={() => { clear(); setReached(value === 1 ? 3 : STORY.length); setVersion(value); }}
                type="button"
              >
                {value === 1 ? 'V1 · Erster Ansatz' : 'V2 · Verbesserung'}
              </button>
            ))}
          </div>
          <LayoutGroup>
            <MiniLanding reducedMotion={reducedMotion} stage={reached} version={version} />
          </LayoutGroup>
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              animate={{ opacity: 1 }}
              className="mk-it__caption"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key={version}
            >
              {version === 1
                ? 'V1: Wer zweifelt, findet Beweise erst ganz unten.'
                : 'V2: Projekt und Vertrauen direkt nach dem Einstieg.'}
            </motion.p>
          </AnimatePresence>
          <button className="mk-ghost-button" onClick={play} type="button">
            <span aria-hidden="true">↻</span>
            Iteration erneut abspielen
          </button>
        </div>
      </div>
    </section>
  );
}
