import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { motion, useDragControls } from 'framer-motion';
import { ArrowIcon } from './service-experiences/shared.jsx';
import { CONTACT_MAIL } from '../siteConfig.js';

const EXPERIENCE_MODULES = {
  webdesign: lazy(() => import('./service-experiences/WebsiteExperience.jsx')),
  assistant: lazy(() => import('./service-experiences/AssistantExperience.jsx')),
  api: lazy(() => import('./service-experiences/ApiIntegrationExperience.jsx')),
  automation: lazy(() => import('./service-experiences/AutomationExperience.jsx')),
  seo: lazy(() => import('./service-experiences/SeoExperience.jsx')),
  social: lazy(() => import('./service-experiences/SocialExperience.jsx')),
};

/*
 * Ansichten mit mittiger Kopfzeile.
 *
 * Die Kategorie steht dort als Nummernkreis plus Name in der Mitte der
 * Kopfzeile. Weil sie damit schon einmal genannt ist, entfaellt in genau
 * diesen Ansichten das zweite Label ueber der Ueberschrift — und der Hero
 * darf enger stehen. Eine Liste statt fuenf verstreuter Bedingungen: hier
 * eintragen, und Kopfzeile, Label und Hero folgen gemeinsam.
 */
const CENTERED_HEAD = new Set(['webdesign', 'assistant', 'api', 'automation', 'seo', 'social']);

/*
 * Ansichten ohne gemeinsamen Abschluss.
 *
 * Der Fussbereich mit Schlusssatz und Kontaktlink ist die Regel. Wo eine
 * Ansicht selbst mit einem bewussten Schlussbild endet, wuerde er die
 * Wirkung nur verwaessern — dort entfaellt er ersatzlos. Bewusst eine
 * Liste statt einer Bedingung im Markup: die Ausnahme steht damit an
 * derselben Stelle wie die Ausnahme fuer die Kopfzeile.
 *
 * Aktuell traegt jede Ansicht ihren Abschluss. Bei 'assistant' bleibt der
 * Schlusssatz stehen und nur der Kontaktlink entfaellt — das steuert das
 * fehlende `ctaLabel` in servicesData, nicht diese Liste.
 */
const NO_CLOSING = new Set(['social']);

function getFocusableElements(container) {
  if (!container) return [];

  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => (
    !element.hasAttribute('hidden')
    && element.getAttribute('aria-hidden') !== 'true'
    && element.getClientRects().length > 0
  ));
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/*
 * Mountet erst, wenn der lazy geladene Inhalt bereitsteht — und setzt genau
 * dann den Scroll-Container zurück. Ein Reset beim Öffnen allein genügt nicht,
 * weil der Inhalt danach erscheint und die Position verschieben kann.
 */
function ScrollToTop({ scrollRef }) {
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [scrollRef]);
  return null;
}

function ExperienceFallback() {
  return (
    <div aria-live="polite" className="sc-experience__loading" role="status">
      <i />
      <span>Interaktive Ansicht wird vorbereitet …</span>
    </div>
  );
}

