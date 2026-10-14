import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CONTACT_MAIL, REACT_PORTFOLIO_REPOSITORY_URL } from '../siteConfig.js';

/*
 * Hero: "Full-Stack Web Developer" — drei bewusst gesetzte Zeilen, die beim
 * ersten Laden nacheinander eingetippt werden.
 *
 * Kein Layout-Shift: Jede Zeile traegt ihr fertiges Wort unsichtbar als
 * Platzhalter (hx-type__ghost). Der getippte Text liegt deckungsgleich
 * darueber (hx-type__live). Die Zeilen haben damit von Anfang an ihre
 * endgueltige Groesse; die Buttons bewegen sich nicht.
 *
 * Screenreader lesen nur den vollstaendigen Satz (hx-sr), nie die einzelnen
 * getippten Buchstaben. data-keep-text schuetzt die Headline vor dem
 * Bindestrich-Rewriter in public/legacy/block-41.js ("Full-Stack").
 */

const HEADLINE = [
  { text: 'Full-Stack', tone: 'primary' },
  { text: 'Web', tone: 'soft' },
  { text: 'Developer', tone: 'accent' },
];
const FULL_TEXT = HEADLINE.map((line) => line.text);
const EMPTY_TEXT = HEADLINE.map(() => '');

/** Tempo: ruhig und professionell, mit leichter natuerlicher Streuung. */
const START_DELAY_MS = 420;
const CHAR_MS = 72;
const CHAR_JITTER_MS = 34;
const WORD_PAUSE_MS = 420;

/** Repository dieses Portfolios und Kontakt: zentral in siteConfig.js. */
const REPOSITORY_URL = REACT_PORTFOLIO_REPOSITORY_URL;

/* Icons wie im Menue (SettingsSheet.jsx: IconGithub / IconMail), hier fuer die Buttons. */
function IconGithub() {
  return (
    <svg aria-hidden="true" className="hx-btn__icon" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49l-.01-1.71c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.28 9.28 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.06 10.06 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      aria-hidden="true"
      className="hx-btn__icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2.5" width="18" x="3" y="5" />
      <path d="m3.8 6.6 7.1 5.1a2 2 0 0 0 2.2 0l7.1-5.1" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg aria-hidden="true" className="hx-btn__arrow" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M5 12h13M12.5 6l5.5 6-5.5 6" />
    </svg>
  );
}

/** Die Einleitung laeuft pro Seitenaufruf genau einmal (nicht bei Re-Render/Remount). */
let introPlayed = false;

const prefersReducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const canAnimate = () => !prefersReducedMotion() && document.visibilityState !== 'hidden';

/**
 * Tippt die Zeilen nacheinander. Liefert den aktuell sichtbaren Text je Zeile,
 * die aktive Zeile (fuer den Cursor) und ob die Animation fertig ist.
 */
