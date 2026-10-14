import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { EASE } from '../shared.jsx';
import CampaignPhone from './CampaignPhone.jsx';
import { MOBILE_QUERY, useMediaQuery, useStepLine, useStepSpy } from './hooks.js';
import useGardenAdvisor from './useGardenAdvisor.js';

/* ==================================================================
 * Kampagnen-Studio — Kapitel 03 bis 07 an EINEM Phone
 *
 *   03 Creative      Hook · Visual · Message · CTA
 *   04 Übergang      Klick → Landingpage im selben Phone
 *   05 Landingpage   Ankommen · Verstehen · Sehen
 *   06 Conversion    Message Match · Hierarchie · Trust · CTA
 *   07 Gartenberater Lead Qualification
 *
 * Links laufen die Kapitel, rechts (Handy: oben) steht das Phone sticky
 * innerhalb dieses Abschnitts. Jeder Schritt ist ein Zustand: Kreuzt er
 * die Aktivlinie, uebernimmt er — das Phone reagiert mit einer kurzen
 * Animation und bleibt dann stehen. Nichts wird an die Scrollposition
 * gekoppelt ("gescrubbt"). Jeder Schritt ist zusaetzlich ein Button, damit
 * sich die Zustaende auch per Tastatur erreichen lassen.
 * ================================================================== */

const STEP_STATE = {
  intro: { mode: 'ad', focus: 'none', section: 'hero' },
  hook: { mode: 'ad', focus: 'hook', section: 'hero' },
  visual: { mode: 'ad', focus: 'visual', section: 'hero' },
  message: { mode: 'ad', focus: 'message', section: 'hero' },
  cta: { mode: 'ad', focus: 'cta', section: 'hero' },
  click: { mode: 'landing', focus: 'none', section: 'hero' },
  'lp-hero': { mode: 'landing', focus: 'none', section: 'hero' },
  'lp-services': { mode: 'landing', focus: 'none', section: 'services' },
  'lp-proof': { mode: 'landing', focus: 'none', section: 'proof' },
  match: { mode: 'landing', focus: 'match', section: 'hero' },
  hierarchy: { mode: 'landing', focus: 'hierarchy', section: 'hero' },
  trust: { mode: 'landing', focus: 'trust', section: 'trust' },
  close: { mode: 'landing', focus: 'close', section: 'final' },
  advisor: { mode: 'landing', focus: 'none', section: 'hero', advisor: true },
};

const CHAPTERS = [
  {
    id: 'creative',
    number: '03',
    eyebrow: 'Paid Social Creative',
    title: 'Ein Motiv, das in Sekunden verstanden wird.',
    lead: 'Die Anzeige entsteht aus den Bausteinen der Marke. Jeder Baustein hat genau eine Aufgabe.',
    steps: [
      { id: 'hook', label: 'Hook', title: 'Aufmerksamkeit gewinnen.', text: '„Aus Garten wird Lebensraum.“ Ein Satz, der ein Bild im Kopf erzeugt, bevor weitergescrollt wird.' },
      { id: 'visual', label: 'Visual', title: 'Die Idee in Sekunden verständlich machen.', text: 'Terrasse, Licht, Architektur. Das Motiv zeigt das Ergebnis, nicht die Baustelle.' },
      { id: 'message', label: 'Message', title: 'Relevanz herstellen.', text: 'Planung, Bau und Pflege aus einer Hand. Genau die Sorge, die vor einem Gartenprojekt steht.' },
      { id: 'cta', label: 'CTA', title: 'Den nächsten Schritt eindeutig machen.', text: 'Ein Button, eine Handlung: „Gartenprojekt anfragen“.' },
    ],
  },
  {
    id: 'transition',
    number: '04',
    eyebrow: 'Vom Klick zur Seite',
    title: 'Der Klick ist nicht das Ziel.',
    lead: 'Creative und Landingpage müssen dieselbe Erwartung weiterführen – visuell, sprachlich und inhaltlich.',
    steps: [
      { id: 'click', label: 'Klick', kind: 'transition' },
    ],
  },
  {
    id: 'landing',
    number: '05',
    eyebrow: 'Landingpage',
    title: 'Eine Seite, die das Versprechen einlöst.',
    lead: 'Kurz, ruhig, hochwertig. Die Seite beantwortet die Fragen, die nach dem Klick entstehen.',
    steps: [
      { id: 'lp-hero', label: 'Ankommen', title: 'Ich bin hier richtig.', text: '„Ihr Garten. Neu gedacht.“ greift die Anzeige auf und macht daraus ein Angebot.' },
      { id: 'lp-services', label: 'Verstehen', title: 'Was genau passiert?', text: 'Planung, Umsetzung, Pflege. Drei Leistungen, klar getrennt, ohne Fachjargon.' },
      { id: 'lp-proof', label: 'Sehen', title: 'Was ist möglich?', text: 'Ein Vorher/Nachher und ausgewählte Projekte zeigen Qualität, statt sie zu behaupten.' },
    ],
  },
  {
    id: 'conversion',
    number: '06',
    eyebrow: 'Conversion Design',
    title: 'Conversion entsteht durch Klarheit, nicht durch Druck.',
    lead: 'Vier Prinzipien, sichtbar an derselben Seite.',
    steps: [
      { id: 'match', label: 'Message Match', title: 'Das Versprechen geht weiter.', text: 'Die Landingpage führt das Versprechen der Anzeige weiter: gleiches Motiv, gleiche Sprache.', kind: 'match' },
      { id: 'hierarchy', label: 'Hierarchie', title: 'Eine klare Hauptbotschaft.', text: 'Eine Headline, ein Satz, ein Button. Alles andere tritt zurück.' },
      { id: 'trust', label: 'Trust', title: 'Proof dort, wo Zweifel entstehen.', text: 'Kurz vor der Entscheidung: eine Stimme aus einem Projekt und drei konkrete Zusagen.' },
      { id: 'close', label: 'CTA', title: 'Ein eindeutiger nächster Schritt.', text: 'Am Ende dieselbe Handlung wie oben. Keine zweite Option, die ablenkt.' },
    ],
  },
  {
    id: 'advisor',
    number: '07',
    eyebrow: 'Lead Qualification',
    title: 'Nicht jede Anfrage braucht ein langes Formular.',
    lead: 'Der Gartenberater stellt zwei Fragen und ordnet das Projekt ein, bevor jemand anfragt. Probier ihn im Phone aus.',
    steps: [
      { id: 'advisor', label: 'Gartenberater', title: 'Zwei Fragen statt zwölf Felder.', text: 'Lokal und regelbasiert. So kommt die Anfrage mit Kontext an, und der Besucher weiß, was als Nächstes passiert.', kind: 'advisor' },
    ],
  },
];

