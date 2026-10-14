import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EASE, Glyph, ModuleHeading, SegmentedControl } from './shared.jsx';

gsap.registerPlugin(ScrollTrigger);

/* ==================================================================
 * Pop-up 5 — SEO & Performance
 *
 * Ein Website-Diagnose-Labor in vier Kapiteln:
 *
 *   1  Diagnostic      — vier Bereiche werden nacheinander geprueft
 *   2  Suche & Lesart  — Suchvorschau live, Mensch vs. Suchsystem
 *   3  Performance     — Ladereihenfolge vorher / optimiert
 *   4  Grundlagen      — Technik, Inhalt, Autoritaet und Priorisierung
 *
 * Bewusst ohne Score, Ranking-Positionen oder erfundene Messwerte:
 * Befunde bleiben getrennt und werden qualitativ eingeordnet
 * (klar / pruefen / priorisieren). Alles ist ein illustratives Beispiel.
 * ================================================================== */

const STATUS = {
  klar: { label: 'klar', mark: '✓' },
  pruefen: { label: 'prüfen', mark: '•' },
  priorisieren: { label: 'priorisieren', mark: '!' },
};

/* ------------------------------------------------------------------
 * Kapitel 1 — Diagnostic
 *
 * Die sieben frueheren Signale sind in vier Bereiche einsortiert
 * (Ladezeit → Bildauslieferung, Core Web Vitals → Layout-Stabilitaet,
 * Metadaten → Seitentitel/Meta-Angaben usw.). Jeder Bereich markiert beim
 * Pruefen die passende Stelle der Beispielseite links.
 * ------------------------------------------------------------------ */

const DIAGNOSTIC = [
  {
    id: 'structure',
    icon: 'layers',
    name: 'Struktur',
    question: 'Ist die Seite logisch aufgebaut?',
    checks: [
      ['H1 & Hierarchie', 'priorisieren'],
      ['Interne Wege', 'pruefen'],
      ['Semantischer Aufbau', 'klar'],
      ['Mobile Darstellung', 'klar'],
    ],
  },
  {
    id: 'content',
    icon: 'type',
    name: 'Inhalt',
    question: 'Wird klar, wofür die Seite da ist?',
    checks: [
      ['Seitentitel', 'pruefen'],
      ['Beschreibung', 'klar'],
      ['Suchintention', 'klar'],
      ['Verständlichkeit', 'klar'],
    ],
  },
  {
    id: 'performance',
    icon: 'gauge',
    name: 'Performance',
    question: 'Kommt das Wichtige zuerst?',
    checks: [
      ['Bildauslieferung', 'priorisieren'],
      ['JavaScript', 'pruefen'],
      ['Layout-Stabilität', 'klar'],
      ['Ladepriorität', 'pruefen'],
    ],
  },
  {
    id: 'index',
    icon: 'scanSearch',
    name: 'Indexierbarkeit',
    question: 'Kommen Suchsysteme überall hin?',
    checks: [
      ['Technische Erreichbarkeit', 'klar'],
      ['Meta-Angaben', 'klar'],
      ['Crawlbare Navigation', 'klar'],
      ['Lesbarer Inhalt', 'klar'],
    ],
  },
];

const DIAG_TOTAL = DIAGNOSTIC.reduce((sum, area) => sum + area.checks.length, 0);

const PREVIEW_VIEWS = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'mobile', label: 'Mobil' },
  { id: 'outline', label: 'Struktur' },
];

// Ruhiger Takt: Bereich wird aktiv, Befunde erscheinen einzeln, kurze Pause.
const AREA_LEAD_MS = 320;
const CHECK_MS = 400;
const AREA_PAUSE_MS = 420;

/*
 * Startet genau einmal pro Mount, sobald rund 40 % sichtbar sind; danach
 * trennt sich der Beobachter. Kein Scroll-Listener, keine Schleife.
 */
