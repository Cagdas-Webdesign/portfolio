/* legacy inline script #13 id="v48-mobile-scrolltrigger-start-refresh" */

(function(){
  if(window.__mobileScrollTriggerStartRefreshV48) return;
  window.__mobileScrollTriggerStartRefreshV48 = true;

  function isMobile(){
    return window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  }

  function refreshMobileGsap(){
    if(!isMobile()) return;

    /* Nichts hart überschreiben – nur Layout/ScrollTrigger neu berechnen */
    if(window.ScrollTrigger){
      try{
        ScrollTrigger.sort();
        ScrollTrigger.refresh(true);
        ScrollTrigger.update();
      }catch{}
    }

    /* Performance (2026-10-14): Hier stand ein kuenstliches
       window.dispatchEvent(new Event('resize')). Zusammen mit dem
       resize-Listener unten ergab das eine Endlosschleife (jeder Aufruf
       loest den naechsten aus): gemessen ~136 resize-Events/s im Leerlauf,
       nur auf Handybreite (<=900px) — jede Runde mit Refresh und allen
       resize-Handlern der Seite. Entfernt. */

    try{
      document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    }catch{}
  }

  /* Performance (2026-10-15): Frueher 7 Refreshes pro Anlass (sofort, rAF,
     80/220/520/950/1500 ms) — bei Start, load und fonts.ready also bis zu 21
     komplette ScrollTrigger.refresh(true) in den ersten Sekunden, genau
     waehrend man durch Hero und Funnel scrollt (gemessen: 11 Refreshes in
     ~3 s, je 45-645 ms Haupt-Thread im Mac-Emulator). Jetzt ein einziger,
     entprellter Refresh 1500 ms nach dem letzten Anlass — derselbe Zeitpunkt
     wie der bisherige letzte Refresh, also derselbe Endzustand. */
  let refreshTimer = 0;
  function scheduleRefreshes(){
    if(!isMobile()) return false;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshMobileGsap, 1500);
    return true;
  }
  /* Der Legacy-Loader legt seinen spaeten Refresh hier hinein (ein Timer
     statt zwei Refreshes kurz hintereinander, 2026-10-15). */
  window.__scheduleMobileStRefresh = scheduleRefreshes;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', scheduleRefreshes, {once:true});
  }else{
    scheduleRefreshes();
  }

  window.addEventListener('load', scheduleRefreshes, {once:true});
  window.addEventListener('orientationchange', ()=>setTimeout(scheduleRefreshes, 220), {passive:true});
  /* Kein Refresh mehr auf jedes resize: iOS Safari meldet resize beim
     Ein-/Ausblenden der Adressleiste WAEHREND des Scrollens. Ein
     ScrollTrigger.refresh(true) mitten im Scrollen erzeugt Ruckler und
     Spruenge; echte Groessenwechsel behandelt ScrollTrigger selbst
     (ignoreMobileResize), Drehen deckt orientationchange oben ab. */

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(scheduleRefreshes).catch(()=>{});
  }
})();
