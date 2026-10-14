import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import AskAction from './AskAction.jsx';
import { MOBILE_QUERY, useMediaQuery } from './hooks.js';
import { TECH_LOGOS } from './techLogos.js';

/* ==================================================================
 * 06 — Under the Hood: Exploded Architecture.
 *
 * Die Schichten liegen auseinandergezogen uebereinander. Dominant ist
 * der Custom RAG Core — die eigene Systemlogik. Provider haengen seitlich
 * an Ports, im Zentrum sitzt die eigene Marke als Ursprung. Der Scroll
 * fuehrt einen Request-Trace durch die Schichten (auf Desktop zusaetzlich
 * Hover): ein aktiver Schritt, gefuellte Leitungen bis dorthin.
 * ================================================================== */

/*
 * Request-Trace: die Reihenfolge, in der eine Anfrage die Architektur
 * durchlaeuft. Genau EIN Schritt ist aktiv; alles davor gilt als
 * durchlaufen, die Leitungen bis dorthin sind gefuellt.
 */
const TRACE = ['worker', 'fastapi', 'core', 'embeddings', 'vectorstore', 'generation', 'grounding', 'runtime'];
// Handy: Kacheln liegen einzeln im Fluss (Core → Mistral → Groq → Vectorize →
// Workers AI). Die Anker muessen in Leserichtung steigen, sonst springt der
// Trace — daher dieselben Schritte in Bildreihenfolge.
const TRACE_MOBILE = ['worker', 'fastapi', 'core', 'embeddings', 'grounding', 'vectorstore', 'generation', 'runtime'];

// Leitung/Port → ab welchem Schritt sie gefuellt ist
const LINKS = {
  'c-edge': 'worker',
  'c-app': 'fastapi',
  'c-core': 'core',
  'p-embeddings': 'embeddings',
  'p-vectorstore': 'vectorstore',
  'p-generation': 'generation',
  'p-grounding': 'grounding',
  'c-runtime': 'runtime',
};

// Module im Core, die zum aktiven Schritt gehoeren (nur leise Betonung)
const MODULE_LINKS = {
  core: ['m-retrieval', 'm-context', 'm-grounding', 'm-citations'],
  embeddings: ['m-retrieval'],
  vectorstore: ['m-retrieval'],
  generation: ['m-grounding'],
  grounding: ['m-grounding'],
};

// Desktop: diese Reihe liegt nebeneinander und ist gemeinsam aktiv
const CORE_ROW = ['core', 'embeddings', 'grounding', 'vectorstore', 'generation'];

// Aktivlinie im Viewport (Anteil der Hoehe)
const FOCUS_LINE = 0.55;

const MODULES = [
  { id: 'm-retrieval', label: 'Retrieval', sub: 'Threshold · Sichtbarkeit' },
  { id: 'm-context', label: 'Context Builder', sub: 'Ranking · Dedupe · Budget' },
  { id: 'm-grounding', label: 'Grounding', sub: 'keine Quelle, keine Antwort' },
  { id: 'm-citations', label: 'Citation Validation', sub: 'Labels gegen Retrieval' },
];

/* Offizielles Marken-Glyph, monochrom — Name steht immer daneben. */
function Logo({ id }) {
  return (
    <svg aria-hidden="true" className="rx-logo" focusable="false" viewBox="0 0 24 24">
      <path d={TECH_LOGOS[id].d} />
    </svg>
  );
}

