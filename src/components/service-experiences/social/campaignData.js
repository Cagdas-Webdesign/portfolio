/* ==================================================================
 * Pop-up 6 — Daten der fiktiven Kampagne VERDE
 *
 * Reine Konstanten (keine Komponenten), damit Fast Refresh die
 * Komponenten-Dateien sauber austauschen kann.
 * ================================================================== */

/*
 * Echte Bilder einsetzen: URL eintragen (z. B. /assets/...). GardenVisual
 * rendert dann ein <img> (object-fit: cover) statt der gezeichneten Szene.
 */
export const VERDE_ASSETS = {
  garden: null, // Hauptmotiv: Terrasse, Architektur, Abendlicht
  before: null, // Vorher-Zustand fuer den Vorher/Nachher-Vergleich
};

export const VERDE_COLORS = [
  { id: 'forest', name: 'Waldgrün', hex: '#14271F', role: 'Fläche & Ruhe' },
  { id: 'moss', name: 'Moos', hex: '#2F4A3A', role: 'Tiefe & Ebenen' },
  { id: 'cream', name: 'Kalkweiß', hex: '#F2EDE3', role: 'Text & Luft' },
  { id: 'brass', name: 'Messing', hex: '#C9A064', role: 'Akzent & Handlung' },
];

/* Marken A–D: Brand System, Message Match und Cross-Platform nutzen sie gemeinsam. */
export const BRAND_KEYS = [
  { id: 'color', key: 'A', label: 'Farbe' },
  { id: 'type', key: 'B', label: 'Typografie' },
  { id: 'image', key: 'C', label: 'Bildwelt' },
  { id: 'voice', key: 'D', label: 'Tonalität' },
];

/* Gartenberater: zwei feste Fragen, feste Antworten — keine KI, keine API. */
export const ADVISOR_QUESTIONS = [
  {
    id: 'project',
    text: 'Was möchten Sie verändern? Ich helfe Ihnen, Ihr Projekt kurz einzuordnen.',
    options: [
      { id: 'plan', label: 'Kompletten Garten planen', short: 'Kompletter Garten', interest: 'Neuplanung', next: 'Erstgespräch vor Ort' },
      { id: 'terrace', label: 'Terrasse & Außenbereich', short: 'Terrasse & Außenbereich', interest: 'Umgestaltung', next: 'Aufmaß & Materialberatung' },
      { id: 'care', label: 'Pflege & Modernisierung', short: 'Pflege & Modernisierung', interest: 'Modernisierung', next: 'Bestandsaufnahme im Garten' },
    ],
  },
  {
    id: 'size',
    text: 'Ungefähr wie groß ist die Fläche?',
    options: [
      { id: 's', label: 'Unter 100 m²' },
      { id: 'm', label: '100–300 m²' },
      { id: 'l', label: 'Über 300 m²' },
    ],
  },
];
