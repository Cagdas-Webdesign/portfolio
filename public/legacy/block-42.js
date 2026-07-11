/* legacy inline script #42 id="v59-platform-flow-spacing-center-script" */

(function(){
  if(window.__v59PlatformFlowFix) return;
  window.__v59PlatformFlowFix = true;

  function wait(cb){
    if(window.gsap && window.ScrollTrigger) cb();
    else setTimeout(function(){ wait(cb); }, 80);
  }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function ease(t){ t = clamp(t,0,1); return t*t*(3-2*t); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  function setupCenter(){
    var connect = document.getElementById('puConnect');
    if(!connect) return;
    var strong = connect.querySelector('strong');
    if(strong){ strong.innerHTML = 'dein<br>Unternehmen'; }
    if(!connect.querySelector('.pu-company-icon')){
      var icon = document.createElement('span');
      icon.className = 'pu-company-icon';
      icon.setAttribute('aria-hidden','true');
      icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M7 20V7.8L12 4l5 3.8V20"/><path d="M9.5 10h5"/><path d="M9.5 13h5"/><path d="M10 20v-4h4v4"/></svg>';
      if(strong) connect.insertBefore(icon, strong);
      else connect.appendChild(icon);
    }
  }

  function init(){
    var section = document.getElementById('social-lottie');
    if(!section || !section.classList.contains('platform-unified-v14')) return;
    var stage = document.getElementById('puStage');
    var svg = document.getElementById('puLines');
    var connect = document.getElementById('puConnect');
    var head = document.getElementById('puHead');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.pcard'));
    if(!stage || !svg || !connect || !cards.length) return;

    setupCenter();

    window.ScrollTrigger.getAll().forEach(function(st){
      if(st && st.trigger === section) st.kill();
    });

    function positions(){
      var w = stage.clientWidth || window.innerWidth;
      var h = stage.clientHeight || window.innerHeight;
      var mobile = w < 760;
      var cw = cards[0].offsetWidth || (mobile ? 120 : 160);
      var ch = cards[0].offsetHeight || (mobile ? 60 : 74);
      var cx = w / 2;
      var cy = h * (mobile ? 0.61 : 0.585);
      var cols = mobile ? 2 : 5;
      var gapX = mobile ? Math.min(148, w * 0.385) : Math.min(214, w * 0.148);
      var gapY = mobile ? 80 : 112;
      var rows = Math.ceil(cards.length / cols);
      var initialTop = h * (mobile ? 0.47 : 0.50);

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
        ? [[-124,-120],[0,-178],[124,-120],[150,-26],[136,90],[68,174],[-68,174],[-136,90],[-150,-26],[0,236]]
        : [[-348,-154],[-188,-252],[22,-276],[238,-212],[360,-52],[328,148],[152,244],[-58,258],[-262,174],[-360,4]];

      var end = orbit.map(function(o){
        return { x: cx + o[0] - cw/2, y: cy + o[1] - ch/2, s: mobile ? .88 : .86 };
      });

      return { w:w, h:h, cx:cx, cy:cy, start:start, end:end };
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
      var c1x = a.x + dx * .36;
      var c1y = a.y + dy * .10;
      var c2x = a.x + dx * .76;
      var c2y = a.y + dy * .90;
      return 'M ' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
    }

    function drawLines(amount, cx, cy){
      if(amount <= .01){ svg.innerHTML = ''; return; }
      var w = stage.clientWidth || window.innerWidth;
      var h = stage.clientHeight || window.innerHeight;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var html = '';
      cards.forEach(function(card){
        var col = card.dataset.color || '#8ffff0';
        var d = linePath(cardCenter(card), {x:cx, y:cy});
        html += '<path d="' + d + '" stroke="' + col + '" stroke-opacity="' + (.18 + amount * .60).toFixed(3) + '"></path>';
      });
      svg.innerHTML = html;
    }

    function render(p){
      setupCenter();
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
        scale: .82 + centerIn * .18,
        force3D: true
      });

      if(head){
        window.gsap.set(head, { opacity: 1 - titleOut, y: -18 * titleOut });
      }

      drawLines(linesIn, pos.cx, pos.cy);
    }

    render(0);
    window.ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: .65,
      invalidateOnRefresh: true,
      onUpdate: function(self){ render(self.progress); },
      onRefresh: function(self){ render(self.progress); }
    });

    setTimeout(function(){ window.ScrollTrigger.refresh(); }, 160);
    setTimeout(function(){ window.ScrollTrigger.refresh(); }, 620);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ wait(init); }, {once:true});
  } else {
    wait(init);
  }
  window.addEventListener('load', function(){ wait(init); }, {once:true});
  window.addEventListener('resize', function(){
    clearTimeout(window.__v59Resize);
    window.__v59Resize = setTimeout(function(){ if(window.ScrollTrigger) window.ScrollTrigger.refresh(); }, 180);
  }, {passive:true});
})();
