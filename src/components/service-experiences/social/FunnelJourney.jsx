import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EASE, ModuleHeading } from '../shared.jsx';
import { MOBILE_QUERY, useMediaQuery, useOnceInView, useScrollProgress } from './hooks.js';
import PhoneIcon from './icons.jsx';
import { GardenVisual, VerdeWordmark } from './verde.jsx';

/* ==================================================================
 * 08 — Journey statt Trichter
 *
 * Die fuenf Touchpoints, die man vorher erlebt hat, als Reihe kleiner
 * Vorschauen. Eine Linie verbindet sie; beim ersten Sichtbarwerden laeuft
 * der Fortschritt einmal von Station zu Station und bleibt dann stehen.
 * Jede Station ist anklickbar. Handy: senkrecht und an den Scroll
 * gekoppelt — keine Autoplay-Sequenz.
 * ================================================================== */

const STATIONS = [
  { id: 'creative', name: 'Instagram Creative', goal: 'Aufmerksamkeit', text: 'Ein Motiv und ein Satz stoppen das Scrollen: „Aus Garten wird Lebensraum.“' },
  { id: 'landing', name: 'Landingpage', goal: 'Interesse', text: 'Dasselbe Bild, dieselbe Sprache. Die Seite erklärt, was VERDE konkret macht.' },
  { id: 'advisor', name: 'Gartenberater', goal: 'Vertrauen', text: 'Zwei kurze Fragen statt Formular. Der Besucher fühlt sich verstanden, nicht verkauft.' },
  { id: 'lead', name: 'Qualifizierter Lead', goal: 'Anfrage', text: 'Die Anfrage kommt mit Projekt, Fläche und nächstem Schritt an.' },
  { id: 'retarget', name: 'Retargeting', goal: 'Wiederansprache', text: 'Wer noch zögert, sieht später ein Vorher/Nachher und wird erneut erinnert.' },
];

const STEP_MS = 1900; // pro Station: Weg + Ruhephase

function Preview({ id }) {
  if (id === 'creative') {
    return (
      <div className="mk-jv mk-jv--ig">
        <GardenVisual />
        <span className="mk-jv__shade" />
        <VerdeWordmark className="mk-jv__brand" sub={false} />
        <p className="mk-jv__serif">Aus Garten wird Lebensraum.</p>
        <span className="mk-jv__bar">Gartenprojekt anfragen</span>
      </div>
    );
  }
  if (id === 'landing') {
    return (
      <div className="mk-jv mk-jv--lp">
        <GardenVisual />
        <span className="mk-jv__shade" />
        <span className="mk-jv__url"><PhoneIcon name="lock" />verde-garten.de</span>
        <p className="mk-jv__serif is-upper">Ihr Garten. Neu gedacht.</p>
        <span className="mk-jv__pill">Projekt besprechen</span>
      </div>
    );
  }
  if (id === 'advisor') {
    return (
      <div className="mk-jv mk-jv--chat">
        <span className="mk-jv__chat-head">✦ Gartenberater</span>
        <span className="mk-jv__bubble">Was möchten Sie verändern?</span>
        <span className="mk-jv__bubble is-user">Terrasse &amp; Außenbereich</span>
        <span className="mk-jv__bubble">Wie groß ist die Fläche?</span>
      </div>
    );
  }
  if (id === 'lead') {
    return (
      <div className="mk-jv mk-jv--lead">
        <span className="mk-jv__lead-head">Lead <b>Qualifiziert</b></span>
        <span><small>Projekt</small>Terrasse</span>
        <span><small>Fläche</small>100–300 m²</span>
        <span><small>Nächster Schritt</small>Aufmaß vor Ort</span>
      </div>
    );
  }
  return (
    <div className="mk-jv mk-jv--rt">
      <div className="mk-jv__split">
        <GardenVisual focusY={480} variant="before" />
        <GardenVisual focusY={480} />
      </div>
      <p className="mk-jv__serif">Noch am Planen?</p>
      <span className="mk-jv__bar">Beispielprojekt ansehen</span>
    </div>
  );
}

export default function FunnelJourney({ reducedMotion }) {
  const last = STATIONS.length - 1;
  const [active, setActive] = useState(reducedMotion ? last : 0);
  const [selected, setSelected] = useState(null);
  const timersRef = useRef([]);

  const clear = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const listRef = useRef(null);

  const run = useCallback(() => {
    if (isMobile) return;
    clear();
    if (reducedMotion) {
      setActive(last);
      return;
    }
    setActive(0);
    for (let index = 1; index <= last; index += 1) {
      timersRef.current.push(window.setTimeout(() => setActive(index), index * STEP_MS));
    }
  }, [isMobile, last, reducedMotion]);

  const viewRef = useOnceInView(run, { threshold: 0.35 });

  // Handy: jede Station erscheint erst, wenn weitergescrollt wird.
  const onScroll = useCallback((progress) => {
    listRef.current?.parentElement?.style.setProperty('--mk-jr-scroll', progress.toFixed(4));
    const next = Math.min(last, Math.floor(progress * (last + 0.999)));
    setActive((value) => (value === next ? value : next));
  }, [last]);
  useScrollProgress(listRef, onScroll, { enabled: isMobile, start: 'top 75%', end: 'bottom 70%' });
  useEffect(() => clear, []);

  const focus = selected ?? active;
  const station = STATIONS[focus];

  const choose = (index) => {
    clear();
    setSelected(index);
    setActive((value) => Math.max(value, index));
  };

  return (
    <section className="sc-experience__section mk-funnel">
      <ModuleHeading eyebrow="08 — Customer Journey" title="Eine Kampagne endet nicht beim Klick.">
        <p>
          Ein Mensch bewegt sich durch mehrere Touchpoints bis zur Anfrage und darüber hinaus.
          An jeder Station hat die Kommunikation eine andere Aufgabe.
        </p>
      </ModuleHeading>

      <div className="mk-jr" ref={viewRef} style={{ '--mk-jr-progress': (isMobile ? active : focus) / last }}>
        <span aria-hidden="true" className="mk-jr__line"><i /></span>
        <ol className="mk-jr__list" ref={listRef}>
          {STATIONS.map((item, index) => (
            <li
              className={`mk-jr__station${index <= active ? ' is-reached' : ''}${focus === index ? ' is-focus' : ''}`}
              key={item.id}
              style={{ '--i': index }}
            >
              <button aria-pressed={focus === index} onClick={() => choose(index)} type="button">
                <span className="mk-jr__frame"><Preview id={item.id} /></span>
                <span aria-hidden="true" className="mk-jr__dot" />
                <small>{item.name}</small>
                <strong>{item.goal}</strong>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div aria-live="polite" className="mk-jr__detail">
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
            key={station.id}
            transition={{ duration: reducedMotion ? 0.01 : 0.3, ease: EASE }}
          >
            <b>{station.name} · {station.goal}.</b> {station.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
