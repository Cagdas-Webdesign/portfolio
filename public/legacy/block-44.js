/* legacy inline script #44 id="v62-real-crown-remove-runtime" */

(function(){
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
