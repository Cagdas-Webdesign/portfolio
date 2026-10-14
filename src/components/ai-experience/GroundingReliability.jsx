import { useRef, useState } from 'react';
import AskAction from './AskAction.jsx';
import { useOnceInView, useReducedMotion, useTabFollow } from './hooks.js';

/* ==================================================================
 * 05 — Verification Chamber
 *
 * Drei Garantien des Backends als drei kurze Szenen im selben Raum.
 * Jede Szene ist eine CSS-Timeline (--t = Startzeit). Der Basiszustand
 * ist das ENDE der Szene — mit reduzierter Bewegung sieht man direkt
 * das Ergebnis. Alles aus der Backend-README: kein Rueckgriff auf
 * Modellwissen, Backend-eigene Quellen, feste Antwort ohne LLM-Aufruf.
 * Koordinaten 1000×440 (--u = 1/1000 der Breite).
 * ================================================================== */

const CASES = [
  // Grounded: kein Zusatztext — die Szene selbst zeigt die Regel.
  { id: 'grounded', label: 'Grounded Answers', ask: 'grounding', result: null },
  { id: 'citations', label: 'Verified Citations', ask: 'citations', result: 'Das Modell wählt nur Labels. Was auf keinen abgerufenen Chunk zeigt, fällt heraus.' },
  { id: 'unknowns', label: 'Controlled Unknowns', ask: 'unknowns', result: 'Ohne Treffer über dem Threshold stoppt der Fluss vor der Generation. Es kommt eine feste Antwort.' },
];

const t = (seconds) => ({ '--t': `${seconds}s` });
// Desktop (x, y) im 1000×440-Raum, Handy (vx, vy) im 400×620-Raum.
const at = (x, y, seconds = 0, vx = x, vy = y) => ({ '--x': x, '--y': y, '--vx': vx, '--vy': vy, '--t': `${seconds}s` });

/*
 * Grounded Answers — einmalige Erklaerung, danach stabiler Endzustand:
 * Retrieved Context → die tragende Passage wird aktiv → Grounding Check
 * → Aussage gilt als gestuetzt (+ Zitat) → Grounded Answer.
 */
function Grounded() {
  const passages = [['S1', 'Chunking folgt der Struktur'], ['S2', 'Größe begrenzt, leicht überlappt'], ['S3', 'Metadaten pro Chunk']];
  return (
    <>
      <span className="rx-ch__col" style={at(190, 58, 0, 200, 40)}>Retrieved Context</span>
      <span className="rx-ch__col is-mid is-wide" style={at(500, 58, 0)}>Grounding Check</span>
      <span className="rx-ch__col is-wide" style={at(810, 58, 0)}>Supported Claim</span>
      <svg className="rx-ch__svg is-h" viewBox="0 0 1000 440">
        <path className="rx-ch__rail" d="M300 220 H 700" />
        <path className="rx-t-draw is-ok" d="M300 220 H 428" pathLength="1" style={t(1.4)} />
        <path className="rx-t-draw is-ok" d="M572 220 H 668" pathLength="1" style={t(2.5)} />
        <path className="rx-t-travel" d="M300 220 H 668" pathLength="1" style={t(2.6)} />
      </svg>
      <svg className="rx-ch__svg is-v" viewBox="0 0 400 620">
        <path className="rx-t-draw is-ok" d="M312 150 C 372 166, 372 282, 272 300" pathLength="1" style={t(1.4)} />
        <path className="rx-t-draw is-ok" d="M200 326 V 372" pathLength="1" style={t(2.5)} />
        <path className="rx-t-travel" d="M312 150 C 372 166, 372 282, 272 300" pathLength="1" style={t(2.6)} />
      </svg>
      {passages.map(([id, text], i) => (
        <span className={`rx-ch__chip rx-t-fade${id === 'S2' ? ' is-evidence rx-t-glow' : ' is-quiet rx-t-quiet'}`} key={id} style={{ ...at(190, 150 + i * 70, i * 0.12, 200, 90 + i * 60), '--g': '0.9s' }}>
          <b>{id}</b>{text}
        </span>
      ))}
      <span className="rx-ch__check rx-t-fade" style={at(500, 220, 1.2, 200, 300)}>
        <i className="rx-t-pop" style={t(2)}>
          <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg>
        </i>
        <span>
          Grounding Check
          <small>S2 trägt die Aussage</small>
        </span>
      </span>
      <div className="rx-ch__claim rx-t-fade rx-t-verify" style={{ ...at(810, 220, 0.3, 200, 430), '--g': '2.9s' }}>
        <p>Blöcke werden in der Größe begrenzt und leicht überlappt.</p>
        <span className="rx-ch__state is-ok rx-t-pop" style={t(3)}>Supported</span>
        <b className="rx-ch__cite rx-t-pop" style={t(3.4)}>S2</b>
      </div>
      <span className="rx-ch__grounded rx-t-fade" style={at(810, 346, 3.9, 200, 548)}>
        <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg>
        Grounded Answer · S2 zitiert
      </span>
    </>
  );
}

