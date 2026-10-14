/* legacy inline script #16 id="v66-stats-and-badges" */

(function(){
  if(window.__v66Polish) return;
  window.__v66Polish = true;

  function animateCounter(el){
    var target = parseInt(el.parentElement.getAttribute('data-target') || '0', 10);
    var suffix = el.parentElement.getAttribute('data-suffix') || '';
    var state = {v:0};
    el.textContent = '0' + suffix;
    if(window.gsap){
      gsap.killTweensOf(state);
      gsap.to(state, {
        v: target,
        duration: 1.15,
        ease: 'power2.out',
        onUpdate: function(){ el.textContent = Math.round(state.v) + suffix; },
        onComplete: function(){ el.textContent = target + suffix; }
      });
    } else {
      var startTs = null, dur = 1150;
      function frame(ts){
        if(!startTs) startTs = ts;
        var p = Math.min((ts - startTs)/dur, 1);
        var val = Math.round(target * (1 - Math.pow(1-p, 3)));
        el.textContent = val + suffix;
        if(p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }

  function runStats(){
    var stats = document.querySelectorAll('#stats .countup');
    stats.forEach(function(el){ animateCounter(el); });
  }

  function setupStats(){
    var sec = document.getElementById('stats');
    if(!sec) return;
    sec.addEventListener('mouseenter', runStats);
    sec.addEventListener('touchstart', runStats, {passive:true});
    if(window.ScrollTrigger && window.gsap){
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 78%',
        onEnter: runStats,
        onEnterBack: runStats
      });
    } else if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ if(entry.isIntersecting) runStats(); });
      }, {threshold:.32});
      io.observe(sec);
    } else {
      runStats();
    }
  }

  function setupBadgeIcons(){
    document.querySelectorAll('#experience .fb-flow-badge').forEach(function(badge){
      if(badge.querySelector('.fb-badge-icon')) return;
      var text = badge.textContent || '';
      var icon = document.createElement('span');
      icon.className = 'fb-badge-icon';
      if(/lead/i.test(text)){ icon.classList.add('lead'); icon.textContent = '↗'; }
      else if(/api/i.test(text)){ icon.classList.add('api'); icon.textContent = '{}'; }
      else if(/automation/i.test(text)){ icon.classList.add('auto'); icon.textContent = '⚙'; }
      else { icon.classList.add('ui'); icon.textContent = '◈'; }
      badge.prepend(icon);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setupStats(); setupBadgeIcons(); });
  } else {
    setupStats();
    setupBadgeIcons();
  }
})();
