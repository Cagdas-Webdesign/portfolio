// Cloudflare Turnstile fuer den Portfolio-Assistenten.
//
// Jede Chat-Anfrage bekommt einen eigenen, frischen Token: pro Anfrage wird ein
// Widget gerendert, sein Token genau einmal an den Worker geschickt und das
// Widget danach wieder entfernt. Nichts wird gespeichert oder wiederverwendet.
//
// Ausgelegt auf den Widget-Modus "Invisible": Der Container ist fuer Besucher
// nie sichtbar. Verlangt Cloudflare dennoch eine Interaktion (z. B. weil das
// Widget im Dashboard noch "Managed" ist), bricht die Anfrage sofort ab — eine
// Challenge in einem unsichtbaren Container koennte niemand loesen.

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Obergrenze fuer eine haengende Pruefung (langsame Verbindung, blockiertes Script). */
const TOKEN_TIMEOUT_MS = 60_000;

export class TurnstileError extends Error {
  /** @param {'config' | 'load' | 'challenge' | 'interactive' | 'timeout'} kind */
  constructor(kind) {
    super(`Turnstile failed: ${kind}`);
    this.name = 'TurnstileError';
    this.kind = kind;
  }
}

let scriptPromise = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new TurnstileError('load')));
    script.onerror = () => {
      script.remove();
      scriptPromise = null;
      reject(new TurnstileError('load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Einen frischen Turnstile-Token holen.
 *
 * `release` entfernt das Widget samt Token und muss nach der Anfrage — egal
 * mit welchem Ergebnis — aufgerufen werden.
 *
 * @param {HTMLElement} container
 * @returns {Promise<{ token: string, release: () => void }>}
 */
export async function acquireTurnstileToken(container) {
  const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim();
  if (!siteKey || !container) throw new TurnstileError('config');

  const turnstile = await loadTurnstile();

  return new Promise((resolve, reject) => {
    let widgetId = null;
    let settled = false;

    const release = () => {
      if (widgetId === null) return;
      try {
        turnstile.remove(widgetId);
      } catch {
        // Widget ist bereits weg.
      }
      widgetId = null;
    };

    const fail = (kind) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      release();
      reject(new TurnstileError(kind));
    };

    const timer = setTimeout(() => fail('timeout'), TOKEN_TIMEOUT_MS);

    try {
      widgetId = turnstile.render(container, {
        sitekey: siteKey,
        action: 'portfolio-chat',
        appearance: 'interaction-only',
        size: 'flexible',
        theme: 'dark',
        // Token wird sofort verbraucht, nie aufgefrischt ('manual' ist im Invisible-Modus unzulaessig).
        'refresh-expired': 'never',
        // Nach einem Fehler entfernen wir das Widget sofort; Turnstiles eigener
        // Auto-Retry riefe danach reset() auf einem entfernten Widget auf
        // ("Nothing to reset found"). Wiederholt wird ueber "Erneut senden".
        retry: 'never',
        callback: (token) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({ token, release });
        },
        'error-callback': () => {
          fail('challenge');
          return true;
        },
        'timeout-callback': () => fail('timeout'),
        'before-interactive-callback': () => fail('interactive'),
      });
    } catch {
      fail('challenge');
    }
  });
}
