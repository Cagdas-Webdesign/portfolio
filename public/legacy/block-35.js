/* legacy inline script #35 id="v54-platform-flow-polish" */

(function(){
  function applyPlatformFlowPolish(){
    var section = document.getElementById('social-lottie');
    if(!section) return;

    var connectLabel = section.querySelector('.pu-connect strong');
    if(connectLabel) connectLabel.textContent = 'dein Unternehmen';

    section.querySelectorAll('.pcard-txt span').forEach(function(el){
      el.textContent = '';
      el.setAttribute('aria-hidden','true');
    });

    if(window.ScrollTrigger){
      clearTimeout(window.__v54PlatformRefresh1);
      clearTimeout(window.__v54PlatformRefresh2);
      window.__v54PlatformRefresh1 = setTimeout(function(){ ScrollTrigger.refresh(); }, 120);
      window.__v54PlatformRefresh2 = setTimeout(function(){ ScrollTrigger.refresh(); }, 620);
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyPlatformFlowPolish);
  } else {
    applyPlatformFlowPolish();
  }
  window.addEventListener('load', function(){
    if(window.ScrollTrigger){
      setTimeout(function(){ ScrollTrigger.refresh(); }, 220);
    }
  }, {once:true});
  window.addEventListener('orientationchange', function(){
    if(window.ScrollTrigger){
      setTimeout(function(){ ScrollTrigger.refresh(); }, 260);
    }
  }, {passive:true});
})();
