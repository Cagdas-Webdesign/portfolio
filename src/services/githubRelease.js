// Neuester veroeffentlichter GitHub-Release eines oeffentlichen Repositorys.
//
// Oeffentliche REST-API ohne Token (CORS erlaubt, 60 Anfragen/h pro IP) —
// bewusst kein Secret im Frontend. `releases/latest` liefert nur den neuesten
// veroeffentlichten Release (keine Entwuerfe, keine Pre-Releases); angezeigt
// wird ausschliesslich dessen `tag_name`, nie eine Historie.
//
// Ergebnis ist immer ein Status, nie eine Exception:
//   { status: 'ok', tag, url }  Release vorhanden
//   { status: 'none' }          Repository ohne veroeffentlichten Release (404)
//   { status: 'error' }         Netz, Rate Limit, unerwartete Antwort
//
// Cache nur im Arbeitsspeicher (pro Seitenaufruf, kein localStorage/Cookie):
// Treffer und „kein Release“ 45 min, Fehler nur 5 min (dann darf es erneut
// versucht werden). Gleichzeitige Anfragen fuer dasselbe Repository teilen
// sich einen Request. Ein Neuladen fragt einmal neu — bei 60 Anfragen/h
// unkritisch; ein Rate-Limit fuehrt nur zum neutralen Fehlerzustand.

const CACHE_PREFIX = 'github-release:';
const TTL_MS = 45 * 60 * 1000;
const ERROR_TTL_MS = 5 * 60 * 1000;
const VERSION_TAG = /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

const inFlight = new Map();
const cache = new Map();

/** "https://github.com/{owner}/{repo}" → { owner, repo }; alles andere → null. */
export function parseGitHubRepo(repositoryUrl) {
  const match = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/.exec(repositoryUrl || '');
  return match ? { owner: match[1], repo: match[2] } : null;
}

function readCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  const ttl = entry.result.status === 'error' ? ERROR_TTL_MS : TTL_MS;
  return Date.now() - entry.at < ttl ? entry.result : null;
}

function writeCache(key, result) {
  cache.set(key, { at: Date.now(), result });
}

async function requestLatestRelease(owner, repo) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (response.status === 404) return { status: 'none' };
    if (!response.ok) return { status: 'error' };

    const data = await response.json();
    const tag = data?.tag_name;
    const url = data?.html_url;
    const valid = typeof tag === 'string' && VERSION_TAG.test(tag)
      && typeof url === 'string'
      && url.startsWith(`https://github.com/${owner}/${repo}/releases/`);
    return valid ? { status: 'ok', tag, url } : { status: 'error' };
  } catch {
    return { status: 'error' };
  }
}

/** Neuester Release (gecacht). Wirft nie. */
export function getLatestGitHubRelease(owner, repo) {
  const key = `${CACHE_PREFIX}${owner}/${repo}`;
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached);
  if (inFlight.has(key)) return inFlight.get(key);

  const request = requestLatestRelease(owner, repo).then((result) => {
    writeCache(key, result);
    inFlight.delete(key);
    return result;
  });
  inFlight.set(key, request);
  return request;
}
