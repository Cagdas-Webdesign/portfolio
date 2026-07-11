/* legacy inline script #17 id="v67-counter-guard" */

(function(){
  if(window.__v67CounterGuard) return;
  window.__v67CounterGuard = true;

  var section = document.getElementById('stats');
  if(!section) return;

  var running = false;
  var lastRun = 0;
  var cooldown = 950;

  function animateOne(el){
    var parent = el.parentElement;
    var target = parseInt(parent.getAttribute('data-target') || '0', 10);
    var suffix = parent.getAttribute('data-suffix') || '';
    var state = { v: 0 };
    el.textContent = '0' + suffix;
    if(window.gsap){
      gsap.killTweensOf(state);
      gsap.to(state, {
        v: target,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: function(){ el.textContent = Math.round(state.v) + suffix; },
        onComplete: function(){ el.textContent = target + suffix; }
      });
    } else {
      var start = null, dur = 1100;
      function frame(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start)/dur, 1);
        var eased = 1 - Math.pow(1-p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if(p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }

  function runCounters(force){
    var now = Date.now();
    if(running) return;
    if(!force && now - lastRun < cooldown) return;
    lastRun = now;
    running = true;
    document.querySelectorAll('#stats .countup').forEach(animateOne);
    setTimeout(function(){ running = false; }, 1200);
  }

  section.addEventListener('mouseenter', function(){ runCounters(false); });
  section.addEventListener('touchstart', function(){ runCounters(false); }, {passive:true});

  if(window.ScrollTrigger && window.gsap){
    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: function(){ runCounters(true); }
    });
  } else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) runCounters(true);
      });
    }, { threshold: .35 });
    io.observe(section);
  }
})();
