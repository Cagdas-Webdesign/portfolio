/*
 * Entfernt interne RAG-Quellenlabels aus dem SICHTBAREN Antworttext.
 *
 * Das Backend ersetzt `[S3]` normalerweise durch die oeffentliche Nummer
 * `[1]`, die auf den n-ten Eintrag von `citations` zeigt (bleibt erhalten).
 * Gelegentlich rutschen aber unkonvertierte Labels durch, z. B. `(S3, S7)`,
 * `(S1)` oder `[S2]`. Diese gehoeren nicht in den Text — die Quellen stehen
 * bereits als Buttons unter der Antwort.
 *
 * Reine Darstellungsfunktion: Die API-Antwort, Citation-Daten und Quellen-IDs
 * bleiben unveraendert; aufgerufen wird sie nur beim Rendern.
 *
 * Erkannt wird nur eine Klammer, die AUSSCHLIESSLICH aus S-Labels besteht
 * (`S` + Ziffern, getrennt durch Komma, Semikolon, Schraegstrich,
 * Bindestrich/Gedankenstrich oder Leerraum). Normale Klammerausdruecke wie
 * `(z. B. React)`, `(S-Bahn)`, `[1]` oder `(Seite 3)` bleiben stehen.
 */
const LABEL = 'S\\d{1,3}';
const SEPARATOR = '\\s*(?:[,;/\\-\\u2013\\u2014]\\s*|\\s+)';
const MARKER = new RegExp(
  `[ \\t\\u00A0]*[\\[(\\u3010]\\s*${LABEL}(?:${SEPARATOR}${LABEL})*\\s*[\\])\\u3011]([ \\t\\u00A0]*)`,
  'g',
);

export function stripSourceMarkers(text) {
  if (typeof text !== 'string' || !text.includes('S')) return text;

  return text.replace(MARKER, (match, trailing, offset, whole) => {
    const before = whole[offset - 1];
    const after = whole[offset + match.length];
    // Zeilenanfang: auch den Leerraum dahinter entfernen ("[S1] Text" -> "Text").
    if (before === undefined || before === '\n') return '';
    // Zeilenende oder Satzzeichen direkt danach: keinen Leerraum stehen lassen.
    if (after === undefined || after === '\n' || /[.,;:!?)\]]/.test(after)) return '';
    // Zwischen zwei Woertern genau ein Leerzeichen erhalten.
    return trailing ? ' ' : match.startsWith(' ') || match.startsWith('\t') ? ' ' : '';
  });
}
