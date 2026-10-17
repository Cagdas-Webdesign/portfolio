/* legacy inline script #43 id="v60-hero-performance-platform-circle-script" */

(function(){
  /* Performance (2026-10-15): Gehoert zur entfernten Plattform-Section
     (#social-lottie / #platform-row-prelude). Ohne sie loeste dieser Block nur
     noch komplette ScrollTrigger-Refreshes aus — beim Laden und bei jedem
     resize (iOS: Adressleiste beim Scrollen). */
  if(!document.getElementById('social-lottie') && !document.getElementById('platform-row-prelude')) return;
  if(window.__v60HeroPlatformFix) return;
  window.__v60HeroPlatformFix = true;

  function waitPlatform(cb){
    if(window.gsap && window.ScrollTrigger) cb();
    else setTimeout(function(){ waitPlatform(cb); }, 80);
  }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function ease(t){ t = clamp(t,0,1); return t*t*(3-2*t); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  function setupCompanyIcon(connect){
    if(!connect) return;
    var strong = connect.querySelector('strong');
    if(strong){ strong.innerHTML = 'dein<br>Unternehmen'; }
    var icon = connect.querySelector('.pu-company-icon');
    if(!icon){
      icon = document.createElement('span');
      icon.className = 'pu-company-icon';
      icon.setAttribute('aria-hidden','true');
      icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M7 20V8l5-4 5 4v12"/><path d="M9.5 10h5"/><path d="M9.5 13h5"/><path d="M10 20v-4h4v4"/></svg>';
      if(strong) connect.insertBefore(icon, strong);
      else connect.appendChild(icon);
    }
  }

  function initPlatformFlowV60(){
    var section = document.getElementById('social-lottie');
    if(!section || !section.classList.contains('platform-unified-v14')) return;
    var stage = document.getElementById('puStage');
    var svg = document.getElementById('puLines');
    var connect = document.getElementById('puConnect');
    var head = document.getElementById('puHead');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.pcard'));
    if(!stage || !svg || !connect || !cards.length) return;

    setupCompanyIcon(connect);

    window.ScrollTrigger.getAll().forEach(function(st){
      if(st && st.trigger === section){ st.kill(); }
    });

    function positions(){
      var w = stage.clientWidth || window.innerWidth;
      var h = stage.clientHeight || window.innerHeight;
      var mobile = w < 760;
      var cw = cards[0].offsetWidth || (mobile ? 118 : 160);
      var ch = cards[0].offsetHeight || (mobile ? 58 : 74);
      var cx = w / 2;
      var cy = h * (mobile ? 0.615 : 0.585);
      var cols = mobile ? 2 : 5;
      var gapX = mobile ? Math.min(150, w * 0.39) : Math.min(212, w * 0.146);
      var gapY = mobile ? 80 : 112;
      var rows = Math.ceil(cards.length / cols);
      var initialTop = h * (mobile ? 0.48 : 0.51);

      var start = cards.map(function(card,i){
        var r = Math.floor(i / cols);
        var c = i % cols;
        var count = (r === rows - 1) ? cards.length - r * cols : cols;
        var rowW = (count - 1) * gapX;
        return {
          x: cx - rowW / 2 + c * gapX - cw / 2,
          y: initialTop + (r - (rows - 1) / 2) * gapY - ch / 2,
          s: mobile ? .88 : .86
        };
      });

      var orbit = mobile
        ? [[-126,-124],[0,-182],[126,-124],[152,-30],[138,92],[68,176],[-68,176],[-138,92],[-152,-30],[0,238]]
        : [[-350,-156],[-190,-254],[24,-278],[240,-214],[362,-54],[330,150],[154,246],[-58,260],[-264,176],[-362,4]];

      var end = orbit.map(function(o){
        return { x: cx + o[0] - cw/2, y: cy + o[1] - ch/2, s: mobile ? .88 : .86 };
      });
      return {w:w,h:h,cx:cx,cy:cy,start:start,end:end};
    }

    function cardCenter(card){
      var s = Number(window.gsap.getProperty(card, 'scale')) || 1;
      return {
        x: (Number(window.gsap.getProperty(card, 'x')) || 0) + (card.offsetWidth || 140) * s / 2,
        y: (Number(window.gsap.getProperty(card, 'y')) || 0) + (card.offsetHeight || 64) * s / 2
      };
    }

    function linePath(a,b){
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var c1x = a.x + dx * .42;
      var c1y = a.y + dy * .18;
      var c2x = a.x + dx * .78;
      var c2y = a.y + dy * .82;
      return 'M ' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
    }

    function drawLines(amount, center){
      if(amount <= .01){ svg.innerHTML = ''; return; }
      var w = stage.clientWidth || window.innerWidth;
      var h = stage.clientHeight || window.innerHeight;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var html = '';
      cards.forEach(function(card){
        var col = card.dataset.color || '#8ffff0';
        var d = linePath(cardCenter(card), center);
        html += '<path d="' + d + '" stroke="' + col + '" stroke-opacity="' + (.16 + amount * .54).toFixed(3) + '"></path>';
      });
      svg.innerHTML = html;
    }

    function render(p){
      setupCompanyIcon(connect);
      var pos = positions();
      var assemble = ease((p - .12) / .40);
      var centerIn = ease((p - .40) / .14);
      var linesIn = ease((p - .53) / .18);
      var titleOut = ease((p - .22) / .14);

      cards.forEach(function(card,i){
        var a = pos.start[i];
        var b = pos.end[i];
        window.gsap.set(card, {
          x: lerp(a.x, b.x, assemble),
          y: lerp(a.y, b.y, assemble),
          scale: lerp(a.s, b.s, assemble),
          rotation: 0,
          opacity: 1,
          clearProps: 'filter',
          force3D: true
        });
      });

      window.gsap.set(connect, {
        left: pos.cx,
        top: pos.cy,
        xPercent: -50,
        yPercent: -50,
        opacity: centerIn,
        scale: .84 + centerIn * .16,
        force3D: true
      });

      if(head){ window.gsap.set(head, { opacity: 1 - titleOut, y: -18 * titleOut }); }
      
      var stageRect = stage.getBoundingClientRect();
      var circleRect = connect.getBoundingClientRect();
      var actualCenter = {
        x: circleRect.left - stageRect.left + circleRect.width / 2,
        y: circleRect.top - stageRect.top + circleRect.height / 2
      };
      drawLines(linesIn, actualCenter);
    }

    render(0);
    window.ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: .55,
      invalidateOnRefresh: true,
      onUpdate: function(self){ render(self.progress); },
      onRefresh: function(self){ render(self.progress); }
    });
    setTimeout(function(){ window.ScrollTrigger.refresh(); }, 160);
    setTimeout(function(){ window.ScrollTrigger.refresh(); }, 620);
  }

  function boot(){
    waitPlatform(initPlatformFlowV60);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
  window.addEventListener('load', function(){ waitPlatform(initPlatformFlowV60); }, {once:true});
  window.addEventListener('resize', function(){
    clearTimeout(window.__v60Resize);
    window.__v60Resize = setTimeout(function(){ if(window.ScrollTrigger) window.ScrollTrigger.refresh(); }, 180);
  }, {passive:true});
})();