export default function ServiceExperience({
  close,
  experienceRef,
  headerVariant = 'numbered',
  index,
  isMobile,
  reducedMotion,
  service,
}) {
  const dragControls = useDragControls();
  const scrollRef = useRef(null);

  /*
   * close in einer Ref halten, damit der Lifecycle-Effekt keine
   * wechselnden Dependencies hat. Sonst würde ein neu erzeugtes
   * close den Effekt erneut ausführen: Scroll-Sperre und Listener
   * würden ein zweites Mal gesetzt, das Aufräumen liefe doppelt.
   */
  const closeRef = useRef(close);
  useLayoutEffect(() => {
    closeRef.current = close;
  }, [close]);
  const titleId = `service-experience-${service.id}`;
  const descriptionId = `service-experience-description-${service.id}`;
  const ExperienceContent = EXPERIENCE_MODULES[service.id];
  const centeredHead = CENTERED_HEAD.has(service.id);
  const showClosing = !NO_CLOSING.has(service.id);
  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

  /*
   * Performance (2026-10-15): Die Einfahrt (translateY 102% -> 0, 0.7 s,
   * gleiche Kurve) laeuft als WAAPI-Animation auf dem Compositor. Framer
   * Motion animiert `y` per JavaScript in jedem Frame — waehrend das Pop-up
   * beim Oeffnen seine Szenen aufbaut, ruckelte die Fahrt dadurch auf dem
   * iPhone. Framer haelt `y` nur noch fuer das Ziehen zum Schliessen (Start 0).
   */
  const entranceRef = useRef(null);
  useLayoutEffect(() => {
    const experience = experienceRef.current;
    if (reducedMotion || !experience?.animate) return undefined;
    const entrance = experience.animate(
      [{ transform: 'translateY(102%)' }, { transform: 'translateY(0%)' }],
      { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    entranceRef.current = entrance;
    return () => entrance.cancel();
    // Nur beim Einhaengen — wie zuvor Framers initial -> animate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDrag = (event) => {
    entranceRef.current?.finish();
    dragControls.start(event);
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 700) close();
  };

  /*
   * Dieses Modal besitzt ausschließlich seine eigene Tastatur- und
   * Fokuszone. Scroll-Sperre, inert-Zustand und das Freigeben der
   * Legacy-Ebene gehören zum Seitenzustand und liegen deshalb in
   * NestedOffers — dort sind sie an den geöffnet/geschlossen-State
   * gekoppelt und nicht an das Ende einer Animation.
   */
  useEffect(() => {
    const experience = experienceRef.current;
    if (!experience) return undefined;

    const closeButton = experience.querySelector('.sc-experience__topbar > button');
    (closeButton || getFocusableElements(experience)[0] || experience)
      .focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(experience);
      if (!focusable.length) {
        event.preventDefault();
        experience.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const keepFocusInside = (event) => {
      if (!experience.contains(event.target)) {
        (getFocusableElements(experience)[0] || experience).focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', keepFocusInside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', keepFocusInside);
    };
  }, [experienceRef]);

  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className={`sc-experience sc-experience--${service.id}${centeredHead ? ' is-centered-head' : ''}`}
      drag={isMobile ? 'y' : false}
      dragConstraints={{ bottom: 0, top: 0 }}
      dragControls={dragControls}
      dragElastic={{ bottom: 0.2, top: 0 }}
      dragListener={false}
      // Die sichtbare Ausfahrt uebernimmt ein statischer Schnappschuss
      // (NestedOffers.closeExperience) — das lebende Pop-up verschwindet sofort.
      exit={{ opacity: 0, transition: { duration: 0 } }}
      initial={{ opacity: reducedMotion ? 0 : 0.99, y: reducedMotion ? '102%' : 0 }}
      onDragEnd={handleDragEnd}
      ref={experienceRef}
      role="dialog"
      tabIndex={-1}
      transition={transition}
    >
      <button
        aria-label="Leistungsansicht nach unten schließen"
        className="sc-experience__drag-handle"
        onClick={close}
        onPointerDown={startDrag}
        type="button"
      >
        <span />
      </button>

      <header className="sc-experience__topbar">
        {headerVariant === 'category' ? (
          // Einstieg „Mehr erfahren“: reine Kategorie-Pill ohne Nummer
          <p className="sc-experience__category">{service.category}</p>
        ) : (
          <p>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {service.category}
          </p>
        )}
        <button aria-label="Leistungsansicht schließen" onClick={close} type="button">
          <CloseIcon />
        </button>
      </header>

      <div className="sc-experience__scroll" ref={scrollRef}>
        {/*
          hideExperienceMedia: Die Illustration gehoert dann nur zur
          Slider-Karte, der Hero steht als reiner Text (--text). Tags sind
          optional und erscheinen nur, wenn ein Service sie mitbringt.
        */}
        <section
          className={`sc-experience__hero sc-experience__hero--${service.id}${service.hideExperienceMedia ? ' sc-experience__hero--text' : ''}`}
        >
          {service.hideExperienceMedia ? null : (
            <div className={`sc-experience__media sc-experience__media--${service.imageFit}`}>
              <img
                alt={service.imageAlt}
                decoding="async"
                height={service.imageHeight}
                src={service.image}
                width={service.imageWidth}
              />
            </div>
          )}
          <div className="sc-experience__hero-copy">
            {/* Zweite Nennung derselben Information — siehe CENTERED_HEAD. */}
            {centeredHead ? null : (
              <span className="sc-experience__tag">{service.category}</span>
            )}
            <h2 id={titleId}>{service.heroTitle}</h2>
            <p id={descriptionId}>{service.heroDescription}</p>
            {service.heroTags?.length ? (
              <ul aria-label="Themen" className="sc-experience__hero-tags">
                {service.heroTags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            ) : null}
          </div>
        </section>

        <Suspense fallback={<ExperienceFallback />}>
          <ScrollToTop scrollRef={scrollRef} />
          <ExperienceContent reducedMotion={reducedMotion} />
        </Suspense>

        {showClosing ? (
          <footer className={`sc-experience__closing sc-experience__closing--${service.id}`}>
            <h3>{service.closingTitle}</h3>
            {service.closingText ? <p>{service.closingText}</p> : null}
            {service.ctaLabel ? (
              <a href={`mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(`Projektanfrage: ${service.category}`)}`}>
                {service.ctaLabel}
                <ArrowIcon />
              </a>
            ) : null}
          </footer>
        ) : null}
      </div>
    </motion.aside>
  );
}
