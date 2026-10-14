import { useEffect, useRef, useState } from 'react';
import { Glyph, ModuleHeading, SegmentedControl } from './shared.jsx';

/* ==================================================================
 * Pop-up 3 — API Integration
 *
 * Ein technischer Produkt-Showcase in vier Schritten:
 *
 *   1  So fliessen Daten      — ein Request laeuft sichtbar hin und zurueck
 *   2  Mehr als ein Endpoint  — Zugriff, Pruefung, Fehler, Rueckmeldung
 *   3  Request / Response / Error — dieselbe Anfrage in drei Zustaenden
 *   4  Praxis                 — was sich damit verbinden laesst
 *
 * Bewusst keine Ablauf- oder Workflow-Themen: Trigger, Folgeaktionen und
 * wiederkehrende Prozesse gehoeren zu Pop-up 4 (Automatisierung). Hier
 * geht es ausschliesslich um die Verbindung zweier Systeme — Anfrage,
 * Antwort und alles, was eine Schnittstelle belastbar macht.
 * ================================================================== */

/* ------------------------------------------------------------------
 * Abschnitt 1 — So fliessen Daten
 *
 * Sechs Zustaende, jeder ein Wort in der Statusleiste. Die Lichtimpulse
 * auf den Leitungen sind einmalige CSS-Animationen, gesteuert ueber
 * data-Attribute; der Takt kommt aus wenigen setTimeouts. Keine Schleife,
 * kein requestAnimationFrame — nach dem Durchlauf ruht die Szene.
 * ------------------------------------------------------------------ */

const FLOW_STATES = [
  'Bereit',
  'Request gesendet',
  'Validiert',
  'Service erreicht',
  '200 OK',
  'Abgeschlossen',
];

/*
 * Zeitpunkte (ms) der Zustaende 1–5 nach dem Start — ruhiges, erklaerendes
 * Tempo: Ein Impuls braucht 1,1 s pro Leitung (CSS: --sc-api-travel), danach
 * bleibt jeder Zustand kurz stehen, bevor der naechste beginnt. Zwischen 4
 * und 5 laufen zwei Impulse nacheinander zurueck: Service → API, dann nach
 * 1,3 s (--sc-api-back-delay) API → Shop. Gesamtdauer rund 6,8 s.
 */
const FLOW_TIMELINE = [0, 1500, 2700, 4100, 6800];
const DONE = FLOW_STATES.length - 1;

const FLOW_NODES = [
  {
    id: 'shop',
    icon: 'cart',
    name: 'Shop',
    role: 'Frontend',
    detail: (step) => {
      if (step === 0) return 'Warenkorb · 2 Artikel';
      if (step < DONE) return 'wartet auf Antwort …';
      return 'Bestellung bestätigt';
    },
    active: (step) => step === 1 || step === DONE,
  },
  {
    id: 'api',
    icon: 'api',
    name: 'API',
    role: 'Schnittstelle',
    detail: (step) => {
      if (step === 0) return 'bereit';
      if (step === 1) return 'Request empfangen';
      if (step < 4) return 'Token und Daten geprüft';
      return 'Antwort weitergegeben';
    },
    active: (step) => step === 2 || step === 4,
  },
  {
    id: 'payment',
    icon: 'card',
    name: 'Payment Service',
    role: 'extern',
    detail: (step) => {
      if (step < 3) return 'wartet';
      if (step === 3) return 'Zahlung wird geprüft';
      return '200 OK';
    },
    active: (step) => step === 3,
  },
];

/*
 * Leitungen zwischen den Knoten. `out` und `back` bestimmen, in welchem
 * Zustand der Impuls hinlaeuft bzw. zurueckkommt; `backDelay` verzoegert
 * die Rueckmeldung der ersten Leitung, bis die zweite zurueck ist.
 */
const FLOW_WIRES = [
  { id: 'a', out: 1, back: 4, backDelay: true, request: 'POST /checkout · JSON', response: 'Response received', responseFrom: 4 },
  { id: 'b', out: 3, back: 4, backDelay: false, request: 'POST /payments', response: '200 OK', responseFrom: 4 },
];

/*
 * Startet genau einmal pro Mount, sobald rund 40 % der Szene sichtbar sind —
 * nicht beim ersten Pixel, damit man den Ablauf von Anfang an sieht. Danach
 * trennt sich der Beobachter: Hin- und Herscrollen startet nichts neu. Wird
 * das Pop-up geschlossen und wieder geoeffnet, mountet die Szene neu und
 * spielt erneut einmal ab. Kein Scroll-Listener, keine Schleife.
 */
