import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stripSourceMarkers } from './stripSourceMarkers.js';

describe('stripSourceMarkers', () => {
  describe('entfernt interne Quellenlabels', () => {
    it('einzelnes Label in eckigen Klammern', () => {
      assert.equal(stripSourceMarkers('FastAPI wird genutzt [S2].'), 'FastAPI wird genutzt.');
    });

    it('einzelnes Label in runden Klammern', () => {
      assert.equal(stripSourceMarkers('FastAPI wird genutzt (S1).'), 'FastAPI wird genutzt.');
    });

    it('kombinierte Labels mit Komma', () => {
      assert.equal(stripSourceMarkers('Vectorize speichert die Vektoren (S3, S7).'), 'Vectorize speichert die Vektoren.');
      assert.equal(stripSourceMarkers('Docker auf Cloud Run [S1,S4, S12].'), 'Docker auf Cloud Run.');
    });

    it('kombinierte Labels mit Semikolon, Schraegstrich, Strich oder Leerraum', () => {
      assert.equal(stripSourceMarkers('A (S1; S2) und B.'), 'A und B.');
      assert.equal(stripSourceMarkers('A [S1/S2] und B.'), 'A und B.');
      assert.equal(stripSourceMarkers('A (S1–S3) und B.'), 'A und B.');
      assert.equal(stripSourceMarkers('A [S1 S2] und B.'), 'A und B.');
    });

    it('Innenabstand in der Klammer und Lenticular-Klammern', () => {
      assert.equal(stripSourceMarkers('Text ( S5 ).'), 'Text.');
      assert.equal(stripSourceMarkers('Text【S5】.'), 'Text.');
    });

    it('Label mitten im Satz laesst genau ein Leerzeichen', () => {
      assert.equal(stripSourceMarkers('React (S1) und Vite [S2] bauen das Frontend.'), 'React und Vite bauen das Frontend.');
      assert.equal(stripSourceMarkers('React(S1) und Vite'), 'React und Vite');
      assert.equal(stripSourceMarkers('React [S1]und Vite'), 'React und Vite');
    });

    it('vor anderen Satzzeichen bleibt kein Leerzeichen', () => {
      assert.equal(stripSourceMarkers('Python [S1], FastAPI (S2) und Docker [S3]!'), 'Python, FastAPI und Docker!');
    });

    it('am Zeilenanfang und Zeilenende', () => {
      assert.equal(stripSourceMarkers('[S1] Erste Zeile\nZweite Zeile (S2)\nDritte'), 'Erste Zeile\nZweite Zeile\nDritte');
      assert.equal(stripSourceMarkers('Antwort [S1]'), 'Antwort');
    });

    it('mehrere Marker im Text', () => {
      assert.equal(stripSourceMarkers('A [S4]. B (S1, S7). C [S12].'), 'A. B. C.');
    });
  });

  describe('laesst normalen Text unveraendert', () => {
    const unchanged = [
      'Eine Antwort ganz ohne Quellenmarker.',
      'React (z. B. mit Vite) und GSAP (für Animationen).',
      'Die öffentliche Quelle steht als Nummer da [1] und [2].',
      'Kombiniert [1, 2] bleibt ebenfalls stehen.',
      'Mit der Linie (S-Bahn) zum Termin.',
      'Seite 3 (Seite 3) und Abschnitt (S. 12).',
      'Samsung (S24 Ultra) bleibt, weil die Klammer nicht nur aus Labels besteht.',
      'Ein Label ohne Klammer wie S1 bleibt stehen.',
      'Klammer mit Text (S1 ist die erste Quelle) bleibt.',
      'Größen (S, M, L) bleiben.',
      'Absatz eins.\n\nAbsatz zwei mit **Formatierung** und `code`.',
      '',
    ];

    for (const text of unchanged) {
      it(JSON.stringify(text), () => {
        assert.equal(stripSourceMarkers(text), text);
      });
    }

    it('erhaelt Absaetze und Zeilenumbrueche', () => {
      assert.equal(
        stripSourceMarkers('Erster Absatz [S1].\n\nZweiter Absatz (S2, S3).\n- Punkt [S4]'),
        'Erster Absatz.\n\nZweiter Absatz.\n- Punkt',
      );
    });

    it('nimmt Nicht-Strings unveraendert zurueck', () => {
      assert.equal(stripSourceMarkers(undefined), undefined);
      assert.equal(stripSourceMarkers(null), null);
    });

    it('veraendert das Eingabeobjekt nicht', () => {
      const message = Object.freeze({ text: 'A [S1].', citations: Object.freeze([{ document_id: 'S1' }]) });
      assert.equal(stripSourceMarkers(message.text), 'A.');
      assert.equal(message.text, 'A [S1].');
      assert.equal(message.citations[0].document_id, 'S1');
    });
  });
});
