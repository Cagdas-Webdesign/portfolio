import { useCallback, useState } from 'react';

// Visuelle Presets des Assistenten. Ein Theme ist nur ein Identifier am Widget
// (data-assistant-theme); Farben und Radien liegen als Tokens in
// styles/assistant-themes.css. Keine Logik haengt am Theme.

export const ASSISTANT_THEMES = [
  { id: 'neural-blue', label: 'Neural Blue', description: 'Tiefschwarz · Glas · Blau' },
  { id: 'cosmic-green', label: 'Cosmic Green', description: 'Messenger · Grün' },
  { id: 'metallic-red', label: 'Metallic Red', description: 'Graphit · Metall · Rot' },
  { id: 'arctic-white', label: 'Arctic White', description: 'Hell · Minimal · Clean' },
];

export const DEFAULT_ASSISTANT_THEME = 'neural-blue';

/** Nur der Theme-Identifier wird lokal gespeichert — keine personenbezogenen Daten. */
const STORAGE_KEY = 'portfolio-assistant-theme';

const isKnownTheme = (value) => ASSISTANT_THEMES.some((theme) => theme.id === value);

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isKnownTheme(stored) ? stored : DEFAULT_ASSISTANT_THEME;
  } catch {
    return DEFAULT_ASSISTANT_THEME;
  }
}

export function useAssistantTheme() {
  const [theme, setThemeState] = useState(readStoredTheme);

  const setTheme = useCallback((next) => {
    if (!isKnownTheme(next)) return;
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Privater Modus / gesperrter Speicher: Theme gilt dann nur fuer diese Sitzung.
    }
  }, []);

  return { theme, setTheme };
}
