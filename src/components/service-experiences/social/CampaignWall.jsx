import { useCallback, useRef } from 'react';
import { ModuleHeading } from '../shared.jsx';
import { useScrollProgress } from './hooks.js';
import PhoneIcon from './icons.jsx';
import {
  InstagramPreview,
  LinkedInPreview,
  TikTokPreview,
  WhatsAppPreview,
} from './PlatformAdaptation.jsx';
import { GardenVisual, VerdeMark, VerdeWordmark } from './verde.jsx';

/* ==================================================================
 * Abschluss — VERDE Campaign Wall
 *
 * Alle bekannten Bausteine ruhig nebeneinander, wie eine Agentur-
 * Praesentation: Marke, Creative, Landingpage im Phone, Kanal-Fragmente
 * und das Lead-Profil. Statisch — das Bild spricht fuer sich.
 * Die Vorschauen sind dieselben Komponenten wie in Kapitel 09.
 * ================================================================== */

export default function CampaignWall({ reducedMotion }) {
  const stageRef = useRef(null);

  // Das System setzt sich beim Hineinscrollen um das Phone zusammen:
  // --mk-in 0 → 1, an den Scroll gekoppelt, kein Autoplay.
  const onProgress = useCallback((progress) => {
    stageRef.current?.style.setProperty('--mk-in', reducedMotion ? '1' : progress.toFixed(3));
  }, [reducedMotion]);
  useScrollProgress(stageRef, onProgress, { start: 'top 95%', end: 'top 35%' });

  return (
    <section className="sc-experience__section mk-wall">
      <ModuleHeading title="Eine Idee wird zur Kampagne. Eine Kampagne wird zum System.">
        <p>Strategie, Marke, Content und Conversion – als eine zusammenhängende Experience.</p>
      </ModuleHeading>

      <div aria-hidden="true" className="mk-wall__stage" inert ref={stageRef}>
        <div className="mk-wall__piece is-brand">
          <VerdeMark className="mk-brand__mark" />
          <VerdeWordmark />
        </div>
        <div className="mk-wall__piece is-ig"><InstagramPreview /></div>
        <div className="mk-wall__piece is-phone">
          <div className="mk-wall__phone">
            <GardenVisual />
            <span className="mk-wall__shade" />
            <VerdeWordmark className="mk-wall__nav" sub={false} />
            <div className="mk-wall__hero">
              <small>Gartengestaltung · Planung · Bau · Pflege</small>
              <p>Ihr Garten.<br />Neu gedacht.</p>
              <span>Projekt besprechen <PhoneIcon name="arrow" /></span>
            </div>
            <span className="mk-wall__launcher">✦ Gartenberater</span>
          </div>
        </div>
        <div className="mk-wall__piece is-tt"><TikTokPreview /></div>
        <div className="mk-wall__piece is-li"><LinkedInPreview /></div>
        <div className="mk-wall__piece is-wa"><WhatsAppPreview /></div>
        <div className="mk-wall__piece is-advisor">
          <span className="mk-wall__lead-head">✦ Gartenberater <b>2 Fragen</b></span>
          <span className="mk-wall__bubble">Was möchten Sie verändern?</span>
          <span className="mk-wall__bubble is-user">Kompletten Garten planen</span>
          <span className="mk-wall__bubble">Wie groß ist die Fläche?</span>
          <span className="mk-wall__bubble is-user">100–300 m²</span>
        </div>
        <div className="mk-wall__piece is-lead">
          <span className="mk-wall__lead-head">Lead-Profil <b>Qualifiziert</b></span>
          <span><small>Projekt</small>Kompletter Garten</span>
          <span><small>Fläche</small>100–300 m²</span>
          <span><small>Nächster Schritt</small>Erstgespräch vor Ort</span>
        </div>
      </div>
    </section>
  );
}
