import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowIcon, EASE, Glyph, ModuleHeading, SegmentedControl, Slider } from './shared.jsx';

/* ==================================================================
 * Pop-up 2 — KI & Chatbots
 *
 * Die Ansicht erzaehlt eine Geschichte in fuenf Schritten und nichts
 * davon wiederholt sich:
 *
 *   1  Verstehen          — was er aus einer Nachricht und einem Gespraech liest
 *   2  Risiken erkennen   — zwei dokumentierte Faelle ohne Leitplanken
 *   3  Leitplanken setzen — woran sich ein verlaesslicher Assistent haelt
 *   4  Sicher uebergeben  — das Protokoll, mit dem ein Mensch uebernimmt
 *
 * Bewusst kein Automations-, CRM- oder Workflow-Thema: dieses Pop-up
 * zeigt ausschliesslich Sprache, Verstaendnis und Verantwortung eines
 * Chat-Assistenten.
 * ================================================================== */

/* ------------------------------------------------------------------
 * Abschnitt 1 — Ein gutes Gespraech
 *
 * Tonfall: hoeflich, konkret, mit einem naechsten Schritt. Emojis
 * hoechstens eines pro Antwort und nur dort, wo ein Mensch auch eines
 * setzen wuerde. Nach dem Emoji steht ein schmales Leerzeichen (U+2009)
 * zusaetzlich zum normalen: die Emoji-Ersatzschrift bringt ihre eigene
 * Laufweite mit und verschluckt den Wortabstand danach sonst optisch.
 * ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    id: 'inquiry',
    label: 'Kundenanfrage',
    panelId: 'assistant-conversation',
    messages: [
      { from: 'user', text: 'Hallo, in unserem Onlineshop brechen viele Kunden kurz vor dem Kauf ab.' },
      { from: 'bot', text: 'Danke für den Hinweis 👋  Passiert das eher im Warenkorb oder erst bei Versand und Zahlung?' },
      { from: 'user', text: 'Meistens bei der Zahlung. Auf dem Handy noch häufiger.' },
      { from: 'bot', text: 'Verstanden. Welche Zahlungsarten bietet ihr im Moment an?' },
      { from: 'user', text: 'Rechnung und Kreditkarte. PayPal fehlt bisher.' },
      { from: 'bot', text: 'Danke 👍  Ich halte fest: Abbrüche bei der Zahlung, vor allem mobil, ohne PayPal. So kann sich jemand den Checkout gezielt ansehen.' },
    ],
    reading: [
      { icon: 'chat', label: 'Anliegen', value: 'Kaufabbrüche im Shop' },
      { icon: 'compass', label: 'Eingegrenzt', value: 'Zahlung, vor allem mobil' },
      { icon: 'eye', label: 'Auffällig', value: 'PayPal fehlt' },
      { icon: 'route', label: 'Nächster Schritt', value: 'Checkout gezielt prüfen' },
    ],
  },
  {
    id: 'appointment',
    label: 'Terminvorbereitung',
    panelId: 'assistant-conversation',
    messages: [
      { from: 'user', text: 'Ich hätte gern ein Erstgespräch – am liebsten noch diese Woche.' },
      { from: 'bot', text: 'Das lässt sich einrichten. Worum soll es in dem Gespräch vor allem gehen?' },
      { from: 'user', text: 'Wir überlegen, einen Assistenten auf unserer Website einzusetzen.' },
      { from: 'bot', text: 'Verstanden. Welche Fragen erreichen euch dort im Moment am häufigsten?' },
      { from: 'user', text: 'Meistens Preise, Ablauf und ob wir Inhalte selbst pflegen können.' },
      { from: 'bot', text: 'Danke, das notiere ich 👍  Ich bereite die drei Punkte so vor, dass ihr im Termin direkt einsteigen könnt.' },
    ],
    reading: [
      { icon: 'chat', label: 'Anliegen', value: 'Erstgespräch diese Woche' },
      { icon: 'compass', label: 'Thema', value: 'Assistent für die Website' },
      { icon: 'eye', label: 'Häufige Fragen', value: 'Preise, Ablauf, Pflege' },
      { icon: 'route', label: 'Nächster Schritt', value: 'Termin inhaltlich vorbereiten' },
    ],
  },
  {
    id: 'faq',
    label: 'FAQ-Support',
    panelId: 'assistant-conversation',
    messages: [
      { from: 'user', text: 'Kann ich Inhalte später selbst ändern?' },
      { from: 'bot', text: 'Ja ✏️  Freigegebene Bereiche pflegst du selbst, ohne dass dabei am Layout etwas verrutscht.' },
      { from: 'user', text: 'Und wenn später neue Funktionen dazukommen?' },
      { from: 'bot', text: 'Die Seite wird modular aufgebaut. Für eigene Funktionen schauen wir in Ruhe, welcher technische Weg wirklich zu euch passt.' },
      { from: 'user', text: 'Kann ich dazu persönlich beraten werden?' },
      { from: 'bot', text: 'Natürlich – dafür bin ich nur der erste Schritt. Ich sammle deine Fragen und gebe sie für eine persönliche Rückmeldung weiter.' },
    ],
    reading: [
      { icon: 'chat', label: 'Anliegen', value: 'Inhalte selbst pflegen' },
      { icon: 'compass', label: 'Umfang', value: 'Freigegebene Bereiche' },
      { icon: 'eye', label: 'Offen', value: 'Spätere Funktionen' },
      { icon: 'route', label: 'Nächster Schritt', value: 'Persönliche Rückmeldung' },
    ],
  },
];

/* ------------------------------------------------------------------
 * Abschnitt 2 — Echtes Verstaendnis
 *
 * Eine einzige Nachricht steht gross im Raum. Vier Stellen darin werden
 * nacheinander markiert, rechts entsteht dazu die Lesart. Zum Schluss
 * steht die Frage, die daraus folgt. Der Aufbau laeuft genau einmal.
 * ------------------------------------------------------------------ */

