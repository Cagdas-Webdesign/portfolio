/* legacy inline script #44 id="v62-real-crown-remove-runtime" */

(function(){
  if(window.__v62RealCrownRemove) return;
  window.__v62RealCrownRemove = true;

  function cleanHeroCrown(){
    var hero = document.getElementById('heroType');
    if(!hero) return;

    hero.querySelectorAll('.hero-w-crown').forEach(function(el){
      if(window.gsap){ window.gsap.killTweensOf(el); window.gsap.killTweensOf(el.querySelectorAll('*')); }
      el.remove();
    });

    hero.querySelectorAll('svg').forEach(function(svg){
      var txt = (svg.outerHTML || '').toLowerCase();
      if(txt.indexOf('#ffd700') !== -1 && txt.indexOf('m 10,25') !== -1){
        if(window.gsap) window.gsap.killTweensOf(svg);
        svg.remove();
      }
    });

    var w = hero.querySelector('.hero-w-text');
    if(w){
      if(window.gsap) window.gsap.killTweensOf(w);
      w.style.visibility = 'visible';
      w.style.opacity = '1';
      w.style.transform = 'none';
      w.style.display = 'inline-block';
    }

    hero.querySelectorAll('.hero-premium-dot').forEach(function(dot){
      dot.style.display = 'block';
      dot.style.visibility = 'visible';
      dot.style.opacity = '1';
      dot.style.borderRadius = '999px';
    });
  }

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

  cleanHeroCrown();
  stabilizePlatformHub();

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ cleanHeroCrown(); stabilizePlatformHub(); }, {once:true});
  }
  window.addEventListener('load', function(){
    cleanHeroCrown(); stabilizePlatformHub();
    setTimeout(cleanHeroCrown, 80);
    setTimeout(cleanHeroCrown, 350);
    setTimeout(stabilizePlatformHub, 350);
  }, {once:true});
})();
