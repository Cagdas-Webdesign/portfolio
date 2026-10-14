import KnowledgeSpace from './KnowledgeSpace.jsx';
import { KNOWLEDGE_DOTS, SPACE_QUERY, candidatesFor } from './spaceData.js';
import { DEMO_CHUNKS, DEMO_CLAIMS, DEMO_QUESTION, STAGES } from './ragData.js';

/* ==================================================================
 * „Inside the RAG“ — EIN Raum, in dem sich dieselbe Frage verwandelt.
 *
 * Keine Szenenwechsel. Alle Objekte existieren durchgehend und bekommen
 * pro Stage eine Zielposition, Groesse, Deckkraft und Tiefe (aus JS,
 * als CSS-Variablen). Die CSS-Transitions interpolieren dazwischen:
 *
 *   Request → Tokens → Query Vector → Knowledge Space → Kandidaten
 *   → herausgeloeste Fragmente → Bounded Context → Claims
 *   → Evidence Connections → Citations → Assistant-Antwort
 *
 * Ebenen: Floor/Grid (hinten) · Knowledge Space · aktive Daten · Labels.
 * Koordinatensystem 600×600, --u = 1/600 der Canvas-Breite.
 * ================================================================== */

const WORD_NUMBERS = ['0.0213', '−0.1178', '0.0864', '0.2411', '−0.0457', '0.1302', '−0.0921', '0.0588'];
const CONSTELLATION = [
  [178, 262, 0.9], [246, 208, 1], [322, 236, 1.1], [404, 198, 0.95],
  [226, 326, 0.85], [318, 334, 1], [408, 296, 0.9], [470, 250, 0.8],
];
const DEPTH_NUMBERS = [[120, 170, '0.0042'], [500, 150, '−0.2031'], [150, 400, '0.1776'], [480, 390, '−0.0318'], [300, 140, '0.0915']];

const Q = SPACE_QUERY;
const { top3: TOP3, near: NEAR } = candidatesFor(Q);
const dotOf = (id) => KNOWLEDGE_DOTS.find((dot) => dot.id === id);

// Stationen der Fragmente
const FLOAT = [[118, 500], [300, 520], [482, 500]];
const SLOT_Y = [186, 300, 414];
const CTX_X = 170;
const CLAIM_X = 446;
const CLAIM_Y = [178, 262, 346, 430];
const SRC_INDEX = { S1: 0, S2: 1, S3: 2 };
// Reihenfolge der Entstehung (ms) — das jeweilige Fragment leuchtet kurz vorher.
const CLAIM_DELAY = [0, 800, 1600, 2400];

/* Woerter der Frage: grob an ihrer Stelle im Request-Objekt verteilt. */
function tokenLayout(words) {
  const out = [];
  let x = 104;
  let y = 236;
  words.forEach((word) => {
    const w = word.length * 12.4;
    if (x + w > 500) {
      x = 104;
      y += 34;
    }
    out.push([x + w / 2, y]);
    x += w + 8;
  });
  return out;
}

function o(x, y, s = 1, opacity = 1, extra = {}) {
  return { '--x': x, '--y': y, '--s': s, opacity, ...extra };
}