const AUTOPLAY_THRESHOLD = 0.4;

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
    }, { threshold: AUTOPLAY_THRESHOLD });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}

function FlowSection({ reducedMotion }) {
  // Reduzierte Bewegung: kein animierter Ablauf, die Szene zeigt sofort
  // den vollstaendigen Endzustand mit allen Stationen und Labels.
  const [step, setStep] = useState(reducedMotion ? DONE : 0);
  const [running, setRunning] = useState(false);
  // Neuer Durchlauf = neue Impuls-Elemente, damit die CSS-Animationen
  // zuverlaessig von vorn beginnen.
  const [run, setRun] = useState(0);
  const timersRef = useRef([]);
  const startedRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const start = () => {
    if (running) return;
    startedRef.current = true;
    clearTimers();
    setRun((value) => value + 1);

    if (reducedMotion) {
      setRunning(false);
      setStep(DONE);
      return;
    }

    setRunning(true);
    setStep(0);
    FLOW_TIMELINE.forEach((at, index) => {
      timersRef.current.push(window.setTimeout(() => {
        setStep(index + 1);
        if (index + 1 === DONE) setRunning(false);
      }, at));
    });
  };

  // Einmal von selbst, sobald die Szene ins Bild kommt — hat jemand schon
  // vorher selbst gestartet, bleibt es dabei.
  const stageRef = useOnceInView(() => {
    if (!startedRef.current) start();
  }, !reducedMotion);

  const wirePhase = (wire) => {
    if (step === wire.out) return 'out';
    if (step === wire.back) return 'back';
    return 'idle';
  };

  const buttonLabel = running
    ? 'Request läuft …'
    : step === DONE ? 'Erneut abspielen' : 'Request starten';

  // Screenreader: nur Start und Ergebnis, nicht jeder Zwischenschritt.
  const announcement = running
    ? 'Request läuft.'
    : step === DONE ? 'Abgeschlossen: 200 OK, Antwort im Shop angekommen.' : '';

  return (
    <section className="sc-experience__section sc-api-flow">
      <ModuleHeading title="So fließen Daten.">
        <p>
          Ein Shop fragt beim Zahlungsdienst an. Die API steht dazwischen: Sie prüft
          die Anfrage, leitet sie weiter und bringt die Antwort kontrolliert zurück.
        </p>
      </ModuleHeading>

      <div className="sc-api-flow__surface" ref={stageRef}>
        <div className="sc-api-flow__stage" key={run}>
          {FLOW_NODES.map((node, index) => (
            <FlowNodeWithWire
              key={node.id}
              node={node}
              step={step}
              wire={FLOW_WIRES[index]}
              wirePhase={FLOW_WIRES[index] ? wirePhase(FLOW_WIRES[index]) : null}
            />
          ))}
        </div>

        <div className="sc-api-flow__footer">
          <ol aria-label="Status des Requests" className="sc-api-flow__states">
            {FLOW_STATES.map((label, index) => {
              let state = 'is-pending';
              if (index < step) state = 'is-done';
              if (index === step) state = 'is-current';
              return (
                <li
                  aria-current={index === step ? 'step' : undefined}
                  className={state}
                  key={label}
                >
                  <i aria-hidden="true" />
                  {label}
                </li>
              );
            })}
          </ol>

          {/* Wiederholen, nicht Voraussetzung: der erste Durchlauf startet von
              selbst. aria-disabled statt disabled: waehrend des Durchlaufs
              bleibt der Fokus auf dem Button. Bei reduzierter Bewegung gibt
              es nichts abzuspielen — der Endzustand steht bereits. */}
          {reducedMotion ? null : (
            <button
              aria-disabled={running}
              className="sc-api-run"
              onClick={start}
              type="button"
            >
              <span aria-hidden="true" className="sc-api-run__dot" />
              {buttonLabel}
            </button>
          )}
        </div>

        <p aria-live="polite" className="sc-sr-only">{announcement}</p>
      </div>
    </section>
  );
}

