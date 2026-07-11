/* legacy inline script #15 id="v65-output-counter-animation" */

(function(){
  if(window.__v65OutputCounters) return;
  window.__v65OutputCounters = true;

  function runCounters(scope){
    var counters = Array.prototype.slice.call((scope || document).querySelectorAll('.stat-count'));
    if(!counters.length) return;

    counters.forEach(function(el){
      if(el.dataset.done === '1') return;
      el.dataset.done = '1';

      var target = parseInt(el.dataset.target || '0', 10);
      var suffix = el.dataset.suffix || '';
      var obj = {v:0};

      if(window.gsap){
        gsap.to(obj, {
          v: target,
          duration: 1.35,
          ease: 'power3.out',
          onUpdate: function(){
            el.textContent = Math.round(obj.v) + suffix;
          },
          onComplete: function(){
            el.textContent = target + suffix;
          }
        });
      } else {
        el.textContent = target + suffix;
      }
    });
  }

  function init(){
    var outputArea = document.querySelector('.code-title');
    if(!outputArea){
      runCounters(document);
      return;
    }

    var parent = outputArea.closest('section') || outputArea.parentElement || document;

    if(window.ScrollTrigger && window.gsap){
      ScrollTrigger.create({
        trigger: parent,
        start: 'top 72%',
        once: true,
        onEnter: function(){ runCounters(parent); }
      });
    } else if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            runCounters(parent);
            io.disconnect();
          }
        });
      }, {threshold:.25});
      io.observe(parent);
    } else {
      runCounters(parent);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