function useTypewriter() {
  const [shouldType] = useState(() => !introPlayed && canAnimate());
  const [typed, setTyped] = useState(shouldType ? EMPTY_TEXT : FULL_TEXT);
  const [activeLine, setActiveLine] = useState(shouldType ? 0 : -1);
  const timer = useRef(0);

  const finish = useCallback(() => {
    window.clearTimeout(timer.current);
    setTyped(FULL_TEXT);
    setActiveLine(-1);
  }, []);

  const play = useCallback(() => {
    window.clearTimeout(timer.current);
    if (!canAnimate()) {
      finish();
      return;
    }
    introPlayed = true;
    const current = [...EMPTY_TEXT];
    setTyped(EMPTY_TEXT);
    setActiveLine(0);

    let line = 0;
    let char = 0;
    const step = () => {
      const word = FULL_TEXT[line];
      if (char < word.length) {
        char += 1;
        current[line] = word.slice(0, char);
        setTyped([...current]);
        timer.current = window.setTimeout(step, CHAR_MS + (Math.random() - 0.5) * 2 * CHAR_JITTER_MS);
        return;
      }
      if (line < FULL_TEXT.length - 1) {
        line += 1;
        char = 0;
        timer.current = window.setTimeout(() => {
          setActiveLine(line);
          step();
        }, WORD_PAUSE_MS);
        return;
      }
      setActiveLine(-1);
    };
    timer.current = window.setTimeout(step, START_DELAY_MS);
  }, [finish]);

  useEffect(() => {
    if (shouldType) play();

    // Tab wird versteckt: Timer werden gedrosselt — Headline sofort vollstaendig.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') finish();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [shouldType, play, finish]);

  return { typed, activeLine, play };
}

export default function Hero() {
  const rootRef = useRef(null);
  const introRef = useRef(null);
  const mediaRef = useRef(null);
  const { typed, activeLine, play } = useTypewriter();
  const typing = activeLine !== -1;

  // Nach dem letzten Buchstaben blinkt der Cursor kurz nach und blendet aus.
  const [caretFading, setCaretFading] = useState(false);
  const wasTyping = useRef(typing);
  useEffect(() => {
    if (wasTyping.current && !typing) setCaretFading(true);
    if (typing) setCaretFading(false);
    wasTyping.current = typing;
  }, [typing]);
  const caretLine = typing ? activeLine : (caretFading ? HEADLINE.length - 1 : -1);

  const scrollTo = useCallback((selector) => {
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, []);

  useLayoutEffect(() => {
    const context = gsap.context((self) => {
      const actions = self.selector('.hx-actions');

      const settle = () => {
        gsap.set(actions, { clearProps: 'all' });
      };

      const media = gsap.matchMedia();

      media.add({
        motion: '(prefers-reduced-motion: no-preference)',
        hover: '(hover: hover) and (pointer: fine)',
      }, (mediaContext) => {
        const { hover, motion } = mediaContext.conditions;
        if (!motion) return undefined;

        let watchdog = 0;

        /*
         * Die Headline tippt sich selbst (useTypewriter). GSAP blendet nur noch
         * die Buttons ruhig ein — ihr Platz ist von Anfang an reserviert, es
         * gibt also keinen Sprung. Ruhezustand = Endzustand.
         */
        const build = () => {
          gsap.set(actions, { opacity: 0, y: 14 });

          const timeline = gsap.timeline({
            delay: 0.55,
            onComplete: () => {
              window.clearTimeout(watchdog);
              settle();
            },
          })
            .to(actions, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });

          // Versteckter oder gedrosselter Tab liefert keine Frames: direkt ans Ende.
          if (document.visibilityState === 'hidden') {
            timeline.progress(1);
            return timeline;
          }

          window.clearTimeout(watchdog);
          watchdog = window.setTimeout(() => {
            if (timeline.progress() < 1) timeline.progress(1);
          }, (timeline.duration() + timeline.delay() + 1.6) * 1000);

          return timeline;
        };

        introRef.current = build();

        const finishIfHidden = () => {
          if (document.visibilityState === 'hidden') introRef.current?.progress(1);
        };
        document.addEventListener('visibilitychange', finishIfHidden);

        // Logo-Klick im Header spielt den Eintritt bewusst erneut ab.
        let lastReplay = 0;
        const replay = () => {
          const now = Date.now();
          if (now - lastReplay < 700) return;
          lastReplay = now;
          introRef.current?.kill();
          introRef.current = build();
          play();
        };
        window.addEventListener('hero:replay', replay);

        // Zurueckhaltende Ambient-Bewegung: der Lichtschleier folgt dem
        // Zeiger leicht verzoegert. Nur mit echtem Zeigergeraet, nie auf Touch.
        const veil = hover ? self.selector('.hx-veil')[0] : null;
        let onPointerMove;
        if (veil) {
          const toX = gsap.quickTo(veil, 'x', { duration: 1.1, ease: 'power3.out' });
          const toY = gsap.quickTo(veil, 'y', { duration: 1.1, ease: 'power3.out' });
          onPointerMove = (event) => {
            /*
             * Der Listener haengt am window und bekommt deshalb auch
             * Zeigerbewegungen, die in einem geoeffneten Modal stattfinden.
             * Solange eine Overlay-Ebene offen ist, ruht der Schleier.
             */
            if (document.documentElement.classList.contains('services-experience-active')
              || document.documentElement.classList.contains('shell-sheet-open')) return;
            toX((event.clientX / window.innerWidth - 0.5) * 46);
            toY((event.clientY / window.innerHeight - 0.5) * 30);
          };
          window.addEventListener('pointermove', onPointerMove, { passive: true });
        }

        return () => {
          window.clearTimeout(watchdog);
          document.removeEventListener('visibilitychange', finishIfHidden);
          window.removeEventListener('hero:replay', replay);
          if (onPointerMove) window.removeEventListener('pointermove', onPointerMove);
          introRef.current?.kill();
          introRef.current = null;
          settle();
          if (veil) gsap.set(veil, { clearProps: 'all' });
        };
      });

      mediaRef.current = media;
    }, rootRef);

    return () => {
      mediaRef.current?.revert();
      mediaRef.current = null;
      context.revert();
    };
  }, [play]);

  return (
    <section id="hero" ref={rootRef}>
      <div aria-hidden="true" className="hx-veil" />

      {/*
        Bleibt im Markup: die koerperweite Funnel-Icon-Bruecke in
        public/legacy/block-00.js liest aus diesem Container ihr Badge-Markup.
        Der Layer selbst ist per CSS unsichtbar und rein strukturell.
      */}
      <div aria-hidden="true" className="hero-tool-layer" id="heroToolLayer" />

      <div className="hx-inner">
        <h1 className="hx-title" data-keep-text="">
          <span className="hx-sr">Full-Stack Web Developer</span>
          <span aria-hidden="true" className="hx-type">
            {HEADLINE.map((line, index) => (
              <span className={`hx-line hx-line--${line.tone}`} key={line.text}>
                <span className="hx-type__word">
                  <span className="hx-type__ghost">{line.text}</span>
                  <span className="hx-type__live">
                    {typed[index]}
                    {caretLine === index ? (
                      <span className={`hx-caret${caretFading ? ' is-fading' : ''}`} />
                    ) : null}
                  </span>
                </span>
              </span>
            ))}
          </span>
        </h1>

        <div className="hx-actions">
          {REPOSITORY_URL ? (
            <a className="hx-btn hx-btn--primary" href={REPOSITORY_URL} rel="noopener noreferrer" target="_blank">
              <IconGithub />
              <span>Open Repository</span>
              <IconArrow />
            </a>
          ) : (
            // Noch keine Repository-URL hinterlegt: bisheriges Ziel bleibt bestehen.
            <button className="hx-btn hx-btn--primary" onClick={() => scrollTo('#funnel')} type="button">
              <IconGithub />
              <span>Open Repository</span>
              <IconArrow />
            </button>
          )}

          <a className="hx-btn hx-btn--ghost" href={`mailto:${CONTACT_MAIL}`}>
            <IconMail />
            <span>Kontakt</span>
          </a>
        </div>
      </div>

    </section>
  );
}
