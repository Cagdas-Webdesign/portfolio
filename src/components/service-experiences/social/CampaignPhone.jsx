import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { GardenAdvisor } from './GardenAdvisor.jsx';
import { useOnceInView } from './hooks.js';
import PhoneIcon from './icons.jsx';
import { AdCreative, InstagramChrome } from './InstagramAd.jsx';
import { GardenVisual } from './verde.jsx';
import VerdeLandingPage from './VerdeLandingPage.jsx';

// Federsteifigkeit des Handy-Scrubs (rad/s, kritisch gedaempft): kleiner =
// mehr Nachlauf. 2.5 ≈ ruhig, ohne traege zu wirken.
const FOLLOW_OMEGA = 2.5;

/* ==================================================================
 * Das Kampagnen-Phone — ein Geraet fuer Anzeige UND Landingpage
 *
 * Ebenen im Bildschirm (von unten nach oben):
 *
 *   1  Instagram-Oberflaeche          (InstagramChrome)
 *   2  gemeinsame Bildflaeche         (.mk-screen__visual)
 *   3  Anzeigen-Text ueber dem Motiv  (AdCreative)
 *   4  Landingpage                    (VerdeLandingPage, Hero transparent)
 *   5  Browser-Leiste
 *   6  Gartenberater
 *
 * Signature-Moment: Die Bildflaeche ist in der Anzeige per clip-path auf
 * das 4:5-Motiv beschnitten. Beim Klick auf den CTA oeffnet sich genau
 * diese Flaeche zum Hero der Landingpage (--reveal 0 → 1). Kein zweites
 * Bild, kein harter Screen-Wechsel: dasselbe Motiv traegt die Botschaft
 * weiter.
 *
 * Alles laeuft ueber eine einzige, pausierte Timeline. Vorwaerts =
 * Klick, rueckwaerts (schneller) = zurueck zur Anzeige. Der Zustand
 * kommt ausschliesslich ueber Props aus dem Kapitel-Scroll.
 * ================================================================== */

const MODE_LABEL = {
  ad: 'Instagram · Feed · Anzeige',
  landing: 'verde-garten.de · Landingpage',
};

function StatusBar() {
  return (
    <div aria-hidden="true" className="mk-screen__status">
      <b>9:41</b>
      <span>
        <svg viewBox="0 0 18 12"><path d="M1 11h2V8H1zM5 11h2V6H5zM9 11h2V3.5H9zM13 11h2V1h-2z" /></svg>
        <svg viewBox="0 0 16 12"><path d="M8 11.2 5.6 8.6a3.4 3.4 0 0 1 4.8 0zM3.4 6.4a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.6 4.6 0 0 0-6.6 0zM1.2 4.2a9.6 9.6 0 0 1 13.6 0l-1.3 1.3a7.8 7.8 0 0 0-11 0z" /></svg>
        <svg viewBox="0 0 26 12"><rect height="10" rx="2.6" width="21" x="0.5" y="1" fill="none" stroke="currentColor" /><rect height="7" rx="1.4" width="16" x="2.5" y="2.5" /><path d="M23.5 4.5v3" stroke="currentColor" /></svg>
      </span>
    </div>
  );
}

/* Hebt Bereiche hervor: on = Fokus mit Rahmen, soft = bleibt hell, off = tritt zurueck. */
function applyFocus(screen, focus) {
  screen.querySelectorAll('[data-part]').forEach((element) => {
    if (!focus || focus === 'none') {
      element.removeAttribute('data-hit');
      return;
    }
    const tokens = element.dataset.part.split(' ');
    let hit = 'off';
    if (tokens.includes(focus)) hit = 'on';
    else if (tokens.includes(`${focus}-soft`)) hit = 'soft';
    element.setAttribute('data-hit', hit);
  });
}