const MESSAGE_PARTS = [
  { text: 'Wir brauchen eine ' },
  { text: 'neue Website', mark: 'intent' },
  { text: ' für unser ' },
  { text: 'Architekturbüro', mark: 'context' },
  { text: ' und möchten ' },
  { text: 'mehr gewerbliche Kunden erreichen', mark: 'goal' },
  { text: '. ' },
  { text: 'Wann es losgehen soll', mark: 'open' },
  { text: ', ist noch offen.' },
];

const READINGS = [
  { id: 'intent', label: 'Vorhaben', value: 'Website neu aufbauen' },
  { id: 'context', label: 'Kontext', value: 'Architekturbüro' },
  { id: 'goal', label: 'Ziel', value: 'Mehr qualifizierte B2B-Anfragen' },
  { id: 'open', label: 'Offen', value: 'Zeitrahmen und Anforderungen' },
];

/*
 * Ein Aufbau, ausgeloest beim Eintritt in den sichtbaren Bereich und
 * danach nie wieder. Der Beobachter haengt sich sofort nach dem ersten
 * Treffer aus — nichts laeuft im Hintergrund weiter.
 *
 * Bewusst threshold 0 mit rootMargin statt eines Anteilswerts: die
 * beobachtete Flaeche ist auf dem Handy hoeher als das Fenster, ein
 * Schwellwert von 30% waere dort nie zu erreichen und der Aufbau bliebe
 * fuer immer im Ausgangszustand stehen.
 */
function useRevealOnce(steps, interval, reducedMotion) {
  const ref = useRef(null);
  const [stage, setStage] = useState(reducedMotion ? steps : 0);

  useEffect(() => {
    if (reducedMotion) {
      setStage(steps);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    let timers = [];
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      timers = Array.from({ length: steps }, (_, position) => window.setTimeout(
        () => setStage(position + 1),
        460 + position * interval,
      ));
    }, { threshold: 0, rootMargin: '0px 0px -18% 0px' });

    observer.observe(node);

    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [interval, reducedMotion, steps]);

  return [ref, stage];
}