const LEAD_STATUS = {
  visitor: { index: 0, label: 'Offen' },
  interested: { index: 1, label: 'In Einordnung' },
  qualified: { index: 2, label: 'Qualifiziert' },
  ready: { index: 3, label: 'Anfrage bereit' },
};

function TransitionDetail({ onReplay }) {
  return (
    <div className="mk-step__extra mk-transition">
      <button className="mk-ghost-button" onClick={onReplay} type="button">
        <span aria-hidden="true">↻</span>
        Übergang wiederholen
      </button>
    </div>
  );
}

/*
 * Conversion-Logik ruhig erzaehlt: pro Prinzip eine Wirkung und ein Satz.
 * Keine Punkte-Grafik — eine Aussage pro Scrollmoment.
 */
const CONVERSION_NOTES = {
  match: { effect: 'Wirkt auf Aufmerksamkeit', note: 'Anzeige und Seite sprechen denselben Satz. Niemand muss sich neu orientieren.' },
  hierarchy: { effect: 'Wirkt auf Relevanz', note: 'Eine Headline, ein Satz, ein Button. Der Blick hat genau einen Weg.' },
  trust: { effect: 'Nimmt Reibung', note: 'Der Zweifel „Können die das?“ wird beantwortet, bevor er bremst.' },
  close: { effect: 'Führt zur Anfrage', note: 'Dieselbe Handlung wie oben. Danach übernimmt der Gartenberater.' },
};

function ConversionNote({ id }) {
  const { effect, note } = CONVERSION_NOTES[id];
  return (
    <p className="mk-step__extra mk-cnote">
      <span>{effect}</span>
      {note}
    </p>
  );
}

