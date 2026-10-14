import PhoneIcon from './icons.jsx';
import { VerdeMark, VerdeWordmark } from './verde.jsx';

/* ==================================================================
 * Instagram-Anzeige im Phone
 *
 * Zwei Ebenen, weil das Bild nicht der Anzeige gehoert, sondern der
 * gemeinsamen Bildflaeche im Phone (siehe CampaignPhone):
 *
 *   InstagramChrome — Feed-Oberflaeche um das Motiv herum
 *   AdCreative      — Wortmarke, Hook und Botschaft ueber dem Motiv
 *
 * data-part  = Bereich, den ein Kapitel hervorheben kann
 * data-build = Baustein der Aufbau-Sequenz (Brand → Visual → Hook → ...)
 * ================================================================== */

export function InstagramChrome() {
  return (
    <div className="mk-ig">
      <div className="mk-ig__bar">
        <PhoneIcon name="back" />
        <span>Beiträge</span>
        <i aria-hidden="true" />
      </div>

      <div className="mk-ig__post-head" data-build="brand">
        <span className="mk-ig__avatar"><VerdeMark /></span>
        <span className="mk-ig__account">
          <b>verde.garten</b>
          <small>Gesponsert</small>
        </span>
        <PhoneIcon name="dots" />
      </div>

      {/* Platzhalter fuer das Motiv — es liegt eine Ebene hoeher. */}
      <div aria-hidden="true" className="mk-ig__media" />

      <div className="mk-ig__cta" data-build="cta" data-label="CTA" data-label-pos="inside-end" data-part="cta">
        <span>Gartenprojekt anfragen</span>
        <PhoneIcon name="chevron" />
      </div>

      <div className="mk-ig__actions">
        <PhoneIcon name="heart" />
        <PhoneIcon name="comment" />
        <PhoneIcon name="send" />
        <PhoneIcon className="is-end" name="save" />
      </div>

      <p className="mk-ig__caption">
        <b>verde.garten</b> Vom ersten Entwurf bis zur Pflege: Außenbereiche, die zum Haus passen.
      </p>
    </div>
  );
}

export function AdCreative() {
  return (
    <div className="mk-ad">
      <span aria-hidden="true" className="mk-ad__shade" />
      <div className="mk-ad__brand" data-build="brand">
        <VerdeWordmark />
      </div>
      <div aria-hidden="true" className="mk-ad__visual-zone" data-label="Visual" data-label-pos="inside-end" data-part="visual" />
      <div className="mk-ad__copy">
        <p className="mk-ad__hook" data-build="hook" data-label="Hook" data-part="hook">
          Aus Garten wird Lebensraum.
        </p>
        <p className="mk-ad__message" data-build="message" data-label="Message" data-label-pos="right" data-part="message">
          Planung. Bau. Pflege.
          <br />
          Alles aus einer Hand.
        </p>
      </div>
    </div>
  );
}