export default function CampaignPhone({
  advisor,
  advisorOpen,
  advisorVisible,
  focus,
  mode,
  onAdvisorClose,
  onAdvisorOpen,
  onPhase,
  reducedMotion,
  replayToken,
  scrubRef,
  section,
  started,
}) {
  const screenRef = useRef(null);
  const frameRef = useRef(null);
  const pageRef = useRef(null);
  const transitionRef = useRef(null);
  const buildRef = useRef(null);
  const builtRef = useRef(false);
  const phaseRef = useRef(onPhase);
  const modeRef = useRef(mode);

  useEffect(() => {
    phaseRef.current = onPhase;
  }, [onPhase]);

  /* ---------- Aufbau-Sequenz: Phone → Marke → Motiv → Hook → Botschaft → CTA ---------- */

  useLayoutEffect(() => {
    if (reducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.set(frameRef.current, { opacity: 0, y: 48 });
      gsap.set('[data-build], .mk-screen__visual .mk-garden, .mk-ig__bar, .mk-ig__actions, .mk-ig__caption', { opacity: 0 });
    }, screenRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  const build = useCallback(() => {
    if (builtRef.current || reducedMotion) return;
    builtRef.current = true;
    const screen = screenRef.current;
    const q = gsap.utils.selector(screen);
    const done = { clearProps: 'opacity,transform' };
    buildRef.current = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(frameRef.current, { opacity: 1, y: 0, duration: 0.9, ...done })
      .to(q('.mk-ig__bar'), { opacity: 1, duration: 0.4, ...done }, '-=0.45')
      .fromTo(q('[data-build="brand"]'), { y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ...done }, '-=0.2')
      .fromTo(q('.mk-screen__visual .mk-garden'), { scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out', ...done }, '-=0.2')
      .fromTo(q('[data-build="hook"]'), { y: 16 }, { opacity: 1, y: 0, duration: 0.65, ...done }, '-=0.6')
      .fromTo(q('[data-build="message"]'), { y: 10 }, { opacity: 1, y: 0, duration: 0.55, ...done }, '-=0.3')
      .fromTo(q('[data-build="cta"]'), { y: 12 }, { opacity: 1, y: 0, duration: 0.55, ...done }, '-=0.2')
      .to(q('.mk-ig__actions, .mk-ig__caption'), { opacity: 1, duration: 0.45, ...done }, '-=0.25');
  }, [reducedMotion]);

  const viewRef = useOnceInView(build, { threshold: 0.3, enabled: !reducedMotion });

  // Sicherheitsnetz: Sobald ein Kapitel-Schritt aktiv ist, ist das Phone
  // sichtbar — auch falls der Beobachter (noch) nicht ausgeloest hat.
  useEffect(() => {
    if (started) build();
  }, [build, started]);

  /* ---------- Signature-Uebergang: Anzeige → Landingpage ---------- */

  useLayoutEffect(() => {
    const screen = screenRef.current;
    const q = gsap.utils.selector(screen);
    const report = (index) => () => {
      const timeline = transitionRef.current;
      if (timeline && !timeline.reversed()) phaseRef.current?.(index);
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.inOut' },
        onComplete: report(4),
      });
      tl.call(report(0), null, 0)
        .fromTo(q('.mk-tap'), { scale: 0, opacity: 0.6 }, { scale: 1, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0)
        .fromTo(q('.mk-ig__cta'), { scale: 1 }, { scale: 0.965, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.02)
        .call(report(1), null, 0.34)
        .to(q('.mk-ad'), { opacity: 0, y: -10, duration: 0.45, ease: 'power2.in' }, 0.32)
        .to(q('.mk-ig'), { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.38)
        .call(report(2), null, 0.58)
        .fromTo(q('.mk-browser'), { yPercent: -110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.56)
        .fromTo(q('.mk-browser__progress'), { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0.62)
        .fromTo(q('.mk-screen__visual'), { '--reveal': 0 }, { '--reveal': 1, duration: 1.05 }, 0.64)
        .fromTo(q('.mk-lp__hero-shade'), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.9)
        .call(report(3), null, 1.34)
        .fromTo(q('[data-enter="nav"]'), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'opacity,transform' }, 1.3)
        .fromTo(q('[data-enter="hero"] > *'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.62, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform' }, 1.38)
        .to(q('.mk-browser__progress'), { opacity: 0, duration: 0.3 }, 1.8);
      transitionRef.current = tl;
      if (modeRef.current === 'landing') tl.progress(1);
    }, screen);

    return () => {
      transitionRef.current = null;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    const tl = transitionRef.current;
    if (!tl) return;
    if (reducedMotion) {
      tl.pause().progress(mode === 'landing' ? 1 : 0);
      phaseRef.current?.(mode === 'landing' ? 4 : -1);
      return;
    }
    if (mode === 'landing') {
      tl.timeScale(1).play();
    } else {
      phaseRef.current?.(-1);
      tl.timeScale(2.2).reverse();
    }
  }, [mode, reducedMotion]);

  // "Übergang wiederholen": kurz zur Anzeige, dann erneut klicken.
  useEffect(() => {
    if (!replayToken) return undefined;
    const tl = transitionRef.current;
    if (!tl) return undefined;
    tl.pause().progress(0);
    phaseRef.current?.(-1);
    const call = gsap.delayedCall(reducedMotion ? 0 : 0.55, () => {
      if (reducedMotion) tl.progress(1);
      else tl.timeScale(1).play();
      if (reducedMotion) phaseRef.current?.(4);
    });
    return () => call.kill();
  }, [replayToken, reducedMotion]);

  /* ---------- Landingpage an einen Anker fahren ---------- */

  // Zielposition der Seite fuer einen Anker (0 = Hero).
  const offsetFor = useCallback((target) => {
    const screen = screenRef.current;
    const page = pageRef.current;
    if (!screen || !page || target === 'hero') return 0;
    const anchor = page.querySelector(`[data-anchor="${target}"]`);
    const nav = screen.querySelector('.mk-lp__nav');
    if (!anchor) return 0;
    const navBottom = nav ? nav.offsetTop + nav.offsetHeight : 0;
    const max = Math.max(0, page.scrollHeight - screen.clientHeight);
    return -Math.min(max, Math.max(0, anchor.offsetTop - navBottom));
  }, []);

  /*
   * Handy-Scrub: kontinuierlicher Nachlauf statt Tween-Neustarts.
   * Eine kritisch gedaempfte Feder auf dem GSAP-Ticker folgt dem Ziel mit
   * stetiger Geschwindigkeit — keine Spruenge pro Scroll-Event (jeder
   * Tween-Neustart begann mit voller Anfangsgeschwindigkeit), gleichmaessiger
   * Nachlauf. Nur fuer den Handy-Scrub; Desktop faehrt weiter per Tween.
   */
  const followRef = useRef({ pos: 0, vel: 0, target: 0, running: false, last: 0 });

  const stopFollow = useCallback(() => {
    const f = followRef.current;
    if (!f.running) return;
    f.running = false;
    gsap.ticker.remove(f.tick);
  }, []);

  const follow = useCallback((y) => {
    const screen = screenRef.current;
    const page = pageRef.current;
    if (!screen || !page) return;
    const visual = screen.querySelector('.mk-screen__visual');
    const f = followRef.current;
    screen.dataset.scrolled = y < -8 ? 'true' : 'false';
    f.target = y;
    f.last = performance.now();
    if (f.running) return;
    gsap.killTweensOf(page, 'y');
    if (visual) gsap.killTweensOf(visual, 'y');
    f.pos = Number(gsap.getProperty(page, 'y')) || 0;
    f.vel = 0;
    f.tick = (_time, deltaMs) => {
      const dt = Math.min(deltaMs / 1000, 0.05);
      const w = FOLLOW_OMEGA;
      f.vel += (w * w * (f.target - f.pos) - 2 * w * f.vel) * dt;
      f.pos += f.vel * dt;
      if (Math.abs(f.target - f.pos) < 0.3 && Math.abs(f.vel) < 3) {
        f.pos = f.target;
        stopFollow();
      }
      gsap.set(page, { y: f.pos });
      if (visual) gsap.set(visual, { y: f.pos * 0.5 });
    };
    f.running = true;
    gsap.ticker.add(f.tick);
  }, [stopFollow]);

  useEffect(() => stopFollow, [stopFollow]);

  const place = useCallback((y, duration, ease = 'power3.out') => {
    const screen = screenRef.current;
    const page = pageRef.current;
    if (!screen || !page) return;
    stopFollow();
    screen.dataset.scrolled = y < -8 ? 'true' : 'false';
    const settings = { y, overwrite: 'auto', duration, ease };
    gsap.to(page, settings);
    // Das Motiv wandert mit halber Geschwindigkeit mit — leichte Tiefe.
    gsap.to(screen.querySelector('.mk-screen__visual'), { ...settings, y: y * 0.5 });
  }, [stopFollow]);

  const lastScrubRef = useRef(null);

  const moveTo = useCallback((target, animate) => {
    // Laeuft gerade der Handy-Scrub, uebernimmt die Feder auch den
    // Schrittwechsel — sonst wuerde ein Tween die laufende Bewegung abloesen.
    const f = followRef.current;
    if (animate && (f.running || performance.now() - f.last < 600)) {
      follow(offsetFor(target));
      return;
    }
    place(offsetFor(target), animate ? 0.95 : 0);
  }, [follow, offsetFor, place]);

  /*
   * Handy: die Seite scrollt im Phone mit dem Finger mit. Innerhalb eines
   * Schritts gleitet sie ruhig vom aktuellen zum naechsten Anker, statt
   * am Schrittwechsel zu springen. Desktop bleibt beim Tween pro Schritt.
   */
  useEffect(() => {
    if (!scrubRef) return undefined;
    scrubRef.current = (from, to, progress, instant = false) => {
      if (modeRef.current !== 'landing') return;
      lastScrubRef.current = { from, to, progress };
      // Linear ueber den ganzen Schritt (keine Pause am Schrittanfang, kein
      // Beschleunigen/Abbremsen pro Schritt); den Nachlauf macht die Feder.
      const t = Math.min(1, Math.max(0, progress));
      const a = offsetFor(from);
      const b = offsetFor(to);
      const y = a + (b - a) * t;
      if (reducedMotion || instant) place(y, 0);
      else follow(y);
    };
    return () => {
      scrubRef.current = null;
    };
  }, [follow, offsetFor, place, reducedMotion, scrubRef]);

  useEffect(() => {
    moveTo(section, !reducedMotion);
  }, [moveTo, reducedMotion, section]);

  useEffect(() => {
    // Resize (auf dem Handy auch beim Ein-/Ausblenden der Adressleiste):
    // die aktuelle Scrub-Position neu vermessen statt zum Anker zu springen.
    const onResize = () => {
      const last = lastScrubRef.current;
      if (last && last.from === section && scrubRef?.current) scrubRef.current(last.from, last.to, last.progress, true);
      else moveTo(section, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [moveTo, scrubRef, section]);

  // Vorher/Nachher: der Trenner faehrt einmal auf, sobald die Projekte kommen.
  useEffect(() => {
    if (section !== 'proof') return undefined;
    const compare = screenRef.current?.querySelector('.mk-lp__compare');
    if (!compare) return undefined;
    if (reducedMotion) {
      compare.style.setProperty('--split', '50%');
      return undefined;
    }
    const tween = gsap.fromTo(compare, { '--split': '86%' }, { '--split': '50%', duration: 1.3, delay: 0.55, ease: 'power3.inOut' });
    return () => tween.kill();
  }, [reducedMotion, section]);

  useEffect(() => {
    if (screenRef.current) applyFocus(screenRef.current, focus);
  }, [focus]);

  useEffect(() => () => buildRef.current?.kill(), []);

  const setFigureRef = (node) => {
    viewRef.current = node;
  };

  return (
    <figure className="mk-phone" data-mode={mode} ref={setFigureRef}>
      <div className="mk-phone__frame" ref={frameRef}>
        <span aria-hidden="true" className="mk-phone__island" />
        <div
          className="mk-screen"
          data-advisor={advisorOpen ? 'open' : 'closed'}
          data-focus={focus}
          data-mode={mode}
          ref={screenRef}
        >
          <div className="mk-screen__layer is-ig" inert={mode !== 'ad'}>
            <InstagramChrome />
          </div>

          <div aria-hidden="true" className="mk-screen__visual">
            <GardenVisual label="" />
          </div>

          <div className="mk-screen__layer is-ad" inert={mode !== 'ad'}>
            <AdCreative />
          </div>

          <div className="mk-screen__layer is-lp" inert={mode !== 'landing'}>
            <VerdeLandingPage pageRef={pageRef} />
          </div>

          <div aria-hidden="true" className="mk-browser">
            <PhoneIcon name="close" />
            <span className="mk-browser__url">
              <PhoneIcon name="lock" />
              verde-garten.de
            </span>
            <PhoneIcon name="dots" />
            <i className="mk-browser__progress" />
          </div>

          <div className="mk-screen__layer is-advisor" inert={mode !== 'landing' || !advisorVisible}>
            <GardenAdvisor
              advisor={advisor}
              onClose={onAdvisorClose}
              onOpen={onAdvisorOpen}
              open={advisorOpen}
              reducedMotion={reducedMotion}
              visible={advisorVisible}
            />
          </div>

          <StatusBar />
          <span aria-hidden="true" className="mk-tap" />
        </div>
      </div>
      <figcaption className="mk-phone__caption">
        <i aria-hidden="true" />
        {MODE_LABEL[mode]}
      </figcaption>
    </figure>
  );
}