export default function RagTechStack() {
  /*
   * Ein Active-State aus zwei Quellen:
   *   scrollFocus — der Schritt, dessen Anker die Aktivlinie ueberschritten hat
   *   keyFocus    — Tastatur-Fokus; danach zurueck zum Scroll
   * Kein Pin, kein Scrubbing einer Timeline: nur Zustand aus der nativen
   * Scrollposition.
   */
  const [keyFocus, setKeyFocus] = useState(null);
  const [scrollFocus, setScrollFocus] = useState(null);
  const archRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const trace = isMobile ? TRACE_MOBILE : TRACE;
  const focus = keyFocus ?? scrollFocus;
  const rowActive = !isMobile && CORE_ROW.includes(focus);
  // Aktive Core-Reihe: Leitungen/Ports der ganzen Reihe gefuellt
  // (Desktop: die ganze Reihe inkl. Grounding ist gefuellt)
  const step = rowActive ? trace.indexOf('grounding') : (focus ? trace.indexOf(focus) : -1);

  useEffect(() => {
    const root = archRef.current;
    if (!root) return undefined;
    let anchors = [];
    let bottom = 0;

    // Anker in Seitenkoordinaten. Handy: jede Kachel liegt einzeln im Fluss.
    // Desktop: die Core-Reihe liegt nebeneinander — ihre Hoehe wird in vier
    // gleiche Abschnitte geteilt (Core → Mistral → Vectorize → Generation),
    // damit auch dort der Fokus der Scrollposition folgt.
    const measure = () => {
      const y = window.scrollY;
      const top = (id) => {
        const rect = root.querySelector(`[data-arch="${id}"]`).getBoundingClientRect();
        return rect.top + y + Math.min(rect.height * 0.3, 60);
      };
      const order = isMobile ? TRACE_MOBILE : TRACE;
      const byId = Object.fromEntries(order.map((id) => [id, top(id)]));
      if (!isMobile) {
        const core = root.querySelector('[data-arch="core"]').getBoundingClientRect();
        // Desktop: die Core-Reihe wird als EIN Zustand aktiv — Core, Mistral
        // links und Vectorize/Generation rechts gleichzeitig.
        CORE_ROW.forEach((id) => { byId[id] = core.top + y + Math.min(core.height * 0.3, 60); });
      }
      anchors = order.map((id) => byId[id]);
      // Der letzte Schritt (Runtime) bleibt noch kurz nach dem Ende aktiv.
      bottom = root.getBoundingClientRect().bottom + y + window.innerHeight * 0.2;
    };

    const update = () => {
      const line = window.scrollY + window.innerHeight * FOCUS_LINE;
      let index = -1;
      anchors.forEach((anchor, i) => { if (line >= anchor) index = i; });
      const order = isMobile ? TRACE_MOBILE : TRACE;
      setScrollFocus(index < 0 || line > bottom ? null : order[index]);
    };

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onRefresh: () => { measure(); update(); },
      onUpdate: update,
      onLeave: () => setScrollFocus(null),
      onLeaveBack: () => setScrollFocus(null),
    });
    measure();
    update();
    return () => trigger.kill();
  }, [isMobile]);

  // Hierarchie: EIN aktiver Schritt (Orange), davor durchlaufen (ruhig hell),
  // danach noch nicht erreicht (zurueckgenommen).
  const cls = (id, base) => {
    if (step < 0) return base;
    const i = trace.indexOf(id);
    if (i === step || (rowActive && CORE_ROW.includes(id))) return `${base} is-active`;
    return `${base} ${i < step ? 'is-passed' : 'is-ahead'}`;
  };
  const link = (id, base) => (step >= trace.indexOf(LINKS[id]) ? `${base} is-lit` : base);
  const moduleCls = (id) => (MODULE_LINKS[rowActive ? 'core' : focus]?.includes(id) ? 'rx-arch__module is-on' : 'rx-arch__module');
  // Nur Tastatur-Fokus uebersteuert den Scroll. Maus-Hover bewusst nicht:
  // beim Scrollen wandern Kacheln unter dem ruhenden Cursor durch und
  // wuerden den Trace sonst springen lassen.
  const bind = (id) => ({
    'data-arch': id,
    onBlur: () => setKeyFocus(null),
    onFocus: () => setKeyFocus(id),
  });

  return (
    <section className="rx-block rx-arch-block" aria-labelledby="rx-stack-title">
      <header className="rx-head">
        <p className="rx-eyebrow">06 · Under the Hood</p>
        <h3 id="rx-stack-title">Die eigene Logik sitzt in der Mitte.</h3>
        <p>Gateway, API und Provider sind austauschbar. Der Custom RAG Core entscheidet, was gefunden, verwendet, geprüft und zitiert wird.</p>
      </header>

      <div className="rx-arch" data-focus={focus || undefined} ref={archRef}>
        <span className={`rx-arch__request${step >= 0 ? ' is-lit' : ''}`}>User · Request</span>
        <span aria-hidden="true" className={link('c-edge', 'rx-arch__conduit')} />

        <div className={cls('worker', 'rx-arch__plane is-edge')} {...bind('worker')}>
          <span className="rx-arch__layer">Edge Layer</span>
          <strong className="rx-arch__tech"><span><Logo id="cloudflare" />Cloudflare Worker</span></strong>
          <small>Edge Guard · Body-Limit · Turnstile</small>
          <AskAction label="Fragen" topic="worker" variant="compact" />
        </div>
        <span aria-hidden="true" className={link('c-app', 'rx-arch__conduit')} />

        <div className={cls('fastapi', 'rx-arch__plane is-app')} {...bind('fastapi')}>
          <span className="rx-arch__layer">Application Layer</span>
          <strong className="rx-arch__tech"><span><Logo id="fastapi" />FastAPI</span><i aria-hidden="true">·</i><span><Logo id="python" />Python</span></strong>
          <small>Transport · Schemas · Middleware · Fehler-Envelope</small>
          <AskAction label="Fragen" topic="fastapi" variant="compact" />
        </div>
        <span aria-hidden="true" className={link('c-core', 'rx-arch__conduit')} />

        <div className="rx-arch__core-row">
          {/* Links wie rechts: zwei Provider als Paar mittig neben dem Core —
              Mistral (Embeddings) und darunter Groq (Grounding) */}
          <div className="rx-arch__stack is-left">
            <div className={cls('embeddings', 'rx-arch__provider is-left')} {...bind('embeddings')}>
              <span className="rx-arch__layer">Embedding Provider</span>
              <strong className="rx-arch__tech"><span><Logo id="mistralai" />Mistral</span></strong>
              <small>mistral-embed · 1024 Dim. · Cosine</small>
              <span aria-hidden="true" className={link('p-embeddings', 'rx-arch__port')} />
              <AskAction label="Fragen" topic="embeddings" variant="compact" />
            </div>
            <div className={cls('grounding', 'rx-arch__provider is-left')} {...bind('grounding')}>
              <span className="rx-arch__layer">Grounding Provider</span>
              <strong className="rx-arch__tech"><span><Logo id="groq" />Groq</span></strong>
              <small>openai/gpt-oss-20b</small>
              <small>Independent grounding verification</small>
              <span aria-hidden="true" className={link('p-grounding', 'rx-arch__port')} />
              <AskAction label="Fragen" topic="groundingProvider" variant="compact" />
            </div>
          </div>

          <div className={cls('core', 'rx-arch__core')} {...bind('core')}>
            {/* Die eigene Marke als Ursprung der Architektur */}
            <span aria-hidden="true" className="rx-arch__logo">
              <i />
              <span className="rx-arch__mark">ÇU</span>
            </span>
            <span className="rx-arch__layer">Custom RAG Core</span>
            <strong>Eigene Systemlogik</strong>
            <small>Ports &amp; Adapters · kein Orchestrierungs-Framework</small>
            <div className="rx-arch__modules">
              {MODULES.map((module) => (
                <span className={moduleCls(module.id)} key={module.id}>
                  <b>{module.label}</b>
                  <em>{module.sub}</em>
                </span>
              ))}
            </div>
            <AskAction label="Den Core fragen" topic="core" variant="compact" />
          </div>

          <div className="rx-arch__stack">
            <div className={cls('vectorstore', 'rx-arch__provider is-right')} {...bind('vectorstore')}>
              <span className="rx-arch__layer">Vector Store</span>
              <strong className="rx-arch__tech"><span><Logo id="cloudflare" />Cloudflare Vectorize</span></strong>
              <small>Index · visibility = public im Query</small>
              <span aria-hidden="true" className={link('p-vectorstore', 'rx-arch__port')} />
              <AskAction label="Fragen" topic="vectorstore" variant="compact" />
            </div>
            <div className={cls('generation', 'rx-arch__provider is-right')} {...bind('generation')}>
              <span className="rx-arch__layer">Generation Provider</span>
              <strong className="rx-arch__tech"><span><Logo id="cloudflare" />Cloudflare Workers AI</span></strong>
              <small>@cf/openai/gpt-oss-120b</small>
              <span aria-hidden="true" className={link('p-generation', 'rx-arch__port')} />
              <AskAction label="Fragen" topic="generation" variant="compact" />
            </div>
          </div>
        </div>

        <span aria-hidden="true" className={link('c-runtime', 'rx-arch__conduit is-short')} />
        <div className={cls('runtime', 'rx-arch__plane is-runtime')} {...bind('runtime')}>
          <span className="rx-arch__layer">Runtime</span>
          <strong className="rx-arch__tech"><span><Logo id="docker" />Docker</span><i aria-hidden="true">·</i><span><Logo id="googlecloud" />Google Cloud Run</span></strong>
          <small>Container für API und Core</small>
          <AskAction label="Fragen" topic="runtime" variant="compact" />
        </div>
      </div>
    </section>
  );
}
