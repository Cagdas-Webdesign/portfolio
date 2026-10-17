/* legacy inline script #40 id="v55-platform-flow-refresh" */

(function(){
  /* Performance (2026-10-15): Gehoert zur entfernten Plattform-Section
     (#social-lottie / #platform-row-prelude). Ohne sie loeste dieser Block nur
     noch komplette ScrollTrigger-Refreshes aus — beim Laden und bei jedem
     resize (iOS: Adressleiste beim Scrollen). */
  if(!document.getElementById('social-lottie') && !document.getElementById('platform-row-prelude')) return;
  function v55Refresh(){
    if(!window.ScrollTrigger) return;
    clearTimeout(window.__v55RefreshA);
    clearTimeout(window.__v55RefreshB);
    window.__v55RefreshA = setTimeout(function(){ ScrollTrigger.refresh(); }, 80);
    window.__v55RefreshB = setTimeout(function(){ ScrollTrigger.refresh(); }, 420);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', v55Refresh, {once:true});
  } else {
    v55Refresh();
  }
  window.addEventListener('load', v55Refresh, {once:true});
  window.addEventListener('resize', function(){
    clearTimeout(window.__v55Resize);
    window.__v55Resize = setTimeout(v55Refresh, 180);
  }, {passive:true});
  window.addEventListener('orientationchange', function(){
    setTimeout(v55Refresh, 240);
  }, {passive:true});
})();
