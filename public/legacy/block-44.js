/* legacy inline script #44 id="v62-real-crown-remove-runtime" */

(function(){
  /* Performance (2026-10-15): Gehoert zur entfernten Plattform-Section
     (#social-lottie / #platform-row-prelude). Ohne sie loeste dieser Block nur
     noch komplette ScrollTrigger-Refreshes aus — beim Laden und bei jedem
     resize (iOS: Adressleiste beim Scrollen). */
  if(!document.getElementById('social-lottie') && !document.getElementById('platform-row-prelude')) return;
  if(window.__v62RealCrownRemove) return;
  window.__v62RealCrownRemove = true;

  function stabilizePlatformHub(){
    var section = document.getElementById('social-lottie');
    if(!section) return;
    var hub = section.querySelector('.pu-connect');
    var label = section.querySelector('.pu-connect strong');
    if(label) label.textContent = 'dein Unternehmen';
    if(hub){
      hub.style.transformOrigin = '50% 50%';
    }
    if(window.ScrollTrigger){
      clearTimeout(window.__v62RefreshA);
      clearTimeout(window.__v62RefreshB);
      window.__v62RefreshA = setTimeout(function(){ window.ScrollTrigger.refresh(); }, 120);
      window.__v62RefreshB = setTimeout(function(){ window.ScrollTrigger.refresh(); }, 620);
    }
  }

  stabilizePlatformHub();

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', stabilizePlatformHub, {once:true});
  }
  window.addEventListener('load', function(){
    stabilizePlatformHub();
    setTimeout(stabilizePlatformHub, 350);
  }, {once:true});
})();
