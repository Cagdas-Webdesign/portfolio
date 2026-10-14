import { useCallback, useEffect, useRef, useState } from 'react';
import AskAction from './AskAction.jsx';
import { MOBILE_QUERY, useMediaQuery, useOnceInView, useReducedMotion, useTabFollow } from './hooks.js';
import KnowledgeSpace from './KnowledgeSpace.jsx';
import { INGESTION } from './ragData.js';

/* ==================================================================
 * 04 — Knowledge Pipeline: EIN Dokument wird zu Wissen im Index.
 *
 * Keine Stufen-Karten. Dieselben Objekte veraendern ihre Form:
 *   Dokument (roh) → normalisiert (Struktur erkannt) → Bloecke trennen
 *   sich entlang der Ueberschriften → Metadaten docken an → jeder Chunk
 *   bekommt eine zweite Ebene (Vektor) → alles zieht in den Knowledge
 *   Space, den „Inside the RAG“ spaeter durchsucht.
 * Koordinaten 600×520 (--u = 1/600 der Breite).
 * ================================================================== */

const BLOCKS = [
  { h: '# Custom RAG Backend', path: 'Custom RAG Backend', lines: [78, 60] },
  { h: '## Ingestion', path: '… › Ingestion', lines: [84, 66] },
  { h: '## Chunking', path: '… › Chunking', lines: [70, 80] },
  { h: '## Retrieval', path: '… › Retrieval', lines: [62, 74] },
];

// Positionen pro Stufe (Mittelpunkte, u)
const IN_DOC = (i) => [300, 262 + i * 56];
// Handy: Dokument fuellt die hohe Buehne (600×800) — groesser statt gedraengt.
const IN_DOC_MOBILE = (i) => [300, 380 + i * 92];
const DOC = [300, 262];
const DOC_MOBILE = [300, 400];
const TAGS = [['Frontmatter', 528, 136], ['Heading', 528, 226], ['Content Block', 528, 252]];
const TAGS_MOBILE = [['Frontmatter', 470, 150], ['Heading', 470, 357], ['Content Block', 470, 388]];
const SPLIT = [[168, 170], [432, 170], [168, 352], [432, 352]];
// Handy: Chunks untereinander und breit — lesbar statt winzig.
const SPLIT_MOBILE = [[300, 112], [300, 290], [300, 468], [300, 646]];
const INTO_INDEX = [379, 227];

const STEP_MS = 2300;

function o(x, y, s = 1, opacity = 1, extra = {}) {
  return { '--x': x, '--y': y, '--s': s, opacity, ...extra };
}

