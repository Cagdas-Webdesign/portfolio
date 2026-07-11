/* legacy inline script #10 id="anon" */

(function(){
  function bootPerformancePolish(){
    var section = document.getElementById('social-lottie');
    if(!section || !window.ScrollTrigger || window.__performancePolishV135) return;
    window.__performancePolishV135 = true;

    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: function(){ section.classList.add('pu-active'); },
      onEnterBack: function(){ section.classList.add('pu-active'); },
      onLeave: function(){ section.classList.remove('pu-active'); },
      onLeaveBack: function(){ section.classList.remove('pu-active'); }
    });

    var refreshTimer;
    window.addEventListener('orientationchange', function(){
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function(){
        if(window.ScrollTrigger) ScrollTrigger.refresh();
      }, 260);
    }, {passive:true});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(bootPerformancePolish, 120);
    });
  } else {
    setTimeout(bootPerformancePolish, 120);
  }
})();
