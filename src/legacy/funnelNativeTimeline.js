/*
 * Native ScrollTimeline fuer die 14 Tech-Kreise des V34-Trichters (nur Touch).
 *
 * Uebernahme der auf dem echten iPhone freigegebenen Diagnosevariante F
 * (Referenz: ../_diag-funnel-f-final/funnel-f.html, Stand 2026-10-15).
 *
 * Problem: iOS scrollt die Seite asynchron; V34 positioniert die Kreise per
 * JavaScript aus scrollY und hinkt beim Finger-Scrollen hinterher (Ruckeln).
 * Loesung: V34 rechnet seine unveraenderten Bahnen fuer virtuelle Scroll-
 * positionen (0 bis Trichterende, 4 px), daraus entstehen pro Kreis Keyframes
 * einer ScrollTimeline-Animation, die der Browser selbst synchron zum nativen
 * Scrollen abspielt. V34 steuert Trichter/Klassen weiter; seine Schreibzugriffe
 * auf die 14 Kreise laufen danach ins Leere (genau ein Controller pro Kreis).
 *
 * Virtuell heisst: window.scrollY/pageYOffset und die Bildschirm-Rechtecke von
 * #hero/#funnel-Elementen werden pro Messpunkt umgebogen — die einzigen
 * Scroll-Abhaengigkeiten von V34. Kein scrollTo, keine scroll-Events (andere
 * ScrollTrigger sehen nichts). Gerechnet wird in Haeppchen (~12 ms), jedes
 * endet mit einem V34-Update an der echten Position. Ergebnis wird pro
 * Geometrie im localStorage gecacht.
 *
 * Desktop/Maus und Browser ohne ScrollTimeline: kein Eingriff, V34 wie bisher.
 */
const VERSION = 'f4-1';
const STEP = 4;
const BUDGET_MS = 12;
const MAX_BLOCKED_RETRIES = 600;
const CACHE_PREFIX = 'funnelTL:';

let started = false;

