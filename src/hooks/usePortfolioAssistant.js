import { useCallback, useEffect, useRef, useState } from 'react';
import { askPortfolioAssistant, MAX_MESSAGE_LENGTH, RagApiError } from '../services/ragApi.js';
import { acquireTurnstileToken, TurnstileError } from '../services/turnstile.js';

// Ein einziger Request-Flow fuer Quick Prompts und freie Eingabe:
// Eingabe pruefen → frischer Turnstile-Token → Worker → Antwort + Citations
// anzeigen → Token verwerfen. Keine automatischen Wiederholungen.

let nextMessageId = 1;
const createId = () => `m${nextMessageId++}`;

/** @param {unknown} error */
function describeError(error) {
  if (error instanceof TurnstileError) {
    if (error.kind === 'config') return { text: 'Der Assistent ist gerade nicht konfiguriert.', retry: false };
    return {
      text: 'Die Sicherheitsprüfung konnte nicht abgeschlossen werden. Bitte versuch es noch einmal.',
      retry: true,
    };
  }

  if (error instanceof RagApiError) {
    switch (error.kind) {
      case 'config':
        return { text: 'Der Assistent ist gerade nicht konfiguriert.', retry: false };
      case 'challenge':
        return {
          text: 'Die Sicherheitsprüfung ist abgelaufen oder ungültig. Bitte sende deine Frage erneut.',
          retry: true,
        };
      case 'rate_limited':
        return {
          text: `Gerade kamen zu viele Anfragen an. Bitte warte ${error.retryAfterSeconds} Sekunden und versuch es dann erneut.`,
          retry: true,
          retryAfterSeconds: error.retryAfterSeconds,
        };
      case 'unavailable':
        return {
          text: 'Der Assistent ist vorübergehend nicht erreichbar. Bitte versuch es in einem Moment erneut.',
          retry: true,
        };
      case 'invalid_request':
        return { text: 'Diese Frage konnte nicht verarbeitet werden. Bitte formuliere sie kürzer.', retry: false };
      case 'timeout':
        return { text: 'Die Antwort hat zu lange gedauert. Bitte versuch es erneut.', retry: true };
      case 'network':
        return {
          text: 'Keine Verbindung zum Assistenten. Bitte prüfe deine Verbindung, warte kurz und versuch es erneut.',
          retry: true,
        };
      default:
        return { text: 'Gerade gibt es ein technisches Problem mit dem Assistenten. Bitte versuch es erneut.', retry: true };
    }
  }

  return { text: 'Gerade gibt es ein technisches Problem mit dem Assistenten. Bitte versuch es erneut.', retry: true };
}

/**
 * @param {{ turnstileRef: import('react').RefObject<HTMLElement> }} options
 */
export function usePortfolioAssistant({ turnstileRef }) {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const cooldownUntil = useRef(0);
  const cooldownTimers = useRef([]);

  useEffect(() => () => cooldownTimers.current.forEach(clearTimeout), []);

  /**
   * @param {string} rawQuestion
   * @param {{ retryOf?: string }} [options] ID der Fehlermeldung, die ersetzt wird.
   * @returns {Promise<boolean>} ob die Frage angenommen wurde
   */
  const ask = useCallback(async (rawQuestion, { retryOf } = {}) => {
    const question = String(rawQuestion ?? '').trim();
    if (!question || inFlight.current) return false;

    if (question.length > MAX_MESSAGE_LENGTH) {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: 'bot',
          kind: 'notice',
          text: `Deine Frage ist zu lang. Bitte kürze sie auf höchstens ${MAX_MESSAGE_LENGTH} Zeichen.`,
        },
      ]);
      return false;
    }

    const waitMs = cooldownUntil.current - Date.now();
    if (waitMs > 0) {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: 'bot',
          kind: 'notice',
          text: `Bitte warte noch ${Math.ceil(waitMs / 1000)} Sekunden, bevor du die nächste Frage stellst.`,
        },
      ]);
      return false;
    }

    inFlight.current = true;
    setPending(true);
    setMessages((current) => [
      ...(retryOf ? current.filter((message) => message.id !== retryOf) : current),
      ...(retryOf ? [] : [{ id: createId(), role: 'user', text: question }]),
    ]);

    let release = () => {};
    try {
      const challenge = await acquireTurnstileToken(turnstileRef.current);
      release = challenge.release;
      const data = await askPortfolioAssistant(question, challenge.token);
      setMessages((current) => [
        ...current,
        { id: createId(), role: 'bot', kind: 'answer', text: data.answer, citations: data.citations },
      ]);
    } catch (error) {
      console.error('[assistant]', error);
      const { text, retry, retryAfterSeconds } = describeError(error);
      const id = createId();

      if (retryAfterSeconds) {
        cooldownUntil.current = Date.now() + retryAfterSeconds * 1000;
        cooldownTimers.current.push(setTimeout(() => {
          setMessages((current) => current.map((message) => (
            message.id === id ? { ...message, cooldown: false } : message
          )));
        }, retryAfterSeconds * 1000));
      }

      setMessages((current) => [
        ...current,
        {
          id,
          role: 'bot',
          kind: 'error',
          text,
          retryQuestion: retry ? question : null,
          cooldown: Boolean(retryAfterSeconds),
        },
      ]);
    } finally {
      // Token ist verbraucht — Widget entfernen, die naechste Anfrage holt einen neuen.
      release();
      inFlight.current = false;
      setPending(false);
    }
    return true;
  }, [turnstileRef]);

  return { messages, pending, ask };
}