function FlowNodeWithWire({ node, step, wire, wirePhase }) {
  const active = node.active(step);
  return (
    <>
      <article className={`sc-api-node sc-api-node--${node.id}${active ? ' is-active' : ''}`}>
        <span aria-hidden="true" className="sc-api-node__icon"><Glyph name={node.icon} /></span>
        <span className="sc-api-node__name">
          <b>{node.name}</b>
          <em>{node.role}</em>
        </span>
        <span className="sc-api-node__detail">{node.detail(step)}</span>
      </article>

      {wire ? (
        <div
          aria-hidden="true"
          className={`sc-api-wire${wire.backDelay ? ' is-delayed-back' : ''}`}
          data-phase={wirePhase}
          data-req={step >= wire.out ? 'on' : 'off'}
          data-res={step >= wire.responseFrom ? 'on' : 'off'}
        >
          <span className="sc-api-wire__label is-request">{wire.request}</span>
          <span className="sc-api-wire__line" />
          <i className="sc-api-wire__pulse" />
          <span className="sc-api-wire__label is-response">{wire.response}</span>
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------
 * Abschnitt 2 — Mehr als ein Endpoint
 * ------------------------------------------------------------------ */

const LAYERS = [
  {
    id: 'auth',
    icon: 'key',
    eyebrow: 'Authentifizierung',
    title: 'Nicht jeder darf alles.',
    text: 'Jeder Request weist sich aus. Zugriff gibt es nur dort, wo er vorgesehen ist.',
  },
  {
    id: 'validation',
    icon: 'braces',
    eyebrow: 'Validierung',
    title: 'Erst prüfen, dann verarbeiten.',
    text: 'Fehlende oder falsche Werte werden am Eingang abgefangen – nicht erst drei Systeme später.',
  },
  {
    id: 'errors',
    icon: 'triangleAlert',
    eyebrow: 'Fehlerbehandlung',
    title: 'Fehler sind eingeplant.',
    text: 'Geht etwas schief, kommt eine klare Antwort zurück, mit der das Frontend umgehen kann.',
  },
  {
    id: 'webhooks',
    icon: 'sync',
    eyebrow: 'Webhooks & Sync',
    title: 'Melden statt fragen.',
    text: 'Ändert sich etwas, meldet sich das andere System von selbst. Niemand muss ständig nachsehen.',
  },
];

/* ------------------------------------------------------------------
 * Abschnitt 3 — Request / Response / Error
 *
 * Illustratives Beispiel eines Kontaktformulars, kein Abbild eines
 * bestimmten Backends. Der Koerper wird aus einem Objekt erzeugt
 * (JSON.stringify) — so ist er garantiert gueltiges JSON.
 * ------------------------------------------------------------------ */

const EXCHANGES = [
  {
    id: 'request',
    label: 'Request',
    tone: 'request',
    badge: 'Anfrage',
    head: ['POST /api/contact', 'Content-Type: application/json'],
    body: {
      name: 'Alex',
      email: 'alex@example.com',
      message: 'Ich möchte ein Projekt besprechen.',
    },
    title: 'Klar gesagt, was ankommt.',
    note: 'Methode, Ziel und Format stehen fest. Die API weiß dadurch genau, was sie erwarten darf.',
  },
  {
    id: 'response',
    label: 'Response',
    tone: 'success',
    badge: '201 Created',
    head: ['HTTP/1.1 201 Created', 'Content-Type: application/json'],
    body: {
      status: 'success',
      message: 'Anfrage wurde übernommen.',
    },
    title: 'Ein Status, auf den man bauen kann.',
    note: 'Der Client bekommt einen eindeutigen Status und kann darauf gezielt reagieren.',
  },
  {
    id: 'error',
    label: 'Error',
    tone: 'error',
    badge: '422 Validierungsfehler',
    head: ['HTTP/1.1 422 Unprocessable Content', 'Content-Type: application/json'],
    body: {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'E-Mail-Adresse fehlt.',
      },
    },
    title: 'Ein Fehler, der nichts verrät.',
    note: 'Die Antwort sagt, was fehlt – und nichts darüber hinaus. Interne Details bleiben intern.',
  },
];

// Dezente Hervorhebung: Schluessel, Zeichenketten, Satzzeichen.
const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|([{}[\],])/g;

function JsonLine({ line }) {
  const parts = [];
  let last = 0;
  let match;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    if (match[1] && match[2]) {
      parts.push(<span className="is-key" key={match.index}>{match[1]}</span>, match[2]);
    } else if (match[1]) {
      parts.push(<span className="is-string" key={match.index}>{match[1]}</span>);
    } else {
      parts.push(<span className="is-punct" key={match.index}>{match[3]}</span>);
    }
    last = TOKEN.lastIndex;
  }
  if (last < line.length) parts.push(line.slice(last));
  return <>{parts}{'\n'}</>;
}

function ExchangeSection() {
  const [selected, setSelected] = useState('request');
  const exchange = EXCHANGES.find((item) => item.id === selected);
  const lines = JSON.stringify(exchange.body, null, 2).split('\n');

  return (
    <section className="sc-experience__section sc-api-exchange">
      <div className="sc-api-exchange__intro">
        <ModuleHeading title="Ein Request ist erst fertig, wenn auch der Fehlerfall klar ist.">
          <p>Ein Kontaktformular, drei Zustände. Ein illustratives Beispiel.</p>
        </ModuleHeading>
        <SegmentedControl
          items={EXCHANGES}
          label="Ansicht wählen: Request, Response oder Error"
          onSelect={setSelected}
          selected={selected}
        />
      </div>

      <div
        aria-label={`Beispiel: ${exchange.label}`}
        className={`sc-api-exchange__panel is-${exchange.tone}`}
        role="region"
      >
        <figure className="sc-api-code">
          <figcaption className="sc-api-code__head">
            <span className="sc-api-code__badge">
              <i aria-hidden="true" />
              {exchange.badge}
            </span>
            <span className="sc-api-code__lines">
              {exchange.head.map((line) => <code key={line}>{line}</code>)}
            </span>
          </figcaption>
          {/* tabIndex: der Block kann auf schmalen Geraeten intern scrollen
              und muss dafuer per Tastatur erreichbar sein. */}
          <pre className="sc-api-code__body" tabIndex={0}>
            <code>
              {lines.map((line, index) => (
                // Zeilen einer festen Ausgabe; der Index ist hier stabil.
                // eslint-disable-next-line react/no-array-index-key
                <JsonLine key={index} line={line} />
              ))}
            </code>
          </pre>
        </figure>

        <div className="sc-api-exchange__note">
          <h4>{exchange.title}</h4>
          <p>{exchange.note}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Abschnitt 4 — Was sich damit verbinden laesst
 * Keine Anbieter, keine Logos: es geht um die Art der Verbindung.
 * ------------------------------------------------------------------ */

const CONNECTIONS = [
  {
    id: 'shop-payment',
    from: { icon: 'cart', label: 'Shop' },
    to: { icon: 'card', label: 'Payment' },
    text: 'Bestellung auslösen, Zahlungsstatus zurückholen – und im Shop genau den nächsten Schritt zeigen.',
  },
  {
    id: 'website-crm',
    from: { icon: 'frame', label: 'Website' },
    to: { icon: 'user', label: 'CRM' },
    text: 'Wer anfragt, steht sofort als vollständiger Datensatz im CRM – ohne Abtippen und ohne Kopierfehler.',
  },
  {
    id: 'app-service',
    from: { icon: 'device', label: 'App' },
    to: { icon: 'database', label: 'Externer Service' },
    text: 'Verfügbarkeiten, Preise oder Status kommen live vom externen Dienst – die App pflegt keine eigene Kopie.',
  },
  {
    id: 'support-tickets',
    from: { icon: 'chat', label: 'Support' },
    to: { icon: 'layers', label: 'Ticket-System' },
    text: 'Anfragen landen direkt dort, wo sie bearbeitet werden – strukturiert, vollständig und ohne Weiterreichen von Hand.',
  },
  {
    id: 'website-newsletter',
    from: { icon: 'frame', label: 'Website' },
    to: { icon: 'mail', label: 'Newsletter' },
    text: 'Anmeldungen kommen direkt im Newsletter-Tool an – mit genau den Daten, die es braucht, und keinem Feld mehr.',
  },
  {
    id: 'dashboard-source',
    from: { icon: 'gauge', label: 'Dashboard' },
    to: { icon: 'database', label: 'Datenquelle' },
    text: 'Externe Daten werden abgerufen, aufbereitet und dort sichtbar, wo Entscheidungen getroffen werden.',
  },
];

/* ================================================================== */

export default function ApiIntegrationExperience({ reducedMotion }) {
  return (
    <>
      <FlowSection reducedMotion={reducedMotion} />

      <section className="sc-experience__section sc-api-layers">
        <ModuleHeading title="Eine Integration besteht aus mehr als einem Endpoint.">
          <p>Vier Dinge entscheiden, ob eine Verbindung im Alltag hält.</p>
        </ModuleHeading>
        <ul className="sc-api-layers__grid">
          {LAYERS.map((layer) => (
            <li className="sc-api-layer" key={layer.id}>
              <span className="sc-api-layer__eyebrow">
                <Glyph name={layer.icon} />
                {layer.eyebrow}
              </span>
              <h4>{layer.title}</h4>
              <p>{layer.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <ExchangeSection />

      <section className="sc-experience__section sc-api-connect">
        <ModuleHeading title="Was sich damit verbinden lässt." />
        <ul className="sc-api-connect__grid">
          {CONNECTIONS.map((item) => (
            <li className="sc-api-pair" key={item.id}>
              <p className="sc-api-pair__systems">
                <span><Glyph name={item.from.icon} />{item.from.label}</span>
                <i aria-hidden="true" />
                <span><Glyph name={item.to.icon} />{item.to.label}</span>
              </p>
              <p className="sc-api-pair__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
