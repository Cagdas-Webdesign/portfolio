import '../../styles/observability.css';
import { useEffect, useRef } from 'react';

/*
 * Observability Dashboard — zwischen Under the Hood (Runtime) und dem
 * Evaluation Report. Bewusst ruhig: Text links, echter Dashboard-Screenshot
 * rechts, drei Kacheln darunter. Einzige Bewegung: einmaliges, leichtes
 * Einblenden (Fade + wenige Pixel nach oben) beim ersten Sichtkontakt.
 * Kein Zoom, kein Parallax, kein Pin. Styles: styles/observability.css (.obs-).
 */
const SCREENSHOT = `${import.meta.env.BASE_URL}assets/observability-dashboard.webp`;

const CARDS = [
  {
    id: 'health',
    title: 'Live API Health',
    text: 'Behalte den Zustand angebundener APIs und Dienste im Blick – inklusive Verfügbarkeit, Reaktionsverhalten und auffälliger Fehlerbilder.',
    // Herz mit Puls-Linie: Gesundheit / Zustand / Monitoring
    icon: (
      <>
        <path d="M19.6 13.4c1.5-1.6 2-3.1 2-4.6A4.8 4.8 0 0 0 12 6.2a4.8 4.8 0 0 0-9.6 2.6c0 1.5.5 3 2 4.6L12 20.6Z" />
        <path d="M5 12.2h3.3l1.5-2.8 2.4 5 1.6-2.2H19" />
      </>
    ),
  },
  {
    id: 'trace',
    title: 'Request Traceability',
    text: 'Jeder Request erhält eine eigene ID und lässt sich über den gesamten Ablauf hinweg nachvollziehen – von der Anfrage bis zur Antwort.',
    // Route vom Start-Knoten bis zur Antwort (Pfeil): Nachverfolgbarkeit
    icon: (
      <>
        <circle cx="5.5" cy="5.5" r="2.3" />
        <path d="M7.8 5.5h6.7a3.6 3.6 0 0 1 0 7.2h-5a3.6 3.6 0 0 0 0 7.2H17" />
        <path d="m15 17.6 2.4 2.3-2.4 2.3" />
      </>
    ),
  },
  {
    id: 'usage',
    title: 'Provider Usage & Limits',
    text: 'Nutzung, Provider-Aufrufe und relevante Limits werden sichtbar, damit Auslastung, Engpässe und Budgetgrenzen früh erkennbar sind.',
    // Gauge (wie zuvor): Nutzung / Auslastung bis zum Limit
    icon: (
      <>
        <path d="M4.5 17a8 8 0 1 1 15 0" />
        <path d="m12 13 3.5-4" />
        <circle cx="12" cy="13.5" fill="currentColor" r="1.2" stroke="none" />
      </>
    ),
  },
];

export default function ObservabilityDashboard() {
  const ref = useRef(null);

  // Einmaliges, sanftes Einblenden. Ohne JS/IO bleibt alles sichtbar:
  // der Ausgangszustand (is-armed) wird erst hier gesetzt.
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    node.classList.add('is-armed');
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      node.classList.add('is-in');
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="obs-title" className="rx-block obs" ref={ref}>
      <div className="obs__top">
        <div className="obs__copy">
          <h3 className="obs__title" id="obs-title">Observability Dashboard</h3>
          <p className="obs__lead">
            Das Backend läuft nicht im Blindflug: API-Health, Request-Traces und Provider-Nutzung werden
            sichtbar gemacht, damit Verhalten, Auslastung und Fehler schneller nachvollzogen werden können.
          </p>
        </div>

        <figure className="obs__shot">
          <img
            alt="Screenshot des Observability Dashboards: Übersicht mit Service-Status, Production Service und Provider-Nutzung für Mistral, Cloudflare Vectorize, Cloudflare Workers AI und Groq"
            decoding="async"
            height="902"
            loading="lazy"
            src={SCREENSHOT}
            width="1744"
          />
        </figure>
      </div>

      <ul className="obs__cards">
        {CARDS.map((card) => (
          <li className="obs-card" key={card.id}>
            <span aria-hidden="true" className="obs-card__icon">
              <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                {card.icon}
              </svg>
            </span>
            <h4 className="obs-card__title">{card.title}</h4>
            <p className="obs-card__text">{card.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
