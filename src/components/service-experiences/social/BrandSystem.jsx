import { ModuleHeading } from '../shared.jsx';
import { BRAND_KEYS, VERDE_COLORS } from './campaignData.js';
import { GardenVisual, VerdeMark, VerdeWordmark } from './verde.jsx';

/* ==================================================================
 * 02 — CI / Brand System
 *
 * Kompakt: nur die Bausteine, die gleich in Anzeige und Landingpage
 * wieder auftauchen. Jede Kachel traegt eine Marke (A–D). Dieselben
 * Marken erscheinen spaeter beim Message Match am Phone — so wird
 * Konsistenz sichtbar statt erklaert.
 * ================================================================== */

function Key({ id }) {
  const item = BRAND_KEYS.find((entry) => entry.id === id);
  return <span aria-hidden="true" className="mk-brand__key">{item.key}</span>;
}

export default function BrandSystem() {
  return (
    <section className="sc-experience__section mk-brand">
      <ModuleHeading eyebrow="02 — Brand System" title="Jede Kampagne steht auf einer Marke.">
        <p>
          VERDE plant und baut hochwertige Gärten. Die Marke ist ruhig, architektonisch und
          nah an der Natur. Diese Bausteine tragen gleich die Anzeige und die Landingpage.
        </p>
      </ModuleHeading>

      <div className="mk-brand__grid">
        <article className="mk-brand__tile mk-brand__tile--logo">
          <VerdeMark className="mk-brand__mark" />
          <VerdeWordmark className="mk-brand__wordmark" />
          <p>Wortmarke &amp; Zeichen</p>
        </article>

        <article className="mk-brand__tile mk-brand__tile--color">
          <header><Key id="color" /><h4>Farbe</h4></header>
          <ul>
            {VERDE_COLORS.map((color) => (
              <li key={color.id} style={{ '--swatch': color.hex }}>
                <i aria-hidden="true" />
                <strong>{color.name}</strong>
                <small>{color.role}</small>
              </li>
            ))}
          </ul>
        </article>

        <article className="mk-brand__tile mk-brand__tile--type">
          <header><Key id="type" /><h4>Typografie</h4></header>
          <div className="mk-brand__type-row">
            <span className="mk-brand__type-sample is-serif">Aa</span>
            <p><strong>Editorial Serif</strong><small>Headlines &amp; Versprechen</small></p>
          </div>
          <div className="mk-brand__type-row">
            <span className="mk-brand__type-sample">Aa</span>
            <p><strong>Klare Grotesk</strong><small>Interface, Text &amp; Buttons</small></p>
          </div>
        </article>

        {/* Bildwelt als kleines Moodboard: ein Leitmotiv, drei Materialien. */}
        <article className="mk-brand__tile mk-brand__tile--image">
          <header><Key id="image" /><h4>Bildwelt</h4><span>Art Direction</span></header>
          <div className="mk-mood">
            <figure className="mk-mood__lead">
              <GardenVisual focusY={420} />
              <figcaption>Architektur &amp; Abendlicht</figcaption>
            </figure>
            <figure className="mk-mood__tex is-stone"><figcaption>Naturstein</figcaption></figure>
            <figure className="mk-mood__tex is-leaf"><figcaption>Pflanzen</figcaption></figure>
            <figure className="mk-mood__tex is-wood"><figcaption>Holz &amp; Licht</figcaption></figure>
          </div>
          <p>Das Ergebnis zeigen, nicht die Baustelle: ruhige Flächen, echte Materialien, warmes Licht.</p>
        </article>

        <article className="mk-brand__tile mk-brand__tile--voice">
          <header><Key id="voice" /><h4>Tonalität</h4></header>
          <p className="mk-brand__voice">Klar. Hochwertig. Persönlich.</p>
          <ul className="mk-brand__voice-list">
            <li className="is-do"><span aria-hidden="true">✓</span>„Wir planen Ihren Garten mit Ihnen.“</li>
            <li className="is-dont"><span aria-hidden="true">✕</span><s>„Jetzt zuschlagen – nur diese Woche!!!“</s></li>
          </ul>
        </article>
      </div>
    </section>
  );
}
