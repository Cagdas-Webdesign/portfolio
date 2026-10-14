import PhoneIcon from './icons.jsx';
import { GardenVisual, VerdeWordmark } from './verde.jsx';

/* ==================================================================
 * VERDE Landingpage im Phone
 *
 * Der Hero ist transparent: dahinter liegt die gemeinsame Bildflaeche
 * des Phones — dasselbe Motiv wie in der Anzeige. Alles danach hat eine
 * eigene Flaeche. Die Seite wird nie vom Besucher gescrollt, sondern
 * vom Kapitel an einen Anker gefahren (data-anchor).
 *
 * data-part: Zuordnung zu den Conversion-Prinzipien. Ein Element kann
 * mehreren Prinzipien dienen (Leerzeichen-getrennt).
 * ================================================================== */

const SERVICES = [
  ['01', 'Planung', 'Entwurf, Materialien, Bepflanzung.'],
  ['02', 'Umsetzung', 'Terrasse, Wege, Wasser, Licht.'],
  ['03', 'Pflege', 'Damit der Garten bleibt, wie gedacht.'],
];

export default function VerdeLandingPage({ pageRef }) {
  return (
    <div className="mk-lp">
      <div className="mk-lp__nav" data-enter="nav">
        <VerdeWordmark />
        <PhoneIcon name="menu" />
      </div>

      <div className="mk-lp__page" ref={pageRef}>
        <section className="mk-lp__hero" data-anchor="hero">
          <span aria-hidden="true" className="mk-lp__hero-shade" />
          <div className="mk-lp__hero-zone" data-label="Gleiches Motiv" data-label-pos="inside" data-part="match" />
          <div className="mk-lp__hero-copy" data-enter="hero">
            <small data-part="eyebrow">Gartengestaltung · Planung · Bau · Pflege</small>
            <h5 data-label="Hauptbotschaft" data-part="match hierarchy">
              Ihr Garten.
              <br />
              Neu gedacht.
            </h5>
            <p data-part="hierarchy-soft">Von der ersten Idee bis zum fertigen Außenbereich.</p>
            <span className="mk-lp__cta" data-label="Primärer CTA" data-label-pos="right" data-part="hierarchy">
              Projekt besprechen
              <PhoneIcon name="arrow" />
            </span>
          </div>
        </section>

        <section className="mk-lp__services" data-anchor="services">
          <p className="mk-lp__eyebrow">Alles aus einer Hand</p>
          <ul>
            {SERVICES.map(([number, title, line]) => (
              <li key={title}>
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{line}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-lp__projects" data-anchor="proof">
          <p className="mk-lp__eyebrow">Ausgewählte Projekte</p>
          <div className="mk-lp__compare" data-part="trust-soft">
            <GardenVisual className="mk-lp__compare-after" focusY={480} />
            <div className="mk-lp__compare-before">
              <GardenVisual focusY={480} variant="before" />
            </div>
            <span className="mk-lp__compare-line" aria-hidden="true" />
            <span className="mk-lp__compare-tag is-before">Vorher</span>
            <span className="mk-lp__compare-tag is-after">Nachher</span>
          </div>
          <div className="mk-lp__project-list">
            <figure>
              <GardenVisual focusY={470} />
              <figcaption>Terrassengarten<small>Holzdeck &amp; Licht</small></figcaption>
            </figure>
            <figure>
              <GardenVisual focusY={590} />
              <figcaption>Wassergarten<small>Becken &amp; Gräser</small></figcaption>
            </figure>
          </div>
        </section>

        <section className="mk-lp__trust" data-anchor="trust" data-label="Vertrauen" data-label-pos="inside-end" data-part="trust">
          <blockquote>
            „Wir wussten nach dem ersten Termin, wie unser Garten aussehen wird.“
            <cite>Stimme aus einem Beispielprojekt</cite>
          </blockquote>
          <ul>
            <li><PhoneIcon name="check" />Beratung vor Ort</li>
            <li><PhoneIcon name="check" />Ein fester Ansprechpartner</li>
            <li><PhoneIcon name="check" />Transparentes Angebot</li>
          </ul>
        </section>

        <section className="mk-lp__final" data-anchor="final">
          <h6>Bereit für Ihren neuen Außenbereich?</h6>
          <span className="mk-lp__cta is-solid" data-label="Ein nächster Schritt" data-part="close">
            Projekt besprechen
            <PhoneIcon name="arrow" />
          </span>
          <small>Unverbindliche Erstberatung</small>
        </section>
      </div>
    </div>
  );
}