export default function KnowledgePipeline() {
  const reduced = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const split = isMobile ? SPLIT_MOBILE : SPLIT;
  const inDoc = isMobile ? IN_DOC_MOBILE : IN_DOC;
  const doc = isMobile ? DOC_MOBILE : DOC;
  const tags = isMobile ? TAGS_MOBILE : TAGS;
  const [stage, setStage] = useState(0);
  const timers = useRef([]);
  const clear = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  const play = useCallback(() => {
    // Handy: keine automatische Sequenz — der Nutzer waehlt die Stufe selbst
    // ueber die Tabbar, sie bleibt bis zum naechsten Tipp stehen.
    if (isMobile) return;
    clear();
    if (reduced) {
      setStage(INGESTION.length - 1);
      return;
    }
    setStage(0);
    INGESTION.forEach((_, i) => {
      if (i) timers.current.push(window.setTimeout(() => setStage(i), i * STEP_MS));
    });
  }, [isMobile, reduced]);

  const viewRef = useOnceInView(play, 0.4);

  // Wechsel auf Handy-Breite mitten in der Sequenz: laufende Timer stoppen.
  useEffect(() => {
    if (isMobile) clear();
  }, [isMobile]);

  // Eine gemeinsame activeStage: Autoplay und Tab-Klick setzen sie, die
  // Tabbar folgt ihr (auf dem Handy horizontal scrollend).
  const railRef = useRef(null);
  useTabFollow(railRef, stage, reduced);
  useEffect(() => clear, []);
  const current = INGESTION[stage];

  const blockStyle = (i) => {
    if (stage <= 1) {
      const [x, y] = inDoc(i);
      const jitter = stage === 0 ? [(i % 2 ? 7 : -5), 0] : [0, 0];
      return o(x + jitter[0], y, 1, 1, { '--dl': `${i * 60}ms` });
    }
    if (stage <= 4) return o(split[i][0], split[i][1], 1, 1, { '--dl': `${i * 110}ms` });
    return o(INTO_INDEX[0], INTO_INDEX[1], 0.06, 0, { '--dl': `${i * 120}ms` });
  };

  return (
    <section className="rx-block rx-ingest" aria-labelledby="rx-ingest-title">
      <header className="rx-head">
        <p className="rx-eyebrow">04 · Knowledge Pipeline</p>
        <h3 id="rx-ingest-title">Hier wird Wissen vorbereitet.</h3>
        <p>Bevor eine Frage gestellt wird, ist das Wissen längst im Index. Einmal, offline, reproduzierbar.</p>
      </header>

      <div aria-label="Stufen der Knowledge Pipeline" className="rx-ingest__rail rx-tabbar" ref={railRef} role="group">
        {INGESTION.map((item, i) => (
          <button
            aria-pressed={stage === i}
            className={i <= stage ? 'is-done' : ''}
            key={item.id}
            onClick={() => { clear(); setStage(i); }}
            type="button"
          >
            <i aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="rx-ingest__stage" data-stage={stage} ref={viewRef}>
        <div aria-hidden="true" className="rx-ingest__object">
          <div aria-hidden="true" className="rx-floor" />

          {/* Derselbe Knowledge Space wie bei Vector Search */}
          <div className="rx-ingest__space">
            <KnowledgeSpace fresh={[0]} state={stage === 5 ? 'index' : 'hidden'} />
          </div>

          {/* Das Dokument: Kopfzeile · Frontmatter · Abschnitte (Chunks) · Fusszeile */}
          <div className="rx-o rx-doc" style={o(doc[0], doc[1], stage <= 1 ? 1 : 1.04, stage <= 1 ? 1 : 0)}>
            <span className="rx-doc__head">
              <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z M9.5 1.5v3h3" /></svg>
              <b>custom-rag-backend.md</b>
              <em>Markdown</em>
            </span>
            <pre className="rx-doc__front">
              {'---\nid: custom-rag-backend\ntitle: Custom RAG Backend\nvisibility: public\ntopics: [rag, retrieval, grounding]\n---'}
            </pre>
            <span className="rx-doc__foot">
              <span>Frontmatter</span>
              <span>{BLOCKS.length} Abschnitte</span>
              <span>visibility · public</span>
            </span>
          </div>

          {/* Frontmatter bleibt als Quelle der Metadaten sichtbar */}
          <span className="rx-o rx-doc__inherit" style={o(300, 60, 1, stage >= 2 && stage <= 4 ? 1 : 0)}>
            Frontmatter · wird an jeden Chunk vererbt
          </span>

          {/* Erkannte Struktur (Normalization) */}
          {tags.map(([tag, x, y]) => (
            <span className="rx-o rx-doc__tag" key={tag} style={o(x, y, 1, stage === 1 ? 1 : 0)}>{tag}</span>
          ))}

          {/* Bloecke → Chunks → Metadaten → Vektoren → Index */}
          {BLOCKS.map((block, i) => (
            <div className="rx-o rx-chunk" data-stage={stage} key={block.h} style={blockStyle(i)}>
              <span className="rx-chunk__vec">
                {Array.from({ length: 24 }, (_, k) => <u key={k} style={{ '--o': ((i * 7 + k * 5) % 10) / 10 }} />)}
              </span>
              <div className="rx-chunk__text">
                <b>{block.h}</b>
                {block.lines.map((w, j) => <i key={j} style={{ width: `${w}%` }} />)}
              </div>
              <span className="rx-chunk__meta">
                <em>source · custom-rag-backend.md</em>
                <em>path · {block.path}</em>
                <em>visibility · public</em>
                <em>fingerprint · sha-256</em>
              </span>
            </div>
          ))}

          <span className="rx-o rx-ingest__note" style={o(300, isMobile ? 770 : 492, 1, stage === 4 || stage === 5 ? 1 : 0)}>
            {stage === 5 ? 'Derselbe Knowledge Space, den Vector Search durchsucht' : 'Der Text bleibt · der Vektor kommt dazu'}
          </span>
        </div>

        <div aria-live="polite" className="rx-ingest__caption">
          <strong>{current.label}</strong>
          <p>{current.text}</p>
          {current.facts ? (
            <dl className="rx-ingest__facts">
              {current.facts.map(([term, value]) => (
                <div key={term}><dt>{term}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          ) : null}
          <AskAction topic={current.ask} />
        </div>
      </div>
    </section>
  );
}
