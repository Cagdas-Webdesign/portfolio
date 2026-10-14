import { useRef } from 'react';
import AskAction from './AskAction.jsx';
import { MOBILE_QUERY, useLiveWhileVisible, useMediaQuery } from './hooks.js';

/*
 * 02 — System Map. Zwei Prozesse, die sich beim Index treffen:
 *   Knowledge Pipeline (offline, beim Indexieren) — oben
 *   Question Pipeline (live, pro Frage)            — unten
 * Chunking liegt sichtbar nur in der oberen Pipeline.
 * Handy: dieselbe Map senkrecht (eigene Koordinaten, kein Verkleinern).
 */
const NODES = [
  { id: 'docs', label: 'Dokumente', sub: 'Markdown', kind: 'doc', side: 'k', h: [90, 110], v: [70, 70] },
  { id: 'chunk', label: 'Chunking', kind: 'step', side: 'k', h: [250, 110], v: [70, 170], ask: 'chunking' },
  { id: 'meta', label: 'Metadata', kind: 'step', side: 'k', h: [400, 110], v: [70, 260] },
  { id: 'embed', label: 'Embeddings', kind: 'step', side: 'k', h: [550, 110], v: [70, 350], ask: 'embeddings' },
  { id: 'q', label: 'Frage', sub: 'pro Anfrage', kind: 'question', side: 'q', h: [90, 450], v: [290, 70] },
  { id: 'valid', label: 'Validation', kind: 'step', side: 'q', h: [250, 450], v: [290, 170], ask: 'validation' },
  { id: 'qembed', label: 'Query Embedding', kind: 'step', side: 'q', h: [420, 450], v: [290, 260], ask: 'embeddings' },
  { id: 'index', label: 'Vector Index', sub: 'Vector Search', kind: 'index', side: 'm', h: [700, 280], v: [180, 470], ask: 'vectorsearch' },
  { id: 'retr', label: 'Retrieval', kind: 'step', side: 'm', h: [860, 280], v: [180, 610], ask: 'retrieval' },
  { id: 'ctx', label: 'Context', kind: 'step', side: 'm', h: [960, 190], v: [180, 700], ask: 'context' },
  { id: 'gen', label: 'Generation', kind: 'step', side: 'm', h: [1120, 190], v: [180, 790], ask: 'generation' },
  { id: 'ground', label: 'Grounding', kind: 'check', side: 'm', h: [1120, 370], v: [180, 880], ask: 'grounding' },
  { id: 'cite', label: 'Citations', kind: 'step', side: 'm', h: [960, 370], v: [180, 970], ask: 'citations' },
  { id: 'answer', label: 'Antwort', sub: '+ Quellen', kind: 'answer', side: 'm', h: [960, 480], v: [180, 1070] },
];

const EDGES = [
  ['docs', 'chunk', 'k'], ['chunk', 'meta', 'k'], ['meta', 'embed', 'k'], ['embed', 'index', 'k'],
  ['q', 'valid', 'q'], ['valid', 'qembed', 'q'], ['qembed', 'index', 'q'],
  ['index', 'retr', 'q'], ['retr', 'ctx', 'q'], ['ctx', 'gen', 'q'], ['gen', 'ground', 'q'], ['ground', 'cite', 'q'], ['cite', 'answer', 'q'],
];

const byId = Object.fromEntries(NODES.map((node) => [node.id, node]));

function curve([x1, y1], [x2, y2], vertical) {
  if (vertical) {
    const my = (y1 + y2) / 2;
    return `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
  }
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function Node({ node, pos }) {
  const [x, y] = pos;
  if (node.kind === 'index') {
    return (
      <g className="rx-map__node is-index" transform={`translate(${x} ${y})`}>
        <ellipse rx="92" ry="46" />
        {Array.from({ length: 26 }, (_, i) => {
          const a = i * 2.4;
          const r = 12 + ((i * 29) % 62);
          return <circle className={i % 7 === 0 ? 'is-hit' : ''} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.42} key={i} r={i % 7 === 0 ? 2.6 : 1.7} />;
        })}
        <text className="rx-map__label" y="70">{node.label}</text>
        <text className="rx-map__sub" y="86">{node.sub}</text>
      </g>
    );
  }
  const wide = node.label.length > 11 || node.kind === 'check' ? 150 : 124;
  return (
    <g className={`rx-map__node is-${node.kind} side-${node.side}`} transform={`translate(${x} ${y})`}>
      {node.kind === 'doc' ? (
        <>
          <rect height="46" rx="6" width="38" x="-26" y="-30" className="is-page" />
          <rect height="46" rx="6" width="38" x="-19" y="-24" className="is-page" />
          <rect height="46" rx="6" width="38" x="-12" y="-18" className="is-page" />
        </>
      ) : (
        <rect height="38" rx="19" width={wide} x={-wide / 2} y="-19" />
      )}
      {node.kind === 'check' ? <path className="is-check" d={`M${-wide / 2 + 14} -1l4 4 8-9`} /> : null}
      <text className="rx-map__label" y={node.kind === 'doc' ? 44 : 5}>{node.label}</text>
      {node.sub && node.kind !== 'doc' ? <text className="rx-map__sub" y="34">{node.sub}</text> : null}
      {node.kind === 'doc' ? <text className="rx-map__sub" y="60">{node.sub}</text> : null}
    </g>
  );
}

export default function RagSystemMap() {
  const ref = useRef(null);
  const vertical = useMediaQuery(MOBILE_QUERY);
  useLiveWhileVisible(ref);
  const key = vertical ? 'v' : 'h';

  return (
    <section className="rx-block rx-map" aria-labelledby="rx-map-title">
      <header className="rx-head">
        <p className="rx-eyebrow">02 · How it works</p>
        <h3 id="rx-map-title">Zwei Prozesse. Ein Treffpunkt.</h3>
        <p>
          Oben wird Wissen einmal vorbereitet. Unten läuft jede Frage live durch das System.
          Beide treffen sich im Vector Index.
        </p>
      </header>

      <div className="rx-map__legend">
        <span className="is-k">Knowledge Pipeline · offline, beim Indexieren</span>
        <span className="is-q">Question Pipeline · live, pro Frage</span>
      </div>

      <div className={`rx-map__stage is-${key}`} ref={ref}>
        <svg aria-label="Architektur: Knowledge Pipeline und Question Pipeline" role="img" viewBox={vertical ? '0 0 360 1130' : '0 0 1200 560'}>
          {EDGES.map(([from, to, side]) => {
            const d = curve(byId[from][key], byId[to][key], vertical);
            return (
              <g key={`${from}-${to}`}>
                <path className={`rx-map__edge side-${side}`} d={d} pathLength="1000" />
                <path className={`rx-map__impulse side-${side}`} d={d} pathLength="1000" style={{ animationDelay: `${(NODES.findIndex((n) => n.id === from) % 6) * 0.35}s` }} />
              </g>
            );
          })}
          {NODES.map((node) => <Node key={node.id} node={node} pos={node[key]} />)}
        </svg>
      </div>

      <div className="rx-asks">
        <AskAction label="Den RAG Core fragen" topic="core" />
        <AskAction label="Warum Chunking offline?" topic="chunking" />
      </div>
    </section>
  );
}