export function startFunnelNativeTimeline() {
  if (started) return;
  started = true;
  /* First Paint (2026-10-15): Auf Touch-Geraeten mit Scroll-Timeline-
     Unterstuetzung ist die Kreis-Ebene per CSS ab dem ersten Frame verborgen
     (base.css, .tool-bridge-layer:not(.is-native-ready)). Freigabe nur hier:
     sobald die Position feststeht — oder sofort bei jedem Abbruch. */
  const pendingLayer = document.getElementById('toolBridgeLayer');
  const reveal = () => { pendingLayer?.classList.add('is-native-ready'); };
  if (typeof window.ScrollTimeline !== 'function') { reveal(); return; }
  if (!window.matchMedia?.('(hover: none) and (pointer: coarse)').matches) { reveal(); return; }
  const hook = window.__v34FunnelHook;
  if (!hook || typeof hook.schedule !== 'function') { reveal(); return; }

  /* Startzustand (2026-10-15): Bis die Position feststeht, ist nur die
     Kreis-Ebene unsichtbar (CSS, bis is-native-ready). Sonst
     zeigte V34 die Kreise zuerst fuer die Fallback-Schrift (font-display:
     swap) und sie sprangen nach dem Schriftwechsel. Jeder Abbruchpfad
     zeigt die Ebene wieder (dann steuert V34 wie bisher). */
  setTimeout(() => { if (!sinkOn) reveal(); }, 6000); // Sicherheitsnetz, nie dauerhaft unsichtbar

  const styleGet = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style').get;
  const gbcr = Element.prototype.getBoundingClientRect;
  const sy = Object.getOwnPropertyDescriptor(window, 'scrollY');
  const py = Object.getOwnPropertyDescriptor(window, 'pageYOffset');
  const sink = {};
  let sinkOn = false;
  let anims = [];
  let activeKey = null;
  let activeFrames = null;
  let activeMax = 0;
  let activeScrollH = 0;
  let activeInnerH = 0;
  let job = null;
  let lastW = window.innerWidth;

  const badges = () => Array.from(document.querySelectorAll('#toolBridgeLayer .tool-bridge-badge'));

  const installSink = (list) => {
    list.forEach((b) => {
      if (Object.prototype.hasOwnProperty.call(b, 'style')) return;
      Object.defineProperty(b, 'style', {
        configurable: true,
        get: () => (sinkOn ? sink : styleGet.call(b)),
      });
    });
  };

  const scrollMax = () => {
    const root = document.scrollingElement || document.documentElement;
    return root.scrollHeight - window.innerHeight;
  };

  const geomKey = (list) => {
    const hero = document.getElementById('hero');
    const fun = document.getElementById('funnel');
    const inner = hero?.querySelector('.hx-inner');
    const title = hero?.querySelector('.hx-title');
    if (!hero || !fun || !inner || !title) return null;
    const hr = gbcr.call(inner);
    const tr = gbcr.call(title);
    const ct = document.querySelector('#aiAssistantWidget .ai-chat-toggle');
    const cr = ct ? gbcr.call(ct) : { left: 0, top: 0, width: 0 };
    return [VERSION, window.innerWidth, window.innerHeight, hero.offsetTop, fun.offsetTop, fun.offsetHeight,
      Math.round(hr.width), Math.round(hr.height), Math.round(tr.width), Math.round(tr.height),
      Math.round(cr.left), Math.round(cr.top), Math.round(cr.width),
      list.map((b) => `${b.offsetWidth}x${b.offsetHeight}`).join(',')].join('|');
  };

  const restoreScrollProps = () => {
    if (sy) Object.defineProperty(window, 'scrollY', sy); else delete window.scrollY;
    if (py) Object.defineProperty(window, 'pageYOffset', py); else delete window.pageYOffset;
  };

  // Ein Haeppchen virtueller Messpunkte. 'blocked': V34 hat noch einen
  // eigenen offenen Frame (ticking) — dann nichts tun und spaeter erneut.
  const sampleChunk = (j) => {
    const realY = window.scrollY;
    let cur = realY;
    const t0 = performance.now();
    const oRaf = window.requestAnimationFrame;
    const q = [];
    let result = 'more';
    let first = true;
    const flush = () => { const cbs = q.splice(0); for (const cb of cbs) cb(performance.now()); };
    const get = () => cur;
    Object.defineProperty(window, 'scrollY', { configurable: true, get });
    Object.defineProperty(window, 'pageYOffset', { configurable: true, get });
    Element.prototype.getBoundingClientRect = function shifted() {
      const r = gbcr.call(this);
      if (cur === realY || !this.closest || !this.closest('#hero,#funnel')) return r;
      return new DOMRect(r.x, r.y + (realY - cur), r.width, r.height);
    };
    window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
    try {
      for (;;) {
        const yy = Math.min(j.y, j.end);
        cur = yy;
        hook.schedule();
        if (first && !q.length) { result = 'blocked'; break; }
        first = false;
        flush();
        j.list.forEach((b, i) => {
          const st = styleGet.call(b);
          j.frames[i].push({ y: yy, transform: st.transform || 'none', opacity: st.opacity === '' ? '1' : st.opacity });
        });
        if (yy === j.end) { result = 'done'; break; }
        j.y += STEP;
        if (performance.now() - t0 > BUDGET_MS) break;
      }
    } finally {
      if (result !== 'blocked') { cur = realY; hook.schedule(); flush(); }
      window.requestAnimationFrame = oRaf;
      Element.prototype.getBoundingClientRect = gbcr;
      restoreScrollProps();
    }
    return result;
  };

  let savedInline = null;
  const layer = () => document.getElementById('toolBridgeLayer');

  const deactivate = () => {
    anims.forEach((a) => a.cancel());
    anims = [];
    sinkOn = false;
    if (savedInline) badges().forEach((b, i) => { styleGet.call(b).cssText = savedInline[i]; });
    savedInline = null;
    layer()?.classList.remove('is-native');
    reveal();
    activeKey = null;
    activeFrames = null;
    hook.schedule(); // V34 schreibt die Kreise sofort wieder selbst
  };

  // V34 einmal synchron an der echten Position rechnen lassen, damit der
  // Inline-Zustand aktuell ist. false: V34 hat noch einen eigenen offenen
  // Frame (dann im naechsten Frame erneut versuchen).
  const syncV34Now = () => {
    const oRaf = window.requestAnimationFrame;
    const q = [];
    window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
    try {
      hook.schedule();
      if (!q.length) return false;
      q.splice(0).forEach((cb) => cb(performance.now()));
      return true;
    } finally {
      window.requestAnimationFrame = oRaf;
    }
  };

  const toKeyframes = (frames, max) => frames.map((frameList) => {
    const f = frameList.map((k) => ({ offset: Math.min(1, k.y / max), transform: k.transform, opacity: k.opacity }));
    const last = f[f.length - 1];
    if (last.offset < 1) f.push({ offset: 1, transform: last.transform, opacity: last.opacity });
    return f;
  });

  // Keyframe-Offsets aus y/max; Bahnen (Werte) bleiben unveraendert.
  // Fix (Integration): Bevor die native Animation uebernimmt, steht im
  // Inline-Style der aktuelle V34-Zustand; danach ist das Inline-Fallback
  // unsichtbar (opacity 0). Rendert WebKit einen Frame ohne die Scroll-
  // Animation (erster Frame, Layer-Neuaufbau), erscheint so kein Kreis
  // oben links bzw. an einer veralteten Position.
  const activate = (list, frames, key, attempt = 0) => {
    if (!syncV34Now()) {
      if (attempt < MAX_BLOCKED_RETRIES) requestAnimationFrame(() => setTimeout(() => activate(list, frames, key, attempt + 1), 0));
      else reveal();
      return;
    }
    const max = scrollMax();
    const root = document.scrollingElement || document.documentElement;
    let next = [];
    try {
      const tl = new window.ScrollTimeline({ source: root, axis: 'block' });
      const kfs = toKeyframes(frames, max);
      next = list.map((b, i) => b.animate(kfs[i], { timeline: tl, fill: 'both', easing: 'linear' }));
    } catch {
      next.forEach((a) => a.cancel());
      deactivate();
      return;
    }
    anims.forEach((a) => a.cancel());
    anims = next;
    if (!savedInline) savedInline = list.map((b) => styleGet.call(b).cssText);
    sinkOn = true;
    list.forEach((b) => { styleGet.call(b).opacity = '0'; });
    layer()?.classList.add('is-native');
    reveal();
    activeKey = key;
    activeFrames = frames;
    activeMax = max;
    activeScrollH = root.scrollHeight;
    activeInnerH = window.innerHeight;
  };

  // Dokumenthoehe geaendert: dieselben Animationen behalten, nur die Offsets
  // neu abbilden (kein Neuaufbau, kein Frame ohne Animation).
  // Nur bei echter Inhaltsaenderung (scrollHeight), nicht bei der iOS-
  // Adressleiste: Viewport-Hoehe bleibt die der Aktivierung (wie in F).
  const remap = () => {
    if (!activeFrames || anims.length !== 14) return;
    const root = document.scrollingElement || document.documentElement;
    if (Math.abs(root.scrollHeight - activeScrollH) <= 1) return;
    activeScrollH = root.scrollHeight;
    const max = activeScrollH - activeInnerH;
    const kfs = toKeyframes(activeFrames, max);
    anims.forEach((a, i) => a.effect.setKeyframes(kfs[i]));
    activeMax = max;
  };

  let blockedRetries = 0;
  const step = () => {
    const j = job;
    if (!j) { layer()?.classList.remove('is-native-sampling'); return; }
    if (document.documentElement.classList.contains('services-experience-active')) { setTimeout(step, 250); return; }
    const res = sampleChunk(j);
    if (res === 'blocked') {
      if (++blockedRetries > MAX_BLOCKED_RETRIES) { job = null; layer()?.classList.remove('is-native-sampling'); reveal(); return; }
      requestAnimationFrame(() => setTimeout(step, 0));
      return;
    }
    if (res === 'done') {
      job = null;
      layer()?.classList.remove('is-native-sampling');
      const f0 = j.frames[0];
      const moved = f0.some((k) => k.transform !== f0[0].transform);
      if (!moved || f0[0].transform === 'none') { reveal(); return; } // Fallback: V34 bleibt aktiv
      activate(j.list, j.frames, j.key);
      try { localStorage.setItem(CACHE_PREFIX + j.key, JSON.stringify(j.frames)); } catch { /* Speicher voll/gesperrt */ }
      return;
    }
    setTimeout(step, 0);
  };

  const startBuild = () => {
    const list = badges();
    if (list.length !== 14) { reveal(); return; }
    installSink(list);
    const key = geomKey(list);
    if (!key || key === activeKey || (job && job.key === key)) return;
    let cached = null;
    try {
      const c = localStorage.getItem(CACHE_PREFIX + key);
      if (c) cached = JSON.parse(c);
    } catch { cached = null; }
    if (Array.isArray(cached) && cached.length === 14) { activate(list, cached, key); return; }
    sinkOn = false; // waehrend der Neuberechnung schreibt V34 wieder echt
    if (savedInline) { list.forEach((b, i) => { styleGet.call(b).cssText = savedInline[i]; }); savedInline = null; }
    const fun = document.getElementById('funnel');
    job = {
      list, key, y: 0,
      end: Math.min(scrollMax(), fun.offsetTop + fun.offsetHeight + window.innerHeight),
      frames: list.map(() => []),
    };
    blockedRetries = 0;
    layer()?.classList.add('is-native-sampling');
    setTimeout(step, 0);
  };

  // Mit geladenen Webfonts stimmt die V34-Geometrie: aktuellen V34-Zustand
  // sicher schreiben, Ebene zeigen (V34 und spaeter die native Animation
  // liefern dieselben Werte) und erst dann die Keyframes berechnen.
  const whenFontsReady = () => {
    const showV34 = (attempt = 0) => {
      if (sinkOn) return; // Cache-Pfad: bereits nativ aktiv
      if (syncV34Now() || attempt >= MAX_BLOCKED_RETRIES) { reveal(); return; }
      requestAnimationFrame(() => setTimeout(() => showV34(attempt + 1), 0));
    };
    startBuild();
    showV34();
  };
  if (!document.fonts || document.fonts.status === 'loaded') whenFontsReady();
  else document.fonts.ready.then(whenFontsReady);

  // Spaete Geometrie (Fonts, load): nur bei Abweichung neu rechnen.
  const loaded = new Promise((r) => {
    if (document.readyState === 'complete') r();
    else window.addEventListener('load', r, { once: true });
  });
  const fonts = document.fonts?.ready ?? Promise.resolve();
  Promise.all([loaded, fonts]).then(startBuild);

  // Dokumenthoehe aendert sich (spaete Sections, Refresh): nur die Offsets neu
  // abbilden — keine Neuberechnung. Reine Hoehenwechsel der iOS-Leiste
  // aendern die Body-Hoehe nicht.
  if (window.ResizeObserver) {
    new ResizeObserver(() => { if (!job) remap(); }).observe(document.body);
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    startBuild();
  }, { passive: true });
}
