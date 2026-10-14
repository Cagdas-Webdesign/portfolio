// Client fuer das Portfolio-RAG-Backend (v1.0.0).
//
// Der Browser spricht ausschliesslich mit dem Cloudflare Worker
// (VITE_RAG_API_URL, z. B. https://<worker>/api/v1/chat). Der Worker prueft
// Turnstile und Rate Limits und leitet erst dann an Cloud Run weiter. Das
// Origin-Secret setzt nur der Worker — hier gibt es bewusst keins.
//
// Das Frontend macht kein Retrieval und veraendert keine Citations: es
// schickt die Frage und reicht die Antwort unveraendert an die UI durch.

/**
 * @typedef {object} SourceCitation
 * @property {string} document_id  Stabile Dokument-ID.
 * @property {string} title        Titel des Dokuments.
 * @property {string} source       URL, Repository-Pfad oder Dateiname.
 * @property {string | null} [section] Innerste Ueberschrift, falls vorhanden.
 */

/**
 * `citations` ist leer, wenn die Knowledge Base die Frage nicht abdeckt —
 * eine normale, erfolgreiche Antwort, kein Fehler. `[n]` im Text verweist
 * auf den n-ten Eintrag von `citations`.
 *
 * @typedef {object} ChatResponse
 * @property {string} answer
 * @property {SourceCitation[]} citations
 * @property {string | null} conversation_id
 */

/**
 * @typedef {'config' | 'challenge' | 'rate_limited' | 'unavailable' | 'invalid_request'
 *   | 'server' | 'network' | 'timeout' | 'invalid_response'} RagErrorKind
 */

/** Entspricht MAX_MESSAGE_LENGTH im Backend (api/schemas/chat.py). */
export const MAX_MESSAGE_LENGTH = 2000;

/** Cold Start von Cloud Run plus Retrieval und Generation brauchen Luft. */
const REQUEST_TIMEOUT_MS = 60_000;

/** Fallback, falls Retry-After fehlt oder per CORS nicht lesbar ist. */
const DEFAULT_RETRY_AFTER_SECONDS = 10;

export class RagApiError extends Error {
  /**
   * @param {RagErrorKind} kind
   * @param {{ status?: number, code?: string, retryAfterSeconds?: number }} [info]
   */
  constructor(kind, info = {}) {
    super(`RAG request failed: ${kind}${info.status ? ` (${info.status})` : ''}`);
    this.name = 'RagApiError';
    this.kind = kind;
    this.status = info.status ?? null;
    this.code = info.code ?? null;
    this.retryAfterSeconds = info.retryAfterSeconds ?? null;
  }
}

export function getRagApiUrl() {
  return (import.meta.env.VITE_RAG_API_URL ?? '').trim();
}

/** @param {string | null} value */
function parseRetryAfter(value) {
  if (!value) return DEFAULT_RETRY_AFTER_SECONDS;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const date = Date.parse(value);
  if (Number.isFinite(date)) return Math.max(1, Math.ceil((date - Date.now()) / 1000));
  return DEFAULT_RETRY_AFTER_SECONDS;
}

/** @returns {value is SourceCitation} */
function isCitation(value) {
  return (
    value !== null
    && typeof value === 'object'
    && typeof value.document_id === 'string'
    && typeof value.title === 'string'
    && typeof value.source === 'string'
    && (value.section === undefined || value.section === null || typeof value.section === 'string')
  );
}

/**
 * Eine Frage an den Worker schicken.
 *
 * @param {string} message
 * @param {string} turnstileToken Frischer Token — genau einmal verwenden.
 * @returns {Promise<ChatResponse>}
 */
export async function askPortfolioAssistant(message, turnstileToken) {
  const url = getRagApiUrl();
  if (!url) throw new RagApiError('config');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Turnstile-Token': turnstileToken,
      },
      body: JSON.stringify({ message, conversation_id: null }),
      signal: controller.signal,
    });
  } catch (error) {
    // Hinweis: Antworten, die der Worker selbst ablehnt (401/403/429), tragen
    // in v1.0.0 keine CORS-Header und landen deshalb im Browser ebenfalls hier.
    throw new RagApiError(error?.name === 'AbortError' ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const status = response.status;
    const code = typeof data?.error?.code === 'string' ? data.error.code : undefined;

    if (status === 401 || status === 403) throw new RagApiError('challenge', { status, code });
    if (status === 429) {
      throw new RagApiError('rate_limited', {
        status,
        code,
        retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After')),
      });
    }
    if (status === 503) throw new RagApiError('unavailable', { status, code });
    if (status === 413 || status === 422) throw new RagApiError('invalid_request', { status, code });
    throw new RagApiError('server', { status, code });
  }

  if (!data || typeof data.answer !== 'string' || !Array.isArray(data.citations)) {
    throw new RagApiError('invalid_response', { status: response.status });
  }

  return {
    answer: data.answer,
    citations: data.citations.filter(isCitation),
    conversation_id: typeof data.conversation_id === 'string' ? data.conversation_id : null,
  };
}
