import '../../styles/ai-experience.css';
import { useEffect, useRef } from 'react';
import EvaluationReport from './EvaluationReport.jsx';
import GroundingReliability from './GroundingReliability.jsx';
import KnowledgePipeline from './KnowledgePipeline.jsx';
import ObservabilityDashboard from './ObservabilityDashboard.jsx';
import RagDeepDive from './RagDeepDive.jsx';
import RagHero from './RagHero.jsx';
import RagSystemMap from './RagSystemMap.jsx';
import RagTechStack from './RagTechStack.jsx';

/* ==================================================================
 * AI Portfolio Assistant — Powered by Custom RAG Backend
 *
 * Ersetzt die fruehere Spline-Section. Zeigt das eigene RAG-System von
 * innen und fuehrt an jeder Station zum ECHTEN Assistenten
 * (askAssistant → AiAssistantWidget). Keine eigene Chat-Logik.
 *
 *   01 Hero · 02 System Map · 03 Inside the RAG · 04 Knowledge Pipeline
 *   05 Grounding & Reliability · 06 Under the Hood · Observability · 07 Evaluation
 *
 * Styles: styles/ai-experience.css, Praefix .rx-.
 * ================================================================== */

export default function AiPortfolioExperience({ onPresenceChange }) {
  const sectionRef = useRef(null);

  // Sichtbarkeit an das Widget melden (steuert den Floating-Button). Nur der
  // Hero zaehlt: dort steht der eigene CTA; im Deep Dive bleibt der Button da.
  useEffect(() => {
    const section = sectionRef.current?.querySelector('.rx-hero');
    if (!section || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => onPresenceChange?.('visible', entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      onPresenceChange?.('visible', false);
    };
  }, [onPresenceChange]);

  return (
    <section
      aria-labelledby="ai-assistant-title"
      className="rx"
      data-keep-text
      id="ai-portfolio-assistant"
      ref={sectionRef}
    >
      <div className="rx__inner">
        <RagHero />
        <RagSystemMap />
        <RagDeepDive />
        <KnowledgePipeline />
        <GroundingReliability />
        <RagTechStack />
        <ObservabilityDashboard />
        <EvaluationReport />
      </div>
    </section>
  );
}
