import { useEffect, useState } from 'react';
import { getLatestGitHubRelease, parseGitHubRepo } from '../services/githubRelease.js';

/**
 * Neuester GitHub-Release fuer eine Repository-URL.
 * Fragt erst, wenn `enabled` wahr ist (z. B. Menue geoeffnet), und nur fuer
 * gueltige github.com-URLs. Liefert null (noch nichts / kein Repository) oder
 * das Status-Objekt aus getLatestGitHubRelease.
 */
export function useLatestGitHubRelease(repositoryUrl, enabled = true) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const target = parseGitHubRepo(repositoryUrl);
    if (!enabled || !target) return undefined;

    let alive = true;
    getLatestGitHubRelease(target.owner, target.repo).then((next) => {
      if (alive) setResult(next);
    });
    return () => {
      alive = false;
    };
  }, [enabled, repositoryUrl]);

  return parseGitHubRepo(repositoryUrl) ? result : null;
}
