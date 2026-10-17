import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ServiceExperience from './ServiceExperience.jsx';
import { SERVICES } from './servicesData.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function useMobileExperience() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia?.('(max-width: 899px)').matches ?? false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 899px)');
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return isMobile;
}

function ServiceCard({
  active,
  index,
  onOpen,
  service,
  setCardRef,
}) {
  return (
    <article
      aria-label={`${index + 1} von ${SERVICES.length}: ${service.category}`}
      aria-roledescription="Folie"
      className={`sc-card sc-card--${service.id}${active ? ' is-active' : ''}`}
      ref={setCardRef}
      role="group"
    >
      <div className={`sc-card__media sc-card__media--${service.imageFit}`}>
        <img
          alt={service.imageAlt}
          decoding="async"
          draggable="false"
          fetchPriority={index === 0 ? 'high' : 'auto'}
          height={service.imageHeight}
          loading={index === 0 ? 'eager' : 'lazy'}
          sizes="(max-width: 899px) 82vw, 52vw"
          src={service.image}
          width={service.imageWidth}
        />
      </div>

      <div className="sc-card__content">
        <span className="sc-card__category">{service.category}</span>
        <h3 aria-label={service.title}>
          {service.titleLines.map((line, lineIndex) => (
            <span aria-hidden="true" key={line}>
              {line}{lineIndex < service.titleLines.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h3>
        <p className="sc-card__description">{service.description}</p>
        <button
          aria-label={`Mehr über ${service.category} erfahren`}
          className="sc-card__link"
          onClick={(event) => onOpen(index, event.currentTarget)}
          tabIndex={active ? 0 : -1}
          type="button"
        >
          <span>Mehr erfahren</span>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 12h13M13 7l5 5-5 5" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default function NestedOffers() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const cardRefs = useRef([]);
  const experienceRef = useRef(null);
  const returnFocusRef = useRef(null);
  const animationFrameRef = useRef(0);
  const activeIndexRef = useRef(0);
  const pointerDragRef = useRef(null);
  const reducedMotion = Boolean(useReducedMotion());
  const isMobileExperience = useMobileExperience();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const selectedService = selectedIndex === null ? null : SERVICES[selectedIndex];

  const getCardPositions = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return [];

    const cards = cardRefs.current.filter(Boolean);
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const mobileLayout = window.matchMedia('(max-width: 899px)').matches;
    const leftPadding = Number.parseFloat(window.getComputedStyle(viewport).paddingLeft) || 0;

    return cards.map((card) => {
      const target = mobileLayout
        ? card.offsetLeft - leftPadding
        : card.offsetLeft - ((viewport.clientWidth - card.offsetWidth) / 2);
      return clamp(target, 0, maxScroll);
    });
  }, []);

  const getLiveProgress = useCallback((scrollLeft, positions) => {
    if (positions.length < 2) return 0;
    if (scrollLeft <= positions[0]) return 0;

    for (let index = 0; index < positions.length - 1; index += 1) {
      const start = positions[index];
      const end = positions[index + 1];

      if (scrollLeft <= end || index === positions.length - 2) {
        const distance = Math.max(1, end - start);
        return index + clamp((scrollLeft - start) / distance, 0, 1);
      }
    }

    return positions.length - 1;
  }, []);

  const updateCarousel = useCallback(() => {
    const viewport = viewportRef.current;
    const section = sectionRef.current;
    if (!viewport || !section) return;

    const positions = getCardPositions();
    const progress = getLiveProgress(viewport.scrollLeft, positions);
    const nextIndex = clamp(Math.round(progress), 0, SERVICES.length - 1);
    const viewportCenter = viewport.scrollLeft + (viewport.clientWidth / 2);

    // Erst alle Masse lesen, dann schreiben: Ein Schreibzugriff vor dem
    // Lesen (Custom Property auf der Section) erzwang pro Wisch-Frame eine
    // synchrone Stil- und Layoutberechnung.
    const scales = cardRefs.current.map((card) => {
      if (!card) return null;
      const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
      const distance = Math.min(
        Math.abs((cardCenter - viewportCenter) / Math.max(card.offsetWidth, 1)),
        1.2,
      );
      return reducedMotion ? 1 : 1.012 - (distance * 0.022);
    });

    section.style.setProperty('--sc-page-position', progress.toFixed(4));
    cardRefs.current.forEach((card, index) => {
      if (card) card.style.setProperty('--sc-card-scale', scales[index].toFixed(4));
    });

    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
  }, [getCardPositions, getLiveProgress, reducedMotion]);

  const requestCarouselUpdate = useCallback(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = window.requestAnimationFrame(updateCarousel);
  }, [updateCarousel]);

  const scrollTweenRef = useRef(0);

  const cancelScrollTween = useCallback(() => {
    window.cancelAnimationFrame(scrollTweenRef.current);
    viewportRef.current?.classList.remove('is-tweening');
  }, []);

  /*
   * Eigener Karten-Tween statt nativem smooth-scroll. Entscheidend:
   * waehrend des Tweens muss scroll-snap deaktiviert sein (Klasse
   * is-tweening), sonst rastet der Browser jeden Zwischenwert sofort
   * auf die Snap-Position ein und der Wechsel wirkt wie ein Schnitt.
   */
  const goToCard = useCallback((index) => {
    const viewport = viewportRef.current;
    const positions = getCardPositions();
    if (!viewport || positions[index] === undefined) return;

    cancelScrollTween();
    viewport.classList.remove('is-tweening');

    const start = viewport.scrollLeft;
    const target = positions[index];
    const distance = target - start;

    if (reducedMotion || Math.abs(distance) < 2) {
      viewport.scrollTo({ left: target });
      return;
    }

    const cardsCrossed = Math.abs(index - activeIndexRef.current);
    const duration = Math.min(980, 820 + Math.max(0, cardsCrossed - 1) * 80);
    const startTime = performance.now();
    // Apple-artige Produktseiten-Kurve: ruhiger Anlauf, souveraener Auslauf
    const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - ((-2 * t + 2) ** 4) / 2);

    viewport.classList.add('is-tweening');
    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      viewport.scrollLeft = start + (distance * easeInOutQuart(t));
      if (t < 1) {
        scrollTweenRef.current = window.requestAnimationFrame(step);
      } else {
        viewport.classList.remove('is-tweening');
      }
    };

    scrollTweenRef.current = window.requestAnimationFrame(step);
  }, [cancelScrollTween, getCardPositions, reducedMotion]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const resizeObserver = new ResizeObserver(requestCarouselUpdate);
    resizeObserver.observe(viewport);
    cardRefs.current.forEach((card) => card && resizeObserver.observe(card));

    viewport.addEventListener('scroll', requestCarouselUpdate, { passive: true });
    viewport.addEventListener('wheel', cancelScrollTween, { passive: true });
    viewport.addEventListener('touchstart', cancelScrollTween, { passive: true });
    window.addEventListener('resize', requestCarouselUpdate, { passive: true });
    requestCarouselUpdate();

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', requestCarouselUpdate);
      viewport.removeEventListener('wheel', cancelScrollTween);
      viewport.removeEventListener('touchstart', cancelScrollTween);
      window.removeEventListener('resize', requestCarouselUpdate);
      window.cancelAnimationFrame(animationFrameRef.current);
      cancelScrollTween();
    };
  }, [cancelScrollTween, requestCarouselUpdate]);

  // Zurueckgestellte Entsperrung (nur mobil, waehrend der Ausfahrt)
  const deferUnlockRef = useRef(false);
  const pendingUnlockRef = useRef(null);
  const flushPendingUnlock = useCallback(() => {
    const unlock = pendingUnlockRef.current;
    pendingUnlockRef.current = null;
    unlock?.();
  }, []);
  useEffect(() => flushPendingUnlock, [flushPendingUnlock]);

  /*
   * Seitenzustand während einer geöffneten Leistungsansicht.
   *
   * Bewusst hier und an den State gekoppelt — nicht an das Unmounten des
   * Modals: Framer Motion unmountet erst nach der Exit-Animation. Bleiben
   * deren Frames aus (verstecktes Tab, gedrosselter Renderer), lief das
   * Aufräumen früher nie und die Seite blieb dauerhaft gesperrt.
   * Die Ausfahrt ist reine Optik; der Seitenzustand darf nicht davon
   * abhängen. Genau ein Besitzer, genau ein Sperren und Entsperren.
   */
  useEffect(() => {
    if (selectedIndex === null) return undefined;
    // Eine noch zurueckgestellte Entsperrung (Ausfahrt laeuft) zuerst
    // abschliessen — sonst merkte sich diese Sperre den gesperrten Zustand.
    flushPendingUnlock();

    const html = document.documentElement;
    const root = document.getElementById('root');
    const scrollY = window.scrollY;
    const previous = {
      htmlOverflow: html.style.overflow,
      body: {
        left: document.body.style.left,
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
        position: document.body.style.position,
        right: document.body.style.right,
        top: document.body.style.top,
        width: document.body.style.width,
      },
      rootInert: root?.inert,
      rootAriaHidden: root?.getAttribute('aria-hidden'),
    };
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    const trigger = returnFocusRef.current;

    /*
     * ScrollTrigger einfrieren, BEVOR der body fixiert wird: sonst sehen alle
     * Trigger kurz scrollY = 0, gescrubbte Szenen (z. B. der Social-Reveal)
     * laufen im Hintergrund auf ihren Startzustand und spielen beim Schliessen
     * sichtbar nach. disable(false, true) behaelt Animation und Pins bei.
     */
    const scrollTrigger = window.ScrollTrigger;
    // getTween() liefert bei nicht gescrubbten Triggern false
    const settle = (t) => {
      const tween = t.getTween?.();
      if (tween && typeof tween.progress === 'function') tween.progress(1);
    };
    // Nur Trigger der Seite: Die Pop-up-eigenen Trigger (Scroller im Pop-up)
    // entstehen in Kind-Effekten VOR diesem Effekt und muessen aktiv bleiben.
    const isPopupTrigger = (t) => {
      const scroller = t.scroller;
      const node = t.trigger;
      return Boolean(
        (scroller instanceof Element && scroller.closest('.sc-experience-layer'))
        || (node instanceof Element && node.closest('.sc-experience-layer')),
      );
    };
    const frozenTriggers = (scrollTrigger?.getAll() ?? []).filter((t) => t.enabled && !isPopupTrigger(t));
    frozenTriggers.forEach((t) => {
      settle(t);
      t.disable(false, true);
    });

    document.querySelectorAll('.sc-experience-layer:not(.is-exit-snapshot)').forEach((node) => {
      node.style.visibility = '';
    });
    html.classList.add('services-experience-active');
    html.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.right = '0';
    document.body.style.left = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    if (root) {
      root.inert = true;
      root.setAttribute('aria-hidden', 'true');
    }

    const unlock = () => {
      if (root) {
        root.inert = previous.rootInert ?? false;
        if (previous.rootAriaHidden === null) root.removeAttribute('aria-hidden');
        else root.setAttribute('aria-hidden', previous.rootAriaHidden);
      }
      html.style.overflow = previous.htmlOverflow;
      Object.assign(document.body.style, previous.body);
      window.scrollTo(0, scrollY);

      // Erst nach wiederhergestellter Position die Legacy-Ebene freigeben,
      // damit sie nicht kurz im Hero-Zustand aufblitzt.
      html.classList.remove('services-experience-active');
      // Position ist wieder korrekt: Trigger ohne Refresh reaktivieren und
      // Scrub-Nachlauf sofort abschliessen — kein sichtbares Nachspielen.
      frozenTriggers.forEach((t) => t.enable(false, false));
      window.dispatchEvent(new Event('scroll'));
      scrollTrigger?.update();
      frozenTriggers.forEach(settle);

      trigger?.focus({ preventScroll: true });
    };

    return () => {
      /*
       * Mobile (2026-10-15): Wie Impressum/Datenschutz bleibt die Seite
       * gesperrt, bis die Ausfahrt beendet ist. Das Entsperren (body-Position,
       * scrollTo, Trigger reaktivieren) erzwingt auf dem iPhone Relayout und
       * Repaint der ganzen Seite — lief es im ersten Frame der Ausfahrt,
       * verschwand das Pop-up abrupt. Desktop entsperrt unveraendert sofort.
       */
      if (deferUnlockRef.current) {
        deferUnlockRef.current = false;
        pendingUnlockRef.current = unlock;
        return;
      }
      unlock();
    };
  }, [selectedIndex, flushPendingUnlock]);

  /*
   * Deterministischer Exit ueber einen statischen Schnappschuss.
   *
   * Die Pop-ups enthalten zeitgesteuerte Szenen (Timer, GSAP, In-View-
   * Trigger). Liefe die Exit-Animation auf dem lebenden Pop-up, koennten
   * diese Szenen waehrend der Ausfahrt weiterlaufen — Text blendet ein,
   * Elemente bewegen sich. Deshalb beim Schliessen:
   *   1. einmalig (closing-Guard) eine reine DOM-Kopie des aktuellen Frames
   *      anlegen — ohne React, Timer, Observer oder Tweens,
   *   2. das lebende Pop-up sofort entfernen (State null, Exit ohne Dauer),
   *   3. nur die Kopie ausfahren und danach entfernen.
   * Beim naechsten Oeffnen startet das Pop-up frisch aus seinem Entrance-State.
   */
  const closingRef = useRef(false);
  const snapshotRef = useRef(null);

  const removeSnapshot = useCallback(() => {
    snapshotRef.current?.remove();
    snapshotRef.current = null;
  }, []);

  // Einstieg merken: steuert nur die Kopfzeile (z. B. Kategorie-Pill bei
  // „Mehr erfahren“ aus dem Social-Media-Reveal). Inhalt bleibt identisch.
  const [openSource, setOpenSource] = useState('popup-navigation');

  const openExperience = useCallback((index, trigger, source = 'popup-navigation') => {
    setOpenSource(source);
    flushPendingUnlock();
    removeSnapshot();
    closingRef.current = false;
    // Framer kann einen noch ausfahrenden Knoten wiederverwenden (gleicher
    // key) — dessen Close-Unsichtbarkeit muss zurueckgesetzt werden.
    document.querySelectorAll('.sc-experience-layer:not(.is-exit-snapshot)').forEach((node) => {
      node.style.visibility = '';
    });
    returnFocusRef.current = trigger;
    setSelectedIndex(index);
  }, [flushPendingUnlock, removeSnapshot]);

  const closeExperience = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    const layer = document.querySelector('.sc-experience-layer:not(.is-exit-snapshot)');
    if (layer) {
      removeSnapshot();
      /*
       * Aktuell sichtbare Werte laufender Animationen (CSS-Animationen/
       * -Transitions, Framer/WAAPI) ins Inline-Style schreiben — sonst faellt
       * die Kopie auf Start-/Endwerte zurueck bzw. startet Reveals neu.
       */
      const frozen = [];
      document.getAnimations().forEach((animation) => {
        const target = animation.effect?.target;
        if (!target || animation.effect.pseudoElement || !layer.contains(target)) return;
        const props = new Set();
        if (animation.transitionProperty) props.add(animation.transitionProperty);
        animation.effect.getKeyframes?.().forEach((frame) => {
          Object.keys(frame).forEach((key) => {
            if (!['offset', 'computedOffset', 'easing', 'composite'].includes(key)) props.add(key);
          });
        });
        // Erst lesen (sichtbarer, berechneter Wert), danach schreiben
        const computed = getComputedStyle(target);
        props.forEach((prop) => {
          const css = prop.startsWith('--') ? prop : prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          frozen.push([target, css, computed.getPropertyValue(css)]);
        });
      });
      frozen.forEach(([target, css, value]) => {
        if (value) target.style.setProperty(css, value);
      });
      const snapshot = layer.cloneNode(true);
      snapshot.classList.add('is-exit-snapshot');
      snapshot.setAttribute('aria-hidden', 'true');
      snapshot.inert = true;
      document.body.appendChild(snapshot);

      // Scrollpositionen (Pop-up-Scroller, horizontale Leisten) uebernehmen
      const source = [layer, ...layer.querySelectorAll('*')];
      const copy = [snapshot, ...snapshot.querySelectorAll('*')];
      source.forEach((node, i) => {
        if (node.scrollTop || node.scrollLeft) {
          copy[i].scrollTop = node.scrollTop;
          copy[i].scrollLeft = node.scrollLeft;
        }
      });
      snapshotRef.current = snapshot;
      // Lebendes Pop-up sofort unsichtbar — nicht erst nach dem Unmount-Frame
      layer.style.visibility = 'hidden';

      const duration = reducedMotion ? 1 : 450;
      const sheet = snapshot.querySelector('.sc-experience');
      const from = sheet ? getComputedStyle(sheet).transform : 'none';
      sheet?.animate(
        [{ transform: from === 'none' ? 'translateY(0)' : from }, { transform: 'translateY(102%)' }],
        { duration, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
      );
      const fade = snapshot.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: 'ease', fill: 'forwards' });
      const done = () => {
        if (snapshotRef.current !== snapshot) return;
        flushPendingUnlock();
        removeSnapshot();
      };
      // Nur mobil: Entsperren erst nach der Ausfahrt (siehe Sperr-Effekt)
      deferUnlockRef.current = isMobileExperience && !reducedMotion;
      fade.onfinish = done;
      /*
       * Fallback, falls keine Frames laufen (verstecktes Tab). Fix
       * (2026-10-15): Der Timer startet erst, wenn die Ausfahrt tatsaechlich
       * laeuft. Vorher lief er ab dem Klick — auf dem iPhone verbrauchten
       * Klonen, Entsperren und Trigger-Reaktivierung einen Grossteil der
       * 700 ms, die Kopie verschwand mitten in der Animation (abrupt).
       */
      fade.ready.then(() => window.setTimeout(done, duration + 250), done);
      window.setTimeout(done, duration + 3000);
    }

    setSelectedIndex(null);
  }, [flushPendingUnlock, isMobileExperience, reducedMotion, removeSnapshot]);

  useEffect(() => removeSnapshot, [removeSnapshot]);

  // Externe Trigger (z. B. „Mehr erfahren“ im Social-Media-Reveal) oeffnen
  // dasselbe Popup ueber denselben State — kein zweites Modal.
  useEffect(() => {
    const onOpen = (event) => {
      const index = SERVICES.findIndex((service) => service.id === event.detail?.id);
      if (index >= 0) openExperience(index, event.detail?.trigger ?? null, event.detail?.source);
    };
    window.addEventListener('services:open', onOpen);
    return () => window.removeEventListener('services:open', onOpen);
  }, [openExperience]);

  const handleCarouselKeyDown = (event) => {
    let nextIndex = activeIndexRef.current;

    if (event.key === 'ArrowRight') nextIndex += 1;
    else if (event.key === 'ArrowLeft') nextIndex -= 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = SERVICES.length - 1;
    else return;

    event.preventDefault();
    goToCard(clamp(nextIndex, 0, SERVICES.length - 1));
  };

  const endPointerDrag = (event) => {
    const viewport = viewportRef.current;
    const dragState = pointerDragRef.current;
    if (!viewport || !dragState) return;

    if (viewport.hasPointerCapture?.(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    pointerDragRef.current = null;
    viewport.classList.remove('is-dragging');

    if (dragState.moved) {
      const positions = getCardPositions();
      const progress = getLiveProgress(viewport.scrollLeft, positions);
      const nearestIndex = clamp(Math.round(progress), 0, SERVICES.length - 1);
      window.requestAnimationFrame(() => goToCard(nearestIndex));
    }
  };

  const handlePointerDown = (event) => {
    const viewport = viewportRef.current;
    if (
      !viewport
      || event.pointerType !== 'mouse'
      || event.button !== 0
      || event.target.closest('button, a')
    ) {
      return;
    }

    cancelScrollTween();
    pointerDragRef.current = {
      moved: false,
      startScroll: viewport.scrollLeft,
      startX: event.clientX,
    };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
  };

  const handlePointerMove = (event) => {
    const viewport = viewportRef.current;
    const dragState = pointerDragRef.current;
    if (!viewport || !dragState) return;

    const delta = event.clientX - dragState.startX;
    if (Math.abs(delta) > 3) dragState.moved = true;
    if (!dragState.moved) return;

    event.preventDefault();
    viewport.scrollLeft = dragState.startScroll - delta;
  };

  return (
    <>
      <div className="sep" />
      <section
        aria-label="Leistungen"
        className="services-capabilities"
        id="services-capabilities"
        ref={sectionRef}
      >
        <p className="sc-sr-only" id="services-carousel-instructions">
          Horizontal wischen oder die Pfeiltasten verwenden, um zwischen den Leistungen zu wechseln.
        </p>

        <div
          aria-describedby="services-carousel-instructions"
          aria-label="Leistungsübersicht"
          aria-roledescription="Karussell"
          className="sc-viewport"
          onKeyDown={handleCarouselKeyDown}
          onPointerCancel={endPointerDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointerDrag}
          ref={viewportRef}
          role="region"
          tabIndex={0}
        >
          <div className="sc-track">
            {SERVICES.map((service, index) => (
              <ServiceCard
                active={activeIndex === index}
                index={index}
                key={service.id}
                onOpen={openExperience}
                service={service}
                setCardRef={(node) => {
                  cardRefs.current[index] = node;
                }}
              />
            ))}
          </div>
        </div>

        <div aria-label="Leistungsnavigation" className="sc-pagination" role="navigation">
          <button
            aria-label="Vorherige Leistung"
            className="sc-pagination__arrow"
            disabled={activeIndex === 0}
            onClick={() => goToCard(activeIndex - 1)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>

          <div className="sc-pagination__steps">
            <span aria-hidden="true" className="sc-pagination__indicator" />
            {SERVICES.map((service, index) => (
              <button
                aria-current={activeIndex === index ? 'true' : undefined}
                aria-label={`Leistung ${index + 1} anzeigen: ${service.category}`}
                key={service.id}
                onClick={() => goToCard(index)}
                type="button"
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </div>

          <button
            aria-label="Nächste Leistung"
            className="sc-pagination__arrow"
            disabled={activeIndex === SERVICES.length - 1}
            onClick={() => goToCard(activeIndex + 1)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <p aria-live="polite" className="sc-sr-only">
          {`${SERVICES[activeIndex].category}, ${activeIndex + 1} von ${SERVICES.length}`}
        </p>
      </section>

      {/*
        Flache Exit-Kette: Layer, Backdrop und Sheet starten gleichzeitig und
        sind gleich lang. Verzögerte, verschachtelte Exits konnten dazu führen,
        dass AnimatePresence auf eine Animation wartet, die nie abschließt —
        das Popup blieb dann sichtbar im DOM stehen.
      */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {selectedService && (
            <motion.div
              animate={{ opacity: 1 }}
              className="sc-experience-layer"
              exit={{ opacity: 0, transition: { duration: 0 } }}
              initial={{ opacity: 1 }}
              key={selectedService.id}
              transition={{ duration: reducedMotion ? 0.01 : 0.4 }}
            >
              <motion.div
                animate={{ opacity: 1 }}
                aria-hidden="true"
                className="sc-experience-backdrop"
                exit={{ opacity: 0, transition: { duration: 0 } }}
                initial={{ opacity: 0 }}
                onClick={closeExperience}
                transition={{ duration: reducedMotion ? 0.01 : 0.55 }}
              />
              <ServiceExperience
                close={closeExperience}
                experienceRef={experienceRef}
                headerVariant={openSource === 'social-media-more' ? 'category' : 'numbered'}
                index={selectedIndex}
                isMobile={isMobileExperience}
                reducedMotion={reducedMotion}
                service={selectedService}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
