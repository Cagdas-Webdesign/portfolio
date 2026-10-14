import { motion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export const EASE = [0.22, 1, 0.36, 1];

export function ArrowIcon({ direction = 'right' }) {
  return (
    <svg
      aria-hidden="true"
      className={`sc-arrow-icon sc-arrow-icon--${direction}`}
      viewBox="0 0 24 24"
    >
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

export function SegmentedControl({
  items,
  label,
  onSelect,
  selected,
}) {
  return (
    <div aria-label={label} className="sc-segmented" role="group">
      {items.map((item) => (
        <button
          aria-pressed={selected === item.id}
          className={selected === item.id ? 'is-selected' : ''}
          key={item.id}
          onClick={() => onSelect(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function ModuleHeading({
  children,
  eyebrow,
  title,
}) {
  return (
    <header className="sc-module-heading">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h3>{title}</h3>
      {children}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Eigenes Icon-Set: eine Strichstärke, eine Sprache, Orange als       */
/* einziger Akzent. Keine Bibliothek, keine Kreise um Symbole.         */
/* ------------------------------------------------------------------ */

const GLYPHS = {
  compass: <><circle cx="16" cy="16" r="12" /><path d="M20.6 11.4 18 18l-6.6 2.6L14 14z" /><circle cx="16" cy="16" r="1.1" className="is-accent" /></>,
  pen: <><path d="M6 26l4.6-1 14-14a2.4 2.4 0 0 0-3.4-3.4l-14 14z" /><path d="M18 9.5l4 4" className="is-accent" /></>,
  layers: <><path d="M16 5l11 5.5L16 16 5 10.5z" /><path d="M5 16l11 5.5L27 16" className="is-accent" /><path d="M5 21.5 16 27l11-5.5" /></>,
  spark: <><path d="M16 5v6M16 21v6M5 16h6M21 16h6" /><path d="M9 9l3.4 3.4M19.6 19.6 23 23M23 9l-3.4 3.4M12.4 19.6 9 23" className="is-accent" /></>,
  grid: <><rect height="9" rx="1.6" width="9" x="5" y="5" /><rect height="9" rx="1.6" width="9" x="18" y="5" className="is-accent" /><rect height="9" rx="1.6" width="9" x="5" y="18" /><rect height="9" rx="1.6" width="9" x="18" y="18" /></>,
  flow: <><circle cx="7" cy="16" r="3" /><circle cx="25" cy="8" r="3" className="is-accent" /><circle cx="25" cy="24" r="3" /><path d="M10 15 22 9M10 17l12 6" /></>,
  shield: <><path d="M16 4l9 3.4v7.2c0 6.4-3.9 10.6-9 13.4-5.1-2.8-9-7-9-13.4V7.4z" /><path d="M11.8 15.8l3 3 5.6-6" className="is-accent" /></>,
  chat: <><path d="M5 8.5A3.5 3.5 0 0 1 8.5 5h15A3.5 3.5 0 0 1 27 8.5v9a3.5 3.5 0 0 1-3.5 3.5H13l-6 5v-5H8.5A3.5 3.5 0 0 1 5 17.5z" /><path d="M10.5 11.5h11M10.5 15.5h6.5" className="is-accent" /></>,
  book: <><path d="M6 6.8A2.8 2.8 0 0 1 8.8 4H26v20H8.8A2.8 2.8 0 0 0 6 26.8z" /><path d="M6 24V6.8M11 9.5h9" className="is-accent" /></>,
  frame: <><rect height="16" rx="2.4" width="16" x="8" y="8" /><path d="M12 8V4.5M20 8V4.5M12 27.5V24M20 27.5V24M8 12H4.5M8 20H4.5M27.5 12H24M27.5 20H24" className="is-accent" /></>,
  pulse: <><path d="M4 16h5l3.4-8 5.6 16 3.4-8H26" /><circle cx="28" cy="16" r="1.4" className="is-accent" /></>,
  hand: <><path d="M9.5 14V8.2a1.9 1.9 0 0 1 3.8 0V14m0-4.4a1.9 1.9 0 0 1 3.8 0V14m0-3.2a1.9 1.9 0 0 1 3.8 0v6.4a7.6 7.6 0 0 1-7.6 7.6h-1a7.6 7.6 0 0 1-6.4-3.4l-2.1-3.3a2 2 0 0 1 3.3-2.3l1.4 1.9" /><path d="M20.9 10.8v3.4" className="is-accent" /></>,
  bolt: <><path d="M18 4 7 18h7l-2 10L23 14h-7z" /><path d="M16 11l2-4" className="is-accent" /></>,
  route: <><circle cx="7" cy="25" r="2.6" /><circle cx="25" cy="7" r="2.6" className="is-accent" /><path d="M9.5 24H18a4 4 0 0 0 4-4v-2a4 4 0 0 1 4-4h-3.4" /></>,
  eye: <><path d="M4 16s4.4-7.5 12-7.5S28 16 28 16s-4.4 7.5-12 7.5S4 16 4 16z" /><circle cx="16" cy="16" r="3.2" className="is-accent" /></>,
  loop: <><path d="M8 12a8.5 8.5 0 0 1 15.5-2M24 20a8.5 8.5 0 0 1-15.5 2" /><path d="M23.5 4.5V10H18M8.5 27.5V22H14" className="is-accent" /></>,
  device: <><rect height="15" rx="2" width="20" x="4" y="6" /><path d="M12 26h8M16 21v5" /><rect height="9" rx="1.6" width="6" x="22" y="15" className="is-accent" /></>,
  type: <><path d="M6 9V5h20v4M16 5v22M12 27h8" /><path d="M22 16h5v5" className="is-accent" /></>,
  gauge: <><path d="M5 23a11 11 0 1 1 22 0" /><path d="M16 23l6.4-7.4" className="is-accent" /><circle cx="16" cy="23" r="1.6" /></>,
  /* Besucherzeichen: Figur in Weiss, der Akzent ist nur der kleine Punkt
     daneben — dieselbe Zurueckhaltung wie bei den uebrigen Zeichen. */
  user: <><circle cx="15" cy="12" r="5.2" /><path d="M6.4 27a8.8 8.8 0 0 1 17.6 0" /><circle cx="25.6" cy="7.4" r="2" className="is-accent" /></>,
  /* Analyse "Was ging schief?" (Pop-up 2): Ereignis, Ursache, Risiko.
     Die Konsequenz nutzt `shield` — Schild mit Haken. */
  messageWarning: <><path d="M5 8.5A3.5 3.5 0 0 1 8.5 5h15A3.5 3.5 0 0 1 27 8.5v9a3.5 3.5 0 0 1-3.5 3.5H13l-6 5v-5H8.5A3.5 3.5 0 0 1 5 17.5z" /><path d="M16 9v4.6" className="is-accent" /><circle cx="16" cy="16.8" r="1.1" className="is-accent" /></>,
  scanSearch: <><path d="M5 10.5V7.5A2.5 2.5 0 0 1 7.5 5h3M21.5 5h3A2.5 2.5 0 0 1 27 7.5v3M27 21.5v3a2.5 2.5 0 0 1-2.5 2.5h-3M10.5 27h-3A2.5 2.5 0 0 1 5 24.5v-3" /><circle cx="15" cy="15" r="4.6" /><path d="m18.4 18.4 3.6 3.6" className="is-accent" /></>,
  triangleAlert: <><path d="M14.2 6.3a2.1 2.1 0 0 1 3.6 0l9.8 17.1a2.1 2.1 0 0 1-1.8 3.1H6.2a2.1 2.1 0 0 1-1.8-3.1z" /><path d="M16 12.4v5.4" className="is-accent" /><circle cx="16" cy="21.4" r="1.1" className="is-accent" /></>,
  /* Pop-up 3 (API Integration): Knoten, Schluessel, geprueftes Datenobjekt,
     Rueckmeldung, Datenbank sowie Shop und Zahlung fuer die Datenpipeline. */
  api: <><rect height="10" rx="2.4" width="10" x="11" y="11" /><path d="M16 11V7M16 21v4M11 16H7M21 16h4" /><circle cx="16" cy="5" r="1.7" className="is-accent" /><circle cx="27" cy="16" r="1.7" className="is-accent" /><circle cx="16" cy="27" r="1.7" /><circle cx="5" cy="16" r="1.7" /></>,
  key: <><circle cx="10.5" cy="16" r="5.5" /><path d="M16 16h11M22.5 16v4.5M26.5 16v3" className="is-accent" /></>,
  braces: <><path d="M11.5 5.5c-2.6 0-3.8 1.3-3.8 3.9v2.7c0 1.9-.9 3.1-2.7 3.9 1.8.8 2.7 2 2.7 3.9v2.7c0 2.6 1.2 3.9 3.8 3.9M20.5 5.5c2.6 0 3.8 1.3 3.8 3.9v2.7c0 1.9.9 3.1 2.7 3.9-1.8.8-2.7 2-2.7 3.9v2.7c0 2.6-1.2 3.9-3.8 3.9" /><path d="m12.6 16.2 2.4 2.4 4.2-4.8" className="is-accent" /></>,
  sync: <><path d="M6.5 14a9.6 9.6 0 0 1 16.8-5.2M25.5 18a9.6 9.6 0 0 1-16.8 5.2" /><path d="M23.6 4.4v4.6H19M8.4 27.6V23H13" className="is-accent" /></>,
  database: <><ellipse cx="16" cy="8" rx="9.5" ry="3.6" /><path d="M6.5 8v16c0 2 4.3 3.6 9.5 3.6s9.5-1.6 9.5-3.6V8" /><path d="M6.5 16c0 2 4.3 3.6 9.5 3.6s9.5-1.6 9.5-3.6" className="is-accent" /></>,
  cart: <><path d="M4 6h3.2l2.7 13.1a2 2 0 0 0 2 1.6h10.3a2 2 0 0 0 1.9-1.4L26.5 11H8.4" /><circle cx="12.6" cy="25.6" r="1.8" /><circle cx="21.6" cy="25.6" r="1.8" /><path d="M12.8 15.6h9.6" className="is-accent" /></>,
  card: <><rect height="17" rx="3" width="24" x="4" y="7.5" /><path d="M4 13h24" /><path d="M8.5 19.5h5.5" className="is-accent" /></>,
  mail: <><rect height="17" rx="3" width="24" x="4" y="7.5" /><path d="m5.5 9.5 10.5 7.8 10.5-7.8" className="is-accent" /></>,
  /* Pop-up 4 (Automatisierung): Verzweigung und Verlauf. */
  branch: <><circle cx="8" cy="7" r="2.6" /><circle cx="8" cy="25" r="2.6" /><circle cx="24" cy="11" r="2.6" className="is-accent" /><path d="M8 9.6v12.8M8 19c0-4.4 3.2-6.4 8-6.4h5.4" /></>,
  history: <><path d="M5.5 16a10.5 10.5 0 1 0 3.1-7.4" /><path d="M5 5.5v4.2h4.2" /><path d="M16 10.5V16l3.8 2.4" className="is-accent" /></>,
};

export function Glyph({ name }) {
  return (
    <svg aria-hidden="true" className="sc-glyph" viewBox="0 0 32 32">
      {GLYPHS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Direktionaler Slider mit einheitlicher Rounded-Pagination.          */
/* Alle Karten liegen übereinander in einer Rasterzelle; sichtbar ist   */
/* die aktuelle, die übrigen warten links und rechts daneben. Ein       */
/* Wechsel verschiebt nur Positionen — nichts wird ein- oder            */
/* ausgehängt. Drag/Swipe, Pfeiltasten und horizontales Wheel inklusive.*/
/*                                                                     */
/* `loop` schaltet die endlose Fassung ein: der Wechsel läuft über das */
/* Ende hinaus weiter und die Navigation bekommt zusätzlich die beiden */
/* Pfeile aus Pop-up 1. Ohne die Angabe bleibt es bei Anschlag und     */
/* reiner Punktnavigation — so nutzen es die älteren Ansichten.        */
/* ------------------------------------------------------------------ */

/*
 * Position einer Karte relativ zur aktuellen.
 *
 * In der endlosen Fassung zaehlt der kuerzeste Weg: Karte 4 steht bei
 * Position 1 nicht drei Schritte rechts, sondern einen Schritt links. Nur
 * dadurch laeuft der Uebergang ueber das Ende hinaus in dieselbe Richtung
 * weiter, in die geklickt wurde.
 */
function slideOffset(itemIndex, index, count, loop) {
  const raw = itemIndex - index;
  if (!loop) return raw;
  const wrapped = ((raw % count) + count) % count;
  return wrapped > count / 2 ? wrapped - count : wrapped;
}

function SliderDots({ ariaLabel, index, items, onSelect, tight }) {
  return (
    <div
      aria-label={`${ariaLabel}: Position wählen`}
      className={`sc-pager${tight ? ' sc-pager--tight' : ''}`}
      role="tablist"
    >
      {items.map((item, itemIndex) => (
        <button
          aria-label={`${itemIndex + 1} von ${items.length}: ${item.pagerLabel || item.title || item.id}`}
          aria-selected={itemIndex === index}
          className={itemIndex === index ? 'is-active' : ''}
          key={item.id}
          onClick={() => onSelect(itemIndex)}
          role="tab"
          type="button"
        >
          <i />
        </button>
      ))}
    </div>
  );
}

export function Slider({
  ariaLabel,
  className = '',
  items,
  loop = false,
  reducedMotion,
  renderSlide,
}) {
  const [index, setIndex] = useState(0);
  const wheelLock = useRef(0);
  const count = items.length;

  /* Ausserhalb der Liste wird in der endlosen Fassung umgebrochen, sonst
     am Rand geklemmt. Beides ohne Anschlaggefuehl fuer den Nutzer. */
  const resolve = useCallback((next) => (loop
    ? ((next % count) + count) % count
    : Math.max(0, Math.min(count - 1, next))
  ), [count, loop]);

  /* Punktnavigation springt auf eine feste Position. */
  const goTo = useCallback((next) => setIndex(resolve(next)), [resolve]);

  /*
   * Pfeile, Tastatur, Swipe und Wheel zaehlen dagegen relativ — und zwar
   * ueber die Zustandsfunktion. Wer zweimal schnell hintereinander klickt,
   * rechnet sonst beide Male vom selben alten Stand aus und der zweite
   * Klick verpufft: React fasst beide Aktualisierungen zusammen.
   */
  const step = useCallback((delta) => {
    setIndex((current) => resolve(current + delta));
  }, [resolve]);

  const handleDragEnd = (_, info) => {
    const power = Math.abs(info.offset.x) * 0.6 + Math.abs(info.velocity.x) * 0.12;
    if (power < 46) return;
    step(info.offset.x < 0 ? 1 : -1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  };

  const handleWheel = (event) => {
    if (Math.abs(event.deltaX) < 24 || Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
    const now = performance.now();
    if (now - wheelLock.current < 520) return;
    wheelLock.current = now;
    step(event.deltaX > 0 ? 1 : -1);
  };

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="Slider"
      className={`sc-slider ${className}`.trim()}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      role="group"
      tabIndex={0}
    >
      {/*
        Alle Karten stehen dauerhaft in derselben Rasterzelle (siehe CSS)
        und bewegen sich nur ueber ihre Position. Vorher wurde je Wechsel
        eine Karte ein- und ausgehaengt — bei schnellem Blaettern blieben
        halb aufgebaute Karten unsichtbar liegen und fingen Klicks ab, und
        die Buehne fiel waehrend des Wechsels auf die Hoehe der neuen
        Karte zusammen. So bleibt die Hoehe konstant und der Wechsel eine
        reine Bewegung, die sich jederzeit unterbrechen laesst.
      */}
      <div className="sc-slider__stage">
        {items.map((item, itemIndex) => {
          const offset = slideOffset(itemIndex, index, count, loop);
          const isCurrent = offset === 0;

          return (
            <motion.div
              animate={{
                x: isCurrent ? 0 : `${offset < 0 ? '-' : ''}58%`,
                opacity: isCurrent ? 1 : 0,
              }}
              aria-hidden={!isCurrent}
              className={`sc-slider__slide${isCurrent ? ' is-current' : ''}`}
              drag={isCurrent && !reducedMotion ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              initial={false}
              key={item.id}
              onDragEnd={handleDragEnd}
              /*
               * Die weichende Karte blendet schneller aus, als die neue
               * einblendet: sonst stehen beide fast eine halbe Sekunde
               * gleich sichtbar uebereinander und der Wechsel wirkt
               * unruhig. Die Bewegung selbst bleibt fuer beide gleich
               * lang — nur so laufen sie sauber synchron.
               */
              transition={reducedMotion
                ? { duration: 0.01 }
                : {
                  x: { duration: 0.52, ease: EASE },
                  opacity: isCurrent
                    ? { duration: 0.34, ease: 'easeOut', delay: 0.1 }
                    : { duration: 0.22, ease: 'easeIn' },
                }}
            >
              {renderSlide(item, itemIndex)}
            </motion.div>
          );
        })}
      </div>

      {loop ? (
        <div className="sc-slider__controls">
          <button
            aria-label="Zurück"
            className="sc-slider__arrow"
            onClick={() => step(-1)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14.5 6.5 9 12l5.5 5.5" /></svg>
          </button>

          <SliderDots
            ariaLabel={ariaLabel}
            index={index}
            items={items}
            onSelect={goTo}
            tight
          />

          <button
            aria-label="Weiter"
            className="sc-slider__arrow"
            onClick={() => step(1)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9.5 6.5 15 12l-5.5 5.5" /></svg>
          </button>
        </div>
      ) : (
        <SliderDots ariaLabel={ariaLabel} index={index} items={items} onSelect={goTo} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PeekSlider — nativer Scroll-Container mit Scroll-Snap statt eines   */
/* transformierten Tracks. Der Browser übernimmt damit Trägheit,       */
/* Gummiband und Snap; auf dem Handy fühlt sich das an wie erwartet.   */
/*                                                                     */
/* Ränder: Der Scroller trägt links und rechts denselben Innenabstand  */
/* und dieselbe scroll-padding. Die erste Karte rastet dadurch mit      */
/* Abstand zum linken Rand ein, die letzte klemmt der Browser auf den   */
/* maximalen Scrollwert — sie steht bündig mit demselben Abstand rechts. */
/* Weder vorne noch hinten bleibt eine tote Fläche.                     */
/* ------------------------------------------------------------------ */

export function PeekSlider({
  ariaLabel,
  className = '',
  items,
  reducedMotion,
  renderSlide,
}) {
  const scrollerRef = useRef(null);
  const frameRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [stops, setStops] = useState([0]);

  /*
   * Erreichbare Haltepunkte statt Kartenindizes.
   *
   * Passen mehrere Karten gleichzeitig ins Fenster, laufen die letzten
   * Karten alle auf denselben maximalen Scrollwert. Wer stattdessen pro
   * Karte blaettert, landet nach einem Klick sofort am Ende — die
   * Pagination sprang dadurch von "1 von 4" auf "4 von 4", obwohl sich
   * kaum etwas bewegt hatte. Deshalb wird gemessen, welche Positionen
   * tatsaechlich verschieden sind; Pfeile und Punkte folgen genau denen.
   */
  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return [0];

    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const pad = Number.parseFloat(getComputedStyle(scroller).paddingLeft) || 0;
    const origin = scroller.getBoundingClientRect().left - scroller.scrollLeft + pad;

    const reachable = [];
    [...scroller.children].forEach((child) => {
      const target = Math.min(max, Math.max(0, child.getBoundingClientRect().left - origin));
      // Positionen unter 2px Abstand sind fuer den Nutzer dieselbe.
      if (!reachable.some((value) => Math.abs(value - target) < 2)) reachable.push(target);
    });

    return reachable.length ? reachable : [0];
  }, []);

  const sync = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const reachable = measure();
    setStops((current) => (
      current.length === reachable.length
        && current.every((value, i) => Math.abs(value - reachable[i]) < 2)
        ? current
        : reachable
    ));

    let next = 0;
    let best = Infinity;
    reachable.forEach((value, i) => {
      const distance = Math.abs(value - scroller.scrollLeft);
      if (distance < best) {
        best = distance;
        next = i;
      }
    });
    setIndex(next);
  }, [measure]);

  /*
   * Auf einen Frame zusammengefasst, aber ohne blockierendes Schloss:
   * ein "steht noch aus"-Flag bleibt haengen, sobald einmal ein Frame
   * ausbleibt (gedrosselter Renderer, verstecktes Tab) — danach wuerde
   * jedes weitere Scroll-Ereignis verworfen und Punkte wie Pfeile
   * blieben dauerhaft auf dem alten Stand.
   */
  const handleScroll = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      sync();
    });
  }, [sync]);

  useLayoutEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    /*
     * Der Slider haengt beim Oeffnen des Pop-ups in einem noch
     * einfahrenden, transformierten Container. Die Breiten stehen dort
     * erst nach dem Layout fest — der ResizeObserver meldet sich genau
     * dann und rechnet die Haltepunkte neu. Deshalb braucht es keine
     * zweite Initialisierung und keinen Timer.
     */
    const observer = new ResizeObserver(sync);
    observer.observe(scroller);
    [...scroller.children].forEach((child) => observer.observe(child));

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [sync]);

  const goTo = useCallback((next) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const reachable = measure();
    const target = reachable[Math.max(0, Math.min(reachable.length - 1, next))];
    if (target === undefined) return;
    scroller.scrollTo({
      left: target,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [measure, reducedMotion]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
    if (event.key === 'Home') { event.preventDefault(); goTo(0); }
    if (event.key === 'End') { event.preventDefault(); goTo(stops.length - 1); }
  };

  // Passt alles gleichzeitig ins Fenster, gibt es nichts zu blaettern.
  const pagable = stops.length > 1;

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="Slider"
      className={`sc-peek ${className}`.trim()}
      onKeyDown={handleKeyDown}
      role="group"
      tabIndex={0}
    >
      <div className="sc-peek__window" onScroll={handleScroll} ref={scrollerRef}>
        {items.map((item, itemIndex) => (
          <div
            aria-label={`${itemIndex + 1} von ${items.length}`}
            className="sc-peek__item is-current"
            key={item.id}
            role="group"
          >
            {renderSlide(item, itemIndex, true)}
          </div>
        ))}
      </div>

      {pagable ? (
        <div className="sc-peek__controls">
          <button
            aria-label="Zurück"
            className="sc-peek__arrow"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14.5 6.5 9 12l5.5 5.5" /></svg>
          </button>

          <div className="sc-pager sc-pager--tight" role="tablist" aria-label={`${ariaLabel}: Position wählen`}>
            {stops.map((stop, stopIndex) => (
              <button
                aria-label={`Position ${stopIndex + 1} von ${stops.length}`}
                aria-selected={stopIndex === index}
                className={stopIndex === index ? 'is-active' : ''}
                key={stop}
                onClick={() => goTo(stopIndex)}
                role="tab"
                type="button"
              >
                <i />
              </button>
            ))}
          </div>

          <button
            aria-label="Weiter"
            className="sc-peek__arrow"
            disabled={index === stops.length - 1}
            onClick={() => goTo(index + 1)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9.5 6.5 15 12l-5.5 5.5" /></svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
