import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { EASE, ModuleHeading, SegmentedControl } from '../shared.jsx';
import { BRAND_KEYS } from './campaignData.js';
import PhoneIcon from './icons.jsx';
import { GardenVisual, VerdeMark, VerdeWordmark } from './verde.jsx';

/* ==================================================================
 * 09 — Cross-Platform
 *
 * Dieselbe VERDE-Kampagne in drei Nutzungssituationen. Die Vorschau
 * wechselt tatsaechlich die Form (Feed-Post, Business-Feed, Kanal-
 * Nachricht), rechts steht, was sich aendert — und was bewusst bleibt.
 * Die Marke (A–D aus dem Brand System) ist in allen drei gleich.
 * ================================================================== */

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'whatsapp', label: 'WhatsApp Channel' },
];

// Variable Ebene: was sich je Kanal aendert.
const VARIABLE_KEYS = ['Kanal', 'Format', 'Hook', 'Message', 'Creative'];
const CHANGES = {
  instagram: ['Feed · Paid Social', '4:5 · ein Motiv', 'Ein Satz im Bild', 'Aus Garten wird Lebensraum.', 'Abendlicht, Architektur'],
  tiktok: ['For You · nativ', '9:16 · Vollbild', 'Frage in Sekunde eins', 'Vom Rasen zur Terrasse.', 'Handkamera, Vorher/Nachher'],
  facebook: ['Feed · regional', '1.91:1 · Link-Anzeige', 'Region + Angebot', 'Erstberatung vor Ort.', 'Projektbild mit Kontext'],
  linkedin: ['Business-Feed', 'Text + Bild', 'Fachliche Beobachtung', 'Planung vor Pflanzung.', 'Ruhig, sachlich'],
  whatsapp: ['Kanal · direkt', 'Nachricht + Bild', 'Persönlich, ohne Umweg', 'Termine im April frei.', 'Kompakt, nah'],
};

// Stabile Ebene: was in allen Kanaelen gleich bleibt.
const FOUNDATION = [
  ['Strategie', 'Anfragen für Gartenprojekte'],
  ['Markenlogik', 'VERDE: Farbe, Serif, Bildwelt, Ton'],
  ['Conversion-Ziel', 'Erstberatung über die Landingpage'],
  ['Customer Journey', 'Creative → Seite → Berater → Lead'],
];

export function InstagramPreview() {
  return (
    <div className="mk-pf-ig">
      <header>
        <span className="mk-pf-avatar"><VerdeMark /></span>
        <span><b>verde.garten</b><small>Gesponsert</small></span>
        <PhoneIcon name="dots" />
      </header>
      <div className="mk-pf-ig__media">
        <GardenVisual />
        <span className="mk-pf-ig__shade" aria-hidden="true" />
        <VerdeWordmark className="mk-pf-ig__brand" />
        <p className="mk-pf-serif">Aus Garten wird Lebensraum.</p>
      </div>
      <div className="mk-pf-ig__cta">Gartenprojekt anfragen<PhoneIcon name="chevron" /></div>
      <div className="mk-pf-ig__actions">
        <PhoneIcon name="heart" /><PhoneIcon name="comment" /><PhoneIcon name="send" />
      </div>
    </div>
  );
}

export function LinkedInPreview() {
  return (
    <div className="mk-pf-li">
      <header>
        <span className="mk-pf-avatar is-square"><VerdeMark /></span>
        <span>
          <b>VERDE Garten &amp; Landschaft</b>
          <small>Unternehmen · Gesponsert · <PhoneIcon name="globe" /></small>
        </span>
      </header>
      <div className="mk-pf-li__text">
        <p>Die meisten Gartenprojekte scheitern nicht an der Umsetzung, sondern an der Planung davor.</p>
        <p>Deshalb beginnt jedes VERDE-Projekt mit einem Termin vor Ort: Licht, Boden, Nutzung. Erst dann entsteht der Entwurf.</p>
        <p className="is-more">Wie das aussieht, zeigt ein Terrassenprojekt … <span>mehr</span></p>
      </div>
      <div className="mk-pf-li__media">
        <GardenVisual focusY={475} />
        <div className="mk-pf-li__caption">
          <span>
            <b className="mk-pf-serif">Planung vor Pflanzung.</b>
            <small>verde-garten.de</small>
          </span>
          <em>Projekt ansehen</em>
        </div>
      </div>
      <footer>
        <span><PhoneIcon name="like" />Gefällt mir</span>
        <span><PhoneIcon name="comment" />Kommentieren</span>
        <span><PhoneIcon name="repost" />Teilen</span>
      </footer>
    </div>
  );
}