export default function RagCanvas({ stage }) {
  const words = DEMO_QUESTION.split(' ');
  const inText = tokenLayout(words);
  const mode = stage >= 7 && stage <= 8 ? 'verify' : 'flow';
  const at = (n) => stage >= n;

  /* ---------- Request-Objekt ---------- */
  let request = o(300, 250, 1, 1);
  if (stage === 2) request = o(300, 250, 0.97, 0.16);
  if (at(3)) request = o(300, 230, 0.9, 0);

  /* ---------- Tokens → Constellation → Query-Punkt ---------- */
  const tokenStyle = (i) => {
    const [cx, cy, depth] = CONSTELLATION[i % CONSTELLATION.length];
    if (stage < 2) return o(inText[i][0], inText[i][1], 1, 0, { '--dl': '0ms' });
    if (stage === 2) {
      return o(cx, cy, depth, 1, {
        '--dl': `${i * 70}ms`,
        filter: depth < 0.9 ? 'blur(0.6px)' : 'none',
      });
    }
    return o(Q.x, Q.y, 0.2, 0, { '--dl': `${i * 40}ms` });
  };

  /* ---------- Fragmente (retrieved chunks) ---------- */
  const fragStyle = (i) => {
    const dot = dotOf(TOP3[i]);
    if (stage < 4) return o(dot.x, dot.y, 0.08, 0, { '--dl': '0ms' });
    if (stage === 4) return o(FLOAT[i][0], FLOAT[i][1], 0.7, 1, { '--dl': `${500 + i * 160}ms` });
    if (stage <= 8) return o(CTX_X, SLOT_Y[i], 1, 1, { '--dl': `${250 + i * 180}ms` });
    return o(300, 470, 0.7, 0, { '--dl': `${i * 60}ms` });
  };

  /* ---------- Claims ---------- */
  const claimStyle = (claim, i) => {
    const y = CLAIM_Y[i];
    if (stage < 6) return o(CLAIM_X + 24, y, 0.96, 0, { '--dl': '0ms' });
    if (stage === 6) return o(CLAIM_X, y, 1, 1, { '--dl': `${CLAIM_DELAY[i] + 250}ms` });
    if (stage === 7) return o(claim.supported ? CLAIM_X - 12 : CLAIM_X + 6, y, 1, claim.supported ? 1 : 0.62, { '--dl': `${i * 90}ms` });
    if (stage === 8) return o(claim.supported ? CLAIM_X - 12 : CLAIM_X + 30, y, claim.supported ? 1 : 0.9, claim.supported ? 1 : 0, { '--dl': `${i * 60}ms` });
    return o(300, 300, 0.8, 0, { '--dl': `${i * 60}ms` });
  };

  const label = STAGES[stage];

  return (
    <div className="rx-canvas" data-mode={mode} data-stage={stage}>
      {/* Hintergrund: raeumlicher Boden, gibt Orientierung */}
      <div aria-hidden="true" className="rx-floor" />

      {/* System Layer: derselbe Knowledge Space wie in der Knowledge Pipeline */}
      <KnowledgeSpace
        candidates={NEAR}
        className="rx-canvas__space"
        hits={TOP3}
        query={Q}
        state={stage < 3 ? 'deep' : stage === 3 ? 'search' : stage === 4 ? 'retrieve' : stage <= 8 ? 'behind' : 'gone'}
      />

      {/* ---------- 01–02: Request-Objekt ---------- */}
      <div className="rx-o rx-request" style={request}>
        <header>
          <b>POST</b>
          <span>/api/v1/chat</span>
          <em>application/json</em>
        </header>
        <p className="rx-request__q" style={{ opacity: at(2) ? 0 : 1 }}>{DEMO_QUESTION}</p>
        <footer>
          <span><i>message</i> string · {DEMO_QUESTION.length} Zeichen</span>
          <span><i>fields</i> 1</span>
        </footer>
        <span aria-hidden="true" className="rx-request__scan" />
        <span className="rx-request__valid">Valid Request</span>
      </div>

      <ul aria-hidden="true" className="rx-o rx-checks" style={o(300, 352, 1, stage === 1 ? 1 : 0)}>
        {['Schema', 'Fields', 'Length'].map((item, i) => (
          <li key={item} style={{ '--i': i }}>{item}<i>✓</i></li>
        ))}
      </ul>

      {/* ---------- 03: Tokens → Query Vector ---------- */}
      <svg aria-hidden="true" className="rx-constellation" viewBox="0 0 600 600">
        <polyline
          pathLength="1"
          points={CONSTELLATION.slice(0, words.length).map(([x, y]) => `${x},${y}`).join(' ')}
        />
      </svg>
      {words.map((word, i) => (
        <span aria-hidden="true" className="rx-o rx-token" key={`${word}-${i}`} style={tokenStyle(i)}>
          <em>{word}</em>
          <b><span>{WORD_NUMBERS[i]}</span></b>
        </span>
      ))}
      {DEPTH_NUMBERS.map(([x, y, n]) => (
        <span aria-hidden="true" className="rx-o rx-depthnum" key={n} style={o(x, y, 0.8, stage === 2 ? 0.45 : 0)}>{n}</span>
      ))}
      <span aria-hidden="true" className="rx-o rx-vlabel" style={o(300, 420, 1, stage === 2 ? 1 : 0)}>
        Query Vector · 1024 Dimensionen · mistral-embed
      </span>

      {/* ---------- 06: Bounded Context ---------- */}
      <div aria-hidden="true" className={`rx-plane rx-plane--ctx${at(5) && stage <= 8 ? ' is-open' : ''}`}>
        <header><span>Bounded Context</span><em>3 Passagen</em></header>
        <div className="rx-budget"><span>Context Budget</span><i /></div>
      </div>

      {/* ---------- 07: Answer Draft / Verification ---------- */}
      <div aria-hidden="true" className={`rx-plane rx-plane--draft${at(6) && stage <= 8 ? ' is-open' : ''}`}>
        <header><span>{mode === 'verify' ? 'Verification' : 'Answer Draft'}</span></header>
      </div>

      {/* Evidence Connections — werden fuer Citations weiterverwendet */}
      <svg aria-hidden="true" className="rx-evidence" viewBox="0 0 600 600">
        {DEMO_CLAIMS.map((claim, i) => {
          const y2 = CLAIM_Y[i];
          const x2 = CLAIM_X - 128;
          if (!claim.source) {
            return <path className="rx-evidence__miss" d={`M${x2} ${y2} C ${x2 - 14} ${y2}, ${x2 - 20} ${y2 + 20}, ${x2 - 26} ${y2 + 24}`} key={claim.id} pathLength="1" />;
          }
          const y1 = SLOT_Y[SRC_INDEX[claim.source]];
          const d = `M${CTX_X + 118} ${y1} C ${CTX_X + 140} ${y1}, ${x2 - 22} ${y2}, ${x2} ${y2}`;
          return (
            <g key={claim.id}>
              <path className="rx-evidence__path" d={d} pathLength="1" style={{ '--dl': `${i * 160}ms` }} />
              <path className="rx-evidence__travel" d={d} pathLength="1" style={{ '--dl': `${i * 220}ms` }} />
            </g>
          );
        })}
      </svg>

      {DEMO_CHUNKS.map((chunk, i) => (
        <article
          className="rx-o rx-frag"
          key={chunk.id}
          style={{
            ...fragStyle(i),
            '--gd': `${CLAIM_DELAY[DEMO_CLAIMS.findIndex((c) => c.source === chunk.label)] ?? 0}ms`,
          }}
        >
          <header><b>{chunk.label}</b><strong>{chunk.section}</strong></header>
          <p>{chunk.text}</p>
          {i === 1 ? <p className="rx-frag__dup">Blöcke werden gepackt …<em>Duplikat entfernt</em></p> : null}
          <small>{chunk.doc} · h2</small>
        </article>
      ))}

      {DEMO_CLAIMS.map((claim, i) => (
        <p
          aria-hidden="true"
          className="rx-o rx-claim"
          data-supported={claim.supported}
          key={claim.id}
          style={claimStyle(claim, i)}
        >
          <span>{claim.text}</span>
          <i className="rx-claim__state">{claim.supported ? 'supported' : 'keine Grundlage'}</i>
          {claim.source ? <b className="rx-claim__cite">{claim.source}</b> : null}
        </p>
      ))}

      {/* ---------- 10: zurueck zum Produkt ---------- */}
      <div className="rx-answer">
        <header><i aria-hidden="true">✦</i>AI Portfolio Assistant</header>
        <p className="rx-answer__q">{DEMO_QUESTION}</p>
        <div className="rx-answer__a">
          <p>
            Das Chunking folgt der Struktur der Dokumente <sup>S1</sup>. Blöcke werden in der Größe
            begrenzt und leicht überlappt <sup>S2</sup>. Jeder Chunk behält Metadaten und Herkunft <sup>S3</sup>.
          </p>
          <div className="rx-answer__src">
            {DEMO_CHUNKS.map((chunk) => (
              <span key={chunk.id}><b>{chunk.label}</b>{chunk.doc} · {chunk.section}</span>
            ))}
          </div>
        </div>
        <small>Schematische Darstellung · die echte Antwort liefert der Assistent.</small>
      </div>

      {/* Vordergrund: aktuelle Station */}
      <div aria-hidden="true" className="rx-hud">
        <span>{String(stage + 1).padStart(2, '0')}</span>
        {label.label}
      </div>
    </div>
  );
}
