/*
 * Bruecke zur bestehenden Assistant-UI (AiAssistantWidget).
 *
 * Die Section baut KEINEN eigenen Chat. Sie schickt nur ein Event;
 * das Widget oeffnet sich und setzt die Frage ins Eingabefeld (ohne zu
 * senden). Request-, Turnstile- und RAG-Logik bleiben unberuehrt.
 */
export const ASK_EVENT = 'portfolio-assistant:ask';

export function askAssistant(question = '') {
  window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: { question } }));
}
