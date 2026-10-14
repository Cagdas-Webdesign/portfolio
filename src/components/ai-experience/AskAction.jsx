import { askAssistant } from './askAssistant.js';
import { ASK } from './ragData.js';

/*
 * Context Action „✦ Assistent fragen“.
 *
 * [✦] ASSISTENT FRAGEN — bei Hover/Fokus erscheint die konkrete Frage
 * als schwebende Vorschau, ohne die Geometrie des Buttons zu aendern. Klick oeffnet den ECHTEN Assistenten, setzt die Frage ins
 * Eingabefeld (nicht senden).
 * Ohne Thema keine Aktion — bewusst kein generischer Fallback.
 */
export default function AskAction({ topic, variant = 'inline', label = 'Assistent fragen' }) {
  const question = ASK[topic];
  if (!question) return null;

  return (
    <button
      aria-label={`${label}: ${question}`}
      className={`ai-open-chat rx-ask rx-ask--${variant}`}
      onClick={() => askAssistant(question)}
      type="button"
    >
      <span aria-hidden="true" className="rx-ask__mark">✦</span>
      <span className="rx-ask__label">{label}</span>
      {/* Vorschau liegt ueber dem Layout (absolut) — Icon und Label bleiben fest. */}
      <span aria-hidden="true" className="rx-ask__preview">
        <span className="rx-ask__q">{question}</span>
      </span>
    </button>
  );
}