function Citations() {
  return (
    <>
      <span className="rx-ch__col" style={at(190, 58, 0, 100, 60)}>Retrieved</span>
      <span className="rx-ch__col" style={at(810, 58, 0, 300, 60)}>Generated</span>
      <svg className="rx-ch__svg is-v" viewBox="0 0 400 620">
        <path className="rx-t-draw is-ok" d="M176 130 H 240" pathLength="1" style={t(0.6)} />
        <path className="rx-t-draw is-ok" d="M176 220 H 240" pathLength="1" style={t(1.2)} />
        <path className="rx-t-miss" d="M240 310 C 220 310, 205 318, 190 330" pathLength="1" style={t(1.9)} />
      </svg>
      <svg className="rx-ch__svg is-h" viewBox="0 0 1000 440">
        <path className="rx-t-draw is-ok" d="M262 140 C 480 140, 520 140, 738 140" pathLength="1" style={t(0.6)} />
        <path className="rx-t-draw is-ok" d="M262 220 C 480 220, 520 220, 738 220" pathLength="1" style={t(1.2)} />
        <path className="rx-t-miss" d="M738 300 C 640 300, 560 290, 470 270" pathLength="1" style={t(1.9)} />
      </svg>
      {['S1', 'S2', 'S3'].map((id, i) => (
        <span className={`rx-ch__chip is-src rx-t-fade${id === 'S3' ? ' is-quiet' : ''}`} key={id} style={at(190, 140 + i * 80, i * 0.1, 100, 130 + i * 90)}>
          <b>{id}</b>abgerufen
        </span>
      ))}
      {['S1', 'S2'].map((id, i) => (
        <span className="rx-ch__chip is-ref rx-t-fade" key={id} style={at(810, 140 + i * 80, 0.2 + i * 0.1, 300, 130 + i * 90)}><b>{id}</b>gültig</span>
      ))}
      <span className="rx-ch__chip is-ref is-rejected rx-t-reject" style={at(810, 300, 0.4, 300, 310)}>
        <b>S7</b>keine Quelle
      </span>
      <div className="rx-ch__final rx-t-fade" style={at(500, 392, 3.3, 200, 470)}>
        Final Answer <b>S1</b><b>S2</b>
      </div>
    </>
  );
}