function UnderstandingSection({ reducedMotion }) {
  // Vier Markierungen, danach die Folgefrage.
  const [ref, stage] = useRevealOnce(READINGS.length + 1, 620, reducedMotion);
  const litIndex = (id) => READINGS.findIndex((item) => item.id === id);

  return (
    <section className="sc-experience__section sc-reading">
      <ModuleHeading title="Aus einer Nachricht wird Kontext.">
        <p>
          Ein Satz enthält mehr als seine Wörter: ein Vorhaben, einen Hintergrund,
          ein Ziel – und das, was noch fehlt.
        </p>
      </ModuleHeading>

      <div className="sc-reading__surface" ref={ref}>
        <figure className="sc-reading__message">
          <figcaption>Nachricht eines Besuchers</figcaption>
          <blockquote>
            {MESSAGE_PARTS.map((part, index) => (
              part.mark
                ? (
                  <mark
                    className={litIndex(part.mark) < stage ? 'is-lit' : undefined}
                    key={part.mark}
                  >
                    {part.text}
                  </mark>
                )
                // Reine Textstuecke haben keine eigene Identitaet; der Index
                // ist hier der einzige stabile Schluessel.
                // eslint-disable-next-line react/no-array-index-key
                : <span key={index}>{part.text}</span>
            ))}
          </blockquote>
        </figure>

        <ol className="sc-reading__readout">
          {READINGS.map((item, index) => (
            <li className={index < stage ? 'is-lit' : undefined} key={item.id}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ol>
      </div>

      <div className={`sc-reading__ask${stage > READINGS.length ? ' is-lit' : ''}`}>
        <span>Nächste sinnvolle Frage</span>
        <p>„Bis wann soll die neue Website online sein – und was muss sie auf jeden Fall können?“</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Abschnitt 3 — Risiken ohne Grenzen
 *
 * Zwei dokumentierte Faelle als Editorial-Cases: Quellenkopf, These,
 * Zusammenfassung — und aufklappbar eine vierteilige Analyse. Keine
 * roten Fehlermarken, keine blinkenden Statuspunkte: die Schwaeche
 * erklaert der Text.
 * ------------------------------------------------------------------ */

const INCIDENTS = [
  {
    id: 'dpd',
    brand: { id: 'dpd', mark: 'DPD', name: 'DPD' },
    origin: 'Kundenservice-Chatbot · 2024',
    title: 'Ein Service-Bot spottet über das eigene Unternehmen',
    summary:
      'Mit gezielten Eingaben brachten Nutzer den Chatbot eines Paketdienstes dazu, den eigenen Service schlechtzureden – bis hin zu einem Spottgedicht über die Firma.',
    analysis: [
      {
        icon: 'messageWarning',
        title: 'Ereignis',
        text: 'Der Service-Bot flucht und dichtet über die eigene Firma. Ein Kunde hatte ihn schlicht darum gebeten.',
      },
      {
        icon: 'scanSearch',
        title: 'Ursache',
        text: 'Rolle und Tonfall waren nicht fest verankert. Eine freundliche Bitte wog schwerer als die Vorgaben des Unternehmens.',
      },
      {
        icon: 'triangleAlert',
        title: 'Risiko',
        text: 'Jede Eingabe kann zu einer öffentlichen Aussage der Marke werden. Ein Screenshot genügt, und sie verbreitet sich.',
      },
      {
        icon: 'shield',
        title: 'Konsequenz',
        text: 'Das Unternehmen verliert die Kontrolle über den eigenen Kanal. DPD schaltete die KI-Funktion daraufhin ab.',
      },
    ],
  },
  {
    id: 'glue',
    brand: { id: 'google', mark: 'G', name: 'Google' },
    origin: 'KI-Übersichten in der Suche · 2024',
    title: 'Eine KI hält einen Internetwitz für einen echten Tipp',
    summary:
      'Eine KI-Übersicht in der Suche empfahl, Käse mit Klebstoff auf der Pizza zu fixieren. Die Quelle war ein alter Scherzkommentar, den das System nicht als Satire erkannte.',
    analysis: [
      {
        icon: 'messageWarning',
        title: 'Ereignis',
        text: 'Die Suche empfiehlt Klebstoff als Pizzazutat – sachlich formuliert, als wäre es ein Küchentipp.',
      },
      {
        icon: 'scanSearch',
        title: 'Ursache',
        text: 'Die Quelle, ein alter Forenscherz, wurde gefunden, aber nicht eingeordnet. Ob sie ernst gemeint war, prüfte niemand.',
      },
      {
        icon: 'triangleAlert',
        title: 'Risiko',
        text: 'Eine plausible Formulierung wirkt wie eine gesicherte Information. Je sauberer der Satz, desto weniger fällt der Fehler auf.',
      },
      {
        icon: 'shield',
        title: 'Konsequenz',
        text: 'Nutzer erhalten eine überzeugende Antwort ohne verlässliche Grundlage – ganz oben in der Suche, wo man ihr am ehesten glaubt.',
      },
    ],
  },
];

function IncidentCard({ incident, reducedMotion }) {
  const [open, setOpen] = useState(false);

  return (
    <article className={`sc-case${open ? ' is-open' : ''}`}>
      <header className="sc-case__source">
        <span aria-hidden="true" className={`sc-case__mark is-${incident.brand.id}`}>
          {incident.brand.mark}
        </span>
        <span className="sc-case__origin">
          <b>{incident.brand.name}</b>
          <em>{incident.origin}</em>
        </span>
      </header>

      <h4>{incident.title}</h4>
      <p>{incident.summary}</p>

      <button
        aria-expanded={open}
        className="sc-case__toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        Was ging schief?
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.dl
            animate={{ height: 'auto', opacity: 1 }}
            className="sc-case__analysis"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.4, ease: EASE }}
          >
            {incident.analysis.map((block) => (
              <div key={block.title}>
                {/* Pille, aber kein Button: der Abschnitt ist nicht anklickbar,
                    deshalb bleibt es semantisch ein Begriff der Liste. */}
                <dt><Glyph name={block.icon} />{block.title}</dt>
                <dd>{block.text}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </AnimatePresence>
    </article>
  );
}

/* ------------------------------------------------------------------
 * Abschnitt 4 — Vier Prinzipien
 *
 * Jede Folie traegt links die Aussage und rechts eine eigene, gebaute
 * Demonstration. Keine vier gleichen Produktkarten: die Demonstration
 * ist bei jedem Prinzip eine andere Szene, aber immer im selben Raster,
 * derselben Hoehe und derselben Typografie.
 * ------------------------------------------------------------------ */

const PRINCIPLES = [
  {
    id: 'knowledge',
    num: '01',
    eyebrow: 'Geprüftes Wissen',
    title: 'Antwortet aus freigegebenen Inhalten.',
    line: 'Antworten entstehen aus dem Kontext, der dafür vorgesehen ist – Leistungen, Abläufe, häufige Fragen.',
    pagerLabel: 'Wissen',
  },
  {
    id: 'uncertainty',
    num: '02',
    eyebrow: 'Unsicherheit erkennen',
    title: 'Sagt, wenn etwas fehlt.',
    line: 'Fehlt eine verlässliche Grundlage, wird daraus keine sichere Behauptung. Stattdessen folgt eine gezielte Rückfrage.',
    pagerLabel: 'Unsicherheit',
  },
  {
    id: 'limits',
    num: '03',
    eyebrow: 'Grenzen einhalten',
    title: 'Bleibt bei seiner Rolle.',
    line: 'Der Assistent bleibt bei dem, wofür er gebaut wurde. Themen, Tonfall und Zusagen sind bewusst begrenzt.',
    pagerLabel: 'Grenzen',
  },
  {
    id: 'handover',
    num: '04',
    eyebrow: 'Menschlich übergeben',
    title: 'Übergibt, wenn Urteil gefragt ist.',
    line: 'Bei Sonderfällen oder sensiblen Fragen endet die Automatisierung – nicht das Gespräch.',
    pagerLabel: 'Übergabe',
  },
];

function CheckMark() {
  return <svg aria-hidden="true" className="sc-demo__check" viewBox="0 0 16 16"><path d="m3.5 8.4 3 3 6-6.8" /></svg>;
}

/*
 * Die vier Szenen. Reines Markup — keine Bilder, keine Diagramme.
 *
 * Jede Szene beginnt mit demselben Bereichsheader: eine kompakte Pille mit
 * Zeichen und Text. Dadurch traegt jede Folie oben rechts dieselbe Marke,
 * egal wie unterschiedlich die Demonstration darunter aufgebaut ist.
 */
function DemoLabel({ icon, children }) {
  return (
    <span className="sc-demo__label">
      <Glyph name={icon} />
      {children}
    </span>
  );
}

function PrincipleDemo({ kind }) {
  if (kind === 'knowledge') {
    return (
      <div className="sc-demo sc-demo--knowledge">
        <DemoLabel icon="book">Freigegebene Inhalte</DemoLabel>
        <ul className="sc-demo__sources">
          <li><CheckMark />Leistungen &amp; Ablauf</li>
          <li><CheckMark />Häufige Fragen</li>
          <li><CheckMark />Referenzprojekte</li>
        </ul>
        <div className="sc-demo__answer">
          <p>„Der Relaunch läuft in vier Schritten – vom Konzept bis zur Übergabe.“</p>
          <span>Grundlage: Leistungen &amp; Ablauf</span>
        </div>
      </div>
    );
  }

  if (kind === 'uncertainty') {
    return (
      <div className="sc-demo sc-demo--uncertainty">
        <DemoLabel icon="eye">Fehlender Kontext</DemoLabel>
        <p className="sc-demo__in">„Was kostet so eine Website ungefähr?“</p>
        <div className="sc-demo__gap">
          <em>Umfang · Seitenanzahl · Funktionen</em>
        </div>
        <p className="sc-demo__out">
          „Das hängt stark vom Umfang ab – ich will dir keine Zahl nennen, die nachher nicht
          stimmt. Wie viele Seiten und welche Funktionen schweben euch vor?“
        </p>
      </div>
    );
  }

  if (kind === 'limits') {
    return (
      <div className="sc-demo sc-demo--limits">
        <DemoLabel icon="frame">Definierter Bereich</DemoLabel>
        <div className="sc-demo__scope">
          <span className="sc-demo__sub">Innerhalb der Rolle</span>
          <ul>
            <li>Leistungen</li>
            <li>Ablauf</li>
            <li>Termine</li>
            <li>Pflege der Inhalte</li>
          </ul>
        </div>
        <div className="sc-demo__beyond">
          <span className="sc-demo__sub">Außerhalb</span>
          <ul>
            <li>Rechtliche Auskünfte</li>
            <li>Feste Preiszusagen</li>
          </ul>
          <p>„Das gehört in ein persönliches Gespräch – ich gebe die Frage weiter.“</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-demo sc-demo--handover">
      <DemoLabel icon="route">Vorbereitete Übergabe</DemoLabel>
      <p className="sc-demo__in">„Wir stecken noch in einem laufenden Vertrag mit einer anderen Agentur.“</p>
      <div className="sc-demo__note">
        <ul>
          <li><b>Anliegen</b>Wechsel bei laufendem Vertrag</li>
          <li><b>Offen</b>Rechtliche Einschätzung</li>
        </ul>
      </div>
      <p className="sc-demo__out">
        „Dazu meldet sich jemand persönlich bei dir – mit allem, was du mir schon gesagt hast.“
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------
 * Abschnitt 5 — Sicher uebergeben
 *
 * Ueberschrift, ein kurzer Satz, dann direkt das Protokoll, mit dem ein
 * Mensch uebernimmt. Kein zweites Gespraech: das zeigt die Demo oben
 * bereits.
 * ------------------------------------------------------------------ */

const RELAY_RECORD = [
  {
    id: 'anliegen',
    label: 'Anliegen',
    text: 'Verbindliche Einschätzung, ob eine bestimmte Lösung für einen Sonderfall trägt.',
  },
  {
    id: 'kontext',
    label: 'Bereits bekannt',
    text: 'Mehrere Lösungswege wurden schon geprüft. Die Entscheidung soll vor dem nächsten Projektschritt fallen.',
  },
  {
    id: 'offen',
    label: 'Noch offen',
    text: 'Fachliche Details zum Sonderfall und zu den konkreten Anforderungen.',
  },
  {
    id: 'schritt',
    label: 'Nächster Schritt',
    text: 'Persönliche Prüfung auf Basis der bisherigen Angaben.',
  },
];

/*
 * Die Inszenierung laeuft ueber whileInView: Framer haengt dafuer einen
 * eigenen IntersectionObserver an und raeumt ihn beim Unmount wieder ab —
 * beim erneuten Oeffnen des Pop-ups startet die Folge deshalb sauber neu.
 * `once` sorgt dafuer, dass sie genau einmal laeuft.
 */
const IN_VIEW = { once: true, margin: '0px 0px -12% 0px' };

function RelaySection({ reducedMotion }) {
  const rise = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 12 },
    show: { opacity: 1, y: 0 },
  };
  // Das Protokollfenster oeffnet sich minimal — kein Zoom, nur ein Hauch.
  const unfold = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 18, scale: reducedMotion ? 1 : 0.988 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  const at = (delay, duration = 0.46) => (reducedMotion
    ? { duration: 0.01 }
    : { duration, delay, ease: EASE });

  return (
    <motion.section
      className="sc-experience__section sc-relay"
      initial="hidden"
      viewport={IN_VIEW}
      whileInView="show"
    >
      <ModuleHeading title="Manchmal ist die beste Antwort eine Übergabe.">
        <p>
          Wenn Kontext fehlt oder menschliches Urteil gefragt ist, sollte ein Assistent
          nicht improvisieren. Er übergibt mit dem, was bereits bekannt ist.
        </p>
      </ModuleHeading>

      <div className="sc-relay__flow">
        <motion.article className="sc-relay__doc" transition={at(0.12, 0.54)} variants={unfold}>
          <header className="sc-relay__doc-head">
            <span aria-hidden="true" className="sc-relay__doc-icon"><Glyph name="book" /></span>
            <h4>Übergabeprotokoll</h4>
            <span className="sc-relay__doc-state">Mensch übernimmt</span>
            <small>Automatisch aus dem Gespräch erstellt</small>
          </header>

          <div className="sc-relay__doc-body">
            {RELAY_RECORD.map((entry, index) => (
              <motion.section
                key={entry.id}
                transition={at(0.3 + index * 0.07, 0.4)}
                variants={rise}
              >
                <span className="sc-relay__doc-label">
                  <i aria-hidden="true" />
                  {entry.label}
                </span>
                <p>{entry.text}</p>
              </motion.section>
            ))}
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}

/* ================================================================== */

export default function AssistantExperience({ reducedMotion }) {
  const [scenario, setScenario] = useState('inquiry');
  const [messageCount, setMessageCount] = useState(2);
  const [typing, setTyping] = useState(false);
  const selectedScenario = SCENARIOS.find((item) => item.id === scenario);

  const selectScenario = (nextScenario) => {
    setScenario(nextScenario);
    setMessageCount(2);
    setTyping(false);
  };

  /* Nächste Antwort mit kurzem, glaubwürdigem Tipp-Moment. */
  const advanceConversation = () => {
    if (typing || messageCount >= selectedScenario.messages.length) return;
    if (reducedMotion) {
      setMessageCount((current) => current + 1);
      return;
    }
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessageCount((current) => Math.min(selectedScenario.messages.length, current + 1));
    }, 620);
  };

  useEffect(() => () => setTyping(false), [scenario]);

  const visibleMessages = selectedScenario.messages.slice(0, messageCount);
  const progress = messageCount / selectedScenario.messages.length;
  // Je beantworteter Frage waechst die Lesart rechts um eine Zeile.
  const readingCount = Math.max(0, messageCount - 2);

  return (
    <>
      <UnderstandingSection reducedMotion={reducedMotion} />

      <section className="sc-experience__section sc-chat-demo">
        <div className="sc-chat-demo__intro">
          <ModuleHeading title="Gute Fragen bringen das Gespräch weiter.">
            <p>
              Wähle eine Situation und klick dich durch. Rechts steht, was der Assistent
              aus jeder Antwort mitnimmt.
            </p>
          </ModuleHeading>
          <SegmentedControl
            items={SCENARIOS}
            label="Gesprächsszenario wählen"
            onSelect={selectScenario}
            selected={scenario}
          />
        </div>

        <div className="sc-chat-demo__workspace">
          <div
            aria-label={`Beispieldialog: ${selectedScenario.label}`}
            className="sc-chat-window"
            id="assistant-conversation"
            role="region"
          >
            <div className="sc-chat-window__top">
              <div><i /><span>Digitaler Assistent</span></div>
              <small>Illustratives Beispiel</small>
            </div>
            <div aria-live="polite" className="sc-chat-window__messages">
              <AnimatePresence initial={false}>
                {visibleMessages.map((message, index) => (
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className={`is-${message.from}`}
                    initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                    key={`${scenario}-${message.text}`}
                    transition={{
                      delay: reducedMotion ? 0 : Math.min(index * 0.035, 0.16),
                      duration: reducedMotion ? 0.01 : 0.28,
                      ease: EASE,
                    }}
                  >
                    <span>
                      <i aria-hidden="true">
                        <Glyph name={message.from === 'bot' ? 'chat' : 'user'} />
                      </i>
                      {message.from === 'bot' ? 'Assistent' : 'Besucher'}
                    </span>
                    {message.text}
                  </motion.p>
                ))}
                {typing && (
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className="is-bot is-typing"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0, y: 8 }}
                    key="typing"
                    transition={{ duration: 0.18 }}
                  >
                    <span>
                      <i aria-hidden="true"><Glyph name="chat" /></i>
                      Assistent
                    </span>
                    <i aria-label="Assistent schreibt"><b /><b /><b /></i>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="sc-chat-window__progress" aria-hidden="true">
              <i style={{ '--sc-chat-progress': progress }} />
            </div>
            <div className="sc-chat-window__controls">
              <button
                disabled={messageCount <= 2}
                onClick={() => setMessageCount((current) => Math.max(2, current - 1))}
                type="button"
              >
                Zurück
              </button>
              <button
                disabled={typing || messageCount >= selectedScenario.messages.length}
                onClick={advanceConversation}
                type="button"
              >
                Nächste Antwort
                <ArrowIcon />
              </button>
            </div>
          </div>

          {/*
            Rechts steht keine Aufgabenliste, sondern die Lesart des
            Assistenten: was er verstanden hat und was daraus folgt. Die
            Zeilen aktivieren sich im Takt des Gesprächs.
          */}
          <aside className="sc-chat-output" aria-live="polite">
            <span>Im Hintergrund</span>
            <h4>Was der Assistent mitnimmt.</h4>
            <ul>
              {selectedScenario.reading.map((row, index) => (
                <li className={index < readingCount ? 'is-lit' : undefined} key={row.label}>
                  <i aria-hidden="true"><Glyph name={row.icon} /></i>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="sc-experience__section sc-incidents">
        <ModuleHeading title="Wenn KI ohne Leitplanken arbeitet.">
          <p>
            Überzeugend klingt nicht automatisch richtig. Beide Fälle sind öffentlich
            dokumentiert – und zeigen, was passiert, wenn niemand die Grenzen eines Systems
            festlegt.
          </p>
        </ModuleHeading>
        <div className="sc-incidents__grid">
          {INCIDENTS.map((incident) => (
            <IncidentCard incident={incident} key={incident.id} reducedMotion={reducedMotion} />
          ))}
        </div>
      </section>

      <section className="sc-experience__section sc-principles">
        <ModuleHeading title="So entsteht ein verlässlicher Assistent.">
          <p>
            Vier Prinzipien entscheiden, ob ein Assistent auch dann trägt, wenn die Frage
            schwierig wird.
          </p>
        </ModuleHeading>

        <Slider
          ariaLabel="Prinzipien eines verlässlichen Assistenten"
          className="sc-principles__slider"
          items={PRINCIPLES}
          loop
          reducedMotion={reducedMotion}
          renderSlide={(slide) => (
            <article className="sc-principle">
              <div className="sc-principle__copy">
                <span className="sc-principle__eyebrow">
                  <i aria-hidden="true">{slide.num}</i>
                  {slide.eyebrow}
                </span>
                <h4>{slide.title}</h4>
                <p>{slide.line}</p>
              </div>
              <div className="sc-principle__demo">
                <PrincipleDemo kind={slide.id} />
              </div>
            </article>
          )}
        />
      </section>

      <RelaySection reducedMotion={reducedMotion} />
    </>
  );
}
