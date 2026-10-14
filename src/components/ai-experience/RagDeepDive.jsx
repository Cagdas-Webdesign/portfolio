import { useCallback, useRef, useState } from 'react';
import AskAction from './AskAction.jsx';
import { MOBILE_QUERY, useMediaQuery, useStageSpy } from './hooks.js';
import RagCanvas from './RagCanvas.jsx';
import { STAGES } from './ragData.js';

/*
 * 03 — Inside the RAG. Eine Frage, zehn Stationen. Links (Handy: unten)
 * die Stationen, rechts (Handy: oben) die sticky Buehne. Jede Station ist
 * ein Zustand: sie uebernimmt, die Buehne wechselt kurz, dann Ruhe.
 */
export default function RagDeepDive() {
  const [stage, setStage] = useState(0);
  const listRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const onStage = useCallback((value) => setStage(value), []);

  useStageSpy(listRef, onStage, { line: isMobile ? '80%' : '55%', rebuildKey: isMobile });

  return (
    <section className="rx-block rx-dive" id="rx-inside" aria-labelledby="rx-dive-title">
      <header className="rx-head">
        <p className="rx-eyebrow">03 · Inside the RAG</p>
        <h3 id="rx-dive-title">Folge einer Frage durch das System.</h3>
        <p>Von der Eingabe bis zur Antwort mit Quellen. Jede Station lässt sich am echten Assistenten nachfragen.</p>
      </header>

      <div className="rx-dive__grid">
        <div className="rx-dive__stage">
          <RagCanvas stage={stage} />
          <ol aria-hidden="true" className="rx-dive__progress">
            {STAGES.map((item, index) => (
              <li className={index <= stage ? 'is-done' : ''} key={item.id} />
            ))}
          </ol>
        </div>

        <ol className="rx-dive__steps" ref={listRef}>
          {STAGES.map((item, index) => (
            <li className={`rx-step${stage === index ? ' is-active' : ''}`} data-stage={index} key={item.id}>
              <button className="rx-step__head" onClick={() => setStage(index)} type="button">
                <span className="rx-step__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="rx-step__label">{item.label}</span>
              </button>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
              {item.ask ? <AskAction topic={item.ask} /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