function Unknowns() {
  return (
    <>
      <svg className="rx-ch__svg is-v" viewBox="0 0 400 620">
        <path className="rx-ch__rail" d="M200 60 V 440" />
        <path className="rx-t-draw is-q" d="M200 80 V 250" pathLength="1" style={t(0.3)} />
        <path className="rx-t-draw is-k" d="M200 256 C 80 290, 70 500, 120 540" pathLength="1" style={t(2.6)} />
        <line className="rx-ch__barrier rx-t-fade" style={t(1.6)} x1="110" x2="290" y1="252" y2="252" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle className="rx-ch__kdot rx-t-flicker" cx={300 + ((i * 29) % 60)} cy={128 + ((i * 23) % 50)} key={i} r="3" style={t(0.9 + (i % 5) * 0.08)} />
        ))}
      </svg>
      <svg className="rx-ch__svg is-h" viewBox="0 0 1000 440">
        <path className="rx-ch__rail" d="M110 200 H 860" />
        <path className="rx-t-draw is-q" d="M130 200 H 470" pathLength="1" style={t(0.3)} />
        <path className="rx-t-draw is-k" d="M480 200 C 560 200, 580 330, 700 330 H 792" pathLength="1" style={t(2.6)} />
        <line className="rx-ch__barrier rx-t-fade" style={t(1.6)} x1="480" x2="480" y1="120" y2="280" />
        {Array.from({ length: 14 }, (_, i) => (
          <circle className="rx-ch__kdot rx-t-flicker" cx={300 + ((i * 37) % 70)} cy={96 + ((i * 23) % 44)} key={i} r="3" style={t(0.9 + (i % 5) * 0.08)} />
        ))}
      </svg>
      <span className="rx-ch__node is-q rx-t-fade" style={at(110, 200, 0, 200, 60)}>Query</span>
      <span className="rx-ch__node rx-t-fade" style={at(335, 200, 0.2, 200, 150)}>Retrieval</span>
      <span className="rx-ch__label rx-t-fade" style={at(335, 156, 1.1, 200, 200)}>kein Treffer über dem Threshold</span>
      <span className="rx-ch__stop rx-t-fade" style={at(480, 94, 1.7, 200, 280)}>No Grounded Context</span>
      <span className="rx-ch__node is-locked rx-t-fade" style={at(640, 200, 0.3, 200, 350)}>Generation<small>nicht aufgerufen</small></span>
      <span className="rx-ch__node is-off rx-t-fade" style={at(860, 200, 0.4, 200, 440)}>Answer</span>
      <div className="rx-ch__claim is-controlled rx-t-fade" style={at(860, 340, 3.3, 200, 548)}>
        <span className="rx-ch__state is-info">Controlled Response</span>
        <p>Feste Antwort: dazu gibt es kein gesichertes Wissen. Keine Quellen.</p>
      </div>
    </>
  );
}

const SCENES = { grounded: Grounded, citations: Citations, unknowns: Unknowns };

export default function GroundingReliability() {
  const [caseId, setCaseId] = useState('grounded');
  const active = CASES.find((item) => item.id === caseId);
  const Scene = SCENES[caseId];
  // Ein State (caseId): Tab-Klick setzt ihn, Szene und Tabbar lesen ihn.
  const tabsRef = useRef(null);
  const reduced = useReducedMotion();
  useTabFollow(tabsRef, CASES.findIndex((item) => item.id === caseId), reduced);
  // Die Szenen-Timelines starten erst, wenn die Kammer im Bild ist —
  // sonst liefe „Grounded Answers“ ungesehen beim Seitenaufbau ab.
  const [armed, setArmed] = useState(false);
  const chamberRef = useOnceInView(() => setArmed(true), 0.45);

  return (
    <section className="rx-block rx-rel" aria-labelledby="rx-rel-title">
      <header className="rx-head">
        <p className="rx-eyebrow">05 · Grounding &amp; Reliability</p>
        <h3 id="rx-rel-title">Nicht überzeugend. Nachvollziehbar.</h3>
        <p>Drei Regeln, strukturell im Backend verankert. Wähle einen Fall und beobachte die Prüfung.</p>
      </header>

      <div aria-label="Fall wählen" className="rx-rel__tabs rx-tabbar" ref={tabsRef} role="group">
        {CASES.map((item) => (
          <button aria-pressed={caseId === item.id} className={caseId === item.id ? 'is-selected' : ''} key={item.id} onClick={() => setCaseId(item.id)} type="button">
            {item.label}
          </button>
        ))}
      </div>

      <div aria-label={`Verification Chamber: ${active.label}`} className={`rx-ch${armed ? ' is-armed' : ''}`} ref={chamberRef} role="img">
        <div aria-hidden="true" className="rx-floor" />
        <div className="rx-ch__scene" data-case={caseId} key={caseId}>
          <Scene />
        </div>
      </div>

      <div className="rx-rel__result">
        {active.result ? <p key={caseId}>{active.result}</p> : null}
        <AskAction topic={active.ask} />
      </div>
    </section>
  );
}