export function WhatsAppPreview() {
  return (
    <div className="mk-pf-wa">
      <header>
        <PhoneIcon name="back" />
        <span className="mk-pf-avatar"><VerdeMark /></span>
        <span><b>VERDE Garten</b><small>Kanal</small></span>
        <PhoneIcon name="bell" />
      </header>
      <div className="mk-pf-wa__feed">
        <span className="mk-pf-wa__day">Heute</span>
        <div className="mk-pf-wa__msg">
          <div className="mk-pf-wa__media"><GardenVisual focusY={480} /></div>
          <p>
            <b>Frühjahr ist Planungszeit.</b>
            {' '}
            Für April sind noch Termine zur Erstberatung frei. Kurz antworten genügt.
          </p>
          <span className="mk-pf-wa__link">Termin sichern →</span>
          <small>09:12</small>
        </div>
      </div>
    </div>
  );
}

export function TikTokPreview() {
  return (
    <div className="mk-pf-tt">
      <GardenVisual />
      <span className="mk-pf-tt__shade" aria-hidden="true" />
      <p className="mk-pf-tt__hook">Was würdest du mit <em>diesem</em> Garten machen?</p>
      <div className="mk-pf-tt__side" aria-hidden="true">
        <span className="mk-pf-avatar"><VerdeMark /></span>
        <PhoneIcon name="heart" /><PhoneIcon name="comment" /><PhoneIcon name="send" />
      </div>
      <div className="mk-pf-tt__meta">
        <b>@verde.garten</b>
        <span>Vom Rasen zur Terrasse in drei Schritten. #gartenplanung</span>
        <small><PhoneIcon name="music" />Originalton · VERDE</small>
      </div>
    </div>
  );
}

export function FacebookPreview() {
  return (
    <div className="mk-pf-fb">
      <header>
        <span className="mk-pf-avatar"><VerdeMark /></span>
        <span><b>VERDE Garten &amp; Landschaft</b><small>Gesponsert · <PhoneIcon name="globe" /></small></span>
        <PhoneIcon name="dots" />
      </header>
      <p>
        Gartenprojekt in der Region geplant? Wir planen, bauen und pflegen Außenbereiche,
        die zum Haus passen. Die Erstberatung vor Ort ist unverbindlich.
      </p>
      <div className="mk-pf-fb__media"><GardenVisual focusY={470} /></div>
      <div className="mk-pf-fb__cta">
        <span><small>verde-garten.de</small><b>Erstberatung für Ihren Garten</b></span>
        <em>Beratung anfragen</em>
      </div>
    </div>
  );
}

const PREVIEWS = {
  instagram: InstagramPreview,
  tiktok: TikTokPreview,
  facebook: FacebookPreview,
  linkedin: LinkedInPreview,
  whatsapp: WhatsAppPreview,
};

export default function PlatformAdaptation({ reducedMotion }) {
  const [platform, setPlatform] = useState('instagram');
  const Preview = PREVIEWS[platform];
  const duration = reducedMotion ? 0.01 : 0.38;

  return (
    <section className="sc-experience__section mk-platforms">
      <ModuleHeading eyebrow="09 — Cross-Platform" title="Eine Kampagne. Unterschiedliche Touchpoints.">
        <p>
          Die Marke bleibt VERDE. Was sich ändert, ist die Art zu sprechen: Jeder Kanal hat eine
          eigene Nutzungssituation.
        </p>
      </ModuleHeading>

      <SegmentedControl items={PLATFORMS} label="Kanal wählen" onSelect={setPlatform} selected={platform} />

      <div className="mk-platforms__stage">
        <div className="mk-platforms__preview" data-platform={platform} id="mk-platform-preview">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`mk-platforms__frame is-${platform}`}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -10, scale: reducedMotion ? 1 : 0.985 }}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 14, scale: reducedMotion ? 1 : 0.985 }}
              key={platform}
              transition={{ duration, ease: EASE }}
            >
              <Preview />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mk-platforms__notes">
          <div className="mk-layer mk-layer--variable">
            <header>
              <span>Außen · verändert sich je Kanal</span>
            </header>
            <dl>
              {VARIABLE_KEYS.map((label, index) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <AnimatePresence initial={false} mode="wait">
                    <motion.dd
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                      key={`${platform}-${label}`}
                      transition={{ duration: reducedMotion ? 0.01 : 0.28, delay: reducedMotion ? 0 : index * 0.05, ease: EASE }}
                    >
                      {CHANGES[platform][index]}
                    </motion.dd>
                  </AnimatePresence>
                </div>
              ))}
            </dl>
          </div>
          <div className="mk-layer mk-layer--foundation">
            <header>
              <span>Darunter · bleibt immer gleich</span>
              <PhoneIcon name="lock" />
            </header>
            <ul>
              {FOUNDATION.map(([label, value]) => (
                <li key={label}><strong>{label}</strong><small>{value}</small></li>
              ))}
            </ul>
            <p className="mk-layer__brand">
              {BRAND_KEYS.map((item) => <span key={item.id}>{item.key}</span>)}
              Markenbausteine aus Kapitel 02
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