function useOnceInView(onEnter, enabled) {
  const ref = useRef(null);
  const callbackRef = useRef(onEnter);
  useEffect(() => {
    callbackRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      callbackRef.current();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}

/* ------------------------------------------------------------------
 * Handy: Sticky-Vorschau + Scroll-Spy
 *
 * Nur wo die Bereiche gestapelt sind (< 900px). Die Vorschau bleibt per
 * position: sticky im Scroll-Container des Pop-ups stehen; ScrollTrigger
 * erkennt, welcher Eintrag gerade die Aktivlinie (62 % der Popup-Hoehe,
 * also mittig im freien Bereich unter der Vorschau) kreuzt. Es wird nie
 * gescrollt, nur Zustand gesetzt.
 * ------------------------------------------------------------------ */

const MOBILE_QUERY = '(max-width: 899px)';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function useScrollSpy(enabled, rootRef, selector, onChange, rebuildKey) {
  const callbackRef = useRef(onChange);
  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return undefined;
    const scroller = root.closest('.sc-experience__scroll');
    if (!scroller) return undefined;

    let triggers = [];
    const timers = [];
    const images = [];
    // Nur die eigenen Trigger neu vermessen: ein globales refresh() wuerde
    // bei gesperrter Seite (Pop-up offen) die Seiten-Trigger verrechnen.
    const refresh = () => triggers.forEach((trigger) => trigger.refresh());

    const build = (attempt = 0) => {
      const items = [...root.querySelectorAll(selector)];
      // Die Liste kann erst nach einer Einblendung erscheinen — kurz warten.
      if (!items.length && attempt < 12) {
        timers.push(window.setTimeout(() => build(attempt + 1), 150));
        return;
      }
      triggers = items.map((item) => ScrollTrigger.create({
        trigger: item,
        scroller,
        start: 'top 62%',
        end: 'bottom 62%',
        onToggle: (self) => {
          if (self.isActive) callbackRef.current(item.dataset.spy);
        },
      }));
      timers.push(window.setTimeout(refresh, 500), window.setTimeout(refresh, 1500));
      scroller.querySelectorAll('img').forEach((image) => {
        if (image.complete) return;
        image.addEventListener('load', refresh, { once: true });
        images.push(image);
      });
    };
    build();

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      timers.forEach(window.clearTimeout);
      images.forEach((image) => image.removeEventListener('load', refresh));
    };
  }, [enabled, rebuildKey, rootRef, selector]);
}

/* Kurze, einmalige Reaktion der Vorschau — kein Loop, danach Ruhe. */
function pulse(container, selectors) {
  if (!container) return;
  const targets = container.querySelectorAll(selectors.join(','));
  if (!targets.length) return;
  gsap.fromTo(
    targets,
    { scale: 0.965, opacity: 0.7, y: 2 },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
      stagger: 0.04,
      clearProps: 'transform,opacity',
    },
  );
}

// Welche Stellen der Beispielseite pro Bereich kurz reagieren.
const DIAG_PULSE = {
  structure: ['.sc-seo-site__copy em', '.sc-seo-site__nav b', '.sc-seo-site__cards em', '.sc-seo-outline [data-area="structure"]'],
  content: ['.sc-seo-site__copy i', '.sc-seo-site__cards span', '.sc-seo-outline [data-area="content"]'],
  performance: ['.sc-seo-site__media'],
  index: ['.sc-seo-site__nav i', '.sc-seo-site__cards span', '.sc-seo-outline [data-area="index"]'],
};

function StatusChip({ status }) {
  const meta = STATUS[status];
  return (
    <span className="sc-seo-status" data-status={status}>
      <i aria-hidden="true">{meta.mark}</i>
      {meta.label}
    </span>
  );
}

