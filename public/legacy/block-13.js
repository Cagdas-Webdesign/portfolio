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
      }catch(e){}
    }

    /* Browser/Live-Server-Mobile-Preview braucht manchmal ein Layout-Signal */
    try{
      window.dispatchEvent(new Event('resize'));
    }catch(e){}

    try{
      document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    }catch(e){}
  }

  function scheduleRefreshes(){
    if(!isMobile()) return;
    refreshMobileGsap();
    requestAnimationFrame(refreshMobileGsap);
    setTimeout(refreshMobileGsap, 80);
    setTimeout(refreshMobileGsap, 220);
    setTimeout(refreshMobileGsap, 520);
    setTimeout(refreshMobileGsap, 950);
    setTimeout(refreshMobileGsap, 1500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', scheduleRefreshes, {once:true});
  }else{
    scheduleRefreshes();
  }

  window.addEventListener('load', scheduleRefreshes, {once:true});
  window.addEventListener('orientationchange', ()=>setTimeout(scheduleRefreshes, 220), {passive:true});
  window.addEventListener('resize', ()=>setTimeout(refreshMobileGsap, 120), {passive:true});

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(scheduleRefreshes).catch(()=>{});
  }
})();
