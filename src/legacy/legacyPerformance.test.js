import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

// Regressionstests fuer die Mobile-Performance-Fixes (2026-10-14) in den
// Legacy-Skripten. Statische Pruefung: die Skripte laufen nur im Browser.
const read = (name) => readFileSync(new URL(`../../public/legacy/${name}`, import.meta.url), 'utf8');
// Kommentare entfernen, damit erklaerende Texte nicht als Code zaehlen
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('block-13 (mobile ScrollTrigger refresh)', () => {
  const src = code(read('block-13.js'));

  it('loest kein kuenstliches resize-Event aus (Endlosschleife)', () => {
    assert.doesNotMatch(src, /dispatchEvent\(\s*new Event\(\s*['"]resize['"]/);
  });

  it('refresht ScrollTrigger nicht bei jedem resize (iOS-Adressleiste beim Scrollen)', () => {
    assert.doesNotMatch(src, /addEventListener\(\s*['"]resize['"]/);
  });

  it('plant nur einen entprellten Refresh statt einer Refresh-Salve', () => {
    const calls = src.match(/setTimeout\(\s*refreshMobileGsap/g) || [];
    assert.equal(calls.length, 1);
    assert.match(src, /clearTimeout\(refreshTimer\)/);
  });
});

describe('Plattform-Bloecke (Sektion existiert nicht mehr)', () => {
  for (const name of ['block-08.js', 'block-09.js', 'block-35.js', 'block-40.js', 'block-42.js', 'block-43.js', 'block-44.js']) {
    it(`${name} bricht ohne Plattform-Markup sofort ab`, () => {
      const src = code(read(name));
      const head = src.slice(src.indexOf('(function(){'), src.indexOf('(function(){') + 200);
      assert.match(head, /if\(!document\.getElementById\('social-lottie'\) && !document\.getElementById\('platform-row-prelude'\)\) return;/);
    });
  }
});

describe('block-41 (Textbereinigung)', () => {
  const src = code(read('block-41.js'));

  it('refresht nur, wenn die Bereinigung tatsaechlich Text geaendert hat', () => {
    assert.match(src, /if\(cleanVisibleText\(\)\) refreshTriggers\(\);/);
  });

  it('reagiert auf resize nur bei Breitenaenderung (nicht auf die iOS-Adressleiste)', () => {
    assert.match(src, /lastWidth/);
  });
});

describe('block-00 (Tech-Icon-Bruecke)', () => {
  const src = code(read('block-00.js'));

  it('beendet die alten #hero/#funnel-Controller vor V34', () => {
    const cleanup = src.indexOf("id === 'hero' || id === 'funnel'");
    const v34 = src.indexOf('const bridge=makeBridge()');
    assert.ok(cleanup > 0, 'Aufraeumen der alten Trigger fehlt');
    assert.ok(cleanup < v34, 'Aufraeumen muss vor V34 laufen');
  });

  it('laesst React-Trigger unangetastet (Bestandsaufnahme am Blockanfang)', () => {
    assert.match(src, /window\.__legacyStBefore\s*=/);
  });

  it('pausiert die Canvas-Schleife, solange das Canvas nicht gerendert wird', () => {
    assert.match(src, /if\(!canvas\.offsetParent\)\{ paused=true; return; \}/);
  });

  it('V34 liest Hero-/Funnel-Masse nicht mehr in jedem Frame (gecacht)', () => {
    const update = src.slice(src.lastIndexOf('function update(){'), src.lastIndexOf('let ticking=false'));
    assert.doesNotMatch(update, /\.offset(Top|Height)\b/);
    assert.match(update, /const funnelStart=geo\.funnelStart;/);
  });

  it('V34 ueberspringt Frames unterhalb des Funnels und misst die Hero-Plaetze nur bei travel<1', () => {
    assert.match(src, /if\(atEnd && finalApplied\) return;/);
    assert.match(src, /\(w<COMPACT_MAX && travel<1\) \? compactHeroSlots\(w,h\)/);
  });
});

describe('base.css (unsichtbare Markup-Quellen der Bruecke)', () => {
  const css = readFileSync(new URL('../styles/base.css', import.meta.url), 'utf8');

  it('haelt in #heroToolLayer/#funnelBadgeLayer keine Animationen, will-change oder Backdrop-Blur aktiv', () => {
    const rule = css.match(/#heroToolLayer \*,[\s\S]*?\{([\s\S]*?)\}/);
    assert.ok(rule, 'Regel fehlt');
    for (const decl of ['animation:none !important', 'will-change:auto !important', 'backdrop-filter:none !important']) {
      assert.ok(rule[1].includes(decl), decl);
    }
  });
});

describe('Startup-Refreshes (2026-10-15, Runde 4)', () => {
  const loader = code(readFileSync(new URL('./loadLegacyScripts.js', import.meta.url), 'utf8'));

  it('Loader refresht bei bereits geladenen Fonts nicht doppelt', () => {
    assert.match(loader, /if \(fontsPending\) document\.fonts\.ready\.then\(refresh\);/);
  });

  it('Loader legt den spaeten Refresh mobil in den entprellten Timer von block-13', () => {
    assert.match(loader, /window\.__scheduleMobileStRefresh\(\)\) return;/);
    assert.match(code(read('block-13.js')), /window\.__scheduleMobileStRefresh = scheduleRefreshes;/);
  });

  it('block-41 plant nur noch einen Refresh pro Textaenderung', () => {
    const src = code(read('block-41.js'));
    const fn = src.slice(src.indexOf('function refreshTriggers'), src.indexOf('function cleanVisibleText'));
    assert.equal((fn.match(/ScrollTrigger\.refresh\(\)/g) || []).length, 1);
  });
});

describe('Service-Pop-ups und Baumvideo (2026-10-15)', () => {
  const src = (p) => code(readFileSync(new URL(p, import.meta.url), 'utf8'));

  it('Einfahrt laeuft als WAAPI-Animation (Compositor), nicht per Framer-y', () => {
    const exp = src('../components/ServiceExperience.jsx');
    assert.match(exp, /experience\.animate\(\s*\[\{ transform: 'translateY\(102%\)' \}, \{ transform: 'translateY\(0%\)' \}\]/);
    assert.match(exp, /duration: 700, easing: 'cubic-bezier\(0\.22, 1, 0\.36, 1\)'/);
    assert.match(exp, /y: reducedMotion \? '102%' : 0/);
  });

  it('Fallback-Timer der Ausfahrt startet erst mit der laufenden Animation', () => {
    const offers = src('../components/NestedOffers.jsx');
    assert.match(offers, /fade\.ready\.then\(\(\) => window\.setTimeout\(done, duration \+ 250\), done\)/);
  });

  it('Baumvideo startet nach blockiertem Autoplay beim naechsten Antippen', () => {
    const story = src('../components/FinalButterflyStory.jsx');
    // Jeder Fehlschlag (nicht nur NotAllowedError) haelt den Nachholversuch scharf.
    assert.match(story, /\(\) => \{\s*playPending = false;\s*if \(wantsPlay\) armRetry\(\);\s*\}/);
    const css = readFileSync(new URL('../styles/final-butterfly-story.css', import.meta.url), 'utf8');
    assert.match(css, /video::-webkit-media-controls-start-playback-button/);
  });
});

describe('iOS-Adressleiste: stabile Viewport-Hoehe nur auf Touch (2026-10-15, Runde 5)', () => {
  it('V34 rechnet mit viewportHeight() statt live innerHeight, nur auf Touch-Geraeten stabil', () => {
    const src = code(read('block-00.js'));
    const update = src.slice(src.lastIndexOf('function update(){'), src.lastIndexOf('let ticking=false'));
    assert.match(update, /const h=viewportHeight\(\);/);
    assert.doesNotMatch(update, /const h=window\.innerHeight/);
    assert.match(src, /\(hover: none\) and \(pointer: coarse\)/);
    assert.match(src, /if\(!touchViewport \|\| w!==stableW\)\{ stableW=w; stableH=window\.innerHeight; \}/);
  });

  it('Chat-Hindernis im Hero wird in die stabile Hoehe umgerechnet', () => {
    assert.match(code(read('block-00.js')), /const dh=h-window\.innerHeight;/);
  });

  it('Eigene Systemlogik: Fokuslinie haengt nicht an der live Fensterhoehe', () => {
    const rag = code(readFileSync(new URL('../components/ai-experience/RagTechStack.jsx', import.meta.url), 'utf8'));
    assert.match(rag, /window\.scrollY \+ viewportHeight\(\) \* FOCUS_LINE/);
    assert.doesNotMatch(rag, /window\.innerHeight \* FOCUS_LINE/);
  });
});

describe('Service-Pop-up: Entsperren erst nach der Ausfahrt (nur mobil)', () => {
  const offers = code(readFileSync(new URL('../components/NestedOffers.jsx', import.meta.url), 'utf8'));

  it('stellt das Entsperren mobil bis zum Ende der Ausfahrt zurueck', () => {
    assert.match(offers, /deferUnlockRef\.current = isMobileExperience && !reducedMotion;/);
    assert.match(offers, /pendingUnlockRef\.current = unlock;/);
  });

  it('holt eine zurueckgestellte Entsperrung vor erneutem Sperren und am Ende der Ausfahrt nach', () => {
    const lock = offers.slice(offers.indexOf('if (selectedIndex === null) return undefined;'));
    assert.ok(lock.indexOf('flushPendingUnlock();') < lock.indexOf('const scrollY = window.scrollY;'));
    assert.match(offers, /if \(snapshotRef\.current !== snapshot\) return;\s*flushPendingUnlock\(\);\s*removeSnapshot\(\);/);
  });
});

describe('Native ScrollTimeline fuer die 14 Kreise (Final Freeze F, nur Touch)', () => {
  const adapter = code(readFileSync(new URL('./funnelNativeTimeline.js', import.meta.url), 'utf8'));
  const loader = code(readFileSync(new URL('./loadLegacyScripts.js', import.meta.url), 'utf8'));

  it('greift nur auf Touch-Geraeten mit ScrollTimeline ein (Desktop unveraendert)', () => {
    assert.match(adapter, /typeof window\.ScrollTimeline !== 'function'\) \{ reveal\(\); return; \}/);
    assert.match(adapter, /\(hover: none\) and \(pointer: coarse\)'\)\.matches\) \{ reveal\(\); return; \}/);
  });

  it('startet direkt nach block-00 und berechnet ohne scrollTo/scroll-Events', () => {
    assert.match(loader, /if \(i === 0\) \{\s*try \{\s*startFunnelNativeTimeline\(\);/);
    assert.doesNotMatch(adapter, /scrollTo\(/);
    assert.doesNotMatch(adapter, /dispatchEvent\(/);
    assert.match(code(read('block-00.js')), /window\.__v34FunnelHook=\{schedule:scheduleUpdate, badges:badges\};/);
  });

  it('Beschriftungs-Zentrierung nur fuer Touch', () => {
    const css = readFileSync(new URL('../styles/base.css', import.meta.url), 'utf8');
    assert.match(css, /@media \(hover: none\) and \(pointer: coarse\) \{\s*\.tool-bridge-layer \.tool-bridge-name\{margin-left:auto !important;margin-right:auto !important;text-align:center !important;\}/);
  });
});

describe('First Paint der Kreis-Ebene (nur Touch mit Scroll-Timeline)', () => {
  it('Ebene ist per CSS ab dem ersten Frame verborgen, bis is-native-ready gesetzt ist', () => {
    const css = readFileSync(new URL('../styles/base.css', import.meta.url), 'utf8');
    assert.match(css, /@media \(hover: none\) and \(pointer: coarse\) \{\s*@supports \(animation-timeline: scroll\(\)\) \{\s*\.tool-bridge-layer:not\(\.is-native-ready\)\{opacity:0 !important;\}/);
  });
});

describe('Baum-Layout (nur Mobil, 2026-10-16)', () => {
  const css = readFileSync(new URL('../styles/final-butterfly-story.css', import.meta.url), 'utf8');

  it('Mobil: Baum nur auf kurzen Viewports abgesenkt, sonst unveraendert 20svh', () => {
    assert.match(css, /bottom: min\(20svh, max\(-20svh, calc\(83\.5svh - 125px - 103\.5vw\)\)\);/);
  });
});

describe('Baumvideo: eine Wiedergabesteuerung ohne konkurrierende Aufrufe (2026-10-16)', () => {
  const story = code(readFileSync(new URL('../components/FinalButterflyStory.jsx', import.meta.url), 'utf8'));

  it('Touch: play()-Start beim Setup, stumm und inline', () => {
    assert.match(story, /if \(isTouchDevice\) \{[\s\S]*?video\.setAttribute\('muted', ''\);\s*video\.setAttribute\('playsinline', ''\);[\s\S]*?playVideo\(\);/);
  });

  it('Nachholen nur ueber echte Nutzeraktivierung (click/keydown), nicht das touchend einer Wischgeste', () => {
    assert.match(story, /const RETRY_EVENTS = \['click', 'keydown'\];/);
    assert.doesNotMatch(story, /'touchend'/);
  });

  it('nur ein play() gleichzeitig; pause() waehrend des Starts wird danach angewendet', () => {
    assert.match(story, /if \(!video\.paused \|\| playPending\) return;/);
    assert.match(story, /if \(!wantsPlay\) syncVideo\(\);/);
  });

  it('Touch: System-Pause, Datenankunft, Tab-Rueckkehr und bfcache gleichen erneut ab (gedrosselt)', () => {
    assert.match(story, /\['pause', 'canplay'\]\.forEach\(\(type\) => listen\(video, type, resumeIfWanted\)\);/);
    assert.match(story, /listen\(document, 'visibilitychange', resumeIfWanted\);/);
    assert.match(story, /listen\(window, 'pageshow', resumeIfWanted\);/);
    assert.match(story, /now - lastAutoRetry < 1000/);
    assert.match(story, /mediaCleanups\.forEach\(\(fn\) => fn\(\)\);/);
  });
});

describe('Eigene Systemlogik: Trace-Wechsel ohne Mal-Uebergaenge auf Touch (2026-10-16)', () => {
  const css = readFileSync(new URL('../styles/ai-experience.css', import.meta.url), 'utf8');

  it('Touch blendet nur noch Deckkraft; Desktop-Uebergaenge unveraendert', () => {
    const block = css.match(/@media \(hover: none\) and \(pointer: coarse\) \{\s*\.rx-arch > \*,[\s\S]*?\n\}/);
    assert.ok(block, 'Touch-Block fuer .rx-arch fehlt');
    assert.match(block[0], /transition-property: opacity;/);
    assert.match(block[0], /\.rx-arch__logo,[\s\S]*?transition: none;/);
    assert.match(css, /\.rx-arch > \*,\n\.rx-arch__core-row > \*,\n\.rx-arch__stack > \* \{\n  transition: opacity 400ms ease, filter 400ms ease, border-color 400ms ease, box-shadow 400ms ease;/);
  });
});

describe('Baum auf dem iPhone als Standbild (2026-10-16)', () => {
  const story = code(readFileSync(new URL('../components/FinalButterflyStory.jsx', import.meta.url), 'utf8'));
  const css = readFileSync(new URL('../styles/final-butterfly-story.css', import.meta.url), 'utf8');
  const asset = (name) => new URL(`../../public/assets/final-butterfly/${name}`, import.meta.url);

  it('nur iPhones rendern statt <video> ein Standbild (kein verstecktes Video)', () => {
    assert.match(story, /const IS_IPHONE = typeof navigator !== 'undefined' && \/iPhone\|iPod\/\.test\(navigator\.userAgent\);/);
    assert.match(story, /\{IS_IPHONE \? \(\s*<picture>[\s\S]*?cicada_tree_still\.avif[\s\S]*?cicada_tree_still\.png[\s\S]*?<\/picture>\s*\) : \(\s*<video/);
  });

  it('Standbild hat dieselbe Leinwand wie das Video (keine Layoutverschiebung)', () => {
    const img = story.match(/<img[\s\S]*?\/>/)[0];
    assert.match(img, /width="3840"/);
    assert.match(img, /height="2160"/);
    assert.match(css, /\.banner-tree picture,\n\.final-butterfly-story \.banner-tree img,\n\.final-butterfly-story \.banner-tree video \{\n  display: block;\n  width: 100%;\n  height: auto;/);
    assert.ok(readFileSync(asset('cicada_tree_still.avif')).length > 0);
    assert.ok(readFileSync(asset('cicada_tree_still.png')).length > 0);
  });

  it('Desktop-Video unveraendert: beide Quellen und Wiedergabeattribute', () => {
    assert.match(story, /<video\s*ref=\{videoRef\}\s*autoPlay\s*muted\s*loop\s*playsInline\s*preload="auto"\s*width="3840"\s*height="2160"\s*>/);
    assert.match(story, /cicada_tree\.mov`\} type=\{'video\/mp4; codecs="hvc1"'\}/);
    assert.match(story, /cicada_tree\.webm`\} type="video\/webm"/);
  });
});