/* Die Beispielseite. data-area verbindet Stellen der Seite mit Bereichen. */
function SitePreview({ view, focus }) {
  if (view === 'outline') {
    return (
      <div className="sc-seo-outline" data-focus={focus}>
        <p data-area="structure"><span>H1</span><strong>Webdesign für klare digitale Angebote</strong></p>
        <div>
          <p data-area="structure"><span>H2</span><strong>Leistungen im Überblick</strong></p>
          <small data-area="content">Nutzen · Beispiele · Link zur Vertiefung</small>
          <p data-area="structure"><span>H2</span><strong>So läuft ein Projekt ab</strong></p>
          <small data-area="index">Ablauf · Antworten · Kontakt</small>
          <p data-area="structure"><span>H3</span><strong>Häufige Fragen zur Umsetzung</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className={`sc-seo-site${view === 'mobile' ? ' is-mobile' : ''}`} data-focus={focus}>
      <div className="sc-seo-site__nav" data-area="index" data-label="Navigation">
        <b />
        <span><i /><i /><i /></span>
      </div>
      <div className="sc-seo-site__hero">
        <div className="sc-seo-site__copy" data-area="structure" data-label="Überschriften">
          <em />
          <i />
          <i />
          <u />
        </div>
        <div className="sc-seo-site__media" data-area="performance" data-label="Hero-Bild" />
      </div>
      <div className="sc-seo-site__cards" data-area="content" data-label="Inhalte">
        <span><em /><i /><i /></span>
        <span><em /><i /><i /></span>
        <span><em /><i /><i /></span>
      </div>
    </div>
  );
}

function DiagnosticSection({ reducedMotion }) {
  const [view, setView] = useState('desktop');
  const [revealed, setRevealed] = useState(reducedMotion ? DIAG_TOTAL : 0);
  const [activeArea, setActiveArea] = useState(null);
  const [phase, setPhase] = useState(reducedMotion ? 'done' : 'ready');
  const timersRef = useRef([]);
  const startedRef = useRef(false);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [scrollFocus, setScrollFocus] = useState(null);
  const areasRef = useRef(null);
  const frameRef = useRef(null);

  const clearTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  useScrollSpy(isMobile, areasRef, '.sc-seo-area', setScrollFocus, 'diag');

  const run = useCallback(() => {
    startedRef.current = true;
    clearTimers();
    if (reducedMotion) {
      setRevealed(DIAG_TOTAL);
      setActiveArea(null);
      setPhase('done');
      return;
    }
    setRevealed(0);
    setPhase('running');
    const at = (delay, fn) => timersRef.current.push(window.setTimeout(fn, delay));
    let time = 200;
    let count = 0;
    DIAGNOSTIC.forEach((area) => {
      at(time, () => setActiveArea(area.id));
      time += AREA_LEAD_MS;
      area.checks.forEach(() => {
        count += 1;
        const next = count;
        time += CHECK_MS;
        at(time, () => setRevealed(next));
      });
      time += AREA_PAUSE_MS;
    });
    at(time, () => {
      setActiveArea(null);
      setPhase('done');
    });
  }, [reducedMotion]);

  const boardRef = useOnceInView(() => {
    if (!startedRef.current) run();
  }, !reducedMotion);

  // Waehrend der automatischen Pruefung fuehrt sie; danach (und auf dem
  // Handy beim Scrollen) der Bereich, den man gerade liest.
  const focus = activeArea ?? (isMobile ? scrollFocus : null) ?? 'none';

  useEffect(() => {
    if (!isMobile || reducedMotion || focus === 'none') return;
    pulse(frameRef.current, DIAG_PULSE[focus] ?? []);
  }, [focus, isMobile, reducedMotion]);

  let offset = 0;
  const areas = DIAGNOSTIC.map((area) => {
    const start = offset;
    offset += area.checks.length;
    const shown = Math.max(0, Math.min(area.checks.length, revealed - start));
    let state = 'waiting';
    if (activeArea === area.id) state = 'active';
    else if (shown === area.checks.length) state = 'done';
    return { ...area, shown, state };
  });

  const counts = { klar: 0, pruefen: 0, priorisieren: 0 };
  areas.forEach((area) => area.checks.slice(0, area.shown).forEach(([, status]) => { counts[status] += 1; }));

  const current = areas.find((area) => area.state === 'active');
  let progress = 'Bereit';
  if (phase === 'running' && current) progress = `Prüft: ${current.name}`;
  if (phase === 'done') progress = `${DIAGNOSTIC.length} Bereiche geprüft`;

  let announcement = '';
  if (phase === 'running') announcement = 'Prüfung läuft.';
  if (phase === 'done' && !reducedMotion) announcement = `Prüfung abgeschlossen: ${counts.priorisieren} priorisieren, ${counts.pruefen} prüfen, ${counts.klar} klar.`;

  return (
    <section className="sc-experience__section sc-seo-diag">
      <ModuleHeading title="Was eine Seite stark macht.">
        <p>
          Vier Bereiche, einzeln geprüft statt zu einer Punktzahl vermischt. Jeder Befund
          wird eingeordnet: klar, prüfen oder priorisieren.
        </p>
      </ModuleHeading>

      <div className="sc-seo-diag__board" ref={boardRef}>
        <header className="sc-seo-diag__bar">
          <span className="sc-seo-diag__url">
            <i aria-hidden="true" className={`is-${phase}`} />
            <b>demo-website.de</b>
            <em>Illustratives Beispiel</em>
          </span>
          <span className="sc-seo-diag__progress">{progress}</span>
        </header>

        <div className="sc-seo-diag__body">
          <div className="sc-seo-diag__preview">
            <SegmentedControl
              items={PREVIEW_VIEWS}
              label="Prüfansicht wählen"
              onSelect={setView}
              selected={view}
            />
            <div className="sc-seo-diag__frame" data-view={view} ref={frameRef}>
              <SitePreview focus={focus} view={view} />
            </div>
          </div>

          <ul className="sc-seo-diag__areas" ref={areasRef}>
            {areas.map((area) => (
              <li
                className={`sc-seo-area${isMobile && focus === area.id ? ' is-in-view' : ''}`}
                data-spy={area.id}
                data-state={area.state}
                key={area.id}
              >
                <header>
                  <Glyph name={area.icon} />
                  <b>{area.name}</b>
                  <span className="sc-seo-area__state">
                    {area.state === 'active' ? 'prüft …' : area.state === 'done' ? 'geprüft' : 'wartet'}
                  </span>
                </header>
                <p className="sc-seo-area__question">{area.question}</p>
                <ul>
                  {area.checks.map(([label, status], index) => (
                    <li className={index < area.shown ? 'is-shown' : undefined} key={label}>
                      <span>{label}</span>
                      {index < area.shown ? <StatusChip status={status} /> : <span className="sc-seo-status is-pending">–</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <footer className="sc-seo-diag__foot">
          <p className="sc-seo-diag__summary">
            <span><StatusChip status="priorisieren" /> {counts.priorisieren}</span>
            <span><StatusChip status="pruefen" /> {counts.pruefen}</span>
            <span><StatusChip status="klar" /> {counts.klar}</span>
          </p>
          {reducedMotion ? null : (
            <button
              aria-disabled={phase === 'running'}
              className="sc-seo-diag__replay"
              onClick={() => { if (phase !== 'running') run(); }}
              type="button"
            >
              <Glyph name="loop" />
              {phase === 'ready' && 'Prüfung starten'}
              {phase === 'running' && 'Prüfung läuft …'}
              {phase === 'done' && 'Erneut prüfen'}
            </button>
          )}
        </footer>
        <p aria-live="polite" className="sc-sr-only">{announcement}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Kapitel 2 — Suchvorschau und Lesart
 * ------------------------------------------------------------------ */

const GENERIC_TITLES = ['startseite', 'home', 'willkommen', 'welcome'];

function words(text) {
  return new Set(text.toLowerCase().match(/[a-zäöüß]{5,}/g) ?? []);
}

/* Qualitative Hinweise — nachvollziehbare Regeln, keine Punktzahl. */
function searchHints(title, description) {
  const cleanTitle = title.trim();
  const generic = GENERIC_TITLES.some((word) => cleanTitle.toLowerCase().includes(word));
  const titleWords = words(cleanTitle);
  const shared = [...words(description)].some((word) => titleWords.has(word));
  return [
    {
      id: 'title',
      label: 'Titel klar',
      ok: cleanTitle.length >= 25 && cleanTitle.length <= 62 && !generic,
      hint: generic ? 'Allgemeine Wörter wie „Startseite“ sagen nichts über das Angebot.' : 'Rund 25–60 Zeichen, das Angebot zuerst.',
    },
    {
      id: 'description',
      label: 'Beschreibung konkret',
      ok: description.trim().length >= 70 && description.trim().length <= 155,
      hint: 'Ein bis zwei Sätze, die Nutzen und Kontext erklären.',
    },
    {
      id: 'intent',
      label: 'Thema durchgängig',
      ok: shared,
      hint: 'Titel und Beschreibung greifen dasselbe Thema auf.',
    },
  ];
}

const LENS_VIEWS = [
  { id: 'human', label: 'Was Besucher sehen' },
  { id: 'crawler', label: 'Was die Suchmaschine liest' },
];

/* Fundstellen in der Handy-Vorschau: welches Element zu welchem Befund. */
const LENS_PULSE = {
  1: ['.sc-seo-mini__title'],
  2: ['.sc-seo-mini__head'],
  3: ['.sc-seo-mini__image'],
  4: ['.sc-seo-mini__nav'],
  5: ['.sc-seo-mini__head', '.sc-seo-mini__image'],
};

function LensMini({ lens, pin }) {
  const hit = (pins) => (pin && pins.includes(pin) ? ' is-hit' : '');
  const badge = (value) => (lens === 'crawler' ? <b aria-hidden="true" className={pin === value ? 'is-hit' : undefined}>{value}</b> : null);
  return (
    <div aria-hidden="true" className="sc-seo-mini" data-mode={lens}>
      <span className={`sc-seo-mini__title${hit([1])}`}>{badge(1)}atelier-nord.de</span>
      <span className={`sc-seo-mini__nav${hit([4])}`}>{badge(4)}<i /><i /><i /></span>
      <span className="sc-seo-mini__visual">
        <span className={`sc-seo-mini__head${hit([2, 5])}`}>{badge(2)}Handwerk<br />mit Haltung.</span>
        <span className={`sc-seo-mini__image${hit([3, 5])}`}>{badge(3)}{badge(5)}</span>
      </span>
    </div>
  );
}

const CRAWLER_FINDINGS = [
  { pin: 1, tag: '<title>', value: 'Startseite – Willkommen', status: 'unklar', note: 'Sagt nichts über Angebot oder Ort.' },
  { pin: 2, tag: '<h1>', value: 'nicht vorhanden', status: 'fehlt', note: 'Die Hauptaussage steckt in einer Grafik.' },
  { pin: 3, tag: 'alt', value: 'alt=""', status: 'fehlt', note: 'Das zentrale Motiv bleibt ohne Beschreibung.' },
  { pin: 4, tag: '<nav>', value: 'erst nach JavaScript', status: 'schwer erreichbar', note: 'Wege durch die Seite sind nicht sofort da.' },
  { pin: 5, tag: 'Text', value: 'als Bild eingebettet', status: 'nicht lesbar', note: 'Für Suchsysteme schlicht unsichtbar.' },
];

function SearchSection({ reducedMotion }) {
  const [title, setTitle] = useState('Webdesign für klare digitale Angebote');
  const [description, setDescription] = useState(
    'Konzept, Gestaltung und Entwicklung für digitale Angebote, die man sofort versteht – und die schnell laden.',
  );
  const [lens, setLens] = useState('human');
  const hints = searchHints(title, description);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [activePin, setActivePin] = useState(null);
  const stageRef = useRef(null);
  const dockRef = useRef(null);

  useScrollSpy(
    isMobile && lens === 'crawler',
    stageRef,
    '.sc-seo-lens__findings > li',
    (value) => setActivePin(Number(value)),
    lens,
  );

  useEffect(() => {
    if (lens !== 'crawler') setActivePin(null);
  }, [lens]);

  useEffect(() => {
    if (!isMobile || reducedMotion || !activePin) return;
    pulse(dockRef.current, [...(LENS_PULSE[activePin] ?? []), '.sc-seo-mini b.is-hit']);
  }, [activePin, isMobile, reducedMotion]);

  return (
    <section className="sc-experience__section sc-seo-search">
      <ModuleHeading title="Relevanz beginnt schon vor dem Klick.">
        <p>
          Titel und Beschreibung entscheiden nicht allein über Sichtbarkeit. Aber sie zeigen
          schon im Suchergebnis, ob eine Seite zur Anfrage passt.
        </p>
      </ModuleHeading>

      <div className="sc-seo-serp">
        <form className="sc-seo-serp__form" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="seo-title">
            <span>Seitentitel</span>
            <input
              id="seo-title"
              maxLength={70}
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
            <small>{title.length} Zeichen · sinnvoll bis etwa 60</small>
          </label>
          <label htmlFor="seo-description">
            <span>Beschreibung</span>
            <textarea
              id="seo-description"
              maxLength={170}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              value={description}
            />
            <small>{description.length} Zeichen · sinnvoll bis etwa 155</small>
          </label>
        </form>

        <div className="sc-seo-serp__preview">
          <span className="sc-seo-serp__caption">Suchvorschau · Beispiel</span>
          <div className="sc-seo-serp__result">
            <span className="sc-seo-serp__site">
              <i aria-hidden="true" />
              <span>
                <b>Demo Website</b>
                <small>demo-website.de › leistungen › webdesign</small>
              </span>
            </span>
            <strong>{title.trim() || 'Seitentitel ergänzen'}</strong>
            <p>{description.trim() || 'Eine verständliche Beschreibung ergänzt Nutzen und Kontext.'}</p>
          </div>
          <ul className="sc-seo-serp__hints">
            {hints.map((hint) => (
              <li data-ok={hint.ok} key={hint.id}>
                <StatusChip status={hint.ok ? 'klar' : 'pruefen'} />
                <span>
                  <b>{hint.label}</b>
                  <small>{hint.hint}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sc-seo-lens">
        <div className="sc-seo-lens__intro">
          <ModuleHeading title="Schön aussehen reicht nicht, wenn die Struktur unsichtbar bleibt.">
            <p>
              Menschen erleben Gestaltung. Suchsysteme brauchen zusätzlich eine Struktur, die
              sie zuverlässig lesen und einordnen können.
            </p>
          </ModuleHeading>
          <SegmentedControl
            items={LENS_VIEWS}
            label="Perspektive wechseln"
            onSelect={setLens}
            selected={lens}
          />
        </div>

        {/* Handy: Tabs und kompakte Vorschau als gemeinsamer Sticky-Block.
            Auf Desktop ausgeblendet — dort gelten Tab-Leiste und Buehne oben. */}
        <div className="sc-seo-lens__dock" ref={dockRef}>
          <SegmentedControl
            items={LENS_VIEWS}
            label="Perspektive wechseln"
            onSelect={setLens}
            selected={lens}
          />
          <LensMini lens={lens} pin={activePin} />
        </div>

        <div
          aria-label={lens === 'human' ? 'Besucheransicht der Beispielseite' : 'Lesart eines Suchsystems'}
          className={`sc-seo-lens__stage is-${lens}`}
          ref={stageRef}
          role="region"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="sc-seo-lens__view"
              exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              key={lens}
              transition={{ duration: reducedMotion ? 0.01 : 0.32, ease: EASE }}
            >
              {lens === 'human' ? (
                <div aria-hidden="true" className="sc-seo-lens__human">
                  <header><strong>atelier-nord.de</strong><span /><span /><span /></header>
                  <div className="sc-seo-lens__art">
                    <em>Handwerk<br />mit Haltung.</em>
                  </div>
                  <footer>
                    <span>Starke Marke</span>
                    <span>Stimmiges Licht</span>
                    <span>Klare Bildsprache</span>
                  </footer>
                </div>
              ) : (
                <div className="sc-seo-lens__crawler">
                  <div aria-hidden="true" className="sc-seo-lens__wire">
                    <span className="is-title"><b>1</b></span>
                    <span className="is-nav"><b>4</b></span>
                    <span className="is-art"><b>2</b><b>3</b><b>5</b></span>
                    <span className="is-foot" />
                  </div>
                  <ol className="sc-seo-lens__findings">
                    {CRAWLER_FINDINGS.map((finding) => (
                      <li
                        className={isMobile && activePin === finding.pin ? 'is-in-view' : undefined}
                        data-spy={finding.pin}
                        key={finding.pin}
                      >
                        <b aria-hidden="true">{finding.pin}</b>
                        <code>{finding.tag}</code>
                        <span className="sc-seo-lens__value">{finding.value}</span>
                        <span className="sc-seo-lens__flag" data-status={finding.status}>{finding.status}</span>
                        <small>{finding.note}</small>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="sc-seo-lens__lesson">
          Gute SEO nimmt der Gestaltung nichts weg. Sie sorgt dafür, dass Menschen und
          Suchsysteme dieselbe starke Seite vorfinden.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Kapitel 3 — Performance
 *
 * Eine vereinfachte Ladereihenfolge, keine DevTools-Kopie und keine
 * Messwerte: Lage und Laenge der Balken sind relativ (0–100), der Marker
 * zeigt qualitativ, wann Inhalt sichtbar wird.
 * ------------------------------------------------------------------ */

const LOAD_STATES = [
  {
    id: 'before',
    label: 'Vorher',
    visibleAt: 78,
    rows: [
      { asset: 'HTML', start: 0, length: 9, tone: 'neutral', tag: 'Dokument' },
      { asset: 'CSS', start: 9, length: 14, tone: 'neutral', tag: 'nötig' },
      { asset: 'JavaScript', start: 11, length: 44, tone: 'block', tag: 'blockiert' },
      { asset: 'Fonts', start: 22, length: 30, tone: 'block', tag: 'verzögert Text' },
      { asset: 'Hero-Bild', start: 24, length: 54, tone: 'heavy', tag: 'zu schwer' },
      { asset: 'Third-Party', start: 30, length: 46, tone: 'block', tag: 'zu früh' },
    ],
    notes: ['Großes Hero-Bild lädt zu früh und zu schwer', 'JavaScript blockiert den Aufbau', 'Fonts verzögern den Text', 'Dritt-Skripte laden, bevor sie gebraucht werden'],
  },
  {
    id: 'after',
    label: 'Optimiert',
    visibleAt: 32,
    rows: [
      { asset: 'HTML', start: 0, length: 9, tone: 'neutral', tag: 'Dokument' },
      { asset: 'CSS', start: 9, length: 7, tone: 'good', tag: 'kritisch zuerst' },
      { asset: 'Hero-Bild', start: 11, length: 18, tone: 'good', tag: 'passende Größe' },
      { asset: 'Fonts', start: 12, length: 14, tone: 'good', tag: 'mit Fallback' },
      { asset: 'JavaScript', start: 38, length: 20, tone: 'later', tag: 'später geladen' },
      { asset: 'Third-Party', start: 62, length: 14, tone: 'later', tag: 'bei Bedarf' },
    ],
    notes: ['Kritische Inhalte zuerst', 'Bilder in passender Größe', 'Skripte reduziert und später geladen', 'Layout bleibt stabil'],
  },
];

function LoadPanel({ state, visible, hiddenOnMobile }) {
  return (
    <article
      className={`sc-seo-load__panel is-${state.id}${hiddenOnMobile ? ' is-hidden-mobile' : ''}`}
      data-visible={visible}
    >
      <header>
        <b>{state.label}</b>
        <span>Ladereihenfolge</span>
      </header>
      <div className="sc-seo-load__chart" style={{ '--sc-visible-at': state.visibleAt }}>
        <span aria-hidden="true" className="sc-seo-load__marker"><em>Inhalt sichtbar</em></span>
        <ul>
          {state.rows.map((row, index) => (
            <li data-tone={row.tone} key={row.asset}>
              <span className="sc-seo-load__asset">{row.asset}</span>
              <span className="sc-seo-load__track">
                <i
                  style={{
                    '--sc-start': row.start,
                    '--sc-length': row.length,
                    '--sc-delay': `${index * 90}ms`,
                  }}
                />
              </span>
              <span className="sc-seo-load__tag">{row.tag}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="sc-seo-load__notes">
        {state.notes.map((note) => <li key={note}>{note}</li>)}
      </ul>
    </article>
  );
}

function PerformanceSection({ reducedMotion }) {
  const [mobileState, setMobileState] = useState('before');
  const [visible, setVisible] = useState(reducedMotion);
  const ref = useOnceInView(() => setVisible(true), !reducedMotion);

  return (
    <section className="sc-experience__section sc-seo-load">
      <div className="sc-seo-load__intro">
        <ModuleHeading title="Schnell fühlt sich einfach an.">
          <p>
            Performance ist keine einzelne Zahl. Entscheidend ist, was zuerst lädt, was
            blockiert – und was wirklich gebraucht wird.
          </p>
        </ModuleHeading>
        <SegmentedControl
          items={LOAD_STATES}
          label="Zustand wählen: vorher oder optimiert"
          onSelect={setMobileState}
          selected={mobileState}
        />
      </div>

      <div className="sc-seo-load__grid" ref={ref}>
        {LOAD_STATES.map((state) => (
          <LoadPanel
            hiddenOnMobile={state.id !== mobileState}
            key={state.id}
            state={state}
            visible={visible}
          />
        ))}
      </div>
      <p className="sc-seo-load__footnote">Illustrative Reihenfolge – relative Balken, keine Messwerte.</p>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Kapitel 4 — Grundlagen und Priorisierung
 * ------------------------------------------------------------------ */

const PILLARS = [
  {
    id: 'tech',
    icon: 'layers',
    title: 'Technik',
    question: 'Kann die Seite sauber erreicht und verarbeitet werden?',
    items: ['Crawlbar für Suchsysteme', 'Indexierbar und eindeutig', 'Schnell geladen', 'Sauber auf allen Geräten'],
  },
  {
    id: 'content',
    icon: 'type',
    title: 'Inhalt',
    question: 'Versteht man, wofür diese Seite relevant ist?',
    items: ['Passend zur Suchintention', 'Klare Überschriften-Hierarchie', 'Aussagekräftiger Titel und Beschreibung', 'Sinnvolle interne Links'],
  },
  {
    id: 'authority',
    icon: 'shield',
    title: 'Autorität',
    question: 'Warum sollte dieser Inhalt Vertrauen verdienen?',
    items: ['Wirklich hilfreiche Inhalte', 'Nachvollziehbare Expertise', 'Relevante Erwähnungen von außen'],
    note: 'Kein Automatismus: Vertrauen entsteht über Zeit, nicht über Linkmengen.',
  },
];

const PRIORITIES = [
  { id: 'h1', title: 'Fehlende Hauptüberschrift', area: 'Struktur', level: 'high', why: 'Die Seite sagt nicht klar, worum es geht.' },
  { id: 'hero', title: 'Zu schweres Hero-Bild', area: 'Performance', level: 'high', why: 'Verzögert den ersten sichtbaren Inhalt.' },
  { id: 'title', title: 'Unklarer Seitentitel', area: 'Inhalt', level: 'medium', why: 'Im Suchergebnis fehlt der Bezug zum Angebot.' },
  { id: 'links', title: 'Schwache interne Verlinkung', area: 'Struktur', level: 'medium', why: 'Wichtige Unterseiten sind schwer zu finden.' },
  { id: 'scripts', title: 'Ladereihenfolge der Skripte', area: 'Performance', level: 'low', why: 'Spürbar, aber erst nach den großen Punkten.' },
];

const LEVELS = {
  high: { label: 'Hoch', bars: 3 },
  medium: { label: 'Mittel', bars: 2 },
  low: { label: 'Niedrig', bars: 1 },
};

function FoundationSection({ reducedMotion }) {
  const rise = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="sc-experience__section sc-seo-base">
      <ModuleHeading title="Sichtbarkeit entsteht nicht an einer einzigen Stelle." />
      <ul className="sc-seo-pillars">
        {PILLARS.map((pillar) => (
          <li className={`sc-seo-pillar is-${pillar.id}`} key={pillar.id}>
            <span className="sc-seo-pillar__icon" aria-hidden="true"><Glyph name={pillar.icon} /></span>
            <h4>{pillar.title}</h4>
            <p className="sc-seo-pillar__question">{pillar.question}</p>
            <ul>
              {pillar.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            {pillar.note ? <p className="sc-seo-pillar__note">{pillar.note}</p> : null}
          </li>
        ))}
      </ul>

      <div className="sc-seo-priority">
        <ModuleHeading title="Nicht jedes Problem ist gleich wichtig.">
          <p>
            Ein Audit hilft erst, wenn daraus eine Reihenfolge wird. Zuerst kommt, was
            Verständnis, Erreichbarkeit oder Ladeverhalten am stärksten beeinflusst.
          </p>
        </ModuleHeading>

        <motion.div
          className="sc-seo-priority__board"
          initial="hidden"
          viewport={{ once: true, amount: 0.3 }}
          whileInView="show"
        >
          <header>
            <b>Maßnahmen nach Einfluss</b>
            <em>Illustratives Beispiel</em>
          </header>
          <ol>
            {PRIORITIES.map((item, index) => (
              <motion.li
                data-level={item.level}
                key={item.id}
                transition={{ delay: reducedMotion ? 0 : 0.12 + index * 0.09, duration: reducedMotion ? 0.01 : 0.4, ease: EASE }}
                variants={rise}
              >
                <span className="sc-seo-priority__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="sc-seo-priority__issue">
                  <b>{item.title}</b>
                  <small>{item.why}</small>
                </span>
                <span className="sc-seo-priority__area">{item.area}</span>
                <span className="sc-seo-priority__level">
                  <i aria-hidden="true">
                    {[1, 2, 3].map((bar) => <u className={bar <= LEVELS[item.level].bars ? 'is-on' : undefined} key={bar} />)}
                  </i>
                  Priorität: {LEVELS[item.level].label}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */

export default function SeoExperience({ reducedMotion }) {
  return (
    <>
      <DiagnosticSection reducedMotion={reducedMotion} />
      <SearchSection reducedMotion={reducedMotion} />
      <PerformanceSection reducedMotion={reducedMotion} />
      <FoundationSection reducedMotion={reducedMotion} />
    </>
  );
}
