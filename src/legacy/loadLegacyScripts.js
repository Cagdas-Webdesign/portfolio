// Loads the original inline <script> blocks (extracted to /public/legacy/) as
// classic scripts in document order, after React has mounted the markup.
// Classic scripts share global scope, matching the original page's semantics.
import manifest from '../legacy-manifest.json';

function installReadyShim() {
  // The original scripts registered DOMContentLoaded / load listeners while the
  // document was still parsing. Here they run after those events already fired,
  // so replay them immediately for late listeners.
  const origDocAdd = document.addEventListener.bind(document);
  document.addEventListener = (type, cb, opts) => {
    if (type === 'DOMContentLoaded' && document.readyState !== 'loading') {
      queueMicrotask(() => cb.call(document, new Event('DOMContentLoaded')));
      return;
    }
    return origDocAdd(type, cb, opts);
  };
  const origWinAdd = window.addEventListener.bind(window);
  window.addEventListener = (type, cb, opts) => {
    if (type === 'load' && document.readyState === 'complete') {
      queueMicrotask(() => cb.call(window, new Event('load')));
      return;
    }
    return origWinAdd(type, cb, opts);
  };
}

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => {
      console.error(`[legacy] failed to load ${src}`);
      resolve();
    };
    document.body.appendChild(s);
  });
}

let started = false;
export async function loadLegacyScripts() {
  if (started) return;
  started = true;
  installReadyShim();
  for (let i = 0; i < manifest.count; i++) {
    await loadScript(`/legacy/block-${String(i).padStart(2, '0')}.js`);
  }
  // The original page ran ScrollTrigger setups during initial parse and got
  // ScrollTrigger's automatic window-load refresh. Here the scripts load after
  // that event, so refresh explicitly — again once fonts and late media have
  // settled, since they shift section offsets.
  const refresh = () => window.ScrollTrigger?.refresh();
  refresh();
  document.fonts?.ready.then(refresh);
  setTimeout(refresh, 1500);
}
