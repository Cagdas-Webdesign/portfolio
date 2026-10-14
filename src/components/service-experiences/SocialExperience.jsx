import '../../styles/social-campaign.css';
import BrandSystem from './social/BrandSystem.jsx';
import CampaignBrief from './social/CampaignBrief.jsx';
import CampaignStudio from './social/CampaignStudio.jsx';
import FunnelJourney from './social/FunnelJourney.jsx';
import JourneyRail from './social/JourneyRail.jsx';
import { VerdeMark } from './social/verde.jsx';
import CampaignWall from './social/CampaignWall.jsx';
import MarketingIteration from './social/MarketingIteration.jsx';
import PlatformAdaptation from './social/PlatformAdaptation.jsx';

/* ==================================================================
 * Pop-up 6 — Social Media & Content Marketing
 *
 * Eine digitale Marketing-Case-Study an einer fiktiven Kampagne
 * (VERDE · Garten & Landschaft). Die Kapitel folgen der Customer
 * Journey, nicht einer Liste von Leistungen:
 *
 *   Hero      Ad → Click → Landingpage → Conversion → Learn
 *   01        Campaign Brief         (CampaignBrief)
 *   02        Brand System           (BrandSystem)
 *   03–07     Creative, Übergang, Landingpage, Conversion,
 *             Gartenberater — an einem Phone (CampaignStudio)
 *   08        Funnel                 (FunnelJourney)
 *   09        Cross-Platform         (PlatformAdaptation)
 *   10        Measurement            (MarketingIteration)
 *   Abschluss Strategie → … → Lernen ↻
 *
 * Styles: styles/social-campaign.css, alles unter .sc-experience--social
 * bzw. dem Praefix .mk-. Keine erfundenen Kennzahlen, keine echten
 * Firmendaten, keine Verbindung zum Portfolio-Assistenten.
 * ================================================================== */

const HERO_JOURNEY = [
  { id: 'ad', label: 'Ad', note: 'Aufmerksamkeit' },
  { id: 'click', label: 'Click', note: 'Interesse' },
  { id: 'landing', label: 'Landing Page', note: 'Überzeugung' },
  { id: 'conversion', label: 'Conversion', note: 'Anfrage' },
  { id: 'learn', label: 'Learn', note: 'Nächste Runde' },
];

export default function SocialExperience({ reducedMotion }) {
  return (
    <div className="mk-root" data-keep-text>
      <section aria-label="Customer Journey" className="mk-hero-journey">
        <JourneyRail
          className="mk-journey--hero"
          items={HERO_JOURNEY}
          label="Von der Anzeige zur Anfrage"
          reducedMotion={reducedMotion}
        />

        {/* Uebergang: aus dem Prinzip wird eine konkrete Kampagne. */}
        <div className="mk-handoff">
          <span className="mk-handoff__line" aria-hidden="true" />
          <div className="mk-handoff__card">
            <span className="mk-handoff__mark"><VerdeMark /></span>
            <div>
              <small>Beispielkampagne · fiktiv</small>
              <strong>VERDE · Garten &amp; Landschaft</strong>
              <p>Instagram zum Saisonstart. Ein Ziel: Anfragen von Menschen, die wirklich bauen wollen – nicht bloß Reichweite.</p>
            </div>
            <ul aria-label="Kampagnen-Eckdaten">
              <li>Instagram</li>
              <li>Paid Social</li>
              <li>Leads</li>
            </ul>
          </div>
        </div>
      </section>

      <CampaignBrief reducedMotion={reducedMotion} />
      <BrandSystem />
      <CampaignStudio reducedMotion={reducedMotion} />
      <FunnelJourney reducedMotion={reducedMotion} />
      <PlatformAdaptation reducedMotion={reducedMotion} />
      <MarketingIteration reducedMotion={reducedMotion} />

      <CampaignWall reducedMotion={reducedMotion} />
    </div>
  );
}