function LeadProfile({ advisor, isMobile }) {
  const { answers, current, choose, reset, status } = advisor;
  const level = LEAD_STATUS[status];
  const project = answers.project;

  return (
    <div className="mk-step__extra mk-lead">
      <ol aria-label="Vom Besuch zur Anfrage" className="mk-lead__path">
        {[
          ['Kampagne', 'Anzeige geklickt', true],
          ['Landingpage', 'Angebot verstanden', true],
          ['Gartenberater', 'Fragen beantwortet', level.index >= 1],
          ['Qualifizierte Anfrage', 'Mit Kontext', level.index >= 2],
        ].map(([label, sub, lit]) => (
          <li className={lit ? 'is-lit' : ''} key={label}>
            <i aria-hidden="true" />
            <strong>{label}</strong>
            <small>{sub}</small>
          </li>
        ))}
      </ol>

      {/* Handy: grosse Antwortflaechen direkt unter dem kleinen Phone. */}
      {isMobile && current ? (
        <div aria-label={current.text} className="mk-lead__answers" role="group">
          <p>{current.text}</p>
          {current.options.map((option) => (
            <button key={option.id} onClick={() => choose(current.id, option)} type="button">
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mk-lead__card" aria-live="polite">
        <header>
          <span>Lead-Profil</span>
          <b data-status={status}>{level.label}</b>
        </header>
        <dl>
          {[
            ['Projekt', project?.short],
            ['Fläche', answers.size?.label],
            ['Interesse', project?.interest],
            ['Status', status === 'visitor' ? null : level.label],
            ['Nächster Schritt', answers.size ? project.next : null],
          ].map(([label, value]) => (
            <div className={value ? 'is-filled' : ''} key={label}>
              <dt>{label}</dt>
              <dd>
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    initial={{ opacity: 0, y: 6 }}
                    key={value || 'empty'}
                    transition={{ duration: 0.28, ease: EASE }}
                  >
                    {value || <i>wird erfragt …</i>}
                  </motion.span>
                </AnimatePresence>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {status !== 'visitor' ? (
        <button className="mk-ghost-button" onClick={reset} type="button">
          <span aria-hidden="true">↻</span>
          Gespräch zurücksetzen
        </button>
      ) : null}
    </div>
  );
}

export default function CampaignStudio({ reducedMotion }) {
  const [step, setStep] = useState('intro');
  const [replayToken, setReplayToken] = useState(0);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const chaptersRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const advisor = useGardenAdvisor(reducedMotion);

  const state = STEP_STATE[step];
  // Der Launcher gehoert zur Landingpage; geoeffnet wird erst im Kapitel 07.
  const advisorVisible = state.mode === 'landing';

  const activate = useCallback((next) => {
    setStep(next);
    // Der Berater oeffnet sich, sobald sein Kapitel uebernimmt, und
    // schliesst sich wieder, wenn man es verlaesst.
    setAdvisorOpen(Boolean(STEP_STATE[next]?.advisor));
  }, []);

  // Handy: Das Phone belegt oben rund zwei Drittel. Ein Schritt ist aktiv,
  // solange er den Lesebereich darunter durchlaeuft — Linie weit unten,
  // Schritthoehe (22svh, CSS) passend zum freien Bereich.
  // Handy: Fortschritt im Schritt → Seite im Phone gleitet zum naechsten Anker.
  const scrubRef = useRef(null);
  const onProgress = useCallback((id, progress) => {
    const order = Object.keys(STEP_STATE);
    const from = STEP_STATE[id];
    const next = STEP_STATE[order[order.indexOf(id) + 1]];
    if (!from || !next || from.mode !== 'landing' || next.mode !== 'landing' || next.advisor) return;
    scrubRef.current?.(from.section, next.section, progress);
  }, []);

  useStepSpy(chaptersRef, activate, {
    line: isMobile ? '82%' : '55%',
    rebuildKey: isMobile,
    onProgress: isMobile ? onProgress : undefined,
  });

  // Orange Fortschrittslinie links — dieselbe Aktivlinie wie der Step-Spy.
  useStepLine(chaptersRef, { line: isMobile ? '82%' : '55%', rebuildKey: isMobile });

  const replay = () => {
    activate('click');
    setReplayToken((value) => value + 1);
  };

  return (
    <section className="sc-experience__section mk-studio" aria-label="Kampagne: Creative, Landingpage und Conversion">
      <div className="mk-studio__device">
        <CampaignPhone
          advisor={advisor}
          advisorOpen={Boolean(state.advisor) && advisorOpen}
          advisorVisible={advisorVisible}
          focus={state.focus}
          mode={state.mode}
          onAdvisorClose={() => setAdvisorOpen(false)}
          onAdvisorOpen={() => setAdvisorOpen(true)}
          reducedMotion={reducedMotion}
          replayToken={replayToken}
          scrubRef={scrubRef}
          section={state.section}
          started={step !== 'intro'}
        />
      </div>

      <div className="mk-studio__chapters" ref={chaptersRef}>
        {CHAPTERS.map((chapter) => (
          <div className={`mk-chapter mk-chapter--${chapter.id}`} key={chapter.id}>
            <header className="sc-module-heading mk-chapter__head">
              <span>{chapter.number} — {chapter.eyebrow}</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.lead}</p>
            </header>

            <ol className="mk-steps">
              {chapter.steps.map((item, index) => {
                const active = step === item.id;
                return (
                  <li
                    className={`mk-step${active ? ' is-active' : ''}${item.kind ? ` mk-step--${item.kind}` : ''}`}
                    data-step={item.id}
                    key={item.id}
                  >
                    {item.kind === 'transition' ? null : (
                    <button
                      aria-current={active ? 'step' : undefined}
                      className="mk-step__trigger"
                      onClick={() => activate(item.id)}
                      type="button"
                    >
                      <span className="mk-step__index" aria-hidden="true">
                        {`${Number(chapter.number)}.${index + 1}`}
                      </span>
                      <span className="mk-step__label">{item.label}</span>
                      <strong className="mk-step__title">{item.title}</strong>
                      <span className="mk-step__text">{item.text}</span>
                    </button>
                    )}
                    {item.kind === 'transition' ? <TransitionDetail onReplay={replay} /> : null}
                    {CONVERSION_NOTES[item.id] ? <ConversionNote id={item.id} /> : null}
                    {item.kind === 'advisor' ? <LeadProfile advisor={advisor} isMobile={isMobile} /> : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
